import { reactive } from "vue";
import router from "../router/router";
import axios from "axios";
import Swal from "sweetalert2";
import functions from "../global/cookie";

const authStore = reactive({
  // apiBase: "http://localhost:8000", //for local
  apiBase: "https://my.azonation.com/api", // for production
  isAuthenticated: functions.getCookie("auth") == 1,
  user: functions.getCookie("user") == 'undefined'? {}: JSON.parse(functions.getCookie("user")),
  errors: null,

  async fetchPublicApi(endPoint = "", params = {}, requestType = "GET") {
    let request = {
      method: requestType.toUpperCase(),
      headers: {
        "Access-Control-Allow-Origin": "*",
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
    };

    if (
      requestType.toUpperCase() == "POST" ||
      requestType.toUpperCase() == "PUT"
    ) {
      request.body = JSON.stringify(params);
    }

    const res = await fetch(this.apiBase + endPoint, request);
    const response = await res.json();
    return response;
  },

  async fetchProtectedApi(endPoint = "", params = {}, requestType = "GET") {
    const token = this.getUserToken();
    let request = {
      method: requestType.toUpperCase(),
      headers: {
        "Access-Control-Allow-Origin": "*",
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${token}`,
        
      },
    };

    if (
      requestType.toUpperCase() == "POST" ||
      requestType.toUpperCase() == "PUT"
    ) {
      request.body = JSON.stringify(params);
    }

    const res = await fetch(this.apiBase + endPoint, request);
    const response = await res.json();
    return response;
  },

  // async uploadProtectedApi(endPoint = "", params = {}) {
  //   const token = this.getUserToken();

  //   const res = await axios.post(this.apiBase + endPoint, params, {
  //     headers: {
  //       "Access-Control-Allow-Origin": "*",
  //       "Content-Type": "multipart/form-data",
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });

  //   const response = await res.data;
  //   return response;
  // },
  // async uploadProtectedApi(endPoint = "", params = {}) {
  //   const token = this.getUserToken();

  //   const res = await axios.post(this.apiBase + endPoint, params, {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });

  //   return res.data;
  // },

  //--------NEW by Ourself------------
  async uploadProtectedApi(endPoint = "", params = {}, requestType = "POST") {
    const token = this.getUserToken();

    // Prepare the request configuration
    let request = {
      method: requestType.toUpperCase(), // Handle both POST and PUT
      headers: {
        "Access-Control-Allow-Origin": "*", // Handle CORS for local development
        Accept: "application/vnd.api+json", // Handle API response format
        "Content-Type": "multipart/form-data", // Multipart form-data for file uploads
        Authorization: `Bearer ${token}`, // Add the authorization header
      },
    };

    // Add the params as the body for POST and PUT requests
    if (
      requestType.toUpperCase() === "POST" ||
      requestType.toUpperCase() === "PUT"
    ) {
      request.data = params; // Use data instead of body for axios
    }

    // Make the axios request
    const res = await axios(this.apiBase + endPoint, request);

    // Return the response data
    return res.data;
  },

  register(name, type, email, country_id, password) {
    this
      .fetchPublicApi(
        "/api/register",
        { name: name, type: type, email: email, country_id: country_id, password: password },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          this.errors = null;
          router.push({ name: "login" });
          Swal.fire({
            icon: "success",
            title: "Registration successful",
            text: "You have successfully registered.",
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          this.errors = res.errors;
        }
      });
  },

  async authenticate(username, password, remember_token) {
    try {
      const response = await this.fetchPublicApi(
        "/api/login",
        { email: username, password: password, remember_token: remember_token },
        "POST"
      );

      if (response.status === "success") {
        this.isAuthenticated = true;
        this.user = response.data;
        functions.setCookie("auth", 1);
        functions.setCookie("user", JSON.stringify(response.data));

        // Redirect based on user type
        switch (response.data.type) {
          case "individual":
            router.push({ name: "individual-index" });
            break;
          case "organisation":
            router.push({ name: "org-index" });
            break;
          case "superadmin":
            router.push({ name: "superadmin-index" });
            break;
          default:
            router.push({ name: "login" });
        }
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "You have successfully logged in.",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        this.errors = response.errors || "An error occurred during login.";
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: response.message || "Invalid login credentials",
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
          // Clear frontend authentication status
          this.isAuthenticated = false;
          this.user = {};
          functions.deleteCookie("auth", 0);
          functions.deleteCookie("user", "{}");
          router.push({ name: "login" });

          Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been logged out successfully.",
            timer: 1000,
            timerProgressBar: true,
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