import { reactive } from "vue";
import router from "../router/router";
import axios from "axios";
import Swal from "sweetalert2";
import functions from "../global/cookie";

const api = axios.create({

  baseURL: "http://localhost:8000",

    // window.location.hostname === "localhost"
    //   ? "http://localhost:8000"
    //   : "https://app.azonation.com",
  withCredentials: true,
});

// ============================
// REQUEST INTERCEPTOR
// ============================
api.interceptors.request.use(
  (config) => {
    const token =
      authStore.user?.accessToken ||
      authStore.user?.token ||
      authStore.user?.plainTextToken ||
      authStore.user?.access_token;

    const activeOrg =
      authStore.currentOrgId || localStorage.getItem("active_org");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FIXED HEADER NAME
    if (activeOrg) {
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
  (error) => {
    // 🔴 401 → logout
    if (error.response?.status === 401) {
      authStore.isAuthenticated = false;
      authStore.user = {};
      authStore.orgAccess = [];
      authStore.currentOrgId = null;

      functions.deleteCookie("auth");
      functions.deleteCookie("user");
      localStorage.removeItem("active_org");

      router.push({ name: "login" });
    }

    // 🔴 403 → permission error
    if (error.response?.status === 403) {
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
// AUTH STORE
// ============================
const authStore = reactive({
  isAuthenticated: functions.getCookie("auth") == 1,

  user: (() => {
    const cookie = functions.getCookie("user");
    try {
      return cookie && cookie !== "undefined" ? JSON.parse(cookie) : {};
    } catch (e) {
      console.error("Failed to parse user cookie:", e);
      return {};
    }
  })(),

  // 🔥 org-wise roles + permissions
  orgAccess: (() => {
    const cookie = functions.getCookie("user");
    try {
      const u = cookie ? JSON.parse(cookie) : {};
      return u?.org_access || [];
    } catch {
      return [];
    }
  })(),
// ============================
// 🔥 ADDED: update permissions for the org that was just modified
// (e.g. after a subscription/package change). Independent of switchOrg,
// which is only for org-member users switching between orgs.
// ============================
updateOrgAccess(orgEntry) {
  if (!orgEntry) return;

  const index = this.orgAccess.findIndex(
    (o) => o.org_type_user_id == orgEntry.org_type_user_id
  );

  if (index !== -1) {
    this.orgAccess[index] = orgEntry;
  } else {
    this.orgAccess.push(orgEntry);
  }

  // persist so a page refresh doesn't revert to the old cookie data
  const updatedUser = { ...this.user, org_access: this.orgAccess };
    this.user = updatedUser;
    functions.setCookie("user", JSON.stringify(updatedUser));
  },
  currentOrgId: localStorage.getItem("active_org") || null,

  errors: null,
  apiBase: api.defaults.baseURL,
  // 🔥 NEW: loading state for org switching
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
  async fetchPublicApi(endPoint = "", params = {}, requestType = "GET") {
    try {
      const response = await api({
        method: requestType.toUpperCase(),
        url: endPoint,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: ["POST", "PUT"].includes(requestType.toUpperCase())
          ? params
          : null,
        params: requestType.toUpperCase() === "GET" ? params : null,
      });
      return response.data;
    } catch (error) {
      console.error("Public API error:", error);
      return {
        status: false,
        errors:
          error.response?.data?.errors || error.response?.data || error.message,
      };
    }
  },

  // ============================
  async fetchProtectedApi(endPoint = "", params = {}, requestType = "GET") {
    try {
      const response = await api({
        method: requestType.toUpperCase(),
        url: endPoint,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
        data: ["POST", "PUT"].includes(requestType.toUpperCase())
          ? params
          : null,
        params: requestType.toUpperCase() === "GET" ? params : null,
      });
      return response.data;
    } catch (error) {
      console.error("Protected API error:", error);
      return {
        status: false,
        errors:
          error.response?.data?.errors || error.response?.data || error.message,
      };
    }
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

  // ============================
  async authenticate(username, password, remember_token) {
    try {
      const response = await this.fetchPublicApi(
        "/api/login",
        { email: username, password, remember_token },
        "POST",
      );

      if (response.status === "success") {
        this.isAuthenticated = true;
        this.user = response.data;

        // 🔥 org access
        this.orgAccess = response.data.org_access || [];

        if (this.orgAccess.length > 0) {
          this.currentOrgId = this.orgAccess[0].org_type_user_id;
          localStorage.setItem("active_org", this.currentOrgId);
        }

        functions.setCookie("auth", 1);
        functions.setCookie("user", JSON.stringify(response.data));

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

          this.isAuthenticated = false;
          this.user = {};
          this.orgAccess = [];
          this.currentOrgId = null;

          functions.deleteCookie("auth");
          functions.deleteCookie("user");
          localStorage.removeItem("active_org");

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

  // ============================
  getUserToken() {
    return (
      this.user?.accessToken ||
      this.user?.token ||
      this.user?.plainTextToken ||
      this.user?.access_token
    );
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
      const res = await this.fetchProtectedApi("/api/org/switch");

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
