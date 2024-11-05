import { createRouter, createWebHistory } from "vue-router";
import { authStore } from '../store/authStore';


//Auth
import Login from "../views/Auth/Login.vue";

//Individual
import IndividualRegister from "../views/Individual/Profile/Register.vue";
import IndividualDashboard from "../views/Individual/Layouts/Dashboard/Index.vue";
import IndividualDashboardInitialContent from "../views/Individual/Layouts/Dashboard/InitialContent.vue";

//import ConnectedOrganisation from "../views/Individual/--ConnectedOrganisation.vue";
import NotificationFromOrg from "../views/Individual/Notifications/NotificationFromOrg.vue";
import IndividualProfileUpdate from "../views/Individual/Profile/IndividualProfileUpdate.vue";


// Org
import OrgRegister from "../views/Org/Profile/Register.vue";
import OrgDashboard from "../views/Org/Layouts/Dashboard/Index.vue";
import OrgDashboardInitialContent from "@/views/Org/Layouts/Dashboard/InitialContent.vue";


//Asset Management
import AssetManagement from "../views/Org/Asset/Index.vue";

//History
import History from "../views/Org/History/Index.vue";

//StrategicPlan
import StrategicPlan from "../views/Org/StrategicPlan/Index.vue";

//Year plan
import YearPlan from "../views/Org/YearPlan/Index.vue"

//Success Story
import SuccessStory from "../views/Org/SuccessStory/Index.vue";

//Recognition
import Recognition from "../views/Org/Recognition/Index.vue"

// Org Profile
import Profile from "../views/Org/Profile/Profile.vue";
import fundamentalInfo from "../views/Org/Profile/FundamentalInfo.vue";
import MyAccount from "../views/Org/Profile/MyAccount.vue";
import OrgSecurity from "../views/Org/Profile/Security.vue";
import OrgSettings from "../views/Org/Profile/Settings.vue";


//Org Member
import AddMember from "../views/Org/Member/AddMember.vue";
import MemberList from "../views/Org/Member/MemberList.vue";

//Committee
import CommitteeList from "../views/Org/Committee/CommitteeList.vue";
import CreateCommittee from "../views/Org/Committee/CreateCommittee.vue";
import FormerCommitteeList from "../views/Org/Committee/FormerCommitteeList.vue";

//Meeting
import CreateMeeting from "../views/Org/Meeting/Create.vue";
import OrgPreviousMeetingList from "../views/Org/Meeting/PastMeetingList.vue";
import InviteMeeting from "../views/Org/Meeting/InviteMeeting.vue";

//Event
import CreateEvent from "../views/Org/Event/CreateEvent.vue";
import UpcomingEvents from "../views/Org/Event/EventList.vue";

//Project
import CreateProject from "../views/Org/Project/Create.vue";
import Projects from "../views/Org/Project/Index.vue";

//Founder
import Founders from "../views/Org/Founder/Create.vue";

//Report
import OrgReport from "../views/Org/Report/Index.vue";
import OrgExpenseReport from "../views/Org/Report/Expense.vue";


//Record
import OfficeRecord from "../views/Org/OfficeRecord/Index.vue";

//Accounts
import Accounts from "../views/Org/Accounts/Index.vue";

//Invite Friend
import InviteFriend from "../views/Org/InviteFriend/Index.vue";

//Billing
import Package from "../views/Org/Financial/Package.vue";
import Subscription from "../views/Org/Financial/Subscription.vue";
import OrgInvoiceList from "../views/Org/Financial/Invoice/InvoiceList.vue";
import ViewInvoice from "../views/Org/Financial/Invoice/ViewInvoice.vue";
import ReceiptList from "../views/Org/Financial/Receipt/ReceiptList.vue";
import ViewReceipt from "../views/Org/Financial/Receipt/ViewReceipt.vue";
import BillCalculation from "@/views/Org/Financial/BillCalculation.vue";
import BillingList from "../views/Org/Financial/BillingList.vue";


// ------------------------SUPER ADMIN----------------------------
//SuperAdmin
import SuperAdminRegister from "../views/SuperAdmin/Profile/Register.vue";
import SuperAdminDashboard from "../views/SuperAdmin/Layouts/Dashboard/Index.vue";
import SuperAdminDashboardInitialContent from "../views/SuperAdmin/Layouts/Dashboard/InitialContent.vue";
import SuperAdminProfileUpdate from "../views/SuperAdmin/Profile/SuperAdminProfileUpdate.vue";

//Package
import EditPackage from "../views/SuperAdmin/Financial/Package/Edit.vue";
import IndexPackage from "../views/SuperAdmin/Financial/Package/Index.vue";
import ViewPackage from "../views/SuperAdmin/Financial/Package/View.vue";

