<!-- OrgDashboard.vue -->
<script setup>
import OrgSidebar from './OrgSidebar.vue';
import { authStore } from "../store/authStore";

const auth = authStore;
</script>

<template>
  <div class="dashboard-layout">
    <OrgSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />
    <div class="content-area">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
}
.content-area {
  margin-left: 220px;
  padding: 20px;
  flex-grow: 1;
}
</style>../store/authStore