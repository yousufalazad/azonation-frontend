<!-- OrgDashboard.vue -->
<script setup>
import OrgHeader from '../../Org/Layouts/Partials/Header.vue';
import OrgLeftSidebar from '../Layouts/Partials/LeftSidebar.vue';
import OrgRightSidebar from '../Layouts/Partials/RightSidebar.vue';
import OrgDashboard from '../OrgDashboard.vue';
import { authStore } from '../../../store/authStore';

const auth = authStore;
</script>

<template>
  
  <div class="dashboard-layout">
    <OrgHeader v-if="auth.isAuthenticated && auth.user?.type == 2" />
    <OrgLeftSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />
    <OrgRightSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />
    <div class="content-area">
      <router-view />
      <OrgDashboard/>
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