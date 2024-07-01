<!-- OrgDashboard.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import OrgSidebar from './OrgSidebar.vue';
import { authStore } from '../../store/authStore';
import RightSidebar from './RightSidebar.vue';

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
    <OrgSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />
    <RightSidebar v-if="auth.isAuthenticated && auth.user?.type == 2" />
    <div class="content-area">
      <router-view />
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

      <div v-if="auth.isAuthenticated && auth.user?.type == 2">
        <br>
        <h3>Total Members: {{ totalOrgMember }}</h3>
        <br>
        <h3>Total Active Committee: 3</h3>
        <br>
        <h3>Upcoming Events: 2</h3>
        <br>
        <h3>Upcoming Projects: 1</h3>
        <br>
        <h3>Next Meeting Date: 1 Jan 2025</h3>
        <br>
        <h3>Total New Member Added in {August}: 3</h3>
        <br>
        <h3>Last Meeting Attendance Parcentage : 75%</h3>
        <br>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
}

.content-area {
  margin-left: 220px;
  padding: 20px;
  flex-grow: 1;
}
</style>