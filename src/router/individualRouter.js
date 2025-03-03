import IndividualDashboard from "../views/Individual/Layouts/Dashboard/Index.vue";
import IndividualDashboardInitialContent from "../views/Individual/Layouts/Dashboard/InitialContent.vue";

import NotificationFromOrg from "../views/Individual/Notifications/NotificationFromOrg.vue";
import IndividualProfileUpdate from "../views/Individual/Profile/IndividualProfileUpdate.vue";

import MyAccount from "../views/Org/Profile/MyAccount.vue";

const individualRoutes = [
  {
    path: "/individual-dashboard",
    name: "individual-dashboard",
    component: IndividualDashboard,
    meta: { requiresAuth: true, type: 'individual' },
    children: [
      {
        path: "individual-dashboard-initial-content",
        name: "individual-dashboard-initial-content",
        component: IndividualDashboardInitialContent,
        meta: { requiresAuth: true },
      },
      {
        path: "notification-from-org",
        name: "notification-from-org",
        component: NotificationFromOrg,
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
    ],
  },
];
export default individualRoutes;