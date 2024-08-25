<!-- OrgDashboard.vue -->

<script setup>
import Header from '../Partials/Header.vue';
import LeftSidebar from '../../../Org/Layouts/Partials/LeftSidebar.vue';
//import InitialContent from '@/views/Individual/Layouts/Dashboard/InitialContent.vue';
</script>

<template>
  <div class="row">
    <div class="col-md-12">
      <Header></Header>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="col-md-2">
          <LeftSidebar></LeftSidebar>
        </div>
        <div class="col-md-10">
          <router-view />
        </div>
      </div>
    </div>
    
  </div>
</template>
