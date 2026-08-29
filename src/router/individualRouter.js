import IndividualDashboardLayout from "../views/Individual/Layouts/Layout.vue";
import IndividualDashboardIndex from "../views/Individual/Layouts/Dashboard/Index.vue";
import HeaderNotifications from "../views/Individual/Layouts/HeaderNotification.vue";
import Notifications from "../views/Individual/Notification/Index.vue";
import ConnectedOrganisations from "../views/Individual/Organisation/Index.vue";

//Profile
import IndividualProfile from "../views/Individual/Profile/Index.vue";
import IndividualSecurity from "../views/Individual/Profile/Security/Index.vue";
import IndividualSettings from "../views/Individual/Profile/Settings/Index.vue";

import PastMeeting from "../views/Individual/Meeting/PastMeeting.vue";
import Committee from "../views/Individual/Committee/Index.vue";
import PastCommittee from "../views/Individual/Committee/PastCommittee.vue";
import PastEvent from "../views/Individual/Event/PastEvent.vue";
import PastProject from "../views/Individual/Project/PastProject.vue";
import Asset from "../views/Individual/Asset/Index.vue";
import PastAsset from "../views/Individual/Asset/PastAsset.vue";
import Attendance from "../views/Individual/Attendance/Index.vue";

// add near the other imports
import Event from "../views/Individual/Event/Index.vue";
import CreateIndividualEvent from "../views/Individual/Event/Create.vue";
import EditIndividualEvent from "../views/Individual/Event/Edit.vue";

import Project from "../views/Individual/Project/Index.vue";
import CreateIndividualProject from "../views/Individual/Project/Create.vue";
import EditIndividualProject from "../views/Individual/Project/Edit.vue";
import ViewIndividualProject from "../views/Individual/Project/View.vue";

import Meeting from "../views/Individual/Meeting/Index.vue";
import CreateIndividualMeeting from "../views/Individual/Meeting/Create.vue";
import EditIndividualMeeting from "../views/Individual/Meeting/Edit.vue";
import ViewIndividualMeeting from "../views/Individual/Meeting/View.vue";

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
