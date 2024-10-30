import { reactive } from "vue";
import router from "../router/router";
import axios from "axios";
import Swal from "sweetalert2";

const authStore = reactive({
  apiBase: "http://localhost:8000",
  isAuthenticated: sessionStorage.getItem("auth") == 1,
  user: JSON.parse(sessionStorage.getItem("user")),
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

    const res = await fetch(authStore.apiBase + endPoint, request);
    const response = await res.json();
    return response;
  },

  async fetchProtectedApi(endPoint = "", params = {}, requestType = "GET") {
    const token = authStore.getUserToken();
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

    const res = await fetch(authStore.apiBase + endPoint, request);
    const response = await res.json();
    return response;
  },

  //--------NEW by Ourself------------
  async uploadProtectedApi(endPoint = "", params = {}, requestType = "POST") {
    const token = authStore.getUserToken();

    // Prepare the request configuration
    let request = {
      method: requestType.toUpperCase(), // Handle both POST and PUT
      headers: {
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
    const res = await axios(authStore.apiBase + endPoint, request);

    // Return the response data
    return res.data;
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
          authStore.fetchProtectedApi("/api/logout",{},"POST")

          // Clear frontend authentication status
          authStore.isAuthenticated = false;
          authStore.user = {};
          sessionStorage.setItem("auth", 0);
          sessionStorage.setItem("user", "{}");
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

});

export { authStore };