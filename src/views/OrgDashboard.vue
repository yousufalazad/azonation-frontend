<!-- OrgDashboard.vue -->
<template>
  <div>
    <h1>Org Dashboard</h1>
    <h2>Organization Data:</h2>
    <p v-if="orgDataLoading">Loading organization data...</p>
    <div v-else>
      <p v-if="orgDataError">{{ orgDataError }}</p>
      <div v-else>
        <p>Organization Name: {{ orgData.org_name }}</p>
        <p>Organization user id: {{ orgData.user_id }}</p>
        <p>Organization id: {{ orgData.id }}</p>
        <p>Organization short_description: {{ orgData.short_description }}</p>
        <p>Organization status: {{ orgData.status }}</p>
        <!-- Display other organization data properties as needed -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { loginAuthStore } from "../store/loginLogoutStore";


const auth = loginAuthStore;
const UserType = computed(() => auth.user?.type);

</script>

<template>
  <h1>Org Dasboard Data:</h1>
  <p>
    User type for Organization: <span>{{ UserType }}</span>
  </p>
</template>

<style></style>
