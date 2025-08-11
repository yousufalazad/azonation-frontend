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
  <div class="space-y-6 sm:space-y-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-2 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800 break-words">
        Past Meetings
      </h1>
      <div class="w-full sm:w-auto">
        <button
          @click="$router.push({ name: 'individual-meetings' })"
          class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Upcoming Meeting List
        </button>
      </div>
    </div>

    <!-- Loading / Empty -->
    <div v-if="isLoading" class="text-gray-500">Loading...</div>
    <div v-else-if="!allMeetings.length" class="text-gray-500 italic">No past meetings found.</div>

    <!-- Data -->
    <div v-else class="bg-white p-4 sm:p-6 rounded shadow">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <h2 class="text-base sm:text-lg font-semibold text-gray-800">All Past Meetings</h2>
      </div>

      <!-- Mobile: card list -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="(meeting, index) in allMeetings"
          :key="meeting.id"
          class="border rounded-lg p-3 bg-white shadow-sm"
        >
          <div class="text-xs text-gray-500 mb-2">
            <span class="font-medium"># {{ index + 1 }}</span>
          </div>

          <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
            <tbody>
              <tr>
                <td class="text-gray-500 w-[100px] pr-2">Organisation</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ meeting.org_name || '—' }}</td>
              </tr>
              <tr>
                <td class="text-gray-500 w-[100px] pr-2">Meeting Name</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ meeting.name || '—' }}</td>
              </tr>
              <tr>
                <td class="text-gray-500 w-[100px] pr-2">Date</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ meeting.date || '—' }}</td>
              </tr>
              <tr>
                <td class="text-gray-500 w-[100px] pr-2">Start Time</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ meeting.start_time || '—' }}</td>
              </tr>
              <tr>
                <td class="text-gray-500 w-[100px] pr-2">End Time</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ meeting.end_time || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tablet/Desktop: table -->
      <div class="hidden sm:block overflow-x-auto">
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
            <tr
              v-for="(meeting, index) in allMeetings"
              :key="meeting.id"
              class="border-t text-sm text-gray-800 hover:bg-gray-50 align-top"
            >
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3 break-words">{{ meeting.org_name || '—' }}</td>
              <td class="px-4 py-3 break-words">{{ meeting.name || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ meeting.date || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ meeting.start_time || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ meeting.end_time || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>