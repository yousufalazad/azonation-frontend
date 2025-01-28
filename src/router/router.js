import { createRouter, createWebHistory } from "vue-router";
import { authStore } from '../store/authStore';

//Home
import Home from "../views/Home.vue";

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
import CreateAsset from "../views/Org/Asset/Create.vue";
import EditAsset from "../views/Org/Asset/Edit.vue";
import ViewAsset from "../views/Org/Asset/View.vue";

//History
import History from "../views/Org/History/Index.vue";
import CreateHistory from "../views/Org/History/Create.vue";
import EditHistory from "../views/Org/History/Edit.vue";
import ViewHistory from "../views/Org/History/View.vue";

//StrategicPlan
import StrategicPlan from "../views/Org/StrategicPlan/Index.vue";
import CreateStrategicPlan from "../views/Org/StrategicPlan/Create.vue";
import EditStrategicPlan from "../views/Org/StrategicPlan/Edit.vue";
import ViewStrategicPlan from "../views/Org/StrategicPlan/View.vue";

//Year plan
import YearPlan from "../views/Org/YearPlan/Index.vue"

//Success Story
import SuccessStory from "../views/Org/SuccessStory/Index.vue";
import CreateSuccessStory from "../views/Org/SuccessStory/Create.vue";
import EditSuccessStory from "../views/Org/SuccessStory/Edit.vue";
import ViewSuccessStory from "../views/Org/SuccessStory/View.vue";

//Recognition
import Recognition from "../views/Org/Recognition/Index.vue"
import CreateRecognition from "../views/Org/Recognition/Create.vue";
import EditRecognition from "../views/Org/Recognition/Edit.vue";
import ViewRecognition from "../views/Org/Recognition/View.vue";


// Org Profile
import Profile from "../views/Org/Profile/Profile.vue";
import fundamentalInfo from "../views/Org/Profile/FundamentalInfo.vue";
import MyAccount from "../views/Org/Profile/MyAccount.vue";
import OrgSecurity from "../views/Org/Profile/Security.vue";
import OrgSettings from "../views/Org/Profile/Settings.vue";


//Org Member
import IndependentMember from "../views/Org/Member/IndependentMember.vue";
import AddMember from "../views/Org/Member/AddMember.vue";
import MemberList from "../views/Org/Member/MemberList.vue";

//Committee
import CommitteeList from "../views/Org/Committee/CommitteeList.vue";
import CreateCommittee from "../views/Org/Committee/CreateCommittee.vue";
import FormerCommitteeList from "../views/Org/Committee/FormerCommitteeList.vue";

//Meeting
import IndexMeeting from "../views/Org/Meeting/Index.vue";
import CreateMeeting from "../views/Org/Meeting/Create.vue";
import EditMeeting from "../views/Org/Meeting/Edit.vue";
import ViewMeeting from "../views/Org/Meeting/View.vue";

import IndexMeetingMinutes from "../views/Org/MeetingMinutes/Index.vue";
import CreateMeetingMinutes from "../views/Org/MeetingMinutes/Create.vue";
import EditMeetingMinutes from "../views/Org/MeetingMinutes/Edit.vue";
import ViewMeetingMinutes from "../views/Org/MeetingMinutes/View.vue";
import MeetingAttendances from "../views/Org/Meeting/MeetingAttendances.vue";
import MeetingGuestAttendance from "@/views/Org/Meeting/MeetingGuestAttendances.vue";

//Event
import IndexEvent from "../views/Org/Event/Index.vue";
import CreateEvent from "../views/Org/Event/Create.vue";
import EditEvent from "../views/Org/Event/Edit.vue";
import ViewEvent from "../views/Org/Event/View.vue";
import UpcomingEvents from "../views/Org/Event/EventList.vue";

import IndexEventSummary from "../views/Org/Event/EventSummary/Index.vue";
import CreateEventSummary from "../views/Org/Event/EventSummary/Create.vue";
import EditEventSummary from "../views/Org/Event/EventSummary/Edit.vue";
import ViewEventSummary from "../views/Org/Event/EventSummary/View.vue";
import EventAttendances from "../views/Org/Event/EventAttendances.vue";
import EventGuestAttendance from "../views/Org/Event/EventGuestAttendance.vue";

//Project and Project Summary
import IndexProject from "../views/Org/Project/Index.vue";
import CreateProject from "../views/Org/Project/Create.vue";
import EditProject from "../views/Org/Project/Edit.vue";
import ViewProject from "../views/Org/Project/View.vue";

