<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const router = useRouter();
const route = useRoute();
const auth = authStore;
const documentId = route.params.id; // Assumes route parameter `id` is passed
const userId = auth.user.id;

const title = ref('');
// const images = ref([{ id: Date.now(), file: null, preview: null }]);
// const documents = ref([{ id: Date.now(), file: null, name: '' }]);
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);
const description = ref('');
const privacySetupId = ref(1);
const isActive = ref(1);
const isLoading = ref(false);
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
const fetchDocumentDetails = async () => {
    isLoading.value = true;
    try {
        const response = await auth.fetchProtectedApi(`/api/office-documents/${documentId}`, {}, 'GET');
        if (response.status) {
            const data = response.data;

            title.value = data.title || '';
            description.value = data.description || '';
            privacySetupId.value = data.privacy_setup_id || 1;
            isActive.value = data.is_active || 1;

            // Process images
            images.value = (data.images || []).map((image) => ({
                id: image.id,
                file: {
                    preview: image.image_url || '', // Ensure `file_path` contains the correct URL
                    name: image.file_name || '',
                },
            }));

            // Process documents
            documents.value = (data.documents || []).map(doc => ({
                id: doc.id,
                file: { preview: doc.document_url, name: doc.file_name },
            }));

            // Map and store images with previews
            // images.value = (data.images || []).map((image) => ({
            //     id: image.id,
            //     file: null,  // No need to pre-load file objects
            //     db_preview: image.image_url || '',
            // }));

            // // Map and store documents
            // documents.value = (data.documents || []).map((doc) => ({
            //     id: doc.id,
            //     file: null,  // No need to pre-load file objects
            //     name: doc.file_name || '',
            // }));
        } else {
            Swal.fire('Error!', 'Failed to fetch document details.', 'error');
        }
    } catch (error) {
        console.error('Error fetching document details:', error);
        Swal.fire('Error!', 'Failed to fetch document details.', 'error');
    } finally {
        isLoading.value = false;
    }
};

const resetForm = () => {
    title.value = '';
    images.value = [{ id: Date.now(), file: null, preview: null }];
    documents.value = [{ id: Date.now(), file: null, name: '' }];
    description.value = '';
    privacySetupId.value = 1;
    isActive.value = 1;
};

// Handle File Attachments
const handleDocument = (event) => {
    file_attachments.value = event.target.files[0];
};

const handleFileChange = (event, fileList, index) => {
    const file = event.target.files[0];
    if (file) {
        fileList[index].file = {
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        };
    }
};

const addMoreFiles = (fileList) => {
    fileList.push({ id: Date.now(), file: null });
};

const removeFile = (fileList, index) => {
    if (fileList[index].file && fileList[index].file.preview) {
        URL.revokeObjectURL(fileList[index].file.preview); // Release memory
    }
    fileList.splice(index, 1);
};

const submitForm = async () => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('privacy_setup_id', privacySetupId.value);
    formData.append('is_active', isActive.value);
    formData.append('_method', 'PUT');

    images.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`images[${index}]`, fileData.file.file);
        }
    });

    documents.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`documents[${index}]`, fileData.file.file);
        }
    });

    try {
        let apiUrl = `/api/office-documents/${documentId}`;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to update this document?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            const response = await auth.uploadProtectedApi(apiUrl, formData, 'POST', {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status) {
                Swal.fire('Success!', 'Document updated successfully.', 'success').then(() => {
                    router.push({ name: 'index-document' });
                    resetForm();
                });
            } else {
                Swal.fire('Failed!', 'Failed to update document.', 'error');
            }
        }
    } catch (error) {
        console.error('Error updating document:', error);
        Swal.fire('Error!', 'Failed to update document.', 'error');
    }
};
onMounted(() => {
  fetchDocumentDetails();
  fetchPrivacySetups();
});
</script>

<template>
    <div class="container mx-auto max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">


        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Edit Documents</h5>
            <div>
                <button @click="$router.push({ name: 'view-document', params: { id: id } })"
                    class="bg-green-500 hover:bg-green-600 text-white p-2 m-2 rounded">View Document</button>
                <button @click="router.push({ name: 'index-document' })"
                    class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700">
                    Back to Document List
                </button>
            </div>
        </div>

        <div v-if="isLoading" class="text-center">Loading...</div>
        <form v-else @submit.prevent="submitForm">
            <!-- Title Input -->
            <div class="mb-4">
                <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full border border-gray-300 rounded-md py-2 px-4"
                    placeholder="Enter title" required />
            </div>

            <!-- Images Upload -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                <div class="space-y-3">
                    <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
                        <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept="image/*"
                            @change="event => handleFileChange(event, images, index)" />

                        <div v-if="file.file && file.file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
                            <img :src="file.file.preview" alt="Preview" class="w-full h-full object-cover" />
                        </div>

                        <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                            @click="removeFile(images, index)">X</button>
                    </div>
                </div>
                <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(images)">
                    Add more image
                </button>
            </div>

            <!-- Documents Upload -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
                <div class="space-y-3">
                    <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
                        <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept=".pdf,.doc,.docx"
                            @change="event => handleFileChange(event, documents, index)" />

                        <span v-if="file.file" class="truncate w-32">{{ file.file.name }}</span>

                        <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                            @click="removeFile(documents, index)">X</button>
                    </div>
                </div>
                <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(documents)">
                    Add more document
                </button>
            </div>

            <!-- Description -->
            <div class="mb-4">
                <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea v-model="description" id="description"
                    class="w-full border border-gray-300 rounded-md py-2 px-4"
                    placeholder="Enter description"></textarea>
            </div>

            <!-- Privacy Setup -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Privacy Setup</label>
                <select v-model="privacySetupId" class="w-full border border-gray-300 rounded-md py-2 px-4">
                    <option v-for="privacy in privacySetups" :key="privacy.id" :value="privacy.id">{{ privacy.name }}</option>
                </select>
            </div>
            <!-- isActive Setup -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Is Active</label>
                <select v-model="isActive" class="w-full border border-gray-300 rounded-md py-2 px-4">
                    <option value="1">Yes</option>
                    <option value="2">No</option>
                </select>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end gap-4">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update
                    Document</button>
                <button type="button" @click="resetForm"
                    class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Reset</button>
            </div>
        </form>
    </div>
</template>
