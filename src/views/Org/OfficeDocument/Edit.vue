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
const images = ref([{ id: Date.now(), file: null, preview: null }]);
const documents = ref([{ id: Date.now(), file: null, name: '' }]);
const description = ref('');
const privacySetupId = ref(1);
const isLoading = ref(false);

const fetchDocumentDetails = async () => {
    isLoading.value = true;
    try {
        const response = await auth.fetchProtectedApi(`/api/office-documents/${documentId}`, {}, 'GET');
        if (response.status) {
            const data = response.data;

            title.value = data.title || '';
            description.value = data.description || '';
            privacySetupId.value = data.privacy_setup_id || 1;

            // Map and store images with previews
            images.value = (data.images || []).map((image) => ({
                id: image.id,
                file: null,  // No need to pre-load file objects
                db_preview: image.image_url || '',
            }));

            // Map and store documents
            documents.value = (data.documents || []).map((doc) => ({
                id: doc.id,
                file: null,  // No need to pre-load file objects
                name: doc.file_name || '',
            }));
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
};

const handleFileChange = (event, fileList, index, isImage = true) => {
    const file = event.target.files[0];
    if (file) {
        fileList[index].file = file;
        if (isImage) {
            fileList[index].preview = URL.createObjectURL(file);
        } else {
            fileList[index].name = file.name;
        }
    }
};

const addMoreFiles = (fileList, isImage = true) => {
    if (isImage) {
        fileList.push({ id: Date.now(), file: null, preview: null });
    } else {
        fileList.push({ id: Date.now(), file: null, name: '' });
    }
};

const removeFile = async (fileList, index, isImage = true) => {
    const fileToDelete = fileList[index];
    if (isImage) {
        // Delete image from server API
        try {
            const response = await auth.fetchProtectedApi(`/api/delete-image/${fileToDelete.id}`, {}, 'DELETE');
            if (response.status) {
                Swal.fire('Deleted!', 'Image has been deleted successfully.', 'success');
                fileList.splice(index, 1); // Remove image from list
            } else {
                Swal.fire('Error!', 'Failed to delete image.', 'error');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            Swal.fire('Error!', 'Failed to delete image.', 'error');
        }
    } else {
        // Delete document from server API
        try {
            const response = await auth.fetchProtectedApi(`/api/delete-document/${fileToDelete.id}`, {}, 'DELETE');
            if (response.status) {
                Swal.fire('Deleted!', 'Document has been deleted successfully.', 'success');
                fileList.splice(index, 1); // Remove document from list
            } else {
                Swal.fire('Error!', 'Failed to delete document.', 'error');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            Swal.fire('Error!', 'Failed to delete document.', 'error');
        }
    }
};

const submitForm = async () => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('privacy_setup_id', privacySetupId.value);
    formData.append('_method', 'PUT');

    images.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`images[${index}]`, fileData.file);
        }
    });

    documents.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`documents[${index}]`, fileData.file);
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

onMounted(fetchDocumentDetails);
</script>


<template>
    <div class="container mx-auto max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">
        <div v-if="isLoading" class="text-center">Loading...</div>
        <form v-else @submit.prevent="submitForm">
            <!-- Title Input -->
            <div class="mb-4">
                <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter title" required />
            </div>

            <!-- Images Upload -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                <div class="space-y-3">
                    <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
                        <input
                            type="file"
                            class="border border-gray-300 rounded-md py-2 px-4"
                            accept="image/*"
                            @change="event => handleFileChange(event, images, index, true)"
                        />

                        <div v-if="file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
                            <img :src="file.preview" alt="Preview" class="w-full h-full object-cover" />
                        </div>

                        <button
                            type="button"
                            class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                            @click="removeFile(images, index, true)"
                        >Delete</button>
                    </div>
                </div>
                <button
                    type="button"
                    class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(images, true)"
                >
                    Add more image
                </button>
            </div>

            <!-- Documents Upload -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
                <div class="space-y-3">
                    <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
                        <input
                            type="file"
                            class="border border-gray-300 rounded-md py-2 px-4"
                            accept=".pdf,.doc,.docx"
                            @change="event => handleFileChange(event, documents, index, false)"
                        />
                        <span v-if="file.name" class="truncate w-32">{{ file.name }}</span>
                        <button
                            type="button"
                            class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                            @click="removeFile(documents, index, false)"
                        >Delete</button>
                    </div>
                </div>
                <button
                    type="button"
                    class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(documents, false)"
                >
                    Add more document
                </button>
            </div>

            <!-- Description -->
            <div class="mb-4">
                <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea v-model="description" id="description" class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter description"></textarea>
            </div>

            <!-- Privacy Setup -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Privacy Setup</label>
                <select v-model="privacySetupId" class="w-full border border-gray-300 rounded-md py-2 px-4">
                    <option value="1">Only Me</option>
                    <option value="2">Public</option>
                    <option value="3">Friends</option>
                </select>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end gap-4">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Document</button>
                <button type="button" @click="resetForm" class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Reset</button>
            </div>
        </form>
    </div>
</template>
