<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const route = useRoute();
const projectId = route.params.id;
const project = ref({});
const auth = authStore;

const fetchProjectDetails = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/projects/${projectId}`, {}, 'GET');
    if (response.status) {
      project.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to fetch project details.', 'error');
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

onMounted(fetchProjectDetails);
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">View Project</h2>
      <div>
        <button @click="$router.push({ name: 'edit-project', params: { id: projectId } })"
          class="bg-green-500 hover:bg-green-600 text-white p-2 m-2 rounded">Project Edit </button>

        <button @click="$router.push({ name: 'index-project' })"
          class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
          Back to Project List
        </button>
      </div>
    </div>

    <!-- Table -->
    <table class="table-auto w-full border-collapse border border-gray-300 text-sm">
      <tbody>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Project Title</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.title || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Venue Name</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.venue_name || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Venue Address</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.venue_address || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Start Date</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.start_date || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">End Date</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.end_date || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Start Time</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.start_time || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">End Time</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.end_time || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Status</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.status === 0 ? 'Active' : 'Disabled' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Conduct Type</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ project.conduct_type === 1 ? 'In Person' : 'Online' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Requirements</td>
          <td>:</td>
          <td class="py-2 px-4 border-b" v-html="project.requirements || 'N/A'"></td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Note</td>
          <td>:</td>
          <td class="py-2 px-4 border-b" v-html="project.note || 'N/A'"></td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Description</td>
          <td>:</td>
          <td class="py-2 px-4 border-b" v-html="project.description || 'N/A'"></td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Short Description</td>
          <td>:</td>
          <td class="py-2 px-4 border-b" v-html="project.short_description || 'N/A'"></td>
        </tr>
        <tr>
          <td class="px-2 py-2 text-left font-semibold w-36">Images</td>
          <td>:</td>
          <td class="px-2 py-2 text-left">
            <div v-if="project.images && project.images.length">
              <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <img v-for="(img, index) in project.images" :key="img.id || index" :src="img.image_url"
                  alt="History Image" class="max-w-full rounded-lg" />
              </div>
            </div>
            <div v-else>
              <p class="text-gray-700">No images available</p>
            </div>
          </td>
        </tr>

        <tr>
          <td class="px-2 py-2 text-left font-semibold w-36">Documents</td>
          <td>:</td>
          <td class="px-2 py-2 text-left">
            <div v-if="project.documents && project.documents.length">
              <ul class="mt-2 list-disc list-inside text-blue-600">
                <li v-for="(doc, index) in project.documents" :key="doc.id || index">
                  <a :href="doc.document_url" target="_blank" class="hover:text-blue-800">
                    {{ doc.file_name || 'Download Document' }}
                  </a>
                </li>
              </ul>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style>
td:first-child {
  width: 200px;
}

td:nth-child(2) {
  width: 10px;
}

td:nth-child(3) {
  width: auto;
}
</style>