const IndividualDashboardLayout = () => import("../views/Individual/Layouts/Layout.vue");
const IndividualDashboardIndex = () => import("../views/Individual/Layouts/Dashboard/Index.vue");
const HeaderNotifications = () => import("../views/Individual/Layouts/HeaderNotification.vue");
// Account pages shared with organisations
const Notifications = () => import("../views/Org/Notification/Index.vue");
const NotificationSettings = () => import("../views/Org/Notification/UserNotifications.vue");
const Support = () => import("../views/Org/Support/Index.vue");
const SupportRequest = () => import("../views/Org/Support/View.vue");
const ConnectedOrganisations = () => import("../views/Individual/Organisation/Index.vue");
//Profile
const IndividualProfile = () => import("../views/Org/Profile/Profile.vue");
const IndividualSecurity = () => import("../views/Org/Profile/Security.vue");
const IndividualSettings = () => import("../views/Org/Profile/Settings.vue");
const Committee = () => import("../views/Individual/Committee/Index.vue");
const Asset = () => import("../views/Individual/Asset/Index.vue");
const Attendance = () => import("../views/Individual/Attendance/Index.vue");
// add near the other imports
const Event = () => import("../views/Individual/Event/Index.vue");
const ViewIndividualEvent = () => import("../views/Individual/Event/View.vue");
const Project = () => import("../views/Individual/Project/Index.vue");
const ViewIndividualProject = () => import("../views/Individual/Project/View.vue");
const Meeting = () => import("../views/Individual/Meeting/Index.vue");
const ViewIndividualMeeting = () => import("../views/Individual/Meeting/View.vue");
const individualRoutes = [
  {
    path: "/individual-dashboard",
    name: "individual-dashboard",
    component: IndividualDashboardLayout,
    meta: { requiresAuth: true, type: "individual" },
    children: [
      {
        path: "index",
        name: "individual-dashboard-index",
        component: IndividualDashboardIndex,
        meta: { requiresAuth: true },
      },
      {
        path: "header-notifications",
        name: "header-notifications",
        component: HeaderNotifications,
        meta: { requiresAuth: true },
      },
      {
        path: "individual-notifications",
        name: "individual-notifications",
        component: Notifications,
        meta: { requiresAuth: true },
      },
      {
        path: "connected-organisations",
        name: "connected-organisations",
        component: ConnectedOrganisations,
        meta: { requiresAuth: true },
      },
      {
        path: "individual-profile",
        name: "individual-profile",
        component: IndividualProfile,
        meta: { requiresAuth: true },
      },
      {
        path: "individual-security",
        name: "individual-security",
        component: IndividualSecurity,
        meta: { requiresAuth: true },
      },
      {
        path: "individual-settings",
        name: "individual-settings",
        component: IndividualSettings,
        meta: { requiresAuth: true },
      },
      {
        path: "notification-settings",
        name: "individual-notification-settings",
        component: NotificationSettings,
        meta: { requiresAuth: true },
      },
      {
        path: "support",
        name: "individual-support",
        component: Support,
        meta: { requiresAuth: true },
      },
      {
        path: "support/:id",
        name: "individual-support-request",
        component: SupportRequest,
        meta: { requiresAuth: true },
      },
      // A member's own view of their organisations: open to every member
      { path: "meetings", name: "individual-meetings", component: Meeting, meta: { requiresAuth: true } },
      { path: "meeting/view/:id", name: "view-individual-meeting", component: ViewIndividualMeeting, meta: { requiresAuth: true } },
      { path: "past-meetings", name: "past-individual-meetings", redirect: { name: "individual-meetings", query: { tab: "past" } } },
      { path: "events", name: "individual-events", component: Event, meta: { requiresAuth: true } },
      { path: "event/view/:id", name: "view-individual-event", component: ViewIndividualEvent, meta: { requiresAuth: true } },
      { path: "past-events", name: "past-individual-events", redirect: { name: "individual-events", query: { tab: "past" } } },
      { path: "projects", name: "individual-projects", component: Project, meta: { requiresAuth: true } },
      { path: "project/view/:id", name: "view-individual-project", component: ViewIndividualProject, meta: { requiresAuth: true } },
      { path: "past-projects", name: "past-individual-projects", redirect: { name: "individual-projects", query: { tab: "past" } } },
      { path: "committees", name: "individual-committees", component: Committee, meta: { requiresAuth: true } },
      { path: "past-committees", name: "past-individual-committees", redirect: { name: "individual-committees", query: { tab: "past" } } },
      { path: "assets", name: "individual-assets", component: Asset, meta: { requiresAuth: true } },
      { path: "past-assets", name: "past-individual-assets", redirect: { name: "individual-assets", query: { tab: "past" } } },
      { path: "attendances", name: "individual-attendances", component: Attendance, meta: { requiresAuth: true } },

    ],
  },
];
export default individualRoutes;
