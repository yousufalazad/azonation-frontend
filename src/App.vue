<!-- App.vue -->
<script setup>
import { computed } from 'vue';
import { authStore } from "./store/authStore";
import LeftSidebar from './views/Org/Layouts/Partials/LeftSidebar.vue';
import RightSidebar from './views/SuperAdmin/Layouts/Partials/RightSidebar.vue';

const auth = authStore;
const UserType = computed(() => auth.user?.type);

const individualUserName = computed(() => auth.individual?.full_name);
const orgUserName = computed(() => auth.org?.org_name);
const superAdminName = computed(() => auth.superadmin?.admin_name);

</script>

<template>
    <header class="navbar navbar-expand-md navbar-light bg-light fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand h4 mb-0" href="#">
          <p class="nav-item" v-if="auth.isAuthenticated && UserType == 1"><span>{{ individualUserName }}</span></p>
          <p class="nav-item" v-if="auth.isAuthenticated && UserType == 2"><span>{{ orgUserName }}</span></p>
          <p class="nav-item" v-if="auth.isAuthenticated && UserType == 3">Super Admin: <span>{{ superAdminName }}</span></p></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>


        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item" v-if="!auth.isAuthenticated">
              <router-link class="nav-link" to="/individual-register">Individual Register</router-link>
            </li>
            <li class="nav-item" v-if="!auth.isAuthenticated">
              <router-link class="nav-link" to="/org-register">Org Register</router-link>
            </li>
            <li class="nav-item" v-if="!auth.isAuthenticated">
              <router-link class="nav-link" to="/superadmin-register">SuperAdmin Register</router-link>
            </li>
            <li class="nav-item" v-if="!auth.isAuthenticated">
              <router-link class="nav-link" to="/">Login</router-link>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated && UserType == 1">
              <router-link class="nav-link" to="/individual-dashboard">Azonation</router-link>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated && UserType == 2">
              <router-link class="nav-link" to="/org-dashboard">Azonation</router-link>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated && UserType == 3">
              <router-link class="nav-link" to="/org-dashboard">Azonation</router-link>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated">
              <button @click="auth.logout()" class="btn btn-primary ms-md-2">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
    
    <div class="container-fluid mt-5">
      <div class="row">
        <div class="col-12">
          <main>
            <router-view />
          </main>
        </div>
      </div>
    </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
