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
import { onMounted } from 'vue';

const authStore = loginAuthStore;
const orgData = authStore.org;
const orgDataError = authStore.errors;
const orgDataLoading = false; // Set to true if you want to show loading indicator

// Fetch organization data when the component is mounted
onMounted(async () => {
  try {
    // You can add any additional logic here before fetching org data
    // For example, check if the user is authenticated before fetching org data
    // if (!authStore.isAuthenticated) { return; }
    
    // Fetch organization data
    // await authStore.orgData(authStore.user.user_id);
  } catch (error) {
    console.error('Error fetching organization data:', error);
  }
});
</script>

<style>
/* Add your CSS styles here */
</style>
