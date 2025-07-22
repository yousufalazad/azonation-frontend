import { reactive } from "vue";
import router from "../router/router";
import axios from "axios";
import Swal from "sweetalert2";
import functions from "../global/cookie";

const authStore = reactive({
  // apiBase: "https://my.azonation.com",
  apiBase: "http://localhost:8000",
  isAuthenticated: functions.getCookie("auth") == 1,
  // user: functions.getCookie("user") === "undefined" ? {} : JSON.parse(functions.getCookie("user")),
  user: (() => {
    const cookie = functions.getCookie("user");
    try {
      return cookie && cookie !== "undefined" ? JSON.parse(cookie) : {};
    } catch (e) {
      console.error("Failed to parse user cookie:", e);
      return {};
    }
  })(),

  errors: null,

  async fetchPublicApi(endPoint = "", params = {}, requestType = "GET") {
    try {
      const response = await axios({
        method: requestType.toUpperCase(),
        url: this.apiBase + endPoint,
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

  async fetchProtectedApi(endPoint = "", params = {}, requestType = "GET") {
    const token = this.getUserToken();

    try {
      const response = await axios({
        method: requestType.toUpperCase(),
        url: this.apiBase + endPoint,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  async uploadProtectedApi(endPoint = "", params = {}, requestType = "POST") {
    const token = this.getUserToken();

    try {
      const response = await axios({
        method: requestType.toUpperCase(),
        url: this.apiBase + endPoint,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: params, // Should be FormData
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

  async register(payload) {
    try {
      const res = await this.fetchPublicApi("/api/register", payload, "POST");

      if (res.status) {
        this.errors = null;
        Swal.fire({
          icon: "success",
          title: "Registration successful",
          text: "You have successfully registered.",
          showConfirmButton: true,
        });
        router.push({ name: "login" });
      } else {
        this.errors = res.errors;
      }
    } catch (error) {
      console.error("Registration error:", error);
      this.errors = error.response?.data?.errors || {
        general: ["Something went wrong. Please try again."],
      };
    }
  },

  async authenticate(username, password, remember_token) {
    try {
      const response = await this.fetchPublicApi(
        "/api/login",
        { email: username, password, remember_token },
        "POST"
      );

      if (response.status === "success") {
        this.isAuthenticated = true;
        this.user = response.data;
        functions.setCookie("auth", 1);
        functions.setCookie("user", JSON.stringify(response.data));
        // functions.saveUserToCookie(response.data);

        switch (response.data.type) {
          case "individual":
            // router.push({ name: "individual-dashboard-index" });
            router.push({ name: "individual-dashboard-index" }).then(() => location.reload());
            break;
          case "organisation":
            // router.push({ name: "org-dashboard-index" });
            router.push({ name: "org-dashboard-index" }).then(() => location.reload());
            break;
          case "superadmin":
            router.push({ name: "superadmin-dashboard-index" }).then(() => location.reload());
            break;
          default:
            router.push({ name: "login" });
        }

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "You have successfully logged in.",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        this.errors = response.errors || "Invalid login credentials.";
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
          functions.deleteCookie("auth");
          functions.deleteCookie("user");
          router.push({ name: "login" });

          Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been logged out successfully.",
            timer: 1000,
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

  getUserToken() {
    return this.user?.accessToken;
  },

  getUserType() {
    return this.user?.type;
  },
});

export { authStore };
