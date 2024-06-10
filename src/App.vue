<!-- App.vue -->
<script setup>
import { computed } from 'vue';
import { authStore } from "./store/authStore";

const auth = authStore;
const UserType = computed(() => auth.user?.type);
</script>

<template>
  <div>
    <header class="navbar navbar-expand-md navbar-light bg-light fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand h4 mb-0" href="#">Azonation (<span>{{ UserType }}</span>)</a>
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
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated && UserType == 1">
              <router-link class="nav-link" to="/individual-dashboard">Individual Dashboard</router-link>
            </li>
            <li class="nav-item" v-if="auth.isAuthenticated && UserType == 2">
              <router-link class="nav-link" to="/org-dashboard">Organization Dashboard</router-link>
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
  </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>./store/authStore
