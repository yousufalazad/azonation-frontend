<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;

const name = ref('');
const short_name = ref('');
const subject = ref('');
const date = ref('');
const time = ref('');
const description = ref('');
const address = ref('');
const agenda = ref('');
const requirements = ref('');
const note = ref('');
const status = ref('');
const conduct_type = ref('');
const meetingList = ref([]);

const user_id = auth.user.id;

const createMeeting = async () => {
  try {
    await auth.createMeeting(
      user_id, name.value, short_name.value, subject.value, date.value, time.value, 
      description.value, address.value, agenda.value, requirements.value, note.value, 
      status.value, conduct_type.value
    );
    Swal.fire({
      icon: 'success',
      title: 'Meeting created successfully',
      showConfirmButton: false,
      timer: 1000
    });
  } catch (error) {
    console.error('Error creating meeting', error);
  }
};

const fetchMeetingList = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/meeting-list/${user_id}`, {}, 'GET');
    meetingList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching meeting list:', error);
    meetingList.value = [];
  }
};

const onEnterKey = (event) => {
  if (event.key === 'Enter') {
    createMeeting();
  }
};

onMounted(fetchMeetingList);
</script>

<template>
  <div class="container mx-auto mt-6">
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-2xl font-bold mb-4">Create and Edit Meeting</h2>
      <div v-if="meetingList.length">
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="p-2">#</th>
              <th class="p-2">User ID</th>
              <th class="p-2">Meeting Name</th>
              <th class="p-2">Short Name</th>
              <th class="p-2">Subject</th>
              <th class="p-2">Date</th>
              <th class="p-2">Time</th>
              <th class="p-2">Description</th>
              <th class="p-2">Address</th>
              <th class="p-2">Agenda</th>
              <th class="p-2">Requirements</th>
              <th class="p-2">Note</th>
              <th class="p-2">Status</th>
              <th class="p-2">Conduct Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="meeting in meetingList" :key="meeting.id" class="hover:bg-gray-50">
              <td class="p-2">{{ meeting.id }}</td>
              <td class="p-2">{{ meeting.user_id }}</td>
              <td class="p-2">{{ meeting.name }}</td>
              <td class="p-2">{{ meeting.short_name }}</td>
              <td class="p-2">{{ meeting.subject }}</td>
              <td class="p-2">{{ meeting.date }}</td>
              <td class="p-2">{{ meeting.time }}</td>
              <td class="p-2">{{ meeting.description }}</td>
              <td class="p-2">{{ meeting.address }}</td>
              <td class="p-2">{{ meeting.agenda }}</td>
              <td class="p-2">{{ meeting.requirements }}</td>
              <td class="p-2">{{ meeting.note }}</td>
              <td class="p-2">{{ meeting.status }}</td>
              <td class="p-2">{{ meeting.conduct_type }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p class="text-gray-500">No meeting found.</p>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold text-center mb-4">Create Meeting</h2>
      
      <form @keydown.enter="onEnterKey" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Meeting Name</label>
          <input v-model="name" type="text" id="name" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter meeting name" required>
        </div>
        
        <div>
          <label for="short_name" class="block text-sm font-medium text-gray-700">Meeting Short Name</label>
          <input v-model="short_name" type="text" id="short_name" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter short name">
        </div>
        
        <div>
          <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
          <input v-model="subject" type="text" id="subject" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter subject">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
            <input v-model="date" type="date" id="date" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label for="time" class="block text-sm font-medium text-gray-700">Time</label>
            <input v-model="time" type="time" id="time" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="description" id="description" rows="4" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Write meeting description"></textarea>
        </div>

        <div>
          <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
          <input v-model="address" type="text" id="address" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter address">
        </div>

        <div>
          <label for="agenda" class="block text-sm font-medium text-gray-700">Agenda</label>
          <input v-model="agenda" type="text" id="agenda" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter agenda">
        </div>

        <div>
          <label for="requirements" class="block text-sm font-medium text-gray-700">Requirements</label>
          <input v-model="requirements" type="text" id="requirements" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter requirements">
        </div>

        <div>
          <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
          <input v-model="note" type="text" id="note" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter note">
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <input v-model="status" type="text" id="status" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter status (Postponed, Cancelled, Hold)">
        </div>

        <div>
          <label for="conduct_type" class="block text-sm font-medium text-gray-700">Meeting Conduct Type</label>
          <input v-model="conduct_type" type="text" id="conduct_type" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter conduct type">
        </div>

        <div class="text-right">
          <button @click.prevent="createMeeting" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Create Meeting
          </button>
        </div>
      </form>
    </div>
  </div>
  <div class="m-5 p-5"></div>
</template>
