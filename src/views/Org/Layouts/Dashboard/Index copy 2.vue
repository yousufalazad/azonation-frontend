<!-- OrgDashboard.vue -->

<script setup>
import LeftSidebar from '../../../Org/Layouts/Partials/LeftSidebar.vue';
import RightSidebar from '../../../Org/Layouts/Partials/RightSidebar.vue';
import Header from '../Partials/Header.vue';

</script>

<template>
  <div class="row">
    <div class="col-md-2">
      <div class="row p-0">
        <div class="col-md-12 p-0 d-flex justify-content-center align-items-center">
          <img src="./../../../../assets/Logo/Azonation.png" width="200px" class=" img-fluid py-2" alt="Azonation Logo">
        </div>
      </div>
      <div class="row p-0">
        <div class="col-md-12 p-0">
          <LeftSidebar />
        </div>
      </div>

    </div>
    <div class="col-md-10 bg-success">
      right
    </div>
  </div>
</template>
