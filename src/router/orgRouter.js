import OrgDashboardLayout from "../views/Org/Layouts/Layout.vue";
import OrgDashboardIndex from "@/views/Org/Layouts/Dashboard/Index.vue";
import HeaderNotifications from "../views/Org/Layouts/HeaderNotification.vue";
import Notifications from "../views/Org/Notification/Index.vue";


// Org Profile
import MyAccount from "../views/Org/Profile/MyAccount.vue";
import Profile from "../views/Org/Profile/Profile.vue";
import fundamentalInfo from "../views/Org/Profile/FundamentalInfo.vue";
import Security from "../views/Org/Profile/Security.vue";
import Settings from "../views/Org/Profile/Settings.vue";

//Administrator
import Administrator from "@/views/Org/Profile/Administrator.vue";

//Org Member
import UnlinkMember from "../views/Org/Member/UnlinkMember.vue";
import CreateMember from "../views/Org/Member/Create.vue";
import IndexMember from "../views/Org/Member/Index.vue";
import FamilyMember from "../views/Org/Member/FamilyMember.vue";

import MembershipStatuses from "../views/Org/Member/MembershipStatuses.vue";
import OrgMembershipTypes from "../views/Org/Member/OrgMembershipTypes.vue";

//Founder
import Founders from "../views/Org/Founder/Index.vue";

//Accounts
import Accounts from "../views/Org/Accounts/Index.vue";
import AccountsFunds from "../views/Org/Accounts/Fund.vue";

//Asset Management
import AssetManagement from "../views/Org/Asset/Index.vue";
import CreateAsset from "../views/Org/Asset/Create.vue";
import EditAsset from "../views/Org/Asset/Edit.vue";
import ViewAsset from "../views/Org/Asset/View.vue";

//Committee
import CommitteeList from "../views/Org/Committee/Index.vue";
import FormerCommitteeList from "../views/Org/Committee/FormerCommitteeList.vue";
import CommitteeMember from "../views/Org/Committee/CommitteeMember.vue";

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

//History
import History from "../views/Org/History/Index.vue";
import CreateHistory from "../views/Org/History/Create.vue";
import EditHistory from "../views/Org/History/Edit.vue";
import ViewHistory from "../views/Org/History/View.vue";

//Meeting
import IndexMeeting from "../views/Org/Meeting/Index.vue";
import CreateMeeting from "../views/Org/Meeting/Create.vue";
import EditMeeting from "../views/Org/Meeting/Edit.vue";
import ViewMeeting from "../views/Org/Meeting/View.vue";

import IndexMeetingMinutes from "../views/Org/Meeting/MeetingMinutes/Index.vue";
import CreateMeetingMinutes from "../views/Org/Meeting/MeetingMinutes/Create.vue";
import EditMeetingMinutes from "../views/Org/Meeting/MeetingMinutes/Edit.vue";
import ViewMeetingMinutes from "../views/Org/Meeting/MeetingMinutes/View.vue";
import MeetingAttendances from "../views/Org/Meeting/MeetingAttendances.vue";
import MeetingGuestAttendance from "@/views/Org/Meeting/MeetingGuestAttendances.vue";

//Office Document
import OfficeDocument from "../views/Org/OfficeDocument/Index.vue";
import CreateDocument from "../views/Org/OfficeDocument/Create.vue";
import EditDocument from "../views/Org/OfficeDocument/Edit.vue";
import ViewDocument from "../views/Org/OfficeDocument/View.vue";

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

//Recognition
import Recognition from "../views/Org/Recognition/Index.vue"
import CreateRecognition from "../views/Org/Recognition/Create.vue";
import EditRecognition from "../views/Org/Recognition/Edit.vue";
import ViewRecognition from "../views/Org/Recognition/View.vue";

//Report
import OrgReport from "../views/Org/Report/Index.vue";
import OrgExpenseReport from "../views/Org/Report/Expense.vue";

//StrategicPlan
import StrategicPlan from "../views/Org/StrategicPlan/Index.vue";
import CreateStrategicPlan from "../views/Org/StrategicPlan/Create.vue";
import EditStrategicPlan from "../views/Org/StrategicPlan/Edit.vue";
import ViewStrategicPlan from "../views/Org/StrategicPlan/View.vue";

//Success Story
import SuccessStory from "../views/Org/SuccessStory/Index.vue";
import CreateSuccessStory from "../views/Org/SuccessStory/Create.vue";
import EditSuccessStory from "../views/Org/SuccessStory/Edit.vue";
import ViewSuccessStory from "../views/Org/SuccessStory/View.vue";

//Year plan
import YearPlan from "../views/Org/YearPlan/Index.vue"
import CreateYearPlan from "../views/Org/YearPlan/Create.vue"
import EditYearPlan from "../views/Org/YearPlan/Edit.vue"
import ViewYearPlan from "../views/Org/YearPlan/View.vue"

