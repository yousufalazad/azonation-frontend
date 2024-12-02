<!-- Project Index.vue -->
<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const userId = auth.user.id;
const recordList = ref([]);

const getRecords = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-project-list/${userId}`, {}, 'GET');
    // const response = await auth.fetchProtectedApi(`/api/get-projects/${userId}`, {}, 'GET');
    recordList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Delete a meeting
const deleteRecord = async (projectId) => {
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
      const response = await auth.fetchProtectedApi(`/api/delete-project/${projectId}`, {}, 'DELETE');
      if (response.status) {
        recordList.value = recordList.value.filter(record => record.id !== projectId);
        Swal.fire('Deleted!', 'Project has been deleted.', 'success');
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
  <div class="max-w-7xl mx-auto w-10/12">
    <section>
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Project List</h5>
        <div>
          <button @click="$router.push({ name: 'create-project' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
            Add Project
          </button>
          <button @click="$router.push({ name: 'index-project-summary' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-2 rounded-md">
            Project Summary List
          </button>
        </div>
      </div>
      <!-- Table container inside the card body -->
      <div v-if="recordList.length" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="border px-1 py-3 text-left" style="width:10px">ID</th>
                <th class="border px-1 py-3 text-left" style="width:250px">Title</th>
                <th class="border px-1 py-3 text-left">Start Date</th>
                <th class="border px-1 py-3 text-left">End Date</th>
                <!-- <th class="border px-1 py-3 text-left">Start Time</th>
                <th class="border px-1 py-3 text-left">End Time</th> -->
                <th class="border px-1 py-3 text-left">Status</th>
                <th class="border px-1 py-3 text-left" style="width:300px">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="project in recordList" :key="project.id"
               class="border-b border-gray-200 hover:bg-gray-100 transition duration-200">
                <td class="border px-1 py-2" style="width:10px">{{ project.id }}</td>
                <td class="border px-1 py-2" style="width:250px">{{ project.title }}</td>
                <td class="border px-1 py-2">{{ project.start_date }}</td>
                <td class="border px-1 py-2">{{ project.end_date }}</td>
                <!-- <td class="border px-1 py-2">{{ project.start_time }}</td>
                <td class="border px-1 py-2">{{ project.end_time }}</td> -->
                <td class="border px-1 py-2"
                  :class="project.status === 1 ? 'text-green-500' : 'text-yellow-500'">
                  {{ project.status === 1 ? 'Active' : 'Disable' }}
                </td>
                <td class="px-4 py-3" style="width:350px">
                  <button @click="$router.push({ name: 'create-project-summary', params: { projectId: project.id } })"
                    class="bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 m-2 rounded">Add Project Summary
                  </button>
                  <button @click="$router.push({ name: 'project-attendances', params: { id: project.id } })"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 m-2 rounded">Attendances </button>
                  <button @click="$router.push({ name: 'edit-project', params: { id: project.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                  <button @click="$router.push({ name: 'view-project', params: { id: project.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                  <button @click="deleteRecord(project.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-4">
        <p class="text-center text-gray-500">No projects available. Click "Create Project" to add a new one.</p>
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