<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

const auth = authStore;
const router = useRouter();
const isLoading = ref(true);
const allEvents = ref([]); // Flattened event list

const fetchEventsData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/past_events', {}, 'GET');
    if (response.status) {
      const orgEvents = response.data || [];

      // Flatten all events with organisation name included
      allEvents.value = orgEvents.flatMap(org =>
        (org.events || []).map(event => ({
          ...event,
          org_name: org.org_name || 'Unknown Organisation',
        }))
      );
    }
  } catch (error) {
    console.error('Failed to load events data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchEventsData();
});
</script>
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Past Events</h1>
      <button @click="$router.push({ name: 'individual-events' })"
        class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
        Event List
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <!-- Empty State -->
    <div v-else-if="!allEvents.length" class="text-gray-500 italic">
      No past events found.
    </div>

    <!-- Data -->
    <div v-else>
      <h2 class="text-lg font-semibold text-gray-800 mb-4">All Past Events</h2>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div v-for="(event, index) in allEvents" :key="event.id"
          class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div class="text-xs text-gray-500 mb-2 font-semibold">
            # {{ index + 1 }}
          </div>
          <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
            <tbody>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[100px] pr-2 font-medium">Organisation</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ event.org_name || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[100px] pr-2 font-medium">Event Name</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ event.name || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[100px] pr-2 font-medium">Event Date</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ event.date || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[100px] pr-2 font-medium">Time</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ event.time || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full bg-white shadow rounded-md">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Organisation</th>
              <th class="px-4 py-3 text-left">Event Name</th>
              <th class="px-4 py-3 text-left">Event Date</th>
              <th class="px-4 py-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, index) in allEvents" :key="event.id"
              class="border-t text-sm text-gray-800 hover:bg-gray-50">
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ event.org_name }}</td>
              <td class="px-4 py-3">{{ event.name || '—' }}</td>
              <td class="px-4 py-3">{{ event.date || '—' }}</td>
              <td class="px-4 py-3">{{ event.time || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>