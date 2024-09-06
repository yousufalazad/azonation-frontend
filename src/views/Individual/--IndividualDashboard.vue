<!-- Individual Dashboard.vue -->
<script setup>
// import IndividualLeftSidebar from '../Individual/Layouts/Partials/LeftSidebar.vue';
import { authStore } from '../../store/authStore';
const auth = authStore;
</script>

<template>
  <div class="individual-layout">
    <!-- <IndividualLeftSidebar v-if="auth.isAuthenticated && auth.user?.type == 1" /> -->
    <div class="content-area">
      <router-view />

      <div v-if="auth.isAuthenticated && auth.user?.type == 1">
        <br>
        <h3>Total Connected Organisations: 75</h3>
        <br>
        <h3>Total Committee Involvement: 3</h3>
        <br>
        <h3>Upcoming meeting: 2</h3>
        <br>
        <h3>Upcoming Events: 2</h3>
        <br>
        <h3>Upcoming Projects: 1</h3>
        <br>
        <h3>Next Meeting Date: 1 Jan 2025</h3>
        <br>
        <h3>Total Upcoming Meeting in {August}: 3</h3>
        <br>
        <h3>Meeting Attendance Parcentage : 75%</h3>
        <br>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.individual-layout {
  display: flex;
}
.content-area {
  margin-left: 220px;
  padding: 20px;
  flex-grow: 1;
}
</style>