import ProjectAttendances from "../views/Org/Project/ProjectAttendances.vue";
import ProjectGuestAttendance from "@/views/Org/Project/ProjectGuestAttendance.vue";

import IndexProjectSummary from "../views/Org/Project/ProjectSummary/Index.vue";
import CreateProjectSummary from "../views/Org/Project/ProjectSummary/Create.vue";
import EditProjectSummary from "../views/Org/Project/ProjectSummary/Edit.vue";
import ViewProjectSummary from "../views/Org/Project/ProjectSummary/View.vue";


//Founder
import Founders from "../views/Org/Founder/Create.vue";

//Report
import OrgReport from "../views/Org/Report/Index.vue";
import OrgExpenseReport from "../views/Org/Report/Expense.vue";


//Record
import OfficeRecord from "../views/Org/OfficeRecord/Index.vue";
import CreateRecord from "../views/Org/OfficeRecord/Create.vue";
import EditRecord from "../views/Org/OfficeRecord/Edit.vue";

//Accounts
import Accounts from "../views/Org/Accounts/Index.vue";
import AccountsFunds from "../views/Org/Accounts/Fund.vue";

//Invite Friend
import InviteFriend from "../views/Org/InviteFriend/Index.vue";

//Billing
import Package from "../views/Org/Financial/Package.vue";
import Subscription from "../views/Org/Financial/Subscription.vue";
import OrgInvoiceList from "../views/Org/Financial/Invoice/InvoiceList.vue";
import ViewInvoice from "../views/Org/Financial/Invoice/ViewInvoice.vue";
import OrgReceiptList from "../views/Org/Financial/Receipt/ReceiptList.vue";
import ViewOrgReceipt from "../views/Org/Financial/Receipt/ViewReceipt.vue";
import BillCalculation from "@/views/Org/Financial/BillCalculation.vue";
import BillList from "../views/Org/Financial/BillingList.vue";



// ------------------------SUPER ADMIN----------------------------
//SuperAdmin
import SuperAdminRegister from "../views/SuperAdmin/Profile/Register.vue";
import SuperAdminDashboard from "../views/SuperAdmin/Layouts/Dashboard/Index.vue";
import SuperAdminDashboardInitialContent from "../views/SuperAdmin/Layouts/Dashboard/InitialContent.vue";
import SuperAdminProfileUpdate from "../views/SuperAdmin/Profile/SuperAdminProfileUpdate.vue";

// Financial
//Package
import EditPackage from "../views/SuperAdmin/Financial/Package/Edit.vue";
import IndexPackage from "../views/SuperAdmin/Financial/Package/Index.vue";
import ViewPackage from "../views/SuperAdmin/Financial/Package/View.vue";

//Currency
import IndexCurrency from "../views/SuperAdmin/Financial/Currency/Index.vue";

//Payment Method

//Subscription
import EditSubscription from "../views/SuperAdmin/Financial/Subscription/Edit.vue";
//import IndexSubscription from "../views/SuperAdmin/Financial/Subscription/Index.vue";
import ViewSubscription from "../views/SuperAdmin/Financial/Subscription/View.vue";
import SuperAdminSubscriptionList from "../views/SuperAdmin/Financial/Subscription/Index.vue";

//UserPrice
import UserPriceRate from "../views/SuperAdmin/Financial/UserPriceRate/Index.vue";

//Billing
import SuperAdminBillingList from "../views/SuperAdmin/Financial/Billing/Index.vue";
import SuperAdminBillingCreate from "../views/SuperAdmin/Financial/Billing/Create.vue";
import SuperAdminBillingEdit from "../views/SuperAdmin/Financial/Billing/Edit.vue";
import SuperAdminBillingView from "../views/SuperAdmin/Financial/Billing/View.vue";

//Invoice
import SuperAdminInvoiceList from "../views/SuperAdmin/Financial/Invoice/Index.vue";
import SuperAdminInvoiceCreate from "../views/SuperAdmin/Financial/Invoice/Create.vue";
import SuperAdminInvoiceEdit from "../views/SuperAdmin/Financial/Invoice/Edit.vue";
import SuperAdminInvoiceView from "../views/SuperAdmin/Financial/Invoice/View.vue";

