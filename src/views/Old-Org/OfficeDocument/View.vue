<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const route = useRoute();
const documentId = route.params.id;
const document = ref({});
const auth = authStore;

const fetchDocumentDetails = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/office-documents/${documentId}`, {}, 'GET');
    if (response.status) {
      document.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to fetch document details.', 'error');
    }
  } catch (error) {
    console.error('Error fetching document details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

onMounted(fetchDocumentDetails);
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">View Document</h2>
      <div>
        <button @click="$router.push({ name: 'edit-document', params: { id: documentId } })"
          class="bg-green-500 hover:bg-green-600 text-white p-2 m-2 rounded">Edit Document</button>

        <button @click="$router.push({ name: 'index-document' })"
          class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
          Back to Document List
        </button>
      </div>
    </div>

    <!-- Table -->
    <table class="table-auto w-full border-collapse border border-gray-300 text-sm">
      <tbody>
        <tr>
          <td class="py-2 px-4 border-b font-medium"> Title</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ document.title || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Description</td>
          <td>:</td>
          <td class="py-2 px-4 border-b" v-html="document.description || 'N/A'"></td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Is Active</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">{{ document.is_active === 0 ? 'No' : 'Yes' }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Images</td>
          <td class="py-2 px-2 border-b">:</td>
          <td class="py-2 px-4 border-b">
            <div v-if="document.images && document.images.length" class="flex flex-wrap gap-2">
              <img v-for="(img, index) in document.images" :key="img.id || index" :src="img.image_url"
                alt="History Image" class="h-36 rounded-lg border" />
            </div>
            <div v-else>
              <p class="text-gray-700">No images available</p>
            </div>
          </td>
        </tr>

        <tr>
          <td class="py-2 px-4 border-b font-medium">Documents</td>
          <td>:</td>
          <td class="py-2 px-4 border-b">
            <div v-if="document.documents && document.documents.length">
              <ul class="mt-2 list-disc list-inside text-blue-600">
                <li v-for="(doc, index) in document.documents" :key="doc.id || index">
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
<!-- <style>
td:first-child {
  width: 200px;
}

td:nth-child(2) {
  width: 10px;
}

td:nth-child(3) {
  width: auto;
}
</style> -->