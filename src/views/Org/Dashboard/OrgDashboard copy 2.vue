<!-- OrgDashboard.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../store/authStore';

const auth = authStore;
const orgId = auth.org.id;
const totalOrgMember = ref('');

const totalOrgMemberCount = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/total-org-member-count/${orgId}`, {}, 'GET');
    if (response.status && response.totalOrgMemberCount) {
      totalOrgMember.value = response.totalOrgMemberCount;
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
  }
};

onMounted(totalOrgMemberCount)
</script>

<template>
  <div class="dashboard-layout">
    <div class="content-area">
      <div v-if="!auth.isAuthenticated">
        <br>
        <h2>Need to protect from Router, path need to protect router.js</h2>
        <h3>Total Membership Organisation/s: 5</h3>
        <br>
        <h3>Total Committee Involvement: 3</h3>
        <br>
        <h3>Upcoming meeting: 2</h3>
        <br>
        <h3>Upcoming Events: 2</h3>
        <br>
        <h3>Upcoming Projects: 1</h3>
        <br>
        <h3>Next Meeting Date: 1 Jan 2025</h3>
        <br>
        <h3>Total Upcoming Meeting in {August}: 3</h3>
        <br>
        <h3>Meeting Attendance Parcentage : 75%</h3>
        <br>
      </div>

      

    </div>
  </div>
</template>../../../store/authStore