//Receipt
import SuperAdminReceiptList from "@/views/SuperAdmin/Financial/Receipt/Index.vue";
import SuperAdminReceiptCreate from "@/views/SuperAdmin/Financial/Receipt/Create.vue";
import SuperAdminReceiptEdit from "@/views/SuperAdmin/Financial/Receipt/Edit.vue";
import SuperAdminReceiptView from "@/views/SuperAdmin/Financial/Receipt/View.vue";


//Payment Log
import SuperAdminPaymentLog from "../views/SuperAdmin/Financial/Payment/Index.vue";

//SuperAdmin Master Setting
import Country from "../views/SuperAdmin/MasterSetting/Country.vue";
import Region from "../views/SuperAdmin/MasterSetting/Region.vue";
import RegionCurrency from "../views/SuperAdmin/MasterSetting/RegionCurrency.vue";
import CountryRegion from "../views/SuperAdmin/MasterSetting/CountryRegion.vue";
import UserCountry from "../views/SuperAdmin/MasterSetting/UserCountry.vue";
import DialingCode from "../views/SuperAdmin/MasterSetting/DialingCode.vue";
import AttendanceType from "../views/SuperAdmin/MasterSetting/AttendanceType.vue";
import ConductType from "../views/SuperAdmin/MasterSetting/ConductType.vue";
import MembershipType from "../views/SuperAdmin/MasterSetting/MembershipType.vue";
import Designation from "../views/SuperAdmin/MasterSetting/Designation.vue";
import LanguageList from "../views/SuperAdmin/MasterSetting/LanguageList.vue";
import TimeZoneSetup from "../views/SuperAdmin/MasterSetting/TimeZoneSetup.vue";
import PrivacySetup from "../views/SuperAdmin/MasterSetting/PrivacySetup.vue";



//Price
import EditPrice from "../views/SuperAdmin/Financial/Price/Edit.vue";
import IndexPrice from "../views/SuperAdmin/Financial/Price/Index.vue";
import ViewPrice from "../views/SuperAdmin/Financial/Price/View.vue";


//Payment Log
import SuperAdminPaymentLogList from "../views/SuperAdmin/Financial/Payment/Index.vue";
import SuperAdminPaymentLogCreate from "../views/SuperAdmin/Financial/Payment/Create.vue";
import SuperAdminPaymentLogEdit from "../views/SuperAdmin/Financial/Payment/Edit.vue";
import SuperAdminPaymentLogView from "../views/SuperAdmin/Financial/Payment/View.vue";

//TAX
import RegionalTaxRate from "../views/SuperAdmin/MasterSetting/RegionalTaxRate.vue";

//SuperAdmin E-commerce Setting
import IndexBusinessType from "../views/SuperAdmin/E-commerce/BusinessType.vue";
import IndexCategory from "../views/SuperAdmin/E-commerce/Category.vue";
import IndexSubCategory from "../views/SuperAdmin/E-commerce/SubCategory.vue";
import IndexSubSubCategory from "../views/SuperAdmin/E-commerce/SubSubCategory.vue";
import IndexBrand from "../views/SuperAdmin/E-commerce/Brand.vue";

import ProductList from "../views/SuperAdmin/E-commerce/product/Index.vue";
import ProductCreate from "../views/SuperAdmin/E-commerce/product/Create.vue";
import ProductEdit from "../views/SuperAdmin/E-commerce/product/Edit.vue";
import ProductView from "../views/SuperAdmin/E-commerce/product/View.vue";

import OrderList from "../views/SuperAdmin/E-commerce/order/Index.vue";
import OrderCreate from "../views/SuperAdmin/E-commerce/order/Create.vue";
import OrderEdit from "../views/SuperAdmin/E-commerce/order/Edit.vue";
import OrderView from "../views/SuperAdmin/E-commerce/order/View.vue";


