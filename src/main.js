import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import "./assets/css/tailwind.css";

// 👇 Import all icons from lucide-vue-next
import * as icons from "lucide-vue-next";

const app = createApp(App);

// 👇 Register all Lucide icons globally
for (const [name, component] of Object.entries(icons)) {
  app.component(name, component);
}

app.use(router);
app.mount("#app");