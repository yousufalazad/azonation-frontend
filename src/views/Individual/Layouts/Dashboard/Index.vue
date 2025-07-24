<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

const auth = authStore;
const router = useRouter();

const isLoading = ref(true);
const hasConnection = ref(false);

const connectedOrgs = ref([]);
const nextMeeting = ref(null);
const upcomingEvent = ref(null);
const approvalRequests = ref([]);
const summaryCounts = ref({
  committees: 0,
  meetings: 0,
  events: 0,
  projects: 0,
  assets: 0,
  founders: 0
});

const fetchDashboardData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/dashboard-summary', {}, 'GET');
    if (response.status) {
      hasConnection.value = response.data.has_connection || [];
      connectedOrgs.value = response.data.connected_organisations || [];
      nextMeeting.value = response.data.next_meeting || null;
      upcomingEvent.value = response.data.upcoming_event || null;
      approvalRequests.value = response.data.approval_requests || [];
      summaryCounts.value = response.data.summary_counts || {};
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <div v-else-if="!hasConnection" class="p-6 bg-yellow-50 text-yellow-700 rounded shadow">
      <p>You are not currently connected to any organisation.</p>
    </div>

    <!-- <div v-else class="space-y-8"> -->
    <div class="space-y-8">
      <!-- Connected Organisations -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Connected Organisations</h2>
          <router-link to="/individual-dashboard/connected-orgs" class="text-sm text-blue-600 hover:underline">See all</router-link>
        </div>
        <ul class="space-y-1">
          <li v-for="org in connectedOrgs" :key="org.id" class="text-gray-700">
            {{ org.org_name }}
          </li>
        </ul>
      </div>

      <!-- Next Meeting & Upcoming Event -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Next Meeting -->
        <div class="bg-white p-6 rounded shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Next Meeting</h2>
            <router-link to="/org-dashboard/meetings" class="text-sm text-blue-600 hover:underline">See all</router-link>
          </div>
          <div v-if="nextMeeting" class="text-gray-700">
            <p class="font-medium">{{ nextMeeting.title }}</p>
            <p class="text-sm text-gray-500">{{ nextMeeting.date }} — {{ nextMeeting.time }}</p>
          </div>
          <div v-else class="text-gray-500 italic">No upcoming meetings.</div>
        </div>

        <!-- Upcoming Event -->
        <div class="bg-white p-6 rounded shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Upcoming Event</h2>
            <router-link to="/org-dashboard/events" class="text-sm text-blue-600 hover:underline">See all</router-link>
          </div>
          <div v-if="upcomingEvent" class="text-gray-700">
            <p class="font-medium">{{ upcomingEvent.title }}</p>
            <p class="text-sm text-gray-500">{{ upcomingEvent.date }} — {{ upcomingEvent.venue }}</p>
          </div>
          <div v-else class="text-gray-500 italic">No upcoming events.</div>
        </div>
      </div>

      <!-- Approval Requests -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Approval Requests</h2>
          <router-link to="/individual-dashboard/approval-requests" class="text-sm text-blue-600 hover:underline">See all</router-link>
        </div>
        <ul v-if="approvalRequests.length" class="space-y-1 text-gray-700">
          <li v-for="req in approvalRequests" :key="req.id">
            {{ req.message }}
          </li>
        </ul>
        <div v-else class="text-gray-500 italic">No approval requests.</div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(count, label) in summaryCounts" :key="label" class="bg-white p-5 rounded shadow text-center">
          <p class="text-sm text-gray-500 uppercase tracking-wide">{{ label }}</p>
          <p class="text-2xl font-bold text-blue-700 mt-1">{{ count }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
