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
  <div class="max-w-7xl mx-auto w-10/12">
    <section class="mb-5">
      <div class="flex justify-between items-center mb-6">
        <h5 class="text-xl font-semibold">View History</h5>
        <button @click="router.push({ name: 'history' })"
          class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
          Back History
        </button>
      </div>


      <!-- history Display Section -->
      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Title</label>
          <p class="mt-1 text-gray-700">{{ history.title }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">History</label>
          <p class="mt-1 text-gray-700">{{ history.history }}</p>
        </div>

        <!-- {{ history.images }} -->

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Images</label>
          <div v-if="history.images && history.images.length">
            <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              <img v-for="(img, index) in history.images" :key="img.id || index" :src="img.image_url"
                alt="History Image" class="max-w-full rounded-lg" />
            </div>
          </div>
          <div v-else>
            <p class="text-gray-700">No images available</p>
          </div>
        </div>


                <!-- {{ history }} -->


        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Documents</label>
          <div v-if="history.documents && history.documents.length">
            <ul class="mt-2 list-disc list-inside text-blue-600">
              <li v-for="(doc, index) in history.documents" :key="doc.id || index">
                <a :href="doc.document_url" target="_blank" class="hover:text-blue-800">
                  {{ doc.file_name || 'Download Document' }}
                </a>
              </li>
            </ul>
          </div>
          <div v-else>
            <p class="text-gray-700">No documents available</p>
          </div>
        </div>


        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Active</label>
          <p class="mt-1 text-gray-700">
            <span v-if="history.is_active === 1" class="text-green-500">Yes</span>
            <span v-else class="text-red-500">No</span>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>