import { ref, reactive } from "vue";
import router from "../router/router";
import axios from "axios";

const loginAuthStore = reactive({
  apiBase: "http://localhost:8000",
  isAuthenticated: localStorage.getItem("auth") == 1,
  user: JSON.parse(localStorage.getItem("user")),
  org: JSON.parse(localStorage.getItem("org")),
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

    if (requestType.toUpperCase() === "POST" || requestType.toUpperCase() === "PUT") {
      request.body = JSON.stringify(params);
    }

    try {
      const res = await fetch(this.apiBase + endPoint, request);
      const response = await res.json();
      return response;
    } catch (error) {
      console.error("Error fetching public API:", error);
      throw new Error("API request failed");
    }
  },
  
  async authenticate(username, password) {
    try {
      const res = await this.fetchPublicApi("/api/login", { email: username, password: password }, "POST");
      if (res.status) {
        this.isAuthenticated = true;
        this.user = res.data;
        localStorage.setItem("auth", 1);
        localStorage.setItem("user", JSON.stringify(res.data));

        if ("1" == res.data.type) {
          this.individualData(res.data.user_id);
          router.push({ name: "individual-dashboard" });
          
        } else if ("2" == res.data.type) {
          await this.orgData(res.data.user_id);
          router.push({ name: "org-dashboard" });
          
        } else {
          router.push("/");
        }
      } else {
        this.errors = res.message;
        console.error("Authentication failed:", res.message);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      this.errors = error.message;
    }
  },

  individualData(id) {
    console.log('user_id', id);
  },
  
  async orgData(id) {
    console.log("Fetching organization data for user_id", id);

    try {
      const res = await this.fetchPublicApi(`/api/organisation_data/${id}`, {}, "GET");
      console.log("API response:", res);

      if (res.status) {
        this.org = res.data;
        localStorage.setItem("org", JSON.stringify(res.data));
        console.log("Organisation Data:", res.data);
      } else {
        this.errors = res.message;
        console.error("Error fetching organization data:", res.message);
      }
    } catch (error) {
      console.error("Error occurred during fetching organization data:", error);
      this.errors = error.message;
    }
  },

  logout() {
    this.isAuthenticated = false;
    this.user = {};
    this.org = {};
    localStorage.setItem("auth", 0);
    localStorage.setItem("user", "{}");
    localStorage.setItem("org", "{}");
    router.push("/login");
  },
});

export { loginAuthStore };
