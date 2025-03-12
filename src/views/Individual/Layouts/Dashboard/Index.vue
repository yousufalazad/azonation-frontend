<!-- OrgDashboard.vue -->

<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const userId = auth.user.id;
const totalOrgMember = ref('');
const memberList = ref([]);
const userType = computed(() => auth.user?.type);


const totalOrgMemberCount = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/total-org-member-count/${userId}`, {}, 'GET');
    if (response.status && response.totalOrgMemberCount) {
      totalOrgMember.value = response.totalOrgMemberCount;
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
  }
};

const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi(`/api/org-members/list/${userId}`, {}, 'GET');
    if (response.status) {
      memberList.value = response.data;
    } else {
      memberList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    memberList.value = [];
  }
};

onMounted(totalOrgMemberCount)
onMounted(fetchMemberList);
</script>

<template>
  <div v-if="auth.isAuthenticated && userType == 'individual'" class="space-y-8 mt-4">
    <!-- Connected Organization Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white shadow rounded-lg p-4">
        <h5 class="font-semibold text-lg">Connected organisations</h5>
        <p class="text-sm font-medium"><strong>{{ connectedOrganisation }}</strong></p>
        <a href="#" class="mt-3 inline-block text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">See all</a>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <h5 class="font-semibold text-lg">Next meeting</h5>
        <p class="text-sm font-medium"><strong>{{ nextMeetingDate }}</strong></p>
        <a href="#" class="mt-3 inline-block text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">See all</a>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <h5 class="font-semibold text-lg">Upcoming event</h5>
        <p class="text-sm font-medium"><strong>{{ upcomingEventDate }}</strong></p>
        <a href="#" class="mt-3 inline-block text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">See all</a>
      </div>
      <div class="bg-white shadow rounded-lg p-4">
        <h5 class="font-semibold text-lg">Approval request</h5>
        <p class="text-sm font-medium"><strong>{{ approvalRequest }}</strong></p>
        <a href="#" class="mt-3 inline-block text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">See all</a>
      </div>
    </div>

    <!-- Connected Organizations' Activities -->
    <div>
      <h3 class="flex justify-between mb-4 left-color-shade py-2">Recent meetings</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Example Activity -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <!-- <img src="#" alt="Meeting Image" class="w-full h-48 object-cover"> -->
          <div class="p-4">
            <h4 class="font-semibold text-lg">Meeting title 1</h4>
            <p class="text-sm text-gray-600">Meeting at <strong>Venue Name</strong></p>
            <p class="text-sm text-gray-600">Held on <strong>{{ meetingDate }}</strong></p>
            <a href="#" class="text-blue-500 hover:underline mt-2 inline-block">View details</a>
          </div>
        </div>
        <!-- Add more activity cards as needed -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <!-- <img src="#" alt="Meeting Image" class="w-full h-48 object-cover"> -->
          <div class="p-4">
            <h4 class="font-semibold text-lg">Meeting title 2</h4>
            <p class="text-sm text-gray-600">Meeting at <strong>Venue Name</strong></p>
            <p class="text-sm text-gray-600">Held on <strong>{{ meetingDate }}</strong></p>
            <a href="#" class="text-blue-500 hover:underline mt-2 inline-block">View details</a>
          </div>
        </div>

        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <!-- <img src="#" alt="Meeting Image" class="w-full h-48 object-cover"> -->
          <div class="p-4">
            <h4 class="font-semibold text-lg">Meeting title 3</h4>
            <p class="text-sm text-gray-600">Meeting at <strong>Venue Name</strong></p>
            <p class="text-sm text-gray-600">Held on <strong>{{ meetingDate }}</strong></p>
            <a href="#" class="text-blue-500 hover:underline mt-2 inline-block">View details</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Event Details -->
    <div>
      <h3 class="flex justify-between mb-4 left-color-shade py-2">Recent events</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Example Event -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <!-- <img src="#" alt="Event Image" class="w-full h-48 object-cover"> -->
          <div class="p-4">
            <h4 class="font-semibold text-lg">Event title</h4>
            <p class="text-sm text-gray-600">Purpose: <strong>Event Purpose</strong></p>
            <p class="text-sm text-gray-600">Location: <strong>Venue Name</strong></p>
            <p class="text-sm text-gray-600">Held on <strong>{{ eventDate }}</strong></p>
            <a href="#" class="text-blue-500 hover:underline mt-2 inline-block">View details</a>
          </div>
        </div>
        <!-- Add more event cards as needed -->
      </div>
    </div>

    <!-- projects -->
    <div>
      <h3 class="flex justify-between mb-4 left-color-shade py-2">Recent projects</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Example Event -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <!-- <img src="#" alt="Event Image" class="w-full h-48 object-cover"> -->
          <div class="p-4">
            <h4 class="font-semibold text-lg">Project title</h4>
            <p class="text-sm text-gray-600">Purpose: <strong>Project Purpose</strong></p>
            <p class="text-sm text-gray-600">Location: <strong>Project venue</strong></p>
            <p class="text-sm text-gray-600">Held on <strong>{{ eventDate }}</strong></p>
            <a href="#" class="text-blue-500 hover:underline mt-2 inline-block">View details</a>
          </div>
        </div>
        <!-- Add more event cards as needed -->
      </div>
    </div>
  </div>
</template>

