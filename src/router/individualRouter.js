const IndividualDashboardLayout = () => import("../views/Individual/Layouts/Layout.vue");
const IndividualDashboardIndex = () => import("../views/Individual/Layouts/Dashboard/Index.vue");
const HeaderNotifications = () => import("../views/Individual/Layouts/HeaderNotification.vue");
const Notifications = () => import("../views/Individual/Notification/Index.vue");
const ConnectedOrganisations = () => import("../views/Individual/Organisation/Index.vue");
//Profile
const IndividualProfile = () => import("../views/Individual/Profile/Index.vue");
const IndividualSecurity = () => import("../views/Individual/Profile/Security/Index.vue");
const IndividualSettings = () => import("../views/Individual/Profile/Settings/Index.vue");
const PastMeeting = () => import("../views/Individual/Meeting/PastMeeting.vue");
const Committee = () => import("../views/Individual/Committee/Index.vue");
const PastCommittee = () => import("../views/Individual/Committee/PastCommittee.vue");
const PastEvent = () => import("../views/Individual/Event/PastEvent.vue");
const PastProject = () => import("../views/Individual/Project/PastProject.vue");
const Asset = () => import("../views/Individual/Asset/Index.vue");
const PastAsset = () => import("../views/Individual/Asset/PastAsset.vue");
const Attendance = () => import("../views/Individual/Attendance/Index.vue");
// add near the other imports
const Event = () => import("../views/Individual/Event/Index.vue");
const CreateIndividualEvent = () => import("../views/Individual/Event/Create.vue");
const EditIndividualEvent = () => import("../views/Individual/Event/Edit.vue");
const Project = () => import("../views/Individual/Project/Index.vue");
const CreateIndividualProject = () => import("../views/Individual/Project/Create.vue");
const EditIndividualProject = () => import("../views/Individual/Project/Edit.vue");
const ViewIndividualProject = () => import("../views/Individual/Project/View.vue");
const Meeting = () => import("../views/Individual/Meeting/Index.vue");
const CreateIndividualMeeting = () => import("../views/Individual/Meeting/Create.vue");
const EditIndividualMeeting = () => import("../views/Individual/Meeting/Edit.vue");
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
        path: "meetings",
        name: "individual-meetings",
        component: Meeting,
        meta: { requiresAuth: true, permission: "meeting.read" },
      },
      {
        path: "meeting/create",
        name: "create-individual-meeting",
        component: CreateIndividualMeeting,
        meta: { requiresAuth: true, permission: "meeting.create" },
      },
      {
        path: "meeting/edit/:id",
        name: "edit-individual-meeting",
        component: EditIndividualMeeting,
        meta: { requiresAuth: true, permission: "meeting.update" },
        props: true,
      },
      {
        path: "meeting/view/:id",
        name: "view-individual-meeting",
        component: ViewIndividualMeeting,
        meta: { requiresAuth: true, permission: "meeting.read" },
        props: true,
      },
      {
        path: "past-meetings",
        name: "past-individual-meetings",
        component: PastMeeting,
        meta: { requiresAuth: true, permission: "meeting.read" },
      },
      {
        path: "past-meetings",
        name: "past-individual-meetings",
        component: PastMeeting,
        meta: { requiresAuth: true, permission: "meeting.read" },
      },
      {
        path: "committees",
        name: "individual-committees",
        component: Committee,
        meta: { requiresAuth: true, permission: "committee.read" },
      },
      {
        path: "past-committees",
        name: "past-individual-committees",
        component: PastCommittee,
        meta: { requiresAuth: true, permission: "committee.read" },
      },
      {
        path: "events",
        name: "individual-events",
        component: Event,
        meta: { requiresAuth: true, permission: "event.read" },
      },

      {
        path: "past-events",
        name: "past-individual-events",
        component: PastEvent,
        meta: { requiresAuth: true, permission: "event.read" },
      },
      {
        path: "events",
        name: "individual-events",
        component: Event,
        meta: { requiresAuth: true, permission: "event.read" },
      },
      {
        path: "event/create",
        name: "create-individual-event",
        component: CreateIndividualEvent,
        meta: { requiresAuth: true, permission: "event.create" },
      },
      {
        path: "event/edit/:id",
        name: "edit-individual-event",
        component: EditIndividualEvent,
        meta: { requiresAuth: true, permission: "event.update" },
        props: true,
      },
      {
        path: "projects",
        name: "individual-projects",
        component: Project,
        meta: { requiresAuth: true, permission: "project.read" },
      },
      {
        path: "project/create",
        name: "create-individual-project",
        component: CreateIndividualProject,
        meta: { requiresAuth: true, permission: "project.create" },
      },
      {
        path: "project/edit/:id",
        name: "edit-individual-project",
        component: EditIndividualProject,
        meta: { requiresAuth: true, permission: "project.update" },
        props: true,
      },
      {
        path: "project/view/:id",
        name: "view-individual-project",
        component: ViewIndividualProject,
        meta: { requiresAuth: true, permission: "project.read" },
        props: true,
      },
      {
        path: "past-projects",
        name: "past-individual-projects",
        component: PastProject,
        meta: { requiresAuth: true, permission: "project.read" },
      },
      {
        path: "past-projects",
        name: "past-individual-projects",
        component: PastProject,
        meta: { requiresAuth: true, permission: "project.read" },
      },
      {
        path: "assets",
        name: "individual-assets",
        component: Asset,
        meta: { requiresAuth: true, permission: "asset.read" },
      },
      {
        path: "past-assets",
        name: "past-individual-assets",
        component: PastAsset,
        meta: { requiresAuth: true, permission: "asset.read" },
      },
      {
        path: "attendances",
        name: "individual-attendances",
        component: Attendance,
        meta: { requiresAuth: true, permission: "attendance.read" },
      },
    ],
  },
];
export default individualRoutes;
