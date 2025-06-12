import IndividualDashboardLayout from "../views/Individual/Layouts/Layout.vue";
import IndividualDashboardIndex from "../views/Individual/Layouts/Dashboard/Index.vue";

import NotificationFromOrg from "../views/Individual/Notifications/NotificationFromOrg.vue";
import IndividualProfileUpdate from "../views/Individual/Profile/IndividualProfileUpdate.vue";

import MyAccount from "../views/Org/Profile/MyAccount.vue";

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