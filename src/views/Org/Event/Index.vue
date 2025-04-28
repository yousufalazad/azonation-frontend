<!-- Event Index.vue -->
<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const userId = auth.user.id;
const recordList = ref([]);

const getRecords = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/events`, {}, 'GET');
    recordList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Delete a meeting
const deleteRecord = async (eventId) => {
  try {
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmed.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/events/${eventId}`, {}, 'DELETE');
      if (response.status) {
        recordList.value = recordList.value.filter(record => record.id !== eventId);
        Swal.fire('Deleted!', 'Meeting has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete meeting.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete meeting.', 'error');
  }
};

onMounted(() => getRecords());
</script>

<template>
  <div>
    <section>
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Events</h2>
        <div class="flex flex-wrap gap-3 mt-2 md:mt-0">
          <button @click="$router.push({ name: 'create-event' })"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
            Add Event
          </button>
          <button @click="$router.push({ name: 'index-event-summary' })"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition">
            Event Summary List
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200 bg-white">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase text-left">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">Title</th>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Time</th>
              <th class="px-4 py-3">Venue</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-800 text-sm divide-y divide-gray-100">
            <tr v-for="(record, index) in recordList" :key="index" class="hover:bg-gray-50">
              <td class="px-4 py-2">{{ record.user_id }}</td>
              <td class="px-4 py-2">{{ record.title }}</td>
              <td class="px-4 py-2">{{ record.name }}</td>
              <td class="px-4 py-2">{{ record.date }}</td>
              <td class="px-4 py-2">{{ record.time }}</td>
              <td class="px-4 py-2">{{ record.venue_name }}</td>
              <td class="px-4 py-2">
                <span :class="record.status === 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                  {{ record.status === 0 ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="px-4 py-2">
                <div class="flex flex-wrap gap-2">
                  <button @click="$router.push({ name: 'create-event-summary', params: { eventId: record.id } })"
                    class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-md text-sm transition">
                    Summary
                  </button>
                  <button @click="$router.push({ name: 'event-attendances', params: { id: record.id } })"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition">
                    Attendances
                  </button>
                  <button @click="$router.push({ name: 'event-guest-attendance', params: { id: record.id } })"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition">
                    Guests
                  </button>
                  <button @click="$router.push({ name: 'edit-event', params: { id: record.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm transition">
                    Edit
                  </button>
                  <button @click="$router.push({ name: 'view-event', params: { id: record.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition">
                    View
                  </button>
                  <button @click="deleteRecord(record.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
<style scoped></style>
