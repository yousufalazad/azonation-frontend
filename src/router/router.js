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