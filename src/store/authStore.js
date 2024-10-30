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

  // async uploadProtectedApi(endPoint = "", params = {}) {
  //   const token = authStore.getUserToken();

  //   const res = await axios.post(authStore.apiBase + endPoint, params, {
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
  //   const token = authStore.getUserToken();

  //   const res = await axios.post(authStore.apiBase + endPoint, params, {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });

  //   return res.data;
  // },

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

  register(name, type, email, password) {
    authStore
      .fetchPublicApi(
        "/api/register",
        { name: name, type: type, email: email, password: password },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
          router.push({name: "login"});
          Swal.fire({
            icon: "success",
            title: "Registration successful",
            text: "You have successfully registered.",
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          authStore.errors = res.errors;
        }
      });
  },


  async authenticate(username, password, remember_token) {
    try {
      const res = await authStore.fetchPublicApi(
        "/api/login",
        { email: username, password: password, remember_token: remember_token },
        "POST"
      );
  
      if (res.status === "success") {
        authStore.isAuthenticated = true;
        authStore.user = res.data;
        sessionStorage.setItem("auth", 1);
        sessionStorage.setItem("user", JSON.stringify(res.data));
  
        // Redirect based on user type
        switch (res.data.type) {
          case "individual":
            router.push({ name: "individual-dashboard-initial-content" });
            break;
          case "organisation":
            router.push({ name: "dashboard-initial-content" });
            break;
          case "superadmin":
            this.superAdminUserData(res.data.id);
            router.push({ name: "super-admin-dashboard" });
            break;
          default:
            router.push({name: "login"});
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
        authStore.errors = res.errors || "An error occurred during login.";
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: res.message || "Invalid login credentials",
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
          await authStore.fetchProtectedApi("/api/logout",{},"POST")

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

  // logout() {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: "You will be logged out.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes, log out!",
  //     cancelButtonText: "Cancel",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         // Call the backend logout API endpoint
  //         const token = authStore.getUserToken();
  //         await fetch(`${authStore.apiBase}/logout`, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             "Authorization": `Bearer ${token}`
  //           },
  //         });

  //         // Clear frontend authentication status
  //         authStore.isAuthenticated = false;
  //         authStore.user = {};
  //         sessionStorage.setItem("auth", 0);
  //         sessionStorage.setItem("user", "{}");
  //         router.push({ name: "login" });

  //         Swal.fire({
  //           icon: "success",
  //           title: "Logged Out",
  //           text: "You have been logged out successfully.",
  //           timer: 1000,
  //           timerProgressBar: true,
  //           showConfirmButton: false,
  //         });
  //       } catch (error) {
  //         console.error("Logout failed:", error);
  //         Swal.fire({
  //           icon: "error",
  //           title: "Logout Failed",
  //           text: "There was an issue logging out. Please try again.",
  //         });
  //       }
  //     }
  //   });
  // },


  // logout() {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: "You will be logged out.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes, log out!",
  //     cancelButtonText: "Cancel",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       authStore.isAuthenticated = false;
  //       authStore.user = {};
  //       sessionStorage.setItem("auth", 0);
  //       sessionStorage.setItem("user", "{}");
  //       router.push({name: "login"});
  //       Swal.fire({
  //         icon: "success",
  //         title: "Logged Out",
  //         text: "You have been logged out successfully.",
  //         timer: 1000,
  //         timerProgressBar: true,
  //         showConfirmButton: false,
  //       });
  //     }
  //   });
  // },

  // individualData(userId) {
  //   this.fetchPublicApi(`/api/individual_profile_data/${userId}`, {}, "GET").then((res) => {
  //     if (res.status) {
  //       this.individual = res.data;
  //       sessionStorage.setItem("individual", JSON.stringify(res.data));
  //       console.log("Individual Data:", res.data);
  //     } else {
  //       this.errors = res.message;
  //     }
  //   });
  // },

  //Find user data after user login only
  // userUpdatedData(userId) {
  //   this.fetchPublicApi(`/api/user_data/${userId}`, {}, "GET").then(
  //     (res) => {
  //       if (res.status) {
  //         this.user = res.data;
  //         sessionStorage.setItem("user", JSON.stringify(res.data));
  //       } else {
  //         this.errors = res.message;
  //       }
  //     }
  //   );
  // },

  //Find org data after any update
  // getUserData(userId) {
  //   this.fetchPublicApi(`/api/user-data-local-update/${userId}`, {}, "GET").then(
  //     (res) => {
  //       if (res.status) {
  //         this.user = res.data;
  //         sessionStorage.setItem("user", JSON.stringify(res.data));
  //       } else {
  //         this.errors = res.message;
  //       }
  //     }
  //   );
  // },

  superAdminUserData(id) {
    // console.log("user_id", id);
    this.fetchPublicApi(`/api/super_admin_user_data/${id}`, {}, "GET").then(
      (res) => {
        if (res.status) {
          this.superadmin = res.data;
          sessionStorage.setItem("superadmin", JSON.stringify(res.data));
          // console.log("superAdmin Data:", res.data);
        } else {
          this.errors = res.message;
        }
      }
    );
  },

  getUserToken() {
    return authStore.user?.accessToken;
  },

  getUserType() {
    return authStore.user?.type;
  },

  createCommittee(
    user_id,
    name,
    short_description,
    start_date,
    end_date,
    note,
    status
  ) {
    authStore
      .fetchProtectedApi(
        "/api/create_committee",
        {
          user_id: user_id,
          name: name,
          short_description: short_description,
          start_date: start_date,
          end_date: end_date,
          note: note,
          status: status,
        },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
          router.push("/committees");
        } else {
          authStore.errors = res.errors;
        }
      });
  },

  updateCommittee(
    id,
    newName,
    short_description,
    start_date,
    end_date,
    note,
    status
  ) {
    authStore
      .fetchProtectedApi(
        // Correct the URL to use backticks for interpolation
        `/api/update_committee/${id}`,
        {
          name: newName,
          short_description: short_description,
          start_date: start_date,
          end_date: end_date,
          note: note,
          status: status,
        },
        "PUT"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
          router.push("/committees");
        } else {
          authStore.errors = res.errors;
        }
      })
      .catch((error) => {
        console.error("Error updating committee:", error);
      });
  },

  createMeeting(
    user_id,
    name,
    short_name,
    subject,
    date,
    time,
    description,
    address,
    agenda,
    requirements,
    note,
    status,
    conduct_type
  ) {
    authStore
      .fetchProtectedApi(
        "/api/create-meeting",
        {
          user_id: user_id,
          name: name,
          short_name: short_name,
          subject: subject,
          date: date,
          time: time,
          description: description,
          address: address,
          agenda: agenda,
          requirements: requirements,
          note: note,
          status: status,
          conduct_type: conduct_type,
        },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
          router.push("/create-meeting");
        } else {
          authStore.errors = res.errors;
        }
      });
  },

  createEvent(
    userId,
    title,
    name,
    short_description,
    description,
    date,
    time,
    venue_name,
    venue_address,
    requirements,
    note,
    status,
    conduct_type
  ) {
    authStore
      .fetchProtectedApi(
        "/api/create-event",
        {
          userId,
          title,
          name,
          short_description,
          description,
          date,
          time,
          venue_name,
          venue_address,
          requirements,
          note,
          status,
          conduct_type,
        },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
          router.push("/create-event");
        } else {
          authStore.errors = res.errors;
        }
      });
  },

  createProject(
    user_id,
    title,
    short_description,
    description,
    start_date,
    end_date,
    start_time,
    end_time,
    venue_name,
    venue_address,
    requirements,
    note,
    status,
    conduct_type
  ) {
    authStore
      .fetchProtectedApi(
        "/api/create-project",
        {
          user_id: user_id,
          title: title,
          short_description: short_description,
          description: description,
          start_date: start_date,
          end_date: end_date,
          start_time: start_time,
          end_time: end_time,
          venue_name: venue_name,
          venue_address: venue_address,
          requirements: requirements,
          note: note,
          status: status,
          conduct_type: conduct_type,
        },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
        } else {
          authStore.errors = res.errors;
        }
      });
  },

  updateProject(
    id,
    title,
    short_description,
    description,
    start_date,
    end_date,
    start_time,
    end_time,
    venue_name,
    venue_address,
    requirements,
    note,
    status,
    conduct_type
  ) {
    authStore
      .fetchProtectedApi(
        `/api/update-project/${id}`,
        {
          title: title,
          short_description: short_description,
          description: description,
          start_date: start_date,
          end_date: end_date,
          start_time: start_time,
          end_time: end_time,
          venue_name: venue_name,
          venue_address: venue_address,
          requirements: requirements,
          note: note,
          status: status,
          conduct_type: conduct_type,
        },
        "PUT"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
        } else {
          authStore.errors = res.errors;
        }
      });
  },
});

export { authStore };
