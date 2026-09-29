import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import "@fortawesome/fontawesome-free/css/all.min.css";
// Self-hosted fonts: the browser downloads only the scripts (Latin, Bangla) a page uses
import "@fontsource/noto-sans/400.css";
import "@fontsource/noto-sans/500.css";
import "@fontsource/noto-sans/600.css";
import "@fontsource/noto-sans/700.css";
import "@fontsource/noto-sans-bengali/400.css";
import "@fontsource/noto-sans-bengali/600.css";
import "@fontsource/noto-sans-bengali/700.css";
import "./assets/css/tailwind.css";
import "./assets/style.css";
import "./assets/css/dark-bridge.css";
import "vue3-easy-data-table/dist/style.css";
import EasyDataTable from "vue3-easy-data-table";

import { getHeaderClass } from "@/global/custom";
import { vSafeHtml } from "@/helpers/sanitizeHtml";
import { initTheme } from "@/composables/useTheme";
import { i18n } from "@/i18n";

// Apply the saved light/dark theme before the first paint
initTheme();

const app = createApp(App);

app.component("EasyDataTable", EasyDataTable);
app.directive("safe-html", vSafeHtml);
app.config.globalProperties.$getHeaderClass = getHeaderClass;

// Lucide icons and Az* components are imported per component at build time (see vite.config.js)

app.use(i18n);
app.use(router);
app.mount("#app");
