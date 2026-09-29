import { reactive } from "vue";
import router from "../router/router";
import axios from "axios";
import Swal from "sweetalert2";
import functions from "../global/cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  withCredentials: true, // session cookie পাঠাবে
  withXSRFToken: true, // XSRF-TOKEN cookie → X-XSRF-TOKEN header (cross-port এও)
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// POST/PUT/DELETE bring one time CSRF cookie if not present before making the request
let csrfPromise = null;
function ensureCsrf() {
  if (functions.getCookie("XSRF-TOKEN")) return Promise.resolve();
  if (!csrfPromise) {
    csrfPromise = api
      .get("/sanctum/csrf-cookie")
      .finally(() => (csrfPromise = null));
  }
  return csrfPromise;
}

// ============================
// REQUEST INTERCEPTOR
// ============================
api.interceptors.request.use(
  async (config) => {
    const method = (config.method || "get").toLowerCase();
    if (!["get", "head", "options"].includes(method)) {
      await ensureCsrf();
    }

    // ❌ Bearer token আর নেই। শুধু active org header
    const activeOrg =
      authStore.currentOrgId || localStorage.getItem("active_org");
    // A request may name its own org (e.g. switchOrg); otherwise use the active one
    if (activeOrg && !config.headers["X-Org-Id"]) {
      config.headers["X-Org-Id"] = activeOrg;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================
// RESPONSE INTERCEPTOR
// ============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config || {};

    // 🔁 419 = CSRF token মেয়াদ শেষ → নতুন নিয়ে একবার retry
    if (status === 419 && !config._retried) {
      config._retried = true;
      await api.get("/sanctum/csrf-cookie");
      return api(config);
    }

    // 🔴 401 → logout (কিন্তু /api/me তে না, ওটা শুধু "logged in কিনা" check করে)
    if (status === 401 && !config.url?.includes("/api/me")) {
      authStore.clearSession();
      router.push({ name: "login" });
    }

    // 🔴 403 → permission error
    if (status === 403) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text:
          error.response?.data?.message ||
          "You don't have permission to perform this action.",
      });
    }

    return Promise.reject(error);
  },
);

// ============================
// JSON REQUEST HELPER
// ============================
const BODY_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

// Identical GET requests made at the same moment (e.g. header and page both
// loading the same list) share one network call.
const inflightGets = new Map();

function toResult(error) {
  return {
    status: false,
    errors: error.response?.data?.errors || error.response?.data || error.message,
  };
}

// Each caller gets its own copy, so one component changing the data
// cannot change what another component shows.
function copyOf(data) {
  try {
    return structuredClone(data);
  } catch {
    return data;
  }
}

async function jsonRequest(endPoint, params, requestType, logLabel) {
  const method = String(requestType || "GET").toUpperCase();
  const send = () =>
    api({
      method,
      url: endPoint,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      data: BODY_METHODS.includes(method) ? params : null,
      params: method === "GET" ? params : null,
    }).then((response) => response.data);

  try {
    if (method !== "GET") return await send();

    const key = `${authStore.currentOrgId ?? ""}|${endPoint}|${JSON.stringify(params ?? {})}`;
    let pending = inflightGets.get(key);
    if (!pending) {
      pending = send().finally(() => inflightGets.delete(key));
      inflightGets.set(key, pending);
    }
    return copyOf(await pending);
  } catch (error) {
    console.error(logLabel, error);
    return toResult(error);
  }
}

// Browser storage keys that can hold personal data; cleared on logout
// (reset_email is kept: it lives in sessionStorage only for the password-reset flow)
const PERSONAL_DATA_KEYS = ["azonation:user", "user"];

