// import './assets/main.css'
//import './assets/style.css'

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import "./assets/css/tailwind.css";
// import axios from "axios";

const app = createApp(App);

app.use(router);
app.mount("#app");
