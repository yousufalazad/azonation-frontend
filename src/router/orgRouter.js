const OrgDashboardLayout = () => import("../views/Org/Layouts/Layout.vue");
const OrgDashboardIndex = () => import("@/views/Org/Layouts/Dashboard/Index.vue");
const HeaderNotifications = () => import("../views/Org/Layouts/HeaderNotification.vue");
const Notifications = () => import("../views/Org/Notification/Index.vue");
// Org Profile
const MyAccount = () => import("../views/Org/Profile/MyAccount.vue");
const Profile = () => import("../views/Org/Profile/Profile.vue");
const fundamentalInfo = () => import("../views/Org/Profile/FundamentalInfo.vue");
const Security = () => import("../views/Org/Profile/Security.vue");
const Settings = () => import("../views/Org/Profile/Settings.vue");
//Administrator
const Administrator = () => import("@/views/Org/Profile/Administrator.vue");
const UserNotifications = () => import("../views/Org/Notification/UserNotifications.vue");
//Org Member
const UnlinkMember = () => import("../views/Org/Member/UnlinkMember.vue");
const OrgMembershipRenewalCycle = () => import("../views/Org/Financial/Renewal/OrgMembershipRenewalCycle.vue");
const OrgMembershipRenewalPrice = () => import("../views/Org/Financial/Renewal/OrgMembershipRenewalPrice.vue");
const OrgMembershipRenewal = () => import("../views/Org/Financial/Renewal/OrgMembershipRenewal.vue");
const CreateMember = () => import("../views/Org/Member/Create.vue");
const IndexMember = () => import("../views/Org/Member/Index.vue");
const FamilyMember = () => import("../views/Org/Member/FamilyMember.vue");
// terminated-members
const TerminatedMember = () => import("../views/Org/Member/TerminatedMember.vue");
const OrgMembershipTypes = () => import("../views/Org/Member/OrgMembershipTypes.vue");
//Founder
const Founders = () => import("../views/Org/Founder/Index.vue");
//Fund and Fund Management
const Fund = () => import("../views/Org/FundManagement/Fund.vue");
const FundManagement = () => import("../views/Org/FundManagement/Index.vue");
//Asset Management
const AssetManagement = () => import("../views/Org/Asset/Index.vue");
const CreateAsset = () => import("../views/Org/Asset/Create.vue");
const EditAsset = () => import("../views/Org/Asset/Edit.vue");
const ViewAsset = () => import("../views/Org/Asset/View.vue");
//Committee
const CommitteeList = () => import("../views/Org/Committee/Index.vue");
const CommitteeMember = () => import("../views/Org/Committee/CommitteeMember.vue");
//Event
const IndexEvent = () => import("../views/Org/Event/Index.vue");
const CreateEvent = () => import("../views/Org/Event/Create.vue");
const EditEvent = () => import("../views/Org/Event/Edit.vue");
const ViewEvent = () => import("../views/Org/Event/View.vue");
const IndexEventSummary = () => import("../views/Org/Event/EventSummary/Index.vue");
const CreateEventSummary = () => import("../views/Org/Event/EventSummary/Create.vue");
const EditEventSummary = () => import("../views/Org/Event/EventSummary/Edit.vue");
const ViewEventSummary = () => import("../views/Org/Event/EventSummary/View.vue");
const EventAttendances = () => import("../views/Org/Event/EventAttendances.vue");
const EventGuestAttendance = () => import("../views/Org/Event/EventGuestAttendance.vue");
//History
const History = () => import("../views/Org/History/Index.vue");
const CreateHistory = () => import("../views/Org/History/Create.vue");
const EditHistory = () => import("../views/Org/History/Edit.vue");
const ViewHistory = () => import("../views/Org/History/View.vue");
//Meeting
const IndexMeeting = () => import("../views/Org/Meeting/Index.vue");
const CreateMeeting = () => import("../views/Org/Meeting/Create.vue");
const EditMeeting = () => import("../views/Org/Meeting/Edit.vue");
const ViewMeeting = () => import("../views/Org/Meeting/View.vue");
const IndexMeetingMinutes = () => import("../views/Org/Meeting/MeetingMinutes/Index.vue");
const CreateMeetingMinutes = () => import("../views/Org/Meeting/MeetingMinutes/Create.vue");
const EditMeetingMinutes = () => import("../views/Org/Meeting/MeetingMinutes/Edit.vue");
const ViewMeetingMinutes = () => import("../views/Org/Meeting/MeetingMinutes/View.vue");
const MeetingAttendances = () => import("../views/Org/Meeting/MeetingAttendances.vue");
const MeetingGuestAttendance = () => import("@/views/Org/Meeting/MeetingGuestAttendances.vue");
//Office Document
const OfficeDocument = () => import("../views/Org/OfficeDocument/Index.vue");
const CreateDocument = () => import("../views/Org/OfficeDocument/Create.vue");
const EditDocument = () => import("../views/Org/OfficeDocument/Edit.vue");
const ViewDocument = () => import("../views/Org/OfficeDocument/View.vue");
//Project and Project Summary
const IndexProject = () => import("../views/Org/Project/Index.vue");
const CreateProject = () => import("../views/Org/Project/Create.vue");
const EditProject = () => import("../views/Org/Project/Edit.vue");
const ViewProject = () => import("../views/Org/Project/View.vue");
const ProjectAttendances = () => import("../views/Org/Project/ProjectAttendances.vue");
const ProjectGuestAttendance = () => import("@/views/Org/Project/ProjectGuestAttendance.vue");
const IndexProjectSummary = () => import("../views/Org/Project/ProjectSummary/Index.vue");
const CreateProjectSummary = () => import("../views/Org/Project/ProjectSummary/Create.vue");
const EditProjectSummary = () => import("../views/Org/Project/ProjectSummary/Edit.vue");
const ViewProjectSummary = () => import("../views/Org/Project/ProjectSummary/View.vue");
//Recognition
const Recognition = () => import("../views/Org/Recognition/Index.vue");
const CreateRecognition = () => import("../views/Org/Recognition/Create.vue");
const EditRecognition = () => import("../views/Org/Recognition/Edit.vue");
const ViewRecognition = () => import("../views/Org/Recognition/View.vue");
//Report
const OrgReport = () => import("../views/Org/Report/Index.vue");
//StrategicPlan
const StrategicPlan = () => import("../views/Org/StrategicPlan/Index.vue");
const CreateStrategicPlan = () => import("../views/Org/StrategicPlan/Create.vue");
const EditStrategicPlan = () => import("../views/Org/StrategicPlan/Edit.vue");
const ViewStrategicPlan = () => import("../views/Org/StrategicPlan/View.vue");
//Success Story
const SuccessStory = () => import("../views/Org/SuccessStory/Index.vue");
const CreateSuccessStory = () => import("../views/Org/SuccessStory/Create.vue");
const EditSuccessStory = () => import("../views/Org/SuccessStory/Edit.vue");
const ViewSuccessStory = () => import("../views/Org/SuccessStory/View.vue");
//Year plan
const YearPlan = () => import("../views/Org/YearPlan/Index.vue");
const CreateYearPlan = () => import("../views/Org/YearPlan/Create.vue");
const EditYearPlan = () => import("../views/Org/YearPlan/Edit.vue");
const ViewYearPlan = () => import("../views/Org/YearPlan/View.vue");
//Referral
const Referral = () => import("../views/Org/Referral/Referral.vue");
//Billing
const Subscription = () => import("../views/Org/Financial/Subscription.vue");
const BillCalculation = () => import("@/views/Org/Financial/BillCalculation.vue");
const ViewBilling = () => import("../views/Org/Financial/ManagementAndStorageBilling/View.vue");
const Invoices = () => import("../views/Org/Financial/Invoice/Index.vue");
const ViewInvoice = () => import("../views/Org/Financial/Invoice/View.vue");
const OrgReceiptIndex = () => import("../views/Org/Financial/Receipt/Index.vue");
//  import UnlinkMember from "../views/Org/Member/UnlinkMember.vue";
const UserRoleAssign = () => import("@/views/RolePermission/OrgUserRoleAssign.vue");
const orgRoutes = [
  {
    path: "/org-dashboard",
    name: "org-dashboard",
    component: OrgDashboardLayout,
    meta: {
      requiresAuth: true,
      type: "organisation",
    },
    children: [
      {
        path: "index",
        name: "org-dashboard-index",
        component: OrgDashboardIndex,
        meta: { requiresAuth: true },
      },
      {
        path: "user-role-assign",
        name: "user-role-assign",
        component: UserRoleAssign,
        meta: { requiresAuth: true },
        // meta: { requiresAuth: true, permission: "assign_roles" },
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
        path: "unlink-member",
        name: "unlink-member",
        component: UnlinkMember,
        meta: { requiresAuth: true, permission: "unlink-member.read" },
      },
      {
        path: "create-member",
        name: "create-member",
        component: CreateMember,
        meta: { requiresAuth: true, permission: "member.create" },
      },
      {
        path: "index-member",
        name: "index-member",
        component: IndexMember,
        meta: { requiresAuth: true, permission: "member.read" },
      },
      {
        path: "terminated-member",
        name: "terminated-member",
        component: TerminatedMember,
        meta: { requiresAuth: true, permission: "terminated-member.read" },
      },
      {
        path: "org-membership-type",
        name: "org-membership-type",
        component: OrgMembershipTypes,
        meta: { requiresAuth: true, permission: "org-membership-type.read" },
      },
      {
        path: "org-membership-renewal-cycle",
        name: "org-membership-renewal-cycle",
        component: OrgMembershipRenewalCycle,
        meta: {
          requiresAuth: true,
          permission: "org-membership-renewal-cycle.read",
        },
      },
      {
        path: "org-membership-renewal-price",
        name: "org-membership-renewal-price",
        component: OrgMembershipRenewalPrice,
        meta: {
          requiresAuth: true,
          permission: "org-membership-renewal-price.read",
        },
      },
      {
        path: "org-membership-renewal",
        name: "org-membership-renewal",
        component: OrgMembershipRenewal,
        meta: { requiresAuth: true, permission: "org-membership-renewal.read" },
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
      // Fund
      {
        path: "fund",
        name: "fund",
        component: Fund,
        meta: { requiresAuth: true, permission: "fund.read" },
      },
      // FundManagement
      {
        path: "fund-management",
        name: "fund-management",
        component: FundManagement,
        meta: { requiresAuth: true, permission: "fund-management.read" },
      },
      {
        path: "asset-management",
        name: "index-asset",
        component: AssetManagement,
        meta: { requiresAuth: true, permission: "asset.read" },
      },
      {
        path: "asset/create",
        name: "create-asset",
        component: CreateAsset,
        meta: { requiresAuth: true, permission: "asset.create" },
      },
      {
        path: "asset/edit/:id",
        name: "edit-asset",
        component: EditAsset,
        meta: { requiresAuth: true, permission: "asset.update" },
        props: true,
      },
      {
        path: "asset/view/:id",
        name: "view-asset",
        component: ViewAsset,
        meta: { requiresAuth: true, permission: "asset.read" },
        props: true,
      },
      {
        path: "committees",
        name: "committees",
        component: CommitteeList,
        meta: { requiresAuth: true, permission: "committee.read" },
      },
      {
        // path: "index-committee-member/:committeeId/:committeeName",
        path: "index-committee-member/:committeeId",
        name: "index-committee-member",
        component: CommitteeMember,
        meta: { requiresAuth: true, permission: "committee-member.read" },
      },
      {
        path: "former-committee-list",
        name: "former-committee-list",
        // Former committees are a tab on the Committees page
        redirect: { name: "committees", query: { tab: "former" } },
      },
      {
        path: "events",
        name: "index-event",
        component: IndexEvent,
        meta: { requiresAuth: true, permission: "event.read" },
      },
      {
        path: "event/create",
        name: "create-event",
        component: CreateEvent,
        meta: { requiresAuth: true, permission: "event.create" },
      },
      {
        path: "event/edit/:id",
        name: "edit-event",
        component: EditEvent,
        meta: { requiresAuth: true, permission: "event.update" },
        props: true,
      },
      {
        path: "event/view/:id",
        name: "view-event",
        component: ViewEvent,
        meta: { requiresAuth: true, permission: "event.read" },
        props: true,
      },
      {
        path: "upcoming-events",
        name: "upcoming-events",
        // The Events list opens on upcoming events
        redirect: { name: "index-event" },
      },
      {
        path: "event-summary",
        name: "index-event-summary",
        component: IndexEventSummary,
        meta: { requiresAuth: true, permission: "event-summary.read" },
      },
      {
        path: "event-summary/create/:eventId",
        name: "create-event-summary",
        component: CreateEventSummary,
        meta: { requiresAuth: true, permission: "event-summary.create" },
      },
      {
        path: "event-summary/edit/:id",
        name: "edit-event-summary",
        component: EditEventSummary,
        meta: { requiresAuth: true, permission: "event-summary.update" },
        props: true,
      },
      {
        path: "event-summary/view/:id",
        name: "view-event-summary",
        component: ViewEventSummary,
        meta: { requiresAuth: true, permission: "event-summary.read" },
        props: true,
      },
      {
        path: "event/attendances/:id",
        name: "event-attendances",
        component: EventAttendances,
        meta: { requiresAuth: true, permission: "event-attendance.read" },
        props: true,
      },
      {
        path: "event/guest/attendance/:id",
        name: "event-guest-attendance",
        component: EventGuestAttendance,
        meta: { requiresAuth: true, permission: "event-guest-attendance.read" },
        props: true,
      },
      {
        path: "history",
        name: "history",
        component: History,
        meta: { requiresAuth: true },
      },
      {
        path: "history/create",
        name: "create-history",
        component: CreateHistory,
        meta: { requiresAuth: true },
      },
      {
        path: "history/edit/:id",
        name: "edit-history",
        component: EditHistory,
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "history/view/:id",
        name: "view-history",
        component: ViewHistory,
        meta: { requiresAuth: true },
        props: true,
      },

      {
        path: "meetings",
        name: "index-meeting",
        component: IndexMeeting,
        meta: { requiresAuth: true, permission: "meeting.read" },
      },
      {
        path: "meeting/create",
        name: "create-meeting",
        component: CreateMeeting,
        meta: { requiresAuth: true, permission: "meeting.create" },
      },
      {
        path: "meeting/edit/:id",
        name: "edit-meeting",
        component: EditMeeting,
        meta: { requiresAuth: true, permission: "meeting.update" },
        props: true,
      },
      {
        path: "meeting/view/:id",
        name: "view-meeting",
        component: ViewMeeting,
        meta: { requiresAuth: true, permission: "meeting.read" },
        props: true,
      },

      {
        path: "meeting-minutes",
        name: "index-meeting-minutes",
        component: IndexMeetingMinutes,
        meta: { requiresAuth: true, permission: "meeting-minute.read" },
      },
      {
        path: "meeting-minutes/create/:meetingId",
        name: "create-meeting-minutes",
        component: CreateMeetingMinutes,
        meta: { requiresAuth: true, permission: "meeting-minute.create" },
      },
      {
        path: "meeting-minutes/edit/:id",
        name: "edit-meeting-minutes",
        component: EditMeetingMinutes,
        meta: { requiresAuth: true, permission: "meeting-minute.update" },
        props: true,
      },
      {
        path: "meeting-minutes/view/:id",
        name: "view-meeting-minutes",
        component: ViewMeetingMinutes,
        meta: { requiresAuth: true, permission: "meeting-minute.read" },
        props: true,
      },
      {
        path: "meeting/attendances/:id",
        name: "meeting-attendances",
        component: MeetingAttendances,
        meta: { requiresAuth: true, permission: "meeting-attendance.read" },
        props: true,
      },
      {
        path: "meeting/guest/attendance/:id",
        name: "meeting-guest-attendance",
        component: MeetingGuestAttendance,
        meta: {
          requiresAuth: true,
          permission: "meeting-guest-attendance.read",
        },
        props: true,
      },
      {
        path: "office-document",
        name: "index-document",
        component: OfficeDocument,
        meta: { requiresAuth: true, permission: "document.read" },
      },
      {
        path: "document/create",
        name: "create-document",
        component: CreateDocument,
        meta: { requiresAuth: true, permission: "document.create" },
      },
      {
        path: "document/edit/:id",
        name: "edit-document",
        component: EditDocument,
        meta: { requiresAuth: true, permission: "document.update" },
      },
      {
        path: "document/view/:id",
        name: "view-document",
        component: ViewDocument,
        meta: { requiresAuth: true, permission: "document.read" },
      },
      {
        path: "projects",
        name: "index-project",
        component: IndexProject,
        meta: { requiresAuth: true, permission: "project.read" },
      },
      {
        path: "project/create",
        name: "create-project",
        component: CreateProject,
        meta: { requiresAuth: true, permission: "project.create" },
      },
      {
        path: "project/edit/:id",
        name: "edit-project",
        component: EditProject,
        meta: { requiresAuth: true, permission: "project.update" },
        props: true,
      },
      {
        path: "project/view/:id",
        name: "view-project",
        component: ViewProject,
        meta: { requiresAuth: true, permission: "project.read" },
        props: true,
      },
      {
        path: "project/attendances/:id",
        name: "project-attendances",
        component: ProjectAttendances,
        meta: { requiresAuth: true, permission: "project-attendance.read" },
        props: true,
      },
      {
        path: "project/guest/attendance/:id",
        name: "project-guest-attendance",
        component: ProjectGuestAttendance,
        meta: {
          requiresAuth: true,
          permission: "project-guest-attendance.read",
        },
        props: true,
      },
      {
        path: "project-summary",
        name: "index-project-summary",
        component: IndexProjectSummary,
        meta: { requiresAuth: true, permission: "project-summary.read" },
      },
      {
        path: "project-summary/create/:projectId",
        name: "create-project-summary",
        component: CreateProjectSummary,
        meta: { requiresAuth: true, permission: "project-summary.create" },
      },
      {
        path: "project-summary/edit/:summaryId",
        name: "edit-project-summary",
        component: EditProjectSummary,
        meta: { requiresAuth: true, permission: "project-summary.update" },
        props: true,
      },
      {
        path: "project-summary/view/:summaryId",
        name: "view-project-summary",
        component: ViewProjectSummary,
        meta: { requiresAuth: true, permission: "project-summary.read" },
        props: true,
      },
      {
        path: "recognition",
        name: "recognition",
        component: Recognition,
        meta: { requiresAuth: true },
      },
      {
        path: "recognition/create",
        name: "create-recognition",
        component: CreateRecognition,
        meta: { requiresAuth: true },
      },
      {
        path: "recognition/edit/:id",
        name: "edit-recognition",
        component: EditRecognition,
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "recognition/view/:id",
        name: "view-recognition",
        component: ViewRecognition,
        meta: { requiresAuth: true },
        props: true,
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
        // Income and spending are now on one Reports page
        redirect: { name: "org-report" },
      },
      {
        path: "strategic-plan",
        name: "strategic-plan",
        component: StrategicPlan,
        meta: { requiresAuth: true },
      },
      {
        path: "strategic-plan/create",
        name: "create-strategic-plan",
        component: CreateStrategicPlan,
        meta: { requiresAuth: true },
      },
      {
        path: "strategic-plan/edit/:id",
        name: "edit-strategic-plan",
        component: EditStrategicPlan,
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "strategic-plan/view/:id",
        name: "view-strategic-plan",
        component: ViewStrategicPlan,
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "success-story",
        name: "success-story",
        component: SuccessStory,
        meta: { requiresAuth: true },
      },
      {
        path: "success-story/create",
        name: "create-success-story",
        component: CreateSuccessStory,
        meta: { requiresAuth: true },
      },
      {
        path: "success-story/edit/:id",
        name: "edit-success-story",
        component: EditSuccessStory,
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "success-story/view/:id",
        name: "view-success-story",
        component: ViewSuccessStory,
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "year-plan",
        name: "year-plan",
        component: YearPlan,
        meta: { requiresAuth: true },
      },
      {
        path: "year-plan/create",
        name: "create-year-plan",
        component: CreateYearPlan,
        meta: { requiresAuth: true },
      },
      {
        path: "year-plan/edit/:id",
        name: "edit-year-plan",
        component: EditYearPlan,
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "year-plan/view/:id",
        name: "view-year-plan",
        component: ViewYearPlan,
        meta: { requiresAuth: true },
        props: true,
      },
       {
            path: "org-membership-type",
            name: "org-membership-type",
            component: OrgMembershipTypes,
            meta: {
              requiresAuth: true,
              permission: "org-membership-type.read",
            },
          },
      {
            path: "org-membership-renewal-cycle",
            name: "org-membership-renewal-cycle",
            component: OrgMembershipRenewalCycle,
            meta: {
              requiresAuth: true,
              permission: "org-membership-renewal-cycle.read",
            },
          },
          {
            path: "org-membership-renewal-price",
            name: "org-membership-renewal-price",
            component: OrgMembershipRenewalPrice,
            meta: { requiresAuth: true },
          },
          {
            path: "org-membership-renewal",
            name: "org-membership-renewal",
            component: OrgMembershipRenewal,
            meta: {
              requiresAuth: true,
              permission: "org-membership-renewal.read",
            },
          },
      {
        path: "administrator",
        name: "administrator",
        component: Administrator,
        meta: { requiresAuth: true },
      },
      {
        path: "fundamental-info",
        redirect: { name: "fundamental-info" },
      },
      {
        path: "settings",
        redirect: { name: "settings" },
      },
      {
        path: "my-account",
        name: "my-account",
        component: MyAccount,
        redirect: { name: "profile" },
        meta: { requiresAuth: true },
        children: [
          {
            path: "profile",
            name: "profile",
            component: Profile,
            meta: { requiresAuth: true },
          },
          // {
          //   path: "administrator",
          //   name: "administrator",
          //   component: Administrator,
          //   meta: { requiresAuth: true },
          // },
          {
            path: "fundamental-info",
            name: "fundamental-info",
            component: fundamentalInfo,
            meta: { requiresAuth: true },
          },
          {
            path: "settings",
            name: "settings",
            component: Settings,
            meta: { requiresAuth: true },
          },
          {
            path: "security",
            name: "security",
            component: Security,
            meta: { requiresAuth: true },
          },
          // {
          //   path: "settings",
          //   name: "settings",
          //   component: Settings,
          //   meta: { requiresAuth: true },
          // },
          // Plans are compared on the Subscription page
          { path: "package", name: "package", redirect: { name: "subscription" } },
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
          // Monthly bills are listed on the Bill page
          { path: "bill-list", name: "bill-list", redirect: { name: "bill-calculation" } },
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
            path: "user-notifications",
            name: "user-notifications",
            component: UserNotifications,
            meta: { requiresAuth: true },
          },          
          {
            path: "referral",
            name: "referral",
            component: Referral,
            meta: { requiresAuth: true },
          },
        ],
      },
    ],
  },
];
export default orgRoutes;
