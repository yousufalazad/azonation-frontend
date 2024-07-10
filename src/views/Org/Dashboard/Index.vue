<!-- OrgDashboard.vue -->

<script setup>
import { authStore } from '../../../store/authStore';
import LeftSidebar from '../../Org/Layouts/Partials/LeftSidebar.vue';
import RightSidebar from '../../Org/Layouts/Partials/RightSidebar.vue';
import InitialContent from '../../Org/Dashboard/InitialContent.vue';

const auth = authStore;
</script>



<template>
  <div>
    <LeftSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />

    <RightSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />

    <InitialContent v-if="auth.isAuthenticated && auth.user?.type == 2" />
  </div>
  
  <div class="dashboard-layout">
    <div class="content-area">

      <router-view />

    </div>
  </div>
</template>