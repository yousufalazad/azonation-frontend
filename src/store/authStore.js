import { reactive } from "vue";
import router from "../router/router";
import axios from "axios";
import Swal from "sweetalert2";

const authStore = reactive({
  apiBase: "http://localhost:8000",
  isAuthenticated: localStorage.getItem("auth") == 1,
  user: JSON.parse(localStorage.getItem("user")),
  individual: JSON.parse(localStorage.getItem("individual")),
  org: JSON.parse(localStorage.getItem("org")),
  superadmin: JSON.parse(localStorage.getItem("superadmin")),
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
  async uploadProtectedApi(endPoint = "", params = {}) {
    const token = authStore.getUserToken();

    const res = await axios.post(authStore.apiBase + endPoint, params, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },

  individualRegister(full_name, email, password) {
    authStore
      .fetchPublicApi(
        "/api/individual_register",
        { full_name, email: email, password: password },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
          router.push("/");
          Swal.fire({
            icon: "success",
            title: "Individual Register Successful",
            text: "You have successfully register.",
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          authStore.errors = res.errors;
        }
      });
  },

  orgRegister(org_name, email, password) {
    authStore
      .fetchPublicApi(
        "/api/org_register",
        { org_name: org_name, email: email, password: password },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
          router.push("/");
          Swal.fire({
            icon: "success",
            title: "Organisation Register Successful",
            text: "You have successfully register.",
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          authStore.errors = res.errors;
        }
      });
  },

  superAdminRegister(admin_name, email, password) {
    authStore
      .fetchPublicApi(
        "/api/superadmin_register",
        { admin_name: admin_name, email: email, password: password },
        "POST"
      )
      .then((res) => {
        if (res.status) {
          authStore.errors = null;
          router.push("/");
          Swal.fire({
            icon: "success",
            title: "SuperAdmin Register Successful",
            text: "You have successfully register.",
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          authStore.errors = res.errors;
        }
      });
  },

  authenticate(username, password) {
    authStore
      .fetchPublicApi(
        "/api/login",
        { email: username, password: password },
        "POST"
      )
      .then((res) => {
        if (res.status === "success") {
          authStore.isAuthenticated = true;
          authStore.user = res.data;
          localStorage.setItem("auth", 1);
          localStorage.setItem("user", JSON.stringify(res.data));

          if ("1" == res.data.type) {
            this.individualData(res.data.user_id);
            router.push({ name: "individual-dashboard" });
          } else if ("2" == res.data.type) {
            this.orgData(res.data.user_id);
            router.push({ name: "dashboard-initial-content" });
          } else if ("3" == res.data.type) {
            this.superAdminUserData(res.data.user_id);
            router.push({ name: "super-admin-dashboard" });
          } else {
            router.push("/");
          }
          Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: "You have successfully logged in.",
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          // Handle login errors here
          authStore.errors = res.errors;
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: res.message,
          });
        }
      });
  },

  logout() {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        authStore.isAuthenticated = false;
        authStore.user = {};
        localStorage.setItem("auth", 0);
        localStorage.setItem("user", "{}");
        router.push("/");
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been logged out successfully.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    });
  },

  individualData(id) {
    this.fetchPublicApi(`/api/individual_data/${id}`, {}, "GET").then((res) => {
      if (res.status) {
        this.individual = res.data;
        localStorage.setItem("individual", JSON.stringify(res.data));
        console.log("Individual Data:", res.data);
      } else {
        this.errors = res.message;
      }
    });
  },

  //Find org data after org login only
  orgData(userId) {
    this.fetchPublicApi(`/api/get_organisation_data/${userId}`, {}, "GET").then(
      (res) => {
        if (res.status) {
          this.org = res.data;
          localStorage.setItem("org", JSON.stringify(res.data));
        } else {
          this.errors = res.message;
        }
      }
    );
  },

  //Find org data after any update
  getOrgData(orgId) {
    this.fetchPublicApi(`/api/organisation/${orgId}`, {}, "GET").then(
      (res) => {
        if (res.status) {
          this.org = res.data;
          localStorage.setItem("org", JSON.stringify(res.data));
        } else {
          this.errors = res.message;
        }
      }
    );
  },


  superAdminUserData(id) {
    // console.log("user_id", id);
    this.fetchPublicApi(`/api/super_admin_user_data/${id}`, {}, "GET").then(
      (res) => {
        if (res.status) {
          this.superadmin = res.data;
          localStorage.setItem("superadmin", JSON.stringify(res.data));
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
    orgId,
    name,
    short_description,
    start_date,
    end_date,
    note,
    status
  ) {
    authStore
      .fetchProtectedApi(
        "/api/create_committee_store",
        {
          orgId: orgId,
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

  createMeeting(
    orgId,
    name,
    name_for_admin,
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
        "/api/create-meeting-store",
        {
          orgId: orgId,
          name: name,
          name_for_admin: name_for_admin,
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
    orgId,
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
          orgId: orgId,
          title: title,
          name: name,
          short_description: short_description,
          description: description,
          date: date,
          time: time,
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
          router.push("/create-event");
        } else {
          authStore.errors = res.errors;
        }
      });
  },

  createProject(
    orgId,
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
          orgId: orgId,
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
          router.push("/create-project");
        } else {
          authStore.errors = res.errors;
        }
      });
  },
});

export { authStore };
