<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const recordList = ref([]);

// Fetch list of meetings
const getRecords = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/meetings`, {}, 'GET');
    recordList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    recordList.value = [];
  }
};

// Navigate to create meeting page
const goToCreateMeeting = () => {
  router.push({ name: 'create-meeting' });
};

// Navigate to edit meeting page
const editRecord = (recordId) => {
  router.push({ name: 'edit-meeting', params: { id: recordId } });
};
// Navigate to view meeting page
const viewRecord = (recordId) => {
  router.push({ name: 'view-meeting', params: { id: recordId } });
};

// Delete a meeting
const deleteRecord = async (recordId) => {
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
      const response = await auth.fetchProtectedApi(`/api/meetings/${recordId}`, {}, 'DELETE');
      if (response.status) {
        recordList.value = recordList.value.filter(record => record.id !== recordId);
        Swal.fire('Deleted!', 'Meeting has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete meeting.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete meeting.', 'error');
  }
};

// Fetch records on mount
onMounted(() => {
  getRecords();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4">
    <section class="mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-100 px-4 py-3 rounded-lg mb-4">
        <h2 class="text-lg font-semibold text-gray-700">Meeting List</h2>
        <div class="flex flex-wrap gap-2 mt-2 md:mt-0">
          <button
            @click="goToCreateMeeting"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Create Meeting
          </button>
          <button
            @click="$router.push({ name: 'index-meeting-minutes' })"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Meeting Minutes List
          </button>
          <button
            @click="goToCreateMeeting"
            class="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Meeting Attendance List
          </button>
        </div>
      </div>

      <div class="overflow-x-auto bg-white shadow rounded-lg">
        <table class="min-w-full text-sm text-left text-gray-700">
          <thead class="bg-gray-200 uppercase text-xs font-semibold text-gray-600">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Short Name</th>
              <th class="px-4 py-3">Subject</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Time</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Conduct Type</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(record, index) in recordList"
              :key="index"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">{{ record.name }}</td>
              <td class="px-4 py-3">{{ record.short_name }}</td>
              <td class="px-4 py-3">{{ record.subject }}</td>
              <td class="px-4 py-3">{{ record.date }}</td>
              <td class="px-4 py-3">{{ record.time }}</td>
              <td class="px-4 py-3">
                <span
                  :class="record.status === 0 ? 'text-green-600' : 'text-red-500'"
                >
                  {{ record.status === 0 ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="px-4 py-3">{{ record.conduct_type_name }}</td>
              <td class="px-4 py-3 space-y-1">
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="$router.push({ name: 'create-meeting-minutes', params: { meetingId: record.id } })"
                    class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Minutes
                  </button>
                  <button
                    @click="$router.push({ name: 'meeting-guest-attendance', params: { id: record.id } })"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Guest
                  </button>
                  <button
                    @click="$router.push({ name: 'meeting-attendances', params: { id: record.id } })"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Attendees
                  </button>
                  <button
                    @click="editRecord(record.id)"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    @click="viewRecord(record.id)"
                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                  >
                    View
                  </button>
                  <button
                    @click="deleteRecord(record.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
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