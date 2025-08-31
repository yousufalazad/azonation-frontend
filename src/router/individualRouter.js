import IndividualDashboardLayout from "../views/Individual/Layouts/Layout.vue";
import IndividualDashboardIndex from "../views/Individual/Layouts/Dashboard/Index.vue";
import HeaderNotifications from "../views/Individual/Layouts/HeaderNotification.vue";
import Notifications from "../views/Individual/Notification/Index.vue";
import Organisations from "../views/Individual/Organisation/Index.vue";

//Profile
import IndividualProfile from "../views/Individual/Profile/Index.vue";
import IndividualSecurity from "../views/Individual/Profile/Security/Index.vue";
import IndividualSettings from "../views/Individual/Profile/Settings/Index.vue";

import Meeting from "../views/Individual/Meeting/Index.vue";
import PastMeeting from "../views/Individual/Meeting/PastMeeting.vue";
import Committee from "../views/Individual/Committee/Index.vue";
import PastCommittee from "../views/Individual/Committee/PastCommittee.vue";
import Event from "../views/Individual/Event/Index.vue";
import PastEvent from "../views/Individual/Event/PastEvent.vue";
import Project from "../views/Individual/Project/Index.vue";
import PastProject from "../views/Individual/Project/PastProject.vue";
import Asset from "../views/Individual/Asset/Index.vue";
import PastAsset from "../views/Individual/Asset/PastAsset.vue";
import Attendance from "../views/Individual/Attendance/Index.vue";

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
        path: "notifications",
        name: "notifications",
        component: Notifications,
        meta: { requiresAuth: true },
      },
      {
        path: "connected-organisations",
        name: "connected-organisations",
        component: Organisations,
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
        path: "meetings",
        name: "individual-meetings",
        component: Meeting,
        meta: { requiresAuth: true },
      },
      {
        path: "past-meetings",
        name: "past-individual-meetings",
        component: PastMeeting,
        meta: { requiresAuth: true },
      },
      {
        path: "committees",
        name: "individual-committees",
        component: Committee,
        meta: { requiresAuth: true },
      },
      {
        path: "past-committees",
        name: "past-individual-committees",
        component: PastCommittee,
        meta: { requiresAuth: true },
      },
      {
        path: "events",
        name: "individual-events",
        component: Event,
        meta: { requiresAuth: true },
      },
      {
        path: "past-events",
        name: "past-individual-events",
        component: PastEvent,
        meta: { requiresAuth: true },
      },
      {
        path: "projects",
        name: "individual-projects",
        component: Project,
        meta: { requiresAuth: true },
      },
      {
        path: "past-projects",
        name: "past-individual-projects",
        component: PastProject,
        meta: { requiresAuth: true },
      },
      {
        path: "assets",
        name: "individual-assets",
        component: Asset,
        meta: { requiresAuth: true },
      },
      {
        path: "past-assets",
        name: "past-individual-assets",
        component: PastAsset,
        meta: { requiresAuth: true },
      },
      {
        path: "attendances",
        name: "individual-attendances",
        component: Attendance,
        meta: { requiresAuth: true },
      },
    ],
  },
];
export default individualRoutes;
