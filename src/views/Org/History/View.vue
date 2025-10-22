<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id || null);


// Reactive variable to hold the history data
//const history = ref(null);S
const history = ref([]); // Ensure it's initialized as an empty array

const fetchHistory = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/histories/${id.value}`, {}, 'GET');
    if (response.status) {
      history.value = response.data;
    } else {
      Swal.fire('Error', 'Failed to fetch history details.', 'error');
      router.push({ name: 'history' });
    }
  } catch (error) {
    console.error('Error fetching history:', error);
    Swal.fire('Error', 'An error occurred. Please try again.', 'error');
    router.push({ name: 'history' });
  }
};

// Load the history data when the component is mounted
onMounted(() => {
  fetchHistory();
});
</script>


<template>
  <div class="max-w-4xl mx-auto w-full mt-10 bg-white p-6 rounded-lg shadow">
    <section class="mb-5">
      <div class="flex justify-between items-center mb-6">
        <h5 class="text-xl font-semibold">View History</h5>
        <button @click="router.push({ name: 'history' })"
          class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
          Back History
        </button>
      </div>


      <!-- history Display Section -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <tbody class="text-gray-600 text-md font-medium">
            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">Title</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">{{ history.title }}</td>
            </tr>

            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36 align-top">History</td>
              <td class="align-top">:</td>
              <td class="px-2 py-2 text-left whitespace-pre-line">{{ history.history }}</td>
            </tr>

            <tr class="mb-4">
              <td class="px-2 py-2 text-left font-semibold w-36 align-top">Images</td>
              <td class="align-top">:</td>
              <td class="px-2 py-2 text-left">
                <div v-if="history.images && history.images.length">
                  <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <img v-for="(img, index) in history.images" :key="img.id || index" :src="img.image_url"
                      alt="History Image" class="max-w-full rounded-lg" />
                  </div>
                </div>
                <div v-else>
                  <p class="text-gray-700">No images available</p>
                </div>
              </td>
            </tr>

            <tr class="mb-4">
              <td class="px-2 py-2 text-left font-semibold w-36 align-top">Documents</td>
              <td class="align-top">:</td>
              <td class="px-2 py-2 text-left">
                <div v-if="history.documents && history.documents.length">
                  <ul class="mt-2 list-disc list-inside text-blue-600">
                    <li v-for="(doc, index) in history.documents" :key="doc.id || index">
                      <a :href="doc.document_url" target="_blank" class="hover:text-blue-800 underline">
                        {{ doc.file_name || 'Download Document' }}
                      </a>
                    </li>
                  </ul>
                </div>
                <div v-else>
                  <p class="text-gray-700">No documents available</p>
                </div>
              </td>
            </tr>

            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">Privacy</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">{{ history.privacy_name }}</td>
            </tr>

            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">Active</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">
                <span v-if="history.is_active === 1" class="text-green-500">Yes</span>
                <span v-else class="text-red-500">No</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </section>
  </div>
</template>