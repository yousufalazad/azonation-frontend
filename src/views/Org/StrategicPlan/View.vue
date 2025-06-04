<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const record = ref(null);

const fetchRecord = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/strategic-plans/${id}`, {}, 'GET');
    if (response.status) {
      record.value = response.data;
    } else {
      record.value = null;
    }
  } catch (error) {
    console.error('Error fetching record:', error);
    record.value = null;
  }
};

onMounted(() => {
  fetchRecord();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Strategic Plan Details</h5>
      <button @click="router.push({ name: 'strategic-plan' })"
        class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
        Back to Strategic Plan List
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <tbody class="text-gray-600 text-md font-medium">
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Title</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ record?.title }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36 align-top">Plan</td>
            <td class="align-top">:</td>
            <td class="px-2 py-2 text-left">
              <!-- Updated rendering of plan -->
              <div v-html="record?.plan" class="prose max-w-none bg-gray-50 p-4 rounded-md border"></div>
            </td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Start Date</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ record?.start_date }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">End Date</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ record?.end_date }}</td>
          </tr>

          <tr class="mb-4">
            <td class="px-2 py-2 text-left font-semibold w-36 align-top">Images</td>
            <td class="align-top">:</td>
            <td v-if="record?.images && record?.images.length">
              <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <img v-for="(img, index) in record?.images" :key="img.id || index" :src="img.image_url"
                  alt="Plan Image" class="max-w-full rounded-lg" />
              </div>
            </td>
          </tr>

          <tr class="mb-4">
            <td class="px-2 py-2 text-left font-semibold w-36 align-top">Documents</td>
            <td class="align-top">:</td>
            <td v-if="record?.documents && record?.documents.length">
              <ul class="mt-2 list-disc list-inside text-blue-600">
                <li v-for="(doc, index) in record?.documents" :key="doc.id || index">
                  <a :href="doc.document_url" target="_blank" class="hover:text-blue-800 underline">
                    {{ doc.file_name || 'Download Document' }}
                  </a>
                </li>
              </ul>
            </td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Status</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ record?.status === 1 ? 'Active' : 'Disabled' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!record" class="text-center py-6">
      <p class="text-red-500">Failed to load the record.</p>
    </div>
  </div>
</template>