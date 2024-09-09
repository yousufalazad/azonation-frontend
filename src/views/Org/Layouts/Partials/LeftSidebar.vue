<!-- Left Sidebar Page -->
<!-- ref: https://flowbite.com/docs/components/sidebar/ -->

<script setup>
import { computed } from 'vue';
import { authStore } from "../../../../store/authStore";
const auth = authStore;
const userType = computed(() => auth.user?.type);


</script>

<template>
  <section v-if="auth.isAuthenticated && userType == 'organisation'">
    
    <div class="left-sidebar-content mt-4">
      <router-link to="/org-dashboard/dashboard-initial-content" class="menu-item">Dashboard</router-link>
      <br><br>
      <router-link to="/org-dashboard/member-list" class="menu-item">Member List</router-link><br>
      <router-link to="/org-dashboard/add-member" class="menu-item">Add Member</router-link>
      <br><br>
      <router-link to="/org-dashboard/committee-list" class="menu-item">Committees</router-link><br>
      <br>
      <router-link to="/org-dashboard/create-meeting" class="menu-item">Meeting</router-link>
      <br><br>
      <router-link to="/org-dashboard/create-event" class="menu-item">Create Event</router-link>
      <br><br>
      <router-link to="/org-dashboard/create-project" class="menu-item">Create Project</router-link>
      <br><br>
      <router-link to="/org-dashboard/org-profile-update" class="menu-item">Profile</router-link><br>
      <br><br><br><br>
    </div>
  </section>
</template>

<style scoped>
.left-sidebar-content {
  margin-left: 23px;
}

</style>