// ============================
// AUTH STORE
// ============================
const authStore = reactive({
  isAuthenticated: false,
  user: {},
  orgAccess: [],
  _initPromise: null,

  // login / Google / refresh, same method for all
  setSession(userData) {
    this.isAuthenticated = true;
    this.user = userData || {};
    this.orgAccess = userData?.org_access || [];

    // previous active org is still valid, keep it
    const saved = localStorage.getItem("active_org");
    const valid = this.orgAccess.some((o) => o.org_type_user_id == saved);
    this.currentOrgId = valid
      ? saved
      : (this.orgAccess[0]?.org_type_user_id ?? null);

    if (this.currentOrgId)
      localStorage.setItem("active_org", this.currentOrgId);
    else localStorage.removeItem("active_org");

    // Remove old token cookies (auth, user) to avoid stale data
    functions.deleteCookie("auth");
    functions.deleteCookie("user");
  },

  clearSession() {
    this.isAuthenticated = false;
    this.user = {};
    this.orgAccess = [];
    this.currentOrgId = null;
    localStorage.removeItem("active_org");
    // Personal data cached by profile pages must not outlive the session
    PERSONAL_DATA_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    functions.deleteCookie("auth");
    functions.deleteCookie("user");
  },

  // Asked from server, if logged in, set session, else clear session
  async fetchUser() {
    try {
      const res = await api.get("/api/me");
      if (res.data?.status === "success") {
        this.setSession(res.data.data);
        return true;
      }
    } catch (e) {
      // 401 = not logged in
    }
    this.clearSession();
    return false;
  },

  // One time initialization, fetch user from server if logged in, else clear session
  init() {
    if (!this._initPromise) this._initPromise = this.fetchUser();
    return this._initPromise;
  },

  // ============================
  //update permissions for the org that was just modified
  // (e.g. after a subscription/package change). Independent of switchOrg,
  // which is only for org-member users switching between orgs.
  // ============================
  updateOrgAccess(orgEntry) {
    if (!orgEntry) return;

    const index = this.orgAccess.findIndex(
      (o) => o.org_type_user_id == orgEntry.org_type_user_id,
    );

    if (index !== -1) {
      this.orgAccess[index] = orgEntry;
    } else {
      this.orgAccess.push(orgEntry);
    }

    // Update the user object with the new org_access array
    this.user = { ...this.user, org_access: this.orgAccess };
  },
  currentOrgId: localStorage.getItem("active_org") || null,

  errors: null,
  apiBase: api.defaults.baseURL,
  //loading state for org switching
  isSwitchingOrg: false,
  // ============================
  normalizePath(path) {
    if (!path) return "";
    if (path.startsWith(this.apiBase)) {
      path = path.replace(this.apiBase, "");
    }
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    return path;
  },

  // ============================
  // Public and protected calls share one implementation: the session cookie is
  // sent on every request, and the backend decides what each route allows.
  fetchPublicApi(endPoint = "", params = {}, requestType = "GET") {
    return jsonRequest(endPoint, params, requestType, "Public API error:");
  },

  // ============================
  fetchProtectedApi(endPoint = "", params = {}, requestType = "GET") {
    return jsonRequest(endPoint, params, requestType, "Protected API error:");
  },

  // ============================
  async uploadProtectedApi(endPoint = "", params = {}, requestType = "POST") {
    try {
      const response = await api({
        method: requestType.toUpperCase(),
        url: endPoint,
        headers: {
          Accept: "application/json",
        },
        data: params,
      });
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      return {
        status: false,
        errors:
          error.response?.data?.errors || error.response?.data || error.message,
      };
    }
  },

  async authenticate(username, password, remember_token) {
    try {
      const response = await this.fetchPublicApi(
        "/api/login",
        { email: username, password, remember_token },
        "POST",
      );

      if (response.status === "success") {
        this.setSession(response.data);
        this._initPromise = Promise.resolve(true);

        switch (response.data.type) {
          case "individual":
            router.push({ name: "individual-dashboard-index" });
            break;
          case "organisation":
            router.push({ name: "org-dashboard-index" });
            break;
          case "superadmin":
            router.push({ name: "superadmin-dashboard-index" });
            break;
          default:
            router.push({ name: "login" });
        }

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "You have successfully logged in.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: response.message || "Invalid login credentials.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Login error",
        text: "An unexpected error occurred. Please try again.",
      });
    }
  },

  // ============================
  logout() {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.fetchProtectedApi("/api/logout", {}, "POST");

          this.clearSession();
          this._initPromise = null;

          router.push({ name: "login" });

          Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been logged out successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Logout failed:", error);
          Swal.fire({
            icon: "error",
            title: "Logout Failed",
            text: "There was an issue logging out. Please try again.",
          });
        }
      }
    });
  },

  getUserType() {
    return this.user?.type;
  },

  // ============================
  // 🔥 ORG SWITCH
  async switchOrg(orgId) {
    const exists = this.orgAccess.find((o) => o.org_type_user_id == orgId);
    if (!exists) return console.error("Invalid organization");

    try {
      // 🔥 Start loading
      this.isSwitchingOrg = true;

      // API call to validate + get fresh permissions
      // Ask for the permissions of the org being switched TO (the backend reads X-Org-Id)
      const { data: res } = await api.get("/api/org/switch", {
        headers: { "X-Org-Id": orgId },
      });

      if (res.status) {
        const updatedOrg = res.data;

        // update store
        const index = this.orgAccess.findIndex(
          (o) => o.org_type_user_id == orgId,
        );
        if (index !== -1) this.orgAccess[index] = updatedOrg;

        this.currentOrgId = orgId;
        localStorage.setItem("active_org", orgId);

        // refresh current route (no reload)
        router.replace({ path: router.currentRoute.value.fullPath });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error("Org switch failed:", err);
      Swal.fire({
        icon: "error",
        title: "Switch Failed",
        text: "Unable to switch organization",
      });
    } finally {
      // 🔥 Stop loading
      this.isSwitchingOrg = false;
    }
  },

  // ============================
  // 🔥 GET CURRENT ORG PERMISSIONS
  getPermissions() {
    const org = this.orgAccess.find(
      (o) => o.org_type_user_id == this.currentOrgId,
    );
    return org?.permissions || [];
  },

  // ============================
  // 🔥 CHECK PERMISSION
  hasPermission(permission) {
    if (this.user?.type === "superadmin") return true;
    return this.getPermissions().includes(permission);
  },

  // ============================
  // 🔥 CHECK ROLE
  hasRole(role) {
    const org = this.orgAccess.find(
      (o) => o.org_type_user_id == this.currentOrgId,
    );
    return org ? org.roles?.includes(role) : false;
  },
});

export { authStore };
