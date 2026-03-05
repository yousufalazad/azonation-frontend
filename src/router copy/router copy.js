// router/router.js (or wherever this file lives)
import { createRouter, createWebHistory } from "vue-router";
import superadminRoutes from './superadminRouter';
import individualRoutes from './individualRouter';
import orgRoutes from './orgRouter';
import functions from "@/global/cookie";

// Auth views
import Signup from "@/views/Auth/Signup.vue";
import Login from "@/views/Auth/Login.vue";
import ForgotPassword from "@/views/Auth/ForgotPassword.vue";
import VerifyCode from "@/views/Auth/VerifyCode.vue";
import ResetPassword from "@/views/Auth/ResetPassword.vue";

// Sign-up and signin via OAuth from Google
import OauthComplete from "@/views/Auth/OauthComplete.vue";
import OauthSignedIn from "@/views/Auth/OauthSignedIn.vue"; // optional sink

// Common views
import Individual from "@/views/Common/IndividualAccountOverview.vue";
import Organisation from "@/views/Common/OrganisationAccountOverview.vue";
import Pricing from "@/views/Common/Pricing.vue";
import Help from "@/views/Common/HelpCenter.vue";
import NotFound from "@/views/Common/NotFound.vue";
import Cookies from "@/views/Common/Cookies.vue";
import PrivacyPolicy from "@/views/Common/PrivacyPolicy.vue";
import TermsOfService from "@/views/Common/TermsOfService.vue";
import AboutUs from "@/views/Common/AboutUs.vue";
import ContactUs from "@/views/Common/ContactUs.vue";

// Base routes
const baseRoutes = [
  { path: "/", name: "login", component: Login },
  { path: "/signup", name: "signup", component: Signup },
  { path: "/verify-code", name: "verify-code", component: VerifyCode },
  { path: "/forgot-password", name: "forgot-password", component: ForgotPassword },
  { path: "/reset-password", name: "reset-password", component: ResetPassword },

  // OAuth routes 
  {
    path: "/oauth/complete",
    name: "oauth-complete",
    component: OauthComplete,
    meta: { requiresAuth: false },
  },
  {
    path: "/oauth/signed-in",
    name: "oauth-signed-in",
    component: OauthSignedIn,
    meta: { requiresAuth: false },
  },

  { path: "/individual", name: "individual", component: Individual },
  { path: "/organisation", name: "organisation", component: Organisation },
  { path: "/pricing", name: "pricing", component: Pricing },
  { path: "/help", name: "help", component: Help },


  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFound, meta: { requiresAuth: false } },

  { path: "/cookies", name: "cookies", component: Cookies, meta: { requiresAuth: false } },
  { path: "/privacy-policy", name: "privacy-policy", component: PrivacyPolicy, meta: { requiresAuth: false } },
  { path: "/terms-of-service", name: "terms-of-service", component: TermsOfService, meta: { requiresAuth: false } },
  { path: "/about-us", name: "about-us", component: AboutUs, meta: { requiresAuth: false } },
  { path: "/contact-us", name: "contact-us", component: ContactUs, meta: { requiresAuth: false } },
];

// route modules
const routes = [...superadminRoutes, ...individualRoutes, ...orgRoutes, ...baseRoutes];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Guard
router.beforeEach(async (to, from, next) => {
  const { authStore } = await import("../store/authStore");
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login" });
  } else if (to.meta.requiresAuth && to.meta.type !== authStore.getUserType()) {
    next("/");
  } else {
    next();
  }
});

export default router;
