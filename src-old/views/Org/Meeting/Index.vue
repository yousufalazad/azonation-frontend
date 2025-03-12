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
    const response = await auth.fetchProtectedApi(`/api/get-org-meetings`, {}, 'GET');
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
      const response = await auth.fetchProtectedApi(`/api/delete-meeting/${recordId}`, {}, 'DELETE');
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
  <div class="max-w-7xl mx-auto w-10/12">
    <section class="mb-5">
      <!-- <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Meeting List</h5>
        <button @click="goToCreateMeeting" class="bg-blue-500 text-white font-semibold py-2 px-2 rounded-md">
          Add Meeting
        </button>
      </div> -->
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Meeting List</h5>
        <div>
          <button @click="goToCreateMeeting" class="bg-blue-500 text-white font-semibold py-2 px-2 rounded-md">
          Create meeting
        </button>

        <button @click="$router.push({ name: 'index-meeting-minutes' })" class="bg-blue-500 text-white font-semibold py-2 px-2 mx-2 rounded-md">
          Meeting minutes list
        </button>

        <button @click="goToCreateMeeting" class="bg-blue-500 text-white font-semibold py-2 px-2 mx-2 rounded-md">
          Meeting attendance list
        </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <!-- <th class="border px-1 py-3 text-left">ID</th> -->
              <th class="border px-1 py-3 text-left">Name</th>
              <th class="border px-1 py-3 text-left">Short Name</th>
              <th class="border px-1 py-3 text-left">Subject</th>
              <th class="border px-1 py-3 text-left">Date</th>
              <th class="border px-1 py-3 text-left">Time</th>
              <th class="border px-1 py-3 text-left">Status</th>
              <th class="border px-1 py-3 text-left">Conduct Type</th>
              <th class="border px-1 py-3 text-left w-42">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-md ">
            <tr v-for="(record, index) in recordList" :key="index"
              class="border-b border-gray-200 hover:bg-gray-100 transition duration-200">
              <!-- <td class="border px-1 py-2">{{ record.user_id }}</td> -->
              <td class="border px-1 py-2">{{ record.name }}</td>
              <td class="border px-1 py-2">{{ record.short_name }}</td>
              <td class="border px-1 py-2">{{ record.subject }}</td>
              <td class="border px-1 py-2">{{ record.date }}</td>
              <td class="border px-1 py-2">{{ record.time }}</td>
              <td class="border px-1 py-2">{{ record.status === 0 ? 'Active' : 'Disabled' }}</td>
              <td class="border px-1 py-2">{{ record.conduct_type_name }}</td>

              <td class="border px-1 py-2">
                <button @click="$router.push({ name: 'create-meeting-minutes', params: { meetingId: record.id } })"
                  class="bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 m-2 rounded">Meeting Minutes </button>
                <button @click="$router.push({ name: 'meeting-guest-attendance', params: { id: record.id } })"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 m-2 rounded">Guest Attendances </button>
                <button @click="$router.push({ name: 'meeting-attendances', params: { id: record.id } })"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 m-2 rounded">Attendances </button>
                <button @click="editRecord(record.id)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                <button @click="viewRecord(record.id)"
                  class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                <button @click="deleteRecord(record.id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  padding: 5px;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

td {
  border-bottom: 1px solid #ddd;
}

button {
  margin-right: 5px;
}
</style>