//Subscription
import EditSubscription from "../views/SuperAdmin/Financial/Subscription/Edit.vue";
import IndexSubscription from "../views/SuperAdmin/Financial/Subscription/Index.vue";
import ViewSubscription from "../views/SuperAdmin/Financial/Subscription/View.vue";

// ----------------Financial--------------

//Billing
import SuperAdminBillingList from "../views/SuperAdmin/Financial/Billing/Index.vue";
import SuperAdminBillingEdit from "../views/SuperAdmin/Financial/Billing/Edit.vue";
import SuperAdminBillingCreate from "../views/SuperAdmin/Financial/Billing/Create.vue";

//Receipt
import SuperAdminReceiptList from "@/views/SuperAdmin/Financial/Receipt/Index.vue";

//Invoice
import SuperAdminInvoiceList from "../views/SuperAdmin/Financial/Invoice/Index.vue";

//Subscription
import SuperAdminSubscriptionList from "../views/SuperAdmin/Financial/Subscription/Index.vue";

//Payment Log
import SuperAdminPaymentLog from "../views/SuperAdmin/Financial/Payment/Index.vue";


//Price
import EditPrice from "../views/SuperAdmin/Financial/Price/Edit.vue";
import IndexPrice from "../views/SuperAdmin/Financial/Price/Index.vue";
import ViewPrice from "../views/SuperAdmin/Financial/Price/View.vue";


// Mock authentication function
function isAuthenticated() {
  // Replace this with your actual authentication logic
  return !!sessionStorage.getItem("auth");
}

