import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/css/tailwind.css";
import "./assets/style.css";
import "vue3-easy-data-table/dist/style.css";
import EasyDataTable from "vue3-easy-data-table";

import { getHeaderClass } from "@/global/custom";
import { vSafeHtml } from "@/helpers/sanitizeHtml";
import { initTheme } from "@/composables/useTheme";

// Apply the saved light/dark theme before the first paint
initTheme();

const app = createApp(App);

app.component("EasyDataTable", EasyDataTable);
app.directive("safe-html", vSafeHtml);
app.config.globalProperties.$getHeaderClass = getHeaderClass;

// Lucide icons are imported per component at build time (see vite.config.js)

app.use(router);
app.mount("#app");
