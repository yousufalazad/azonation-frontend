// Import dependencies
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router-edited";
import "./assets/css/tailwind.css";
import { authStore } from './store/authStore'; // Assuming you're using Pinia or similar
import axios from "axios";

// CSRF Setup
const csrfToken = document.cookie
  .split("; ")
  .find((row) => row.startsWith("XSRF-TOKEN="))
  ?.split("=")[1];

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-XSRF-TOKEN"] = csrfToken;

axios.get("/sanctum/csrf-cookie")
  .then(() => {
    console.log("CSRF token initialized");
  })
  .catch((error) => {
    console.error("Error initializing CSRF:", error);
  });

const app = createApp(App);
app.use(router);

function checkAuthenticationStatus() {
  try {
    // Get the authentication state from localStorage
    const authState = JSON.parse(localStorage.getItem('auth-event'));

    // If authState is found and status is 'login', set isAuthenticated flag
    if (authState && authState.status === 'login') {
      // Optionally, you can set the isAuthenticated flag to sessionStorage
      sessionStorage.setItem('auth', 1);
      // sessionStorage.setItem('user', JSON.stringify(authState.user));
      console.log('User is authenticated');
    } else {
      // If not logged in, handle accordingly
      sessionStorage.setItem('auth', '0');
      console.log('User is not authenticated');
    }
  } catch (error) {
    console.error("Error parsing auth-state from localStorage:", error);
    sessionStorage.setItem('auth', '0'); // Set default to '0' if error occurs
  }
}

// Call this function when the new tab is opened
checkAuthenticationStatus();

// Optionally, use this value in your app:
const isAuthenticated = sessionStorage.getItem('auth');
console.log('Is Authenticated:', isAuthenticated === '1' ? 'Yes' : 'No');



app.mount("#app");
