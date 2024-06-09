<!-- Individual Dashboard.vue -->
<script setup>
import IndividualSidebar from './IndividualSidebar.vue';
import { loginAuthStore } from "../store/loginLogoutStore";
const auth = loginAuthStore;
</script>

<template>
  <div class="individual-layout">
    <IndividualSidebar v-if="auth.isAuthenticated && auth.user?.type == 1" />
    <div class="content-area">
      <router-view />
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