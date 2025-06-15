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
    const response = await auth.fetchProtectedApi(`/api/projects`, {}, 'GET');
    // const response = await auth.fetchProtectedApi(`/api/projectss/${userId}`, {}, 'GET');
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
      const response = await auth.fetchProtectedApi(`/api/projects/${projectId}`, {}, 'DELETE');
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

const projectSummary = ref([]);
// Fetch list of meetings
const fetchProjectSummary = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/project-summaries`, {}, 'GET');
    console.log('projectSummary', response.data);
    projectSummary.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    projectSummary.value = [];
  }
};

onMounted(() => {
  getRecords();
  fetchProjectSummary();
});
</script>

<template>
  <div class="mx-auto py-6">
    <section>
      <div class="flex justify-between items-center mb-6">
        <h5 class="text-lg font-semibold text-gray-800">Project List</h5>
        <div class="space-x-3">
          <button @click="$router.push({ name: 'create-project' })"
            class="bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition">
            + Add New Project
          </button>
        </div>
      </div>

      <div v-if="recordList.length" class="overflow-x-auto rounded-lg bg-white shadow-md">
        <table class="project-table min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">#</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Title</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Location</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Start Date</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(project, index) in recordList" :key="project.id" class="hover:bg-gray-50 transition duration-200">
              <td class="px-6 py-3 text-sm font-medium text-gray-800">{{ index + 1 }}</td>
              <td class="px-6 py-3 text-sm font-medium text-gray-800">{{ project.title }}</td>
              <td class="px-6 py-3 text-sm text-gray-600">{{ project.venue_name }}</td>
              <td class="px-6 py-3 text-sm text-gray-600">{{ project.start_date }}</td>
              <!-- <td class="px-6 py-3 text-sm">
                <span :class="project.status === 1 ? 'text-green-500' : 'text-yellow-500'">
                  {{ project.status === 1 ? 'Active' : 'Disabled' }}
                </span>
              </td> -->
              <td class="px-6 py-3 space-x-2">

                <div class="flex flex-wrap gap-2">
                  <div v-if="projectSummary.find(s => s.org_project_id === project.id)">
                    <buttonv
                      @click="$router.push({ name: 'view-project-summary', params: { summaryId: projectSummary.find(s => s.org_project_id === project.id).id } })"
                      class="bg-sky-500 hover:bg-sky-600 text-sm font-mediumv text-white px-3 py-1 rounded">
                      Summary View
                    </buttonv>
                  </div>
                  <div v-else>
                    <button @click="$router.push({ name: 'create-project-summary', params: { projectId: project.id } })"
                      class="bg-sky-600 text-white hover:bg-sky-700 px-3 py-1 rounded">
                      Add Summary
                    </button>
                  </div>
                  <button @click="$router.push({ name: 'project-attendances', params: { id: project.id } })"
                    class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded">
                    Attendances
                  </button>
                  <button @click="$router.push({ name: 'project-guest-attendance', params: { id: project.id } })"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Guest
                    Attendances </button>
                  
                  <button @click="$router.push({ name: 'view-project', params: { id: project.id } })"
                    class="bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded">
                    View
                  </button>
                  <button @click="deleteRecord(project.id)"
                    class="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded">
                    Delete
                  </button>

                </div>

              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center text-gray-500 py-6">
        <p>No projects available. Click "Add Project" to create a new one.</p>
      </div>
    </section>
  </div>
</template>