// Mock authentication function
function isAuthenticated() {
  // Replace this with your actual authentication logic
  return !!sessionStorage.getItem("auth");
}

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
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
        path: "independent-member",
        name: "independent-member",
        component: IndependentMember,
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
        path: 'meetings',
        name: "index-meeting",
        component: IndexMeeting,
        meta: { requiresAuth: true },
      },
      {
        path: 'meeting/create',
        name: "create-meeting",
        component: CreateMeeting,
        meta: { requiresAuth: true },
      },
      { 
        path: 'meeting/edit/:id',
        name: 'edit-meeting',
        component: EditMeeting,
        meta: { requiresAuth: true },
        props: true
       },
      { 
        path: 'meeting/view/:id',
        name: 'view-meeting',
        component: ViewMeeting,
        meta: { requiresAuth: true },
        props: true
       },
      {
        path: 'meeting-minutes',
        name: "index-meeting-minutes",
        component: IndexMeetingMinutes,
        meta: { requiresAuth: true },
      },
      {
        path: 'meeting-minutes/create/:meetingId',
        name: "create-meeting-minutes",
        component: CreateMeetingMinutes,
        meta: { requiresAuth: true },
      },
      { 
        path: 'meeting-minutes/edit/:id',
        name: 'edit-meeting-minutes',
        component: EditMeetingMinutes,
        meta: { requiresAuth: true },
        props: true
       },
      { 
        path: 'meeting-minutes/view/:id',
        name: 'view-meeting-minutes',
        component: ViewMeetingMinutes,
        meta: { requiresAuth: true },
        props: true
       },
      { 
        path: 'meeting/attendances/:id',
        name: 'meeting-attendances',
        component: MeetingAttendances,
        meta: { requiresAuth: true },
        props: true
       },
      { 
        path: 'meeting/guest/attendance/:id',
        name: 'meeting-guest-attendance',
        component: MeetingGuestAttendance,
        meta: { requiresAuth: true },
        props: true
       },
       {
        path: 'events',
        name: 'index-event',
        component: IndexEvent,
        meta: { requiresAuth: true },
      },
      {
        path: 'event/create',
        name: 'create-event',
        component: CreateEvent,
        meta: { requiresAuth: true },
      },
      {
        path: 'event/edit/:id',
        name: 'edit-event',
        component: EditEvent,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'event/view/:id',
        name: 'view-event',
        component: ViewEvent,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: "upcoming-events",
        name: "upcoming-events",
        component: UpcomingEvents,
        meta: { requiresAuth: true },
      },
      {
        path: 'event-summary',
        name: "index-event-summary",
        component: IndexEventSummary,
        meta: { requiresAuth: true },
      },
      {
        path: 'event-summary/create/:eventId',
        name: "create-event-summary",
        component: CreateEventSummary,
        meta: { requiresAuth: true },
      },
      { 
        path: 'event-summary/edit/:id',
        name: 'edit-event-summary',
        component: EditEventSummary,
        meta: { requiresAuth: true },
        props: true
       },
      { 
        path: 'event-summary/view/:id',
        name: 'view-event-summary',
        component: ViewEventSummary,
        meta: { requiresAuth: true },
        props: true
       },
      { 
        path: 'event/attendances/:id',
        name: 'event-attendances',
        component: EventAttendances,
        meta: { requiresAuth: true },
        props: true
       },
       { 
        path: 'event/guest/attendance/:id',
        name: 'event-guest-attendance',
        component: EventGuestAttendance,
        meta: { requiresAuth: true },
        props: true
       },
       {
        path: "projects",
        name: "index-project",
        component: IndexProject,
        meta: { requiresAuth: true },
      },
      {
        path: 'project/create',
        name: 'create-project',
        component: CreateProject,
        meta: { requiresAuth: true },
      },
      {
        path: 'project/edit/:id',
        name: 'edit-project',
        component: EditProject,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'project/view/:id',
        name: 'view-project',
        component: ViewProject,
        meta: { requiresAuth: true },
        props: true
      },
      { 
        path: 'project/attendances/:id',
        name: 'project-attendances',
        component: ProjectAttendances,
        meta: { requiresAuth: true },
        props: true
       },
      { 
        path: 'project/guest/attendance/:id',
        name: 'project-guest-attendance',
        component: ProjectGuestAttendance,
        meta: { requiresAuth: true },
        props: true
       },
       {
        path: 'project-summary',
        name: "index-project-summary",
        component: IndexProjectSummary,
        meta: { requiresAuth: true },
      },
      {
        path: 'project-summary/create/:projectId',
        name: "create-project-summary",
        component: CreateProjectSummary,
        meta: { requiresAuth: true },
      },
      { 
        path: 'project-summary/edit/:summaryId',
        name: 'edit-project-summary',
        component: EditProjectSummary,
        meta: { requiresAuth: true },
        props: true
       },
      { 
        path: 'project-summary/view/:summaryId',
        name: 'view-project-summary',
        component: ViewProjectSummary,
        meta: { requiresAuth: true },
        props: true
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
        path: 'history/create',
        name: 'create-history',
        component: CreateHistory,
        meta: { requiresAuth: true },
      },
      {
        path: 'history/edit/:id',
        name: 'edit-history',
        component: EditHistory,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'history/view/:id',
        name: 'view-history',
        component: ViewHistory,
        meta: { requiresAuth: true },
        props: true
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
        path: 'strategic-plan/create',
        name: 'create-strategic-plan',
        component: CreateStrategicPlan,
        meta: { requiresAuth: true },
      },
      {
        path: 'strategic-plan/edit/:id',
        name: 'edit-strategic-plan',
        component: EditStrategicPlan,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'strategic-plan/view/:id',
        name: 'view-strategic-plan',
        component: ViewStrategicPlan,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: "success-story",
        name: "success-story",
        component: SuccessStory,
        meta: { requiresAuth: true },
      },
      {
        path: 'success-story/create',
        name: 'create-success-story',
        component: CreateSuccessStory,
        meta: { requiresAuth: true },
      },
      {
        path: 'success-story/edit/:id',
        name: 'edit-success-story',
        component: EditSuccessStory,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'success-story/view/:id',
        name: 'view-success-story',
        component: ViewSuccessStory,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: "recognition",
        name: "recognition",
        component: Recognition,
        meta: { requiresAuth: true },
      },
      {
        path: 'recognition/create',
        name: 'create-recognition',
        component: CreateRecognition,
        meta: { requiresAuth: true },
      },
      {
        path: 'recognition/edit/:id',
        name: 'edit-recognition',
        component: EditRecognition,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'recognition/view/:id',
        name: 'view-recognition',
        component: ViewRecognition,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: "accounts",
        name: "accounts",
        component: Accounts,
        meta: { requiresAuth: true },
      },
      {
        path: "accounts-fund",
        name: "accounts-fund",
        component: AccountsFunds,
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
        name: "index-record",
        component: OfficeRecord,
        meta: { requiresAuth: true },
      },
      {
        path: 'record/create',
        name: 'create-record',
        component: CreateRecord,
        meta: { requiresAuth: true },
      },
      {
        path: 'record/edit/:id',
        name: 'edit-record',
        component: EditRecord,
        meta: { requiresAuth: true },
      },
      {
        path: "asset-management",
        name: "index-asset",
        component: AssetManagement,
        meta: { requiresAuth: true },
      },
      {
        path: 'asset/create',
        name: 'create-asset',
        component: CreateAsset,
        meta: { requiresAuth: true },
      },
      {
        path: 'asset/edit/:id',
        name: 'edit-asset',
        component: EditAsset,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'asset/view/:id',
        name: 'view-asset',
        component: ViewAsset,
        meta: { requiresAuth: true },
        props: true
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
          path: "bill-calculation",
          name: "bill-calculation",
          component: BillCalculation,
          meta: { requiresAuth: true },
        },
        {
          path: "bill-list",
          name: "bill-list",
          component: BillList,
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
          path: "org-receipt-list",
          name: "org-receipt-list",
          component: OrgReceiptList,
          meta: { requiresAuth: true },
        },
        {
          path: "view-org-receipt",
          name: "view-org-receipt",
          component: ViewOrgReceipt,
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
        path: "country",
        name: "country",
        component: Country,
        meta: { requiresAuth: true },
      },
      {
        path: "region",
        name: "region",
        component: Region,
        meta: { requiresAuth: true },
      },
      {
        path: "region-currency",
        name: "region-currency",
        component: RegionCurrency,
        meta: { requiresAuth: true },
      },
      {
        path: "country-region",
        name: "country-region",
        component: CountryRegion,
        meta: { requiresAuth: true },
      },
      {
        path: "user-country",
        name: "user-country",
        component: UserCountry,
        meta: { requiresAuth: true },
      },
      {
        path: "dialing-code",
        name: "dialing-code",
        component: DialingCode,
        meta: { requiresAuth: true },
      },
      {
        path: "conduct-type",
        name: "conduct-type",
        component: ConductType,
        meta: { requiresAuth: true },
      },
      {
        path: "attendance-type",
        name: "attendance-type",
        component: AttendanceType,
        meta: { requiresAuth: true },
      },
      {
        path: "membership-type",
        name: "membership-type",
        component: MembershipType,
        meta: { requiresAuth: true },
      },
      {
        path: "designation",
        name: "designation",
        component: Designation,
        meta: { requiresAuth: true },
      },
      {
        path: "language-list",
        name: "language-list",
        component: LanguageList,
        meta: { requiresAuth: true },
      },
      {
        path: "time-zone-setup",
        name: "time-zone-setup",
        component: TimeZoneSetup,
        meta: { requiresAuth: true },
      },
      {
        path: "privacy-setup",
        name: "privacy-setup",
        component: PrivacySetup,
        meta: { requiresAuth: true },
      },
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
        path: "user-price-rate",
        name: "user-price-rate",
        component: UserPriceRate,
        meta: { requiresAuth: true },
      },

      {
        path: "super-admin-billing-list",
        name: "super-admin-billing-list",
        component: SuperAdminBillingList,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-billing-create",
        name: "super-admin-billing-create",
        component: SuperAdminBillingCreate,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-billing-edit/:id",
        name: "super-admin-billing-edit",
        component: SuperAdminBillingEdit,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-billing-view/:id",
        name: "super-admin-billing-view",
        component: SuperAdminBillingView,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-invoice-list",
        name: "super-admin-invoice-list",
        component: SuperAdminInvoiceList,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-invoice-create",
        name: "super-admin-invoice-create",
        component: SuperAdminInvoiceCreate,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-invoice-edit/:id",
        name: "super-admin-invoice-edit",
        component: SuperAdminInvoiceEdit,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-invoice-view/:id",
        name: "super-admin-invoice-view",
        component: SuperAdminInvoiceView,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-receipt-list",
        name: "super-admin-receipt-list",
        component: SuperAdminReceiptList,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-receipt-create",
        name: "super-admin-receipt-create",
        component: SuperAdminReceiptCreate,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-receipt-edit/:id",
        name: "super-admin-receipt-edit",
        component: SuperAdminReceiptEdit,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-receipt-view/:id",
        name: "super-admin-receipt-view",
        component: SuperAdminReceiptView,
        meta: { requiresAuth: true },
      },
      {
        path: "index-currency",
        name: "index-currency",
        component: IndexCurrency,
        meta: { requiresAuth: true },
      },
      {
        path: "regional-tax-rate",
        name: "regional-tax-rate",
        component: RegionalTaxRate,
        meta: { requiresAuth: true },
      },

      {
        path: "super-admin-payment-log-list",
        name: "super-admin-payment-log-list",
        component: SuperAdminPaymentLogList,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-payment-log-create",
        name: "super-admin-payment-log-create",
        component: SuperAdminPaymentLogCreate,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-payment-log-edit/:id",
        name: "super-admin-payment-log-edit",
        component: SuperAdminPaymentLogEdit,
        meta: { requiresAuth: true },
      },
      {
        path: "super-admin-payment-log-view/:id",
        name: "super-admin-payment-log-view",
        component: SuperAdminPaymentLogView,
        meta: { requiresAuth: true },
      },
      {
        path: "index-business-type",
        name: "index-business-type",
        component: IndexBusinessType,
        meta: { requiresAuth: true },
      },
      {
        path: "index-category",
        name: "index-category",
        component: IndexCategory,
        meta: { requiresAuth: true },
      },
      {
        path: "index-sub-category",
        name: "index-sub-category",
        component: IndexSubCategory,
        meta: { requiresAuth: true },
      },
      {
        path: "index-sub-sub-category",
        name: "index-sub-sub-category",
        component: IndexSubSubCategory,
        meta: { requiresAuth: true },
      },
      {
        path: "index-brand",
        name: "index-brand",
        component: IndexBrand,
        meta: { requiresAuth: true },
      },
      {
        path: "products-list",
        name: "products-list",
        component: ProductList,
        meta: { requiresAuth: true },
      },
      {
        path: "product-create",
        name: "product-create",
        component: ProductCreate,
        meta: { requiresAuth: true },
      },
      {
        path: "product-edit/:id",
        name: "product-edit",
        component: ProductEdit,
        meta: { requiresAuth: true },
      },
      {
        path: "product-view/:id",
        name: "product-view",
        component: ProductView,
        meta: { requiresAuth: true },
      },

      {
        path: "orders-list",
        name: "orders-list",
        component: OrderList,
        meta: { requiresAuth: true },
      },
      {
        path: "order-create",
        name: "order-create",
        component: OrderCreate,
        meta: { requiresAuth: true },
      },
      {
        path: "order-edit/:id",
        name: "order-edit",
        component: OrderEdit,
        meta: { requiresAuth: true },
      },
      {
        path: "order-view/:id",
        name: "order-view",
        component: OrderView,
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
