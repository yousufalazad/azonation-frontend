<!-- OrgDashboard.vue -->

<script setup>
import { authStore } from '../../../../store/authStore';
import LeftSidebar from '../../../Org/Layouts/Partials/LeftSidebar.vue';
import RightSidebar from '../../../Org/Layouts/Partials/RightSidebar.vue';
import Header from '../Partials/Header.vue';

const auth = authStore;
</script>

<template>
  <div class="row">
    <div class="col-md-12">
      <Header />
    </div>
    <div class="col-md-2">
      <LeftSidebar />
    </div>
    <div class="col-md-8">
      <router-view />
    </div>
    <div class="col-md-2">
      <RightSidebar />
    </div>
  </div>
</template>
