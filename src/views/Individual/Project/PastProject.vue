<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

const auth = authStore;
const router = useRouter();
const isLoading = ref(true);
const allProjects = ref([]); // Flattened list with org info

const fetchProjectsData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/past_projects', {}, 'GET');
    if (response.status) {
      const orgProjects = response.data || [];

      // Flatten projects and include organisation name in each
      allProjects.value = orgProjects.flatMap(org =>
        (org.projects || []).map(project => ({
          ...project,
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

onMounted(() => {
  fetchProjectsData();
});
</script>
<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Past Projects</h1>
      <div>
        <button @click="$router.push({ name: 'individual-projects' })"
          class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
          Projects List
        </button>
      </div>
    </div>
    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <div v-else-if="!allProjects.length" class="text-gray-500 italic">No projects found.</div>

    <div v-else class="bg-white p-6 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">All Past Projects</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow rounded-md">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Organisation</th>
              <th class="px-4 py-3 text-left">Project Title</th>
              <th class="px-4 py-3 text-left">Start Date</th>
              <th class="px-4 py-3 text-left">End Date</th>
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
