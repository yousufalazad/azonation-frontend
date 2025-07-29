import IndividualDashboardLayout from "../views/Individual/Layouts/Layout.vue";
import IndividualDashboardIndex from "../views/Individual/Layouts/Dashboard/Index.vue";
import Notification from "../views/Individual/Layouts/Notification.vue";

import Profile from "../views/Individual/Profile/Index.vue";
import Security from "../views/Individual/Profile/Security/Index.vue";
import Settings from "../views/Individual/Profile/Settings/Index.vue";

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
    meta: { requiresAuth: true, type: 'individual' },
    children: [
      {
        path: "index",
        name: "individual-dashboard-index",
        component: IndividualDashboardIndex,
        meta: { requiresAuth: true },
      },
      {
        path: "notification",
        name: "notification",
        component: Notification,
        meta: { requiresAuth: true },
      },
      {
        path: "profile",
        name: "profile",
        component: Profile,
        meta: { requiresAuth: true },
      },
      {
        path: "security",
        name: "security",
        component: Security,
        meta: { requiresAuth: true },
      },
      {
        path: "settings",
        name: "settings",
        component: Settings,
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