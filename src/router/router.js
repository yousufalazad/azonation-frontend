import { createRouter, createWebHistory } from "vue-router";
import superadminRoutes from './superadminRouter';
import individualRoutes from './individualRouter';
import orgRoutes from './orgRouter';
import functions from "@/global/cookie";

//Auth
import Signup from "@/views/Auth/Signup.vue";
import Login from "../views/Auth/Login.vue";
import ForgotPassword from '../views/Auth/ForgotPassword.vue';
import VerifyCode from '../views/Auth/VerifyCode.vue';
import ResetPassword from '../views/Auth/ResetPassword.vue';
import Individual from "@/views/Common/Individual.vue";
import Organisation from "@/views/Common/Organisation.vue";
import Pricing from "@/views/Common/Pricing.vue";
import Help from "@/views/Common/Help.vue";
import NotFound from "@/views/Common/NotFound.vue";
import Cookies from "@/views/Common/Cookies.vue";

// Mock authentication function
function isAuthenticated() {
  return !!sessionStorage.getItem("auth");
}

const baseRoutes = [
  {
    path: "/",
    name: "home",
    component: Signup, // Assuming this is the landing page
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/signup",
    name: "signup",
    component: Signup,
  },
  {
    path: "/verify-code",
    name: "verify-code",
    component: VerifyCode,
  },
  {
    path: "/forgot-password", // before login
    name: "forgot-password",
    component: ForgotPassword,
  },
  {
    path: "/reset-password", // after login for new password
    name: "reset-password",
    component: ResetPassword,
  },
  {
    path: "/individual", // after login for new password
    name: "individual",
    component: Individual,
  },
  {
    path: "/organisation", // after login for new password
    name: "organisation",
    component: Organisation,
  },
  {
    path: "/pricing", // after login for new password
    name: "pricing",
    component: Pricing,
  },
  {
    path: "/help", // after login for new password
    name: "help",
    component: Help,
  },
  {
    path: "/:pathMatch(.*)*", // Catch-all route for 404
    name: "not-found",
    component: NotFound,
    meta: { requiresAuth: false },
  },
  {
    path: "/:catchAll(.*)", // Catch-all route for 404
    name: "not-found",
    component: NotFound,
    meta: { requiresAuth: false },
  },
  {
    path: "/cookies",
    name: "cookies",
    component: Cookies,
    meta: { requiresAuth: false },
  },
];

// Merge all route modules properly
const routes = [...superadminRoutes, ...individualRoutes, ...orgRoutes, ...baseRoutes];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Add route guard for authentication
router.beforeEach(async (to, from, next) => {
  const { authStore } = await import("../store/authStore"); // 👈 Fix applied
  // const auth = authStore(); 

  console.log(functions.getCookie("user") == 'undefined');
  console.log(typeof functions.getCookie("user"));


  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login" });
  } else if (to.meta.requiresAuth && to.meta.type !== authStore.getUserType()) {
    next("/");
  } else {
    next();
  }
});

export default router;