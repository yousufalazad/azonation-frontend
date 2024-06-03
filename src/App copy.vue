<!-- App.vue -->
<script setup>
import { computed } from 'vue';
import { loginAuthStore } from "./store/loginLogoutStore";

const auth = loginAuthStore;
const UserType = computed(() => auth.user?.type);
//const UserName = computed(() => auth.user?.org_name);
//const IndividualUserName = computed(() => auth.user?.full_name);

</script>

<template>
  <div class="container">
    <header class="d-flex flex-column flex-md-row align-items-center p-3 mb-4 border-bottom bg-light">
      <h1 class="h4 me-auto">Azonation (<span>{{ UserType }}</span>)</h1>
      <nav class="my-2 my-md-0 me-md-3">
        <ul class="nav">
          <li class="nav-item" v-if="!auth.isAuthenticated">
            <router-link class="nav-link" to="/individual-register">Individual Register</router-link>
          </li>
          <li class="nav-item" v-if="!auth.isAuthenticated">
            <router-link class="nav-link" to="/org-register">Org Register</router-link>
          </li>
          <li class="nav-item" v-if="!auth.isAuthenticated">
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
          <li v-if="auth.isAuthenticated">
            <ul class="nav">
              <li class="nav-item" v-if="UserType === 1">
                <ul class="nav">
                  <li class="nav-item">
                    <router-link class="nav-link" to="/individual-dashboard">Individual Dashboard</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/individual-dashboard">Individual Dashboard2</router-link>
                  </li>
                </ul>
              </li>
              <li class="nav-item" v-if="UserType === 2">
                <ul class="nav">
                  <li class="nav-item">
                    <router-link class="nav-link" to="/org-dashboard">Organization Dashboard</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/org-dashboard">Organization Dashboard2</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/org-member-list">Org Member List</router-link>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <button v-if="auth.isAuthenticated" @click="auth.logout()" class="btn btn-primary ms-md-2">
                  Logout
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
    <div class="row">
      <div class="col-md-12">
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
