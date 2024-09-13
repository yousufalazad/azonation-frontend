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
      <router-link to="/org-dashboard/member-list" class="menu-item">Members</router-link><br>
      <!-- <router-link to="/org-dashboard/add-member" class="menu-item">Add Member</router-link> it will be a button in Members page -->
      <br>
      <router-link to="/org-dashboard/committee-list" class="menu-item">Committees</router-link><br>
      <br>
      <router-link to="/org-dashboard/create-meeting" class="menu-item">Meetings</router-link>
      <br><br>
      <router-link to="/org-dashboard/create-event" class="menu-item">Events</router-link>
      <br><br>
      <router-link to="/org-dashboard/create-project" class="menu-item">Projects</router-link>
      <br><br>
      <router-link to="/org-dashboard/create-project" class="menu-item">Accounts</router-link>
      <br><br>
      <router-link to="/org-dashboard/create-project" class="menu-item">Records</router-link>
      <br><br>
      <router-link to="/org-dashboard/create-project" class="menu-item">Reports</router-link>
      <br><br>
      <router-link to="/org-dashboard/profile" class="menu-item">Profile</router-link>
      <br><br>
      <!-- <router-link to="/org-dashboard/profile" class="menu-item">Settings</router-link><br>will place in top right dropdown -->
      <br><br><br><br>
    </div>
  </section>
</template>

<style scoped>
.left-sidebar-content {
  margin-left: 23px;
}

</style>