const routes = [
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
  //ORGANISATION
  {
    path: "/org-dashboard",
    name: "org-dashboard",
    component: OrgDashboard,
    meta: { requiresAuth: true,
      type: 'organisation',
    },
    children: [
      {
        path: "dashboard-initial-content",
        name: "dashboard-initial-content",
        component: OrgDashboardInitialContent,
        meta: { requiresAuth: true },
      },
      {
        path: "fundamental-info",
        name: "fundamental-info",
        component: fundamentalInfo,
        meta: { requiresAuth: true },
      },
      {
        path: "add-member",
        name: "add-member",
        component: AddMember,
        meta: { requiresAuth: true },
      },
      {
        path: "member-list",
        name: "member-list",
        component: MemberList,
        meta: { requiresAuth: true },
      },
      {
        path: "create-committee",
        name: "create-committee",
        component: CreateCommittee,
        meta: { requiresAuth: true },
      },
      {
        path: "committee-list",
        name: "committee-list",
        component: CommitteeList,
        meta: { requiresAuth: true },
      },
      {
        path: "former-committee-list",
        name: "former-committee-list",
        component: FormerCommitteeList,
        meta: { requiresAuth: true },
      },
      {
        path: "create-meeting",
        name: "create-meeting",
        component: CreateMeeting,
        meta: { requiresAuth: true },
      },
      {
        path: "previous-meeting-list",
        name: "previous-meeting-list",
        component: OrgPreviousMeetingList,
        meta: { requiresAuth: true },
      },
      {
        path: "invite-meeting",
        name: "invite-meeting",
        component: InviteMeeting,
        meta: { requiresAuth: true },
      },
      {
        path: "create-event",
        name: "create-event",
        component: CreateEvent,
        meta: { requiresAuth: true },
      },
      {
        path: "upcoming-events",
        name: "upcoming-events",
        component: UpcomingEvents,
        meta: { requiresAuth: true },
      },
      {
        path: "create-project",
        name: "create-project",
        component: CreateProject,
        meta: { requiresAuth: true },
      },
      {
        path: "projects",
        name: "projects",
        component: Projects,
        meta: { requiresAuth: true },
      },
      {
        path: "founders",
        name: "founders",
        component: Founders,
        meta: { requiresAuth: true },
      },
      {
        path: "history",
        name: "history",
        component: History,
        meta: { requiresAuth: true },
      },
      {
        path: "year-plan",
        name: "year-plan",
        component: YearPlan,
        meta: { requiresAuth: true },
      },
      {
        path: "strategic-plan",
        name: "strategic-plan",
        component: StrategicPlan,
        meta: { requiresAuth: true },
      },
      {
        path: "success-story",
        name: "success-story",
        component: SuccessStory,
        meta: { requiresAuth: true },
      },
      {
        path: "recognition",
        name: "recognition",
        component: Recognition,
        meta: { requiresAuth: true },
      },
      {
        path: "accounts",
        name: "accounts",
        component: Accounts,
        meta: { requiresAuth: true },
      },
      {
        path: "org-report",
        name: "org-report",
        component: OrgReport,
        meta: { requiresAuth: true },
      },
      {
        path: "org-expense-report",
        name: "org-expense-report",
        component: OrgExpenseReport,
        meta: { requiresAuth: true },
      },
      {
        path: "office-record",
        name: "office-record",
        component: OfficeRecord,
        meta: { requiresAuth: true },
      },
      {
        path: "asset-management",
        name: "asset-management",
        component: AssetManagement,
        meta: { requiresAuth: true },
      },
      {
        path: "my-account",
        name: "my-account",
        component: MyAccount,
        meta: { requiresAuth: true },

      children: 
      [
        {
          path: "profile",
          name: "profile",
          component: Profile,
          meta: { requiresAuth: true },
        },
        {
          path: "org-security",
          name: "org-security",
          component: OrgSecurity,
          meta: { requiresAuth: true },
        },
        {
          path: "org-settings",
          name: "org-settings",
          component: OrgSettings,
          meta: { requiresAuth: true },
        },
        {
          path: "package",
          name: "package",
          component: Package,
          meta: { requiresAuth: true },
        },
        {
          path: "subscription",
          name: "subscription",
          component: Subscription,
          meta: { requiresAuth: true },
        },
        {
          path: "billing-list",
          name: "billing-list",
          component: BillingList,
          meta: { requiresAuth: true },
        },
        {
          path: "bill-calculation",
          name: "bill-calculation",
          component: BillCalculation,
          meta: { requiresAuth: true },
        },
        {
          path: "invoice-list",
          name: "invoice-list",
          component: OrgInvoiceList,
          meta: { requiresAuth: true },
        },
        {
          path: "view-invoice",
          name: "view-invoice",
          component: ViewInvoice,
          meta: { requiresAuth: true },
        },
        {
          path: "receipt-list",
          name: "receipt-list",
          component: ReceiptList,
          meta: { requiresAuth: true },
        },
        {
          path: "view-receipt",
          name: "view-receipt",
          component: ViewReceipt,
          meta: { requiresAuth: true },
        },
        {
          path: "invite-friend",
          name: "invite-friend",
          component: InviteFriend,
          meta: { requiresAuth: true },
        },
      ],
    },
    ],
  },

  //INDIVIDUAL
  {
    path: "/individual-dashboard",
    name: "individual-dashboard",
    component: IndividualDashboard,
    meta: { requiresAuth: true, type: 'individual'},
    children: [
      {
        path: "individual-dashboard-initial-content",
        name: "individual-dashboard-initial-content",
        component: IndividualDashboardInitialContent,
        meta: { requiresAuth: true },
      },
      // {
      //   path: "connected-organisation",
      //   name: "connected-organisation",
      //   component: ConnectedOrganisation,
      //   meta: { requiresAuth: true },
      // },
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

  //SUPERADMIN
  {
    path: "/superadmin-dashboard",
    name: "superadmin-dashboard",
    component: SuperAdminDashboard,
    meta: { requiresAuth: true,
      type: 'superadmin',
     },
    children: [
      {
        path: "initial-content",
        name: "initial-content",
        component: SuperAdminDashboardInitialContent,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-profile-update",
        name: "super-admin-profile-update",
        component: SuperAdminProfileUpdate,
        meta: { requiresAuth: true },
      },
      {
        path: "edit-package",
        name: "edit-package",
        component: EditPackage,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-packages",
        name: "super-admin-packages",
        component: IndexPackage,
        meta: { requiresAuth: true },
      },
      {
        path: "view-package",
        name: "view-package",
        component: ViewPackage,
        meta: { requiresAuth: true },
      },
      {
        path: "edit-price",
        name: "edit-price",
        component: EditPrice,
        meta: { requiresAuth: true },
      },
      {
        path: "index-price",
        name: "index-price",
        component: IndexPrice,
        meta: { requiresAuth: true },
      },
      {
        path: "view-price",
        name: "view-price",
        component: ViewPrice,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-payment-log",
        name: "super-admin-payment-log",
        component: SuperAdminPaymentLog,
        meta: { requiresAuth: true },
      },
      {
        path: "edit-subscription",
        name: "edit-subscription",
        component: EditSubscription,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-subscription-list",
        name: "super-admin-subscription-list",
        component: SuperAdminSubscriptionList,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-view-subscription",
        name: "super-admin-view-subscription",
        component: ViewSubscription,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-billing-list",
        name: "super-admin-billing-list",
        component: SuperAdminBillingList,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-invoice-list",
        name: "super-admin-invoice-list",
        component: SuperAdminInvoiceList,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-receipt-list",
        name: "super-admin-receipt-list",
        component: SuperAdminReceiptList,
        meta: { requiresAuth: true },
      },

    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// const router = createRouter({
//   history: createWebHistory(),
//   routes
// })

// router.beforeEach((to, from, next) => {
//   if (to.matched.some((record) => record.meta.requiresAuth)) {
//     if (!isAuthenticated()) {
//       next({ name: "login" });
//     } else {
//       next();
//     }
//   } else {
//     next();
//   }
// });

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({name: "login"})
  } else if (to.meta.requiresAuth && to.meta.type != authStore.getUserType()) {
      next('/')
  } else {
      next()
  }
})

export default router;