//Referral
import Referral from "../views/Org/Referral/Referral.vue";


//Billing
import Package from "../views/Org/Financial/Package.vue";
import Subscription from "../views/Org/Financial/Subscription.vue";
import BillCalculation from "@/views/Org/Financial/BillCalculation.vue";
import BillList from "../views/Org/Financial/ManagementAndStorageBilling/Index.vue";
import ViewBilling from "../views/Org/Financial/ManagementAndStorageBilling/View.vue";

import Invoices from "../views/Org/Financial/Invoice/Index.vue";
import ViewInvoice from "../views/Org/Financial/Invoice/View.vue";
import OrgReceiptIndex from "../views/Org/Financial/Receipt/Index.vue";
// import UnlinkMember from "../views/Org/Member/UnlinkMember.vue";


const orgRoutes = [
  {
    path: "/org-dashboard",
    name: "org-dashboard",
    component: OrgDashboardLayout,
    meta: {
      requiresAuth: true,
      type: 'organisation',
    },
    children: [
      {
        path: "index",
        name: "org-dashboard-index",
        component: OrgDashboardIndex,
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
        path: "fundamental-info",
        name: "fundamental-info",
        component: fundamentalInfo,
        meta: { requiresAuth: true },
      },
      {
        path: "unlink-member",
        name: "unlink-member",
        component: UnlinkMember,
        meta: { requiresAuth: true },
      },
      {
        path: "create-member",
        name: "create-member",
        component: CreateMember,
        meta: { requiresAuth: true },
      },
      {
        path: "index-member",
        name: "index-member",
        component: IndexMember,
        meta: { requiresAuth: true },
      },
      {
        path: "membership-statuses",
        name: "membership-statuses",
        component: MembershipStatuses,
        meta: { requiresAuth: true },
      },
      {
        path: "org-membership-types",
        name: "org-membership-types",
        component: OrgMembershipTypes,
        meta: { requiresAuth: true },
      },
      {
        path: "family-member",
        name: "family-member",
        component: FamilyMember,
        meta: { requiresAuth: true },
      },
      {
        path: "founders",
        name: "founders",
        component: Founders,
        meta: { requiresAuth: true },
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
        path: "committees",
        name: "committees",
        component: CommitteeList,
        meta: { requiresAuth: true },
      },
      {
        // path: "index-committee-member/:committeeId/:committeeName",
        path: "index-committee-member/:committeeId",
        name: "index-committee-member",
        component: CommitteeMember,
        meta: { requiresAuth: true },
      },
      {
        path: "former-committee-list",
        name: "former-committee-list",
        component: FormerCommitteeList,
        meta: { requiresAuth: true },
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
        path: "office-document",
        name: "index-document",
        component: OfficeDocument,
        meta: { requiresAuth: true },
      },
      {
        path: 'document/create',
        name: 'create-document',
        component: CreateDocument,
        meta: { requiresAuth: true },
      },
      {
        path: 'document/edit/:id',
        name: 'edit-document',
        component: EditDocument,
        meta: { requiresAuth: true },
      },
      {
        path: 'document/view/:id',
        name: 'view-document',
        component: ViewDocument,
        meta: { requiresAuth: true },
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
        path: "year-plan",
        name: "year-plan",
        component: YearPlan,
        meta: { requiresAuth: true },
      },
      {
        path: 'year-plan/create',
        name: 'create-year-plan',
        component: CreateYearPlan,
        meta: { requiresAuth: true },
      },
      {
        path: 'year-plan/edit/:id',
        name: 'edit-year-plan',
        component: EditYearPlan,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: 'year-plan/view/:id',
        name: 'view-year-plan',
        component: ViewYearPlan,
        meta: { requiresAuth: true },
        props: true
      },
      {
        path: "my-account",
        name: "my-account",
        component: MyAccount,
        meta: { requiresAuth: true },
        children: [
          {
            path: "profile",
            name: "profile",
            component: Profile,
            meta: { requiresAuth: true },
          },
          {
            path: "administrator",
            name: "administrator",
            component: Administrator,
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
            path: "view-billing/:id",
            name: "view-billing",
            component: ViewBilling,
            meta: { requiresAuth: true },
          },
          {
            path: "invoices",
            name: "invoices",
            component: Invoices,
            meta: { requiresAuth: true },
          },
          {
            path: "view-invoice/:id",
            name: "view-invoice",
            component: ViewInvoice,
            meta: { requiresAuth: true },
          },
          {
            path: "org-receipt-index",
            name: "org-receipt-index",
            component: OrgReceiptIndex,
            meta: { requiresAuth: true },
          },
          {
            path: "referral",
            name: "referral",
            component: Referral,
            meta: { requiresAuth: false },
          }      
        ],
      },

    ],
  }
];
export default orgRoutes;