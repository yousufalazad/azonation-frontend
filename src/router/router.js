// router/router.js
import { createRouter, createWebHistory } from "vue-router";
import superadminRoutes from "./superadminRouter";
import individualRoutes from "./individualRouter";
import orgRoutes from "./orgRouter";

// Auth views
const Signup = () => import("@/views/Auth/Signup.vue");
import Login from "@/views/Auth/Login.vue";
const ForgotPassword = () => import("@/views/Auth/ForgotPassword.vue");
const VerifyCode = () => import("@/views/Auth/VerifyCode.vue");
const ResetPassword = () => import("@/views/Auth/ResetPassword.vue");
// OAuth
const OauthComplete = () => import("@/views/Auth/OauthComplete.vue");
const OauthSignedIn = () => import("@/views/Auth/OauthSignedIn.vue");
// Common views
const Individual = () => import("@/views/Common/IndividualAccountOverview.vue");
const Organisation = () => import("@/views/Common/OrganisationAccountOverview.vue");
const Pricing = () => import("@/views/Common/Pricing.vue");
const Help = () => import("@/views/Common/HelpCenter.vue");
const NotFound = () => import("@/views/Common/NotFound.vue");
const Cookies = () => import("@/views/Common/Cookies.vue");
const PrivacyPolicy = () => import("@/views/Common/PrivacyPolicy.vue");
const TermsOfService = () => import("@/views/Common/TermsOfService.vue");
const AboutUs = () => import("@/views/Common/AboutUs.vue");
const ContactUs = () => import("@/views/Common/ContactUs.vue");
const Unauthorized = () => import("@/views/Common/Unauthorized.vue");
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

  // Design system reference (development builds only)
  ...(import.meta.env.DEV
    ? [{ path: "/style-guide", name: "style-guide", component: () => import("@/views/Common/StyleGuide.vue") }]
    : []),

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
    // Fail closed: if the session check breaks, never open a protected page
    return to.meta.requiresAuth ? next({ name: "login" }) : next();
  }
});

/* ===========================================================
   STALE CHUNK RECOVERY
   After a new deploy, an open tab may request page files that no longer
   exist. Reload once to get the new version instead of showing a blank page.
=========================================================== */
router.onError((error, to) => {
  const chunkFailed = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    error?.message || "",
  );
  if (!chunkFailed) return;
  const key = "azonation_chunk_reload";
  try {
    if (sessionStorage.getItem(key) === to.fullPath) return;
    sessionStorage.setItem(key, to.fullPath);
  } catch (e) {}
  window.location.assign(to.fullPath);
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
