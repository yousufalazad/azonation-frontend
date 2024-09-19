<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const userId = auth.user.id; // Assuming the org ID is stored in the logged-in user
const eventList = ref([]);

const title = ref('');
const name = ref('');
const short_description = ref('');
const description = ref('');
// const from_date = ref('');
// const end_date = ref('');
const date = ref('');
// const start_time = ref('');
// const end_time = ref('');
const time = ref('');
const venue_name = ref('');
const venue_address = ref('');
const requirements = ref('');
const note = ref('');
const status = ref('');
const conduct_type = ref('');


const createEvent= async () => {
  try {
    await auth.createEvent(userId, title.value, name.value, short_description.value, description.value, 
    date.value, time.value, venue_name.value, venue_address.value, requirements.value, note.value, status.value, conduct_type.value);
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Event created successfully',
      showConfirmButton: false,
      timer: 1000
    });
  } catch (error) {
    // Handle error if needed
    console.error("Error creating event", error);
  }
};

const fetchEventList = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-event-list/${userId}`, {}, 'GET');
    if (response.status) {
        eventList.value = response.data;
    } else {
        eventList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    eventList.value = [];
  }
};

onMounted(fetchEventList);
</script>

<template>
  <div class="space-y-6">
    <!-- Event List Section -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-6">Create and Edit Event</h2>
      
      <div v-if="eventList.length">
        <table class="w-full text-left table-auto">
          <thead class="border-b">
            <tr>
              <th class="py-3 px-4">Sl</th>
              <th class="py-3 px-4">Title</th>
              <th class="py-3 px-4">Name</th>
              <th class="py-3 px-4">Short Description</th>
              <th class="py-3 px-4">Description</th>
              <th class="py-3 px-4">Date</th>
              <th class="py-3 px-4">Time</th>
              <th class="py-3 px-4">Venue Name</th>
              <th class="py-3 px-4">Venue Address</th>
              <th class="py-3 px-4">Requirements</th>
              <th class="py-3 px-4">Note</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Conduct Type</th>
              <th class="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in eventList" :key="event.id" class="border-b">
              <td class="py-3 px-4">{{ event.id }}</td>
              <td class="py-3 px-4">{{ event.title }}</td>
              <td class="py-3 px-4">{{ event.name }}</td>
              <td class="py-3 px-4">{{ event.short_description }}</td>
              <td class="py-3 px-4">{{ event.description }}</td>
              <td class="py-3 px-4">{{ event.date }}</td>
              <td class="py-3 px-4">{{ event.time }}</td>
              <td class="py-3 px-4">{{ event.venue_name }}</td>
              <td class="py-3 px-4">{{ event.venue_address }}</td>
              <td class="py-3 px-4">{{ event.requirements }}</td>
              <td class="py-3 px-4">{{ event.note }}</td>
              <td class="py-3 px-4">{{ event.status }}</td>
              <td class="py-3 px-4">{{ event.conduct_type }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p class="text-gray-500">No event found</p>
      </div>
    </div>

    <!-- Event Creation Section -->
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-center text-lg font-bold mb-6">Create Event</h1>

      <form @submit="createEvent" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium">Event Title</label>
          <input v-model="title" id="title" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Event title" required>
          <p v-if="auth.errors?.title" class="text-red-500 text-sm mt-2">{{ auth.errors?.title[0] }}</p>
        </div>

        <div>
          <label for="name" class="block text-sm font-medium">Event Name</label>
          <input v-model="name" id="name" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Event name">
          <p v-if="auth.errors?.name" class="text-red-500 text-sm mt-2">{{ auth.errors?.name[0] }}</p>
        </div>

        <div>
          <label for="short_description" class="block text-sm font-medium">Short Description</label>
          <input v-model="short_description" id="short_description" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Short description">
          <p v-if="auth.errors?.short_description" class="text-red-500 text-sm mt-2">{{ auth.errors?.short_description[0] }}</p>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium">Description</label>
          <input v-model="description" id="description" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Description">
          <p v-if="auth.errors?.description" class="text-red-500 text-sm mt-2">{{ auth.errors?.description[0] }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="date" class="block text-sm font-medium">Date</label>
            <input v-model="date" id="date" type="date" class="w-full mt-1 border border-gray-300 rounded-md p-2">
            <p v-if="auth.errors?.date" class="text-red-500 text-sm mt-2">{{ auth.errors?.date[0] }}</p>
          </div>

          <div>
            <label for="time" class="block text-sm font-medium">Time</label>
            <input v-model="time" id="time" type="time" class="w-full mt-1 border border-gray-300 rounded-md p-2">
            <p v-if="auth.errors?.time" class="text-red-500 text-sm mt-2">{{ auth.errors?.time[0] }}</p>
          </div>
        </div>

        <div>
          <label for="venue_name" class="block text-sm font-medium">Venue Name</label>
          <input v-model="venue_name" id="venue_name" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Venue name">
          <p v-if="auth.errors?.venue_name" class="text-red-500 text-sm mt-2">{{ auth.errors?.venue_name[0] }}</p>
        </div>

        <div>
          <label for="venue_address" class="block text-sm font-medium">Venue Address</label>
          <input v-model="venue_address" id="venue_address" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Venue address">
          <p v-if="auth.errors?.venue_address" class="text-red-500 text-sm mt-2">{{ auth.errors?.venue_address[0] }}</p>
        </div>

        <div>
          <label for="requirements" class="block text-sm font-medium">Requirements</label>
          <input v-model="requirements" id="requirements" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Requirements">
          <p v-if="auth.errors?.requirements" class="text-red-500 text-sm mt-2">{{ auth.errors?.requirements[0] }}</p>
        </div>

        <div>
          <label for="note" class="block text-sm font-medium">Note</label>
          <input v-model="note" id="note" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Note">
          <p v-if="auth.errors?.note" class="text-red-500 text-sm mt-2">{{ auth.errors?.note[0] }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="status" class="block text-sm font-medium">Status</label>
            <input v-model="status" id="status" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Status (Postponed/Cancelled/Hold)">
            <p v-if="auth.errors?.status" class="text-red-500 text-sm mt-2">{{ auth.errors?.status[0] }}</p>
          </div>

          <div>
            <label for="conduct_type" class="block text-sm font-medium">Conduct Type</label>
            <input v-model="conduct_type" id="conduct_type" type="text" class="w-full mt-1 border border-gray-300 rounded-md p-2" placeholder="Conduct type">
            <p v-if="auth.errors?.conduct_type" class="text-red-500 text-sm mt-2">{{ auth.errors?.conduct_type[0] }}</p>
          </div>
        </div>

        <div class="text-right">
          <button type="submit" class="bg-blue-600 text-white py-2 mb-6 px-4 rounded-md shadow hover:bg-blue-700">Create Event</button>
        </div>
      </form>
    </div>
  </div>
</template>


<style>

</style>