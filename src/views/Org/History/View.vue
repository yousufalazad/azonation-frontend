<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const route = useRoute();
const id = ref(route.params.id || null);


// Reactive variable to hold the record data
const record = ref(null);
const fetchRecord = async () => {
    try {
      const response = await auth.fetchProtectedApi(`/api/get-org-history/${id.value}`, {}, 'GET');
        if (response.status) {
            record = response.data;
        } else {
            Swal.fire('Error', 'Failed to fetch record details.', 'error');
            router.push({ name: 'history' });
        }
    } catch (error) {
        console.error('Error fetching record:', error);
        Swal.fire('Error', 'An error occurred. Please try again.', 'error');
        router.push({ name: 'history' });
    }
};

// Load the record data when the component is mounted
onMounted(() => {
    fetchRecord();
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

  
        <!-- Record Display Section -->
        <div class="bg-white shadow-sm rounded-lg p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <p class="mt-1 text-gray-700">{{ record.title }}</p>
          </div>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">History</label>
            <p class="mt-1 text-gray-700">{{ record.history }}</p>
          </div>
  
          <!-- <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Image</label>
            <div v-if="record.image">
              <img :src="record.image" alt="Image" class="mt-2 max-w-full rounded-lg" />
            </div>
            <div v-else>
              <p class="text-gray-700">No image available</p>
            </div>
          </div>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Document</label>
            <div v-if="record.document">
              <a :href="record.document" target="_blank" class="text-blue-600 hover:text-blue-800">Download Document</a>
            </div>
            <div v-else>
              <p class="text-gray-700">No document available</p>
            </div>
          </div> -->
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <p class="mt-1 text-gray-700">
              <span v-if="record.status === 1" class="text-green-500">Active</span>
              <span v-else class="text-red-500">Disabled</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  </template>
  