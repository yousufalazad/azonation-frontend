<!-- Office document Index-->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id; // Assuming the user ID is stored in the logged-in user
const title = ref('');
const images = ref([]); // Multiple images for upload
const document = ref(null); // Document file for upload
const description = ref(''); // Plain textarea for description
const privacySetupId = ref(1); // Default to "Only Me"
const isEditMode = ref(false); // Toggle between add and edit modes
const selectedDocumentId = ref(null); // Store the ID of the document to edit
const documentList = ref([]); // Data list for the table

const privacySetups = ref([]);
const fetchPrivacySetups = async () => {
  try {    
    const response = await auth.fetchProtectedApi(`/api/privacy-setups`, {}, 'GET');
    if (response.status) {
      privacySetups.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to fetch privacySetups.', 'error');
    }
  } catch (error) {
    console.error('Error fetching privacySetups:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

// Fetch list of records
const getDocuments = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/office-documents', {}, 'GET');
        if (response.status) {
            documentList.value = response.data;
        } else {
            documentList.value = [];
        }
    } catch (error) {
        console.error('Error fetching records:', error);
        documentList.value = [];
    }
};

// Delete document
const deleteRecord = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this document?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/office-documents/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'document has been deleted.', 'success');
                getDocuments(); // Refresh the document list
            } else {
                Swal.fire('Failed!', 'Failed to delete document.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        Swal.fire('Error!', 'Failed to delete document.', 'error');
    }
};

// Sanitize the HTML content
const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'br', 'img'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    });
};

// Fetch records when component is mounted
onMounted(() => {
    getDocuments();
    fetchPrivacySetups();
});
</script>

<template>
    <section>
      <div class="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-md mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Document List</h2>
        <button
          @click="$router.push({ name: 'create-document' })"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
        >
          Add Document
        </button>
      </div>
  
      <div class="overflow-x-auto bg-white shadow-sm rounded-md">
        <table class="min-w-full text-sm text-gray-700 border border-gray-200">
          <thead class="bg-gray-200 text-left text-xs font-semibold">
            <tr>
              <th class="pl-4 py-3 border-b border-gray-300">#</th>
              <th class="px-4 py-3 border-b border-gray-300">Title</th>
              <th class="px-4 py-3 border-b border-gray-300">Description</th>
              <th class="px-4 py-3 border-b border-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(document, index) in documentList"
              :key="document.id"
              class="hover:bg-gray-50 border-b border-gray-100"
            >
              <td class="pl-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ document.title }}</td>
              <td class="px-4 py-3" v-html="sanitize(document.description)"></td>
              <!-- <td class="px-4 py-3">{{ privacySetups.find(p => p.id === document.privacy_setup_id)?.name || 'Unknown' }}</td> -->
              
              <td class="px-4 py-3 text-left space-x-2">
                <button @click="$router.push({ name: 'view-document', params: { id: document.id } })"
                  class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">View</button>
                <button
                  @click="$router.push({ name: 'edit-document', params: { id: document.id } })"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md transition"
                >
                  Edit
                </button>
                <button
                  @click="deleteRecord(document.id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </template>
  