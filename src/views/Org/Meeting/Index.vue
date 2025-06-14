<!-- meeting index -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const meetingList = ref([]);

// Fetch list of meetings
const getMeetings = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/meetings`, {}, 'GET');
    meetingList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    meetingList.value = [];
  }
};

// Navigate to create meeting page
const goToCreateMeeting = () => {
  router.push({ name: 'create-meeting' });
};

// Navigate to edit meeting page
const editMeeting = (meetingId) => {
  router.push({ name: 'edit-meeting', params: { id: meetingId } });
};
// Navigate to view meeting page
const viewMeeting = (meetingId) => {
  router.push({ name: 'view-meeting', params: { id: meetingId } });
};

// Delete a meeting
const deleteMeeting = async (meetingId) => {
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
      const response = await auth.fetchProtectedApi(`/api/meetings/${meetingId}`, {}, 'DELETE');
      if (response.status) {
        meetingList.value = meetingList.value.filter(meeting => meeting.id !== meetingId);
        Swal.fire('Deleted!', 'Meeting has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete meeting.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete meeting.', 'error');
  }
};


const meetingMinuteList = ref([]);
// Fetch list of meetings
const getmeetingMinuteMeetings = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/meeting-minutes`, {}, 'GET');
    meetingMinuteList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    meetingMinuteList.value = [];
  }
};
// Fetch meetings on mount
onMounted(() => {
  getMeetings();
  getmeetingMinuteMeetings();
});
</script>

<template>
  <div>
    <section class="mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-100 py-3 mb-4">
        <h2 class="text-lg font-semibold text-gray-700">Meeting List</h2>
        <div class="flex flex-wrap gap-2 mt-2 md:mt-0">
          <button @click="goToCreateMeeting"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md">
            Create Meeting
          </button>
        </div>
      </div>

      <div class="overflow-x-auto bg-white">
        <table class="min-w-full text-sm text-left text-gray-700">
          <thead class="bg-gray-200 uppercase text-xs font-semibold text-gray-600">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Short Name</th>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Time</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(meeting, index) in meetingList" :key="index" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ meeting.short_name }}</td>
              <td class="px-4 py-3">{{ meeting.name }}</td>
              <td class="px-4 py-3">{{ meeting.date }}</td>
              <td class="px-4 py-3">{{ meeting.time }}</td>
              <!-- <td class="px-4 py-3">
                <span :class="meeting.status === 0 ? 'text-green-600' : 'text-red-500'">
                  {{ meeting.status === 0 ? 'Active' : 'Disabled' }}
                </span>
              </td> -->
              <td class="px-4 py-3 space-y-1">
                <div class="flex flex-wrap gap-2">

                  <div v-if="meetingMinuteList.find(s => s.meeting_id === meeting.id)">
                    <button @click="$router.push({ name: 'view-meeting-minutes', params: { id: meetingMinuteList.find(s => s.meeting_id === meeting.id).id }})"
                      class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-xs">
                      Minutes view
                    </button>
                  </div>
                  <div v-else>
                    <button
                      @click="$router.push({ name: 'create-meeting-minutes',  params: { meetingId: meeting.id } })"
                      class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-xs">
                      Minutes add
                    </button>
                  </div>
                  <button @click="$router.push({ name: 'meeting-guest-attendance', params: { id: meeting.id } })"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">
                    Guest
                  </button>
                  <button @click="$router.push({ name: 'meeting-attendances', params: { id: meeting.id } })"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                    Attendees
                  </button>
                  <button @click="editMeeting(meeting.id)"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">
                    Edit
                  </button>
                  <button @click="viewMeeting(meeting.id)"
                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">
                    View
                  </button>
                  <button @click="deleteMeeting(meeting.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
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