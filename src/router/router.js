import { createRouter, createWebHistory } from "vue-router";

//Auth
import Login from "../views/Auth/Login.vue";

//Individual
import IndividualRegister from "../views/Individual/User/Register.vue";
import IndividualDashboard from "../views/Individual/IndividualDashboard.vue";
import ConnectedOrganisation from "../views/Individual/ConnectedOrganisation.vue";
import NotificationFromOrg from "../views/Individual/Notifications/NotificationFromOrg.vue";
import IndividualProfileUpdate from "../views/Individual/Profile/IndividualProfileUpdate.vue";

//Org
import OrgRegister from "../views/Org/User/Register.vue";
import OrgDashboard from "../views/Org/Dashboard/Index.vue";
import OrgDashboardInitialContent from "../views/Org/Dashboard/InitialContent.vue"

import OrgProfileUpdate from "../views/Org/Profile/OrgProfileUpdate.vue";
import OrgSettings from "../views/Org/Profile/Settings.vue";

import AddMember from "../views/Org/Member/AddMember.vue";
import OrgMemberList from "../views/Org/Member/orgMemberList.vue";

import CommitteeList from "../views/Org/Committee/CommitteeList.vue";
import CreateCommittee from "../views/Org/Committee/CreateCommittee.vue";
import FormerCommitteeList from "../views/Org/Committee/FormerCommitteeList.vue";

import CreateMeeting from "../views/Org/Meeting/CreateMeeting.vue";
import OrgUpcomingMeetingList from "../views/Org/Meeting/OrgUpcomingMeetingList.vue";
import OrgPreviousMeetingList from "../views/Org/Meeting/OrgPreviousMeetingList.vue";
import InviteMeeting from "../views/Org/Meeting/InviteMeeting.vue";

import CreateEvent from "../views/Org/Event/CreateEvent.vue";
import UpcomingEvents from "../views/Org/Event/EventList.vue";

import CreateProject from "../views/Org/Project/Create.vue";
import Projects from "../views/Org/Project/Index.vue";

//SuperAdmin
import SuperAdminRegister from "../views/SuperAdmin/User/Register.vue";
import SuperAdminDashboard from "../views/SuperAdmin/Profile/SuperAdminDashboard.vue";
import SuperAdminProfileUpdate from "@/views/SuperAdmin/Profile/SuperAdminProfileUpdate.vue";


// Mock authentication function
function isAuthenticated() {
  // Replace this with your actual authentication logic
  return !!localStorage.getItem("auth");
}

const routes = [
  {
    path: "/",
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
    path: "/superadmin-register",
    name: "superadmin-register",
    component: SuperAdminRegister,
  },
  {
    path: "/individual-dashboard",
    name: "individual-dashboard",
    component: IndividualDashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: "connected-organisation",
        name: "connected-organisation",
        component: ConnectedOrganisation,
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
    ],
  },
  {
    path: "/org-dashboard",
    name: "org-dashboard",
    component: OrgDashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: "/initial-content",
        name: "org-dashboard-initial-content",
        component: OrgDashboardInitialContent,
        meta: { requiresAuth: true },
      },
      {
        path: "org-profile-update",
        name: "org-profile-update",
        component: OrgProfileUpdate,
        meta: { requiresAuth: true },
      },
      {
        path: "org-settings",
        name: "org-settings",
        component: OrgSettings,
        meta: { requiresAuth: true },
      },
      {
        path: "add-member",
        name: "add-member",
        component: AddMember,
        meta: { requiresAuth: true },
      },
      {
        path: "org-member-list",
        name: "org-member-list",
        component: OrgMemberList,
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
        path: "upcoming-meeting-list",
        name: "upcoming-meeting-list",
        component: OrgUpcomingMeetingList,
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
    ],
  },
  {
    path: "/super-admin-dashboard",
    name: "super-admin-dashboard",
    component: SuperAdminDashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: "superadmin-profile-update",
        name: "superadmin-profile-update",
        component: SuperAdminProfileUpdate,
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
