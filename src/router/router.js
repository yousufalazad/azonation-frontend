// router/router.js
import { createRouter, createWebHistory } from "vue-router";
import superadminRoutes from "./superadminRouter";
import individualRoutes from "./individualRouter";
import orgRoutes from "./orgRouter";
import functions from "@/global/cookie";

// Auth views
import Signup from "@/views/Auth/Signup.vue";
import Login from "@/views/Auth/Login.vue";
import ForgotPassword from "@/views/Auth/ForgotPassword.vue";
import VerifyCode from "@/views/Auth/VerifyCode.vue";
import ResetPassword from "@/views/Auth/ResetPassword.vue";

// OAuth
import OauthComplete from "@/views/Auth/OauthComplete.vue";
import OauthSignedIn from "@/views/Auth/OauthSignedIn.vue";

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
import Unauthorized from "@/views/Common/Unauthorized.vue";

/* ===========================================================
   TOP LOADER REGISTER
=========================================================== */
let topLoaderRef = null;
export function setTopLoader(loader) {
  topLoaderRef = loader;
}

/* ===========================================================
   BASE ROUTES
=========================================================== */
const baseRoutes = [
  { path: "/", name: "login", component: Login },
  { path: "/signup", name: "signup", component: Signup },
  { path: "/verify-code", name: "verify-code", component: VerifyCode },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPassword,
  },
  { path: "/reset-password", name: "reset-password", component: ResetPassword },

  // OAuth
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
  // unauthorized
  { path: "/unauthorized", name: "unauthorized", component: Unauthorized },

  // Public pages
  { path: "/individual", name: "individual", component: Individual },
  { path: "/organisation", name: "organisation", component: Organisation },
  { path: "/pricing", name: "pricing", component: Pricing },
  { path: "/help", name: "help", component: Help },

  // Legal
  { path: "/cookies", name: "cookies", component: Cookies },
  { path: "/privacy-policy", name: "privacy-policy", component: PrivacyPolicy },
  {
    path: "/terms-of-service",
    name: "terms-of-service",
    component: TermsOfService,
  },
  { path: "/about-us", name: "about-us", component: AboutUs },
  { path: "/contact-us", name: "contact-us", component: ContactUs },

  // 404
  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFound },
];

/* ===========================================================
   MERGED ROUTES
=========================================================== */
const routes = [
  ...superadminRoutes,
  ...individualRoutes,
  ...orgRoutes,
  ...baseRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/* ===========================================================
   ROUTER GUARD + TOP LOADER CONTROL
=========================================================== */
router.beforeEach(async (to, from, next) => {
  try {
    topLoaderRef?.start?.();
  } catch (e) {}

  try {
    const { authStore } = await import("../store/authStore");
    await authStore.init();   // after refresh, session is checked from server, and user data is set in store

    // logged in user login/signup page forwarded to dashboard page
    const guestOnly = ["login", "signup", "forgot-password", "reset-password", "verify-code"];
    if (authStore.isAuthenticated && guestOnly.includes(to.name)) {
      const home = {
        individual: "individual-dashboard-index",
        organisation: "org-dashboard-index",
        superadmin: "superadmin-dashboard-index",
      }[authStore.getUserType()];
      if (home) {
        try { topLoaderRef?.finish?.(); } catch (e) {}
        return next({ name: home });
      }
    }

    // Not logged in
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      try {
        topLoaderRef?.finish?.();
      } catch (e) {}
      return next({ name: "login" });
    }

    // Wrong user type
    if (
      to.meta.requiresAuth &&
      to.meta.type &&
      to.meta.type !== authStore.getUserType()
    ) {
      try {
        topLoaderRef?.finish?.();
      } catch (e) {}
      return next("/");
    }
   
    /* ================= PERMISSION CHECK ================= */
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
      try {
        topLoaderRef?.finish?.();
      } catch (e) {}
      return next({ name: "unauthorized" });
    }

    return next();
  } catch (err) {
    try {
      topLoaderRef?.finish?.();
    } catch (e) {}
    return next();
  }
});

/* ===========================================================
   AFTER EACH — SMOOTH FINISH
=========================================================== */
router.afterEach(() => {
  setTimeout(() => {
    try {
      topLoaderRef?.finish?.();
    } catch (e) {}
  }, 250);
});

export default router;
