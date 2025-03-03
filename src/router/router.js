import { createRouter, createWebHistory } from "vue-router";
import { authStore } from '../store/authStore';
import superadminRoutes from '../router/superadminRouter';
import individualRoutes from '../router/individualRouter';
import orgRoutes from '../router/orgRouter';

//Home
import Home from "../views/Home.vue";

//Auth
import Login from "../views/Auth/Login.vue";

//Individual
import IndividualRegister from "../views/Individual/Profile/Register.vue";

// Org
import OrgRegister from "../views/Org/Profile/Register.vue";

//SuperAdmin
import SuperAdminRegister from "../views/SuperAdmin/Profile/Register.vue";

// Mock authentication function
function isAuthenticated() {
  // Replace this with your actual authentication logic
  return !!sessionStorage.getItem("auth");
}

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
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
    path: "/superAdmin-register",
    name: "superAdmin-register",
    component: SuperAdminRegister,
  },
];

//routes = [orgRoutes, ...routes]; // Add orgRoutes to the routes

// Merge all route modules properly
routes = [...superadminRoutes, ...individualRoutes, ...orgRoutes, ...routes];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Add route guard for authentication
router.beforeEach((to, from, next) => {
  const auth = authStore(); 

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: "login" });
  } else if (to.meta.requiresAuth && to.meta.type !== auth.getUserType()) {
    next("/");
  } else {
    next();
  }
});

export default router;