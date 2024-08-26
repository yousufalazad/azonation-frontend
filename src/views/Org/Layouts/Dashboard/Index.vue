<!-- OrgDashboard.vue -->

<script setup>
import Header from '../Partials/Header.vue';
import LeftSidebar from '../../../Org/Layouts/Partials/LeftSidebar.vue';
//import InitialContent from '@/views/Individual/Layouts/Dashboard/InitialContent.vue';
</script>
<template>
  <div class="row">
    <div class="col-md-12 bg-primary top-header">
      <Header></Header>
    </div>
  </div>
  <div class="row">
    <div class="col-md-2 bg-success left-sidebar">
      <LeftSidebar></LeftSidebar>

    </div>
    <div class="col-md-10 bg-danger px-5">
      <router-view />
    </div>
    
  </div>
</template>

<style scoped>
  .row {
    margin: 0;
  }
  
  .top-header {
    height: 56px; /* Adjust the height of the top header as needed */
  }

  /* .left-sidebar {
    position: fixed;
    top: 80px; /* Adjust according to the top-header height
    bottom: 0;
    overflow-y: auto;
    height: calc(100vh - 80px); /* Full height minus the header
  } */

  .left-sidebar {
    /*position: fixed;*/
    top: 80px; 
    bottom: 0; 
    overflow-y: auto;
    height: calc(100vh - 80px); 
  }

</style>
