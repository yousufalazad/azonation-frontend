<!-- Left Sidebar Page -->

<script setup>
import { computed } from 'vue';
import { authStore } from "../../../../store/authStore";
const auth = authStore;
const userType = computed(() => auth.user?.type);

</script>

<template>
  <section v-if="auth.isAuthenticated && userType == 'individual'">
    <div class="left-sidebar-content mt-4">
      <router-link to="/org-dashboard/dashboard-initial-content" class="menu-item">Dashboard</router-link>
      <br><br>
      
      <router-link to="/individual-dashboard/connected-organisation" class="menu-item">Organisations</router-link><br>
      <br>
      <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">
        Events</router-link><br><br>
      
      <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">
        Attendance</router-link><br><br>
      <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">
        Designations</router-link><br>
      <br>
      <!-- <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">Profile</router-link><br><br>
      <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">Settings</router-link><br> will place in top right dropdown-->
      <br><br><br><br>
    </div>
  </section>
</template>

<style scoped>
.left-sidebar-content {
  margin-left: 23px;
}
</style>
