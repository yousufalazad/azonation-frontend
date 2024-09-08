<!-- OrgDashboard.vue -->

<script setup>
import Header from '../Partials/Header.vue';
import LeftSidebar from '../../../Org/Layouts/Partials/LeftSidebar.vue';

</script>
<template>
  <div class="row">
    <div class="col-md-12 top-header">
      <Header></Header>
    </div>
  </div>
  <div class="row">
    <div class="col-md-2 left-sidebar border-right">
      <LeftSidebar></LeftSidebar>
    </div>
    <div class="col-md-10 px-5">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
  .row {
    margin: 0;
  }
  
  .top-header {
    height: 65px; /* Adjust the height of the top header as needed */
    border-bottom: 0.01em solid;
    border-color: whitesmoke;
  }

  .left-sidebar {
    top: 80px;
    bottom: 0;
    /* overflow-y: auto; */
    height: calc(100vh);
    /* border-right: 0.01em solid; */
    border-right: 0.01em solid;
    border-color: whitesmoke;
  }

</style>
