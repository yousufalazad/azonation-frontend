<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const auth = authStore;
const router = useRouter();
const isLoading = ref(true);
const allProjects = ref([]);

const canCreate = computed(() => auth.hasPermission('project.create'));

const canManage = (project) =>
  project.org_id === auth.currentOrgId && auth.hasPermission('project.update');

const canRemove = (project) =>
  project.org_id === auth.currentOrgId && auth.hasPermission('project.delete');

const activeOrgName = computed(() => {
  const org = auth.orgAccess.find(o => o.org_type_user_id === auth.currentOrgId);
  return org?.org_name || 'Unknown';
});

const fetchProjectsData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/projects', {}, 'GET');
    if (response.status) {
      const orgProjects = response.data || [];
      allProjects.value = orgProjects.flatMap(org =>
        (org.projects || []).map(project => ({
          ...project,
          org_id: org.org_type_user_id, // ⚠️ confirm this key matches your API response
          org_name: org.org_name || 'Unknown Organisation',
        }))
      );
    }
  } catch (error) {
    console.error('Failed to load projects data:', error);
  } finally {
    isLoading.value = false;
  }
};

const goToCreateProject = () => router.push({ name: 'create-individual-project' });
const goToEditProject = (id) => router.push({ name: 'edit-individual-project', params: { id } });
const goToViewProject = (id) => router.push({ name: 'view-individual-project', params: { id } });

const deleteRecord = async (id) => {
  const confirmed = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!confirmed.isConfirmed) return;

  try {
    const response = await auth.fetchProtectedApi(`/api/projects/${id}`, {}, 'DELETE');
    if (response.status) {
      allProjects.value = allProjects.value.filter(p => p.id !== id);
      Swal.fire('Deleted!', 'Project has been deleted.', 'success');
    } else {
      Swal.fire('Error!', 'Failed to delete project.', 'error');
    }
  } catch (e) {
    console.error(e);
    Swal.fire('Error!', 'Failed to delete project.', 'error');
  }
};

onMounted(() => {
  fetchProjectsData();
});
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Upcoming Projects</h1>
        <p v-if="canCreate" class="text-xs text-gray-500 mt-1">
          Creating for: <span class="font-medium">{{ activeOrgName }}</span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button v-if="canCreate" @click="goToCreateProject"
          class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md">
          Add Project
        </button>
        <button @click="$router.push({ name: 'past-individual-projects' })"
          class="bg-gray-500 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md">
          Past Projects List
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <div v-else-if="!allProjects.length" class="text-gray-500 italic">
      No projects found.
    </div>

    <div v-else>
      <h2 class="text-lg font-semibold text-gray-800 mb-4">All Upcoming Projects</h2>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div v-for="(project, index) in allProjects" :key="project.id"
          class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div class="text-xs text-gray-500 mb-2 font-semibold"># {{ index + 1 }}</div>
          <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
            <tbody>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[100px] pr-2 font-medium">Organisation</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ project.org_name || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[100px] pr-2 font-medium">Project Title</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ project.title || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[100px] pr-2 font-medium">Start Date</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ project.start_date || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[100px] pr-2 font-medium">End Date</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ project.end_date || '—' }}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-end gap-3 mt-3 pt-2 border-t">
            <button @click="goToViewProject(project.id)" class="text-green-600 text-xs font-medium">View</button>
            <button v-if="canManage(project)" @click="goToEditProject(project.id)" class="text-yellow-600 text-xs font-medium">Edit</button>
            <button v-if="canRemove(project)" @click="deleteRecord(project.id)" class="text-red-600 text-xs font-medium">Delete</button>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full bg-white shadow rounded-md">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Organisation</th>
              <th class="px-4 py-3 text-left">Project Title</th>
              <th class="px-4 py-3 text-left">Start Date</th>
              <th class="px-4 py-3 text-left">End Date</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(project, index) in allProjects" :key="project.id"
              class="border-t text-sm text-gray-800 hover:bg-gray-50">
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ project.org_name }}</td>
              <td class="px-4 py-3">{{ project.title || '—' }}</td>
              <td class="px-4 py-3">{{ project.start_date || '—' }}</td>
              <td class="px-4 py-3">{{ project.end_date || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <button @click="goToViewProject(project.id)" class="text-green-600 mr-3 hover:underline">View</button>
                <button v-if="canManage(project)" @click="goToEditProject(project.id)" class="text-yellow-600 mr-3 hover:underline">Edit</button>
                <button v-if="canRemove(project)" @click="deleteRecord(project.id)" class="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>