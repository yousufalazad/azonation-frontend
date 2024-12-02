<!-- Index.vue, ProjectSummary -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const router = useRouter();

const recordList = ref([]);
// Fetch list of meetings
const getRecords = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-project-summary`, {}, 'GET');
    console.log('recordList', response.data);
    recordList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    recordList.value = [];
  }
};

// Delete a meeting
const deleteRecord = async (recordId) => {

  console.log('recordId', recordId);
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
      const response = await auth.fetchProtectedApi(`/api/delete-project-summary/${recordId}`, {}, 'DELETE');
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
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Project Summary List</h5>
        <div>
          <button @click="$router.push({ name: 'index-project' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 rounded-md">Back Project List
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <!-- <th class="border px-1 py-3 text-left">ID</th> -->
              <th class="border px-1 py-3 text-left">Project Id</th>
              <th class="border px-1 py-3 text-left">Total Member Attendance</th>
              <th class="border px-1 py-3 text-left">Total Guest Attendance</th>
              <th class="border px-1 py-3 text-left">Active</th>
              <th class="border px-1 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody class="text-gray-600 text-md ">
            <tr v-for="(record, index) in recordList" :key="index"
              class="border-b border-gray-200 hover:bg-gray-100 transition duration-200">
              <!-- <td class="border px-1 py-2">{{ record.user_id }}</td> -->
              <td class="border px-1 py-2">{{ record.org_project_id }}</td>
              <td class="border px-1 py-2">{{ record.total_member_attendance }}</td>
              <td class="border px-1 py-2">{{ record.total_guest_attendance }}</td>
              <td class="border px-1 py-2">{{ record.is_active === 0 ? 'No' : 'Yes' }}</td>

              <td class="border px-1 py-2 w-50">
                <button @click="$router.push({ name: 'edit-project-summary', params: { summaryId: record.id } })"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit </button>

                <button @click="$router.push({ name: 'view-project-summary', params: { summaryId: record.id } })"
                  class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View </button>

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