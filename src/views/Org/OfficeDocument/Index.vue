<!-- Office document -->
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
const baseURL = 'http://localhost:8000/storage/'; // Adjust baseURL as per your setup

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

// Reset form fields
const resetForm = () => {
    title.value = '';
    images.value = [];
    document.value = null;
    description.value = ''; // Reset description text
    privacySetupId.value = 1; // Default to "Only Me"
    isEditMode.value = false;
    selectedDocumentId.value = null;
};

// Handle document file change
const handleDocument = (event) => {
    document.value = event.target.files[0]; // Store the uploaded document
};

// Handle multiple image file change and show preview
const handleImages = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    uploadedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            images.value.push({
                file,
                preview: e.target.result
            });
        };
        reader.readAsDataURL(file);
    });
};

// Remove image from the list
const removeImage = (index) => {
    images.value.splice(index, 1);
};

// Add or update a document
const submitForm = async () => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('status', privacySetupId.value);

    if (document.value) {
        formData.append('document', document.value); // Handle document upload
    }
    if (images.value.length) {
        images.value.forEach((img, index) => {
            formData.append(`images[${index}]`, img.file); // Handle multiple image upload
        });
    }

    // Add _method='PUT' only if editing
    if (isEditMode.value) {
        formData.append('_method', 'PUT');
    }

    try {
        let apiUrl = '/api/office-documents';

        if (isEditMode.value && selectedDocumentId.value) {
            apiUrl = `/api/office-documents/${selectedDocumentId.value}`;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this document?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.uploadProtectedApi(apiUrl, formData, 'POST', {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status) {
                await Swal.fire('Success!', `Document ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getDocuments(); // Refresh the document list
                resetForm(); // Reset the form fields
            } else {
                Swal.fire('Failed!', 'Failed to save document.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} document:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} document.`, 'error');
    }
};

// Edit document
const editRecord = (document) => {
    title.value = document.title;
    description.value = document.description; // Load description text
    privacySetupId.value = document.status;
    selectedDocumentId.value = document.id;
    isEditMode.value = true; // Switch to edit mode
};

// View PDF document
const viewDocument = (document) => {
    if (document.document) {
        window.open(`${baseURL}${document.document}`, '_blank'); // Open PDF in a new tab
    } else {
        Swal.fire('No Document', 'This document does not have a document attached.', 'info');
    }
};

// View Images
const viewImages = (document) => {
    if (document.images && document.images.length) {
        // Open modal to view multiple images
        Swal.fire({
            title: 'Images',
            html: document.images.map((img) => `<img src="${baseURL}${img.image}" style="width: 100%; max-width: 300px; margin: 5px;">`).join(''),
            showCloseButton: true,
            focusConfirm: false,
        });
    } else {
        Swal.fire('No Images', 'This document does not have images attached.', 'info');
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
              <th class="px-4 py-3 border-b border-gray-300">Title</th>
              <th class="px-4 py-3 border-b border-gray-300">Description</th>
              <th class="px-4 py-3 border-b border-gray-300">Privacy</th>
              <th class="px-4 py-3 border-b border-gray-300 text-center">Document</th>
              <th class="px-4 py-3 border-b border-gray-300 text-center">Images</th>
              <th class="px-4 py-3 border-b border-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="document in documentList"
              :key="document.id"
              class="hover:bg-gray-50 border-b border-gray-100"
            >
              <td class="px-4 py-3">{{ document.title }}</td>
              <td class="px-4 py-3" v-html="sanitize(document.description)"></td>
              <td class="px-4 py-3">
                <span v-if="document.status === 1">Only Me</span>
                <span v-else-if="document.status === 2">Public</span>
                <span v-else-if="document.status === 3">Selected Users</span>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  v-if="document.documents && document.documents.length"
                  @click="viewDocument(document)"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition"
                >
                  View
                </button>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  v-if="document.images && document.images.length"
                  @click="viewImages(document)"
                  class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition"
                >
                  View
                </button>
              </td>
              <td class="px-4 py-3 text-center space-x-2">
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
  