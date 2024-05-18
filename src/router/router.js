import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import OrgRegister from '../views/OrgRegister.vue'
import IndividualRegister from '../views/individualRegister.vue'
import IndividualDashboard from '../views/IndividualDashboard.vue'
import OrgDashboard from '../views/OrgDashboard.vue'
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
      component: OrgDashboard
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

export default router
