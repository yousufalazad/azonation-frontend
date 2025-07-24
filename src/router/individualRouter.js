import IndividualDashboardLayout from "../views/Individual/Layouts/Layout.vue";
import IndividualDashboardIndex from "../views/Individual/Layouts/Dashboard/Index.vue";

import Notification from "../views/Individual/Layouts/Notification.vue";
import IndividualProfileUpdate from "../views/Individual/Profile/IndividualProfileUpdate.vue";

import MyAccount from "../views/Org/Profile/MyAccount.vue";
import Security from "../views/Individual/Profile/Security/Index.vue";
import Meeting from "../views/Individual/Meeting/Index.vue";
import Committee from "../views/Individual/Committee/Index.vue";
import Event from "../views/Individual/Event/Index.vue";
import Project from "../views/Individual/Project/Index.vue";
import Asset from "../views/Individual/Asset/Index.vue";
import Attendance from "../views/Individual/Attendance/Index.vue";
import Settings from "../views/Individual/Profile/Settings/Index.vue";


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
        path: "individual-profile-update",
        name: "individual-profile-update",
        component: IndividualProfileUpdate,
        meta: { requiresAuth: true },
      },
      {
        path: "my-account-individual",
        name: "my-account-individual",
        component: MyAccount,
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
        name: "individual-settings",
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
        path: "committees",
        name: "individual-committees",
        component: Committee,
        meta: { requiresAuth: true },
      },
      {
        path: "events",
        name: "individual-events",
        component: Event,
        meta: { requiresAuth: true },
      },
      {
        path: "projects",
        name: "individual-projects",
        component: Project,
        meta: { requiresAuth: true },
      },
      {
        path: "assets",
        name: "individual-assets",
        component: Asset,
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