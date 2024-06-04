import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import OrgRegister from '../views/OrgRegister.vue'
import IndividualDashboard from '../views/IndividualDashboard.vue'
import IndividualRegister from '../views/IndividualRegister.vue'
import OrgDashboard from '../views/OrgDashboard.vue'
import OrgProfileUpdate from '../views/OrgProfileUpdate.vue'
import AddMember from '../views/AddMember.vue'
import OrgMemberList from '../views/orgMemberList.vue'
import Login from '../views/Login.vue'

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
      component: IndividualDashboard
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
