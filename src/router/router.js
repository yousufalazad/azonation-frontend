import { createRouter, createWebHistory } from "vue-router";
import superadminRoutes from './superadminRouter';
import individualRoutes from './individualRouter';
import orgRoutes from './orgRouter';
import functions from "@/global/cookie";

//Home
import Home from "../views/Home.vue";

//Auth
import Login from "../views/Auth/Login.vue";
import ForgotPassword from '../views/Auth/ForgotPassword.vue';
import VerifyCode from '../views/Auth/VerifyCode.vue';
import ResetPassword from '../views/Auth/ResetPassword.vue';

//Individual
import IndividualRegister from "../views/Auth/IndividualRegister.vue";

// Org
import OrgRegister from "../views/Auth/OrgRegister.vue";

//SuperAdmin
import SuperadminRegister from "../views/Auth/SuperadminRegister.vue";

// Mock authentication function
function isAuthenticated() {
  return !!sessionStorage.getItem("auth");
}

const baseRoutes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPassword,
  },
  {
    path: "/verify-code",
    name: "verify-code",
    component: VerifyCode,
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: ResetPassword,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/individual-register",
    name: "individual-register",
    component: IndividualRegister,
  },
  {
    path: "/org-register",
    name: "org-register",
    component: OrgRegister,
  },
  {
    path: "/superadmin-register",
    name: "superadmin-register",
    component: SuperadminRegister,
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