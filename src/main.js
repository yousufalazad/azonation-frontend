// import './assets/main.css'
//import './assets/style.css'

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import "./assets/css/tailwind.css";

import axios from "axios";

// Get CSRF token from cookies
const csrfToken = document.cookie
  .split("; ")
  .find((row) => row.startsWith("XSRF-TOKEN="))
  ?.split("=")[1];

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-XSRF-TOKEN"] = csrfToken; // Add CSRF token to header

axios
  .get("/sanctum/csrf-cookie")
  .then(() => {
    console.log("CSRF token initialized");
  })
  .catch((error) => {
    console.error("Error initializing CSRF:", error);
  });

// axios.defaults.withCredentials = true;
// axios.defaults.baseURL = 'http://localhost:8000';

// // Reusable function to initialize CSRF
// export const initializeCSRF = () => {
//   return axios.get('/sanctum/csrf-cookie')
//     .then(() => {
//       console.log('CSRF token initialized');
//     })
//     .catch(error => {
//       console.error('CSRF initialization failed:', error);
//     });
// };

const app = createApp(App);

app.use(router);

app.mount("#app");
