import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import Login from '../views/Login.vue'

import IndividualRegister from '../views/IndividualRegister.vue'
import IndividualDashboard from '../views/IndividualDashboard.vue'
import ConnectedOrganisation from '../views/ConnectedOrganisation.vue'
import NotificationFromOrg from '../views/NotificationFromOrg.vue'
import IndividualProfileUpdate from '../views/IndividualProfileUpdate.vue'

import OrgRegister from '../views/OrgRegister.vue'
import OrgDashboard from '../views/OrgDashboard.vue'
import OrgProfileUpdate from '../views/OrgProfileUpdate.vue'

import AddMember from '../views/AddMember.vue'
import OrgMemberList from '../views/orgMemberList.vue'

import CommitteeList from '../views/CommitteeList.vue'
import CreateCommittee from '../views/CreateCommittee.vue'
import FormerCommitteeList from '../views/FormerCommitteeList.vue'

import CreateMeeting from '../views/CreateMeeting.vue'
import OrgUpcomingMeetingList from '../views/OrgUpcomingMeetingList.vue'
import OrgPreviousMeetingList from '../views/OrgPreviousMeetingList.vue'
import InviteMeeting from '../views/InviteMeeting.vue'

import CreateEvent from '../views/Org/Event/CreateEvent.vue'
import UpcomingEvents from '../views/Org/Event/EventList.vue'

import CreateProject from '../views/Org/Project/Create.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {  
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/individual-register',
      name: 'individual-register',
      component: IndividualRegister
    },
    {
      path: '/org-register',
      name: 'org-register',
      component: OrgRegister
    },
    {
      path: '/individual-dashboard',
      name: 'individual-dashboard',
      component: IndividualDashboard,
      children: [
        {
          path: 'connected-organisation',
          name: 'connected-organisation',
          component: ConnectedOrganisation
        },
        {
          path: 'notification-from-org',
          name: 'notification-from-org',
          component: NotificationFromOrg
        },
        {
          path: 'individual-profile-update',
          name: 'individual-profile-update',
          component: IndividualProfileUpdate
        }
      ]
    },
    {
      path: '/org-dashboard',
      name: 'org-dashboard',
      component: OrgDashboard,
      children: [
        {
          path: 'org-profile-update',
          name: 'org-profile-update',
          component: OrgProfileUpdate
        },
        {
          path: 'add-member',
          name: 'add-member',
          component: AddMember
        },
        {
          path: 'org-member-list',
          name: 'org-member-list',
          component: OrgMemberList
        },
        {
          path: 'create-committee',
          name: 'create-committee',
          component: CreateCommittee
        },
        {
          path: 'committee-list',
          name: 'committee-list',
          component: CommitteeList
        },
        {
          path: 'former-committee-list',
          name: 'former-committee-list',
          component: FormerCommitteeList
        },
        {
          path: 'create-meeting',
          name: 'create-meeting',
          component: CreateMeeting
        },
        {
          path: 'upcoming-meeting-list',
          name: 'upcoming-meeting-list',
          component: OrgUpcomingMeetingList
        },
        {
          path: 'previous-meeting-list',
          name: 'previous-meeting-list',
          component: OrgPreviousMeetingList
        },
        {
          path: 'invite-meeting',
          name: 'invite-meeting',
          component: InviteMeeting
        },
        {
          path: 'create-event',
          name: 'create-event',
          component: CreateEvent
        },
        {
          path: 'upcoming-events',
          name: 'upcoming-events',
          component: UpcomingEvents
        },
        {
          path: 'create-project',
          name: 'create-project',
          component: CreateProject
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

export default router
