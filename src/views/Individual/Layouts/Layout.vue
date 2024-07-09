<!-- OrgDashboard.vue -->
<script setup>
import OrgSidebar from '../Org/OrgSidebar.vue';
import { authStore } from '../../store/authStore';
import RightSidebar from './RightSidebar.vue';
const auth = authStore;
</script>

<template>
  <div class="dashboard-layout">
    <OrgSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />
    <RightSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />
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
</style>