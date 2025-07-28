<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

const auth = authStore;
const router = useRouter();
const isLoading = ref(true);
const allMeetings = ref([]); // Flattened list

const fetchMeetingsData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/past_meetings', {}, 'GET');
    if (response.status) {
      const orgMeetings = response.data || [];

      // Flatten meetings with org_name included
      allMeetings.value = orgMeetings.flatMap(org =>
        (org.meetings || []).map(meeting => ({
          ...meeting,
          org_name: org.org_name || 'Unknown Organisation',
        }))
      );
    }
  } catch (error) {
    console.error('Failed to load meetings data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMeetingsData();
});
</script>
<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Past Meetings</h1>
      <div>
        <button @click="$router.push({ name: 'individual-meetings' })"
          class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
          Past Event List
        </button>
      </div>
    </div>
    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <div v-else-if="!allMeetings.length" class="text-gray-500 italic">No past meetings found.</div>

    <div v-else class="bg-white p-6 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">All Past Meetings</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow rounded-md">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Organisation</th>
              <th class="px-4 py-3 text-left">Meeting Name</th>
              <th class="px-4 py-3 text-left">Date</th>
              <th class="px-4 py-3 text-left">Start Time</th>
              <th class="px-4 py-3 text-left">End Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(meeting, index) in allMeetings" :key="meeting.id"
              class="border-t text-sm text-gray-800 hover:bg-gray-50">
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ meeting.org_name }}</td>
              <td class="px-4 py-3">{{ meeting.name || '—' }}</td>
              <td class="px-4 py-3">{{ meeting.date || '—' }}</td>
              <td class="px-4 py-3">{{ meeting.start_time || '—' }}</td>
              <td class="px-4 py-3">{{ meeting.end_time || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
