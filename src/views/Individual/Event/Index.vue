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
    const response = await auth.fetchProtectedApi('/api/individual/events', {}, 'GET');
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
    <h1 class="text-2xl font-bold text-gray-800">Events</h1>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <div v-else-if="!allEvents.length" class="text-gray-500 italic">No upcoming events found.</div>

    <div v-else class="bg-white p-6 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">All Upcoming Events</h2>
      </div>

      <div class="overflow-x-auto">
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
            <tr
              v-for="(event, index) in allEvents"
              :key="event.id"
              class="border-t text-sm text-gray-800 hover:bg-gray-50"
            >
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
