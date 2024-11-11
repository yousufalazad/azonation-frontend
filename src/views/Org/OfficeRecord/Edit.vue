<!-- edit.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const auth = authStore;
const userId = auth.user.id;

const title = ref('');
const images = ref([]);  // Store images as objects with 'file' and 'preview' properties
const description = ref('');
const privacySetupId = ref(1);
const document = ref(null);  // Holds the uploaded document file
const recordId = route.params.id;  // Record ID from route parameters

// Load existing record data
const getRecordDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/get-office-record/${recordId}`, {}, 'GET');
        if (response.status) {
            const record = response.data;

            title.value = record.title;
            description.value = record.description;
            privacySetupId.value = record.status;
            
            // Handle existing document
            document.value = record.document ? { file: null, preview: record.document } : null;

            // Handle existing images (if any)
            // images.value = record.images ? record.images.map(img => ({
            //     file: null,  // Placeholder for new image files
            //     preview: img.url  // URL for existing image preview
            // })) : [];
        }
    } catch (error) {
        console.error('Error fetching record details:', error);
        Swal.fire('Error!', 'Failed to fetch record details.', 'error');
    }
};

const resetForm = () => {
    title.value = '';
    images.value = [];
    document.value = null;
    description.value = '';
    privacySetupId.value = 1;
};

// Handle new image uploads
const handleImages = (event) => {
    images.value = Array.from(event.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
    }));
};

// Remove image from the list
const removeImage = (index) => {
    images.value.splice(index, 1);
};

// Handle document upload
const handleDocument = (event) => {
    document.value = { file: event.target.files[0], preview: URL.createObjectURL(event.target.files[0]) };
};

// Submit form data
const submitForm = async () => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('status', privacySetupId.value);
    formData.append('_method', 'PUT');

    // Append images only if there are new files to upload
    images.value.forEach((img, index) => {
        if (img.file) {  // Only add if it's a new file
            formData.append(`images[${index}]`, img.file);
        }
    });

    // Append document if it is a new file
    if (document.value && document.value.file) {
        formData.append('document', document.value.file);
    }

    try {
        let apiUrl = `/api/update-office-record/${recordId}`;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to update this record?',
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
                Swal.fire('Success!', 'Record updated successfully.', 'success').then(() => {
                    router.push({ name: 'index-record' });
                    resetForm();
                });
            } else {
                Swal.fire('Failed!', 'Failed to update record.', 'error');
            }
        }
    } catch (error) {
        console.error('Error updating record:', error);
        Swal.fire('Error!', 'Failed to update record.', 'error');
    }
};

onMounted(getRecordDetails);
</script>

<template>
    <div class="container mx-auto max-w-7xl mx-auto w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
        <!-- Header Section -->
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Edit Record</h5>
            <button @click="$router.push({ name: 'index-record' })"
                class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                Back to Record List
            </button>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="submitForm">
            <!-- Title Input -->
            <div class="mb-4">
                <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full border border-gray-300 rounded-md py-2 px-4"
                    placeholder="Enter title" required />
            </div>

            <!-- Image Input with Preview and Remove Button -->
            <div class="mb-4">
                <label for="images" class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                <input @change="handleImages" type="file" id="images"
                    class="w-full border border-gray-300 rounded-md py-2 px-4" accept="image/*" multiple />

                <!-- Image Preview -->
                <div class="mt-3 flex flex-wrap">
                    <div v-for="(img, index) in images" :key="index" class="relative group w-32 h-32 mr-2 mb-2">
                        <img :src="img.preview" class="w-full h-full object-cover rounded-md">
                        <button @click="removeImage(index)"
                            class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            &times;
                        </button>
                    </div>
                </div>
            </div>

            <!-- Description Input -->
            <div class="mb-4">
                <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea v-model="description" id="description" class="w-full border border-gray-300 rounded-md"
                    placeholder="Enter description"></textarea>
            </div>

            <!-- Document Input -->
            <div class="mb-4">
                <label for="document" class="block text-gray-700 font-semibold mb-2">Upload Document (PDF)</label>
                <input @change="handleDocument" type="file" id="document"
                    class="w-full border border-gray-300 rounded-md py-2 px-4" accept=".pdf" />
                <!-- Display document file name if selected -->
                <p v-if="document" class="mt-2 text-gray-600">{{ document.name }}</p>
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

            <!-- Submit and Reset Buttons -->
            <div class="flex justify-end gap-4">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Record</button>
                <button type="button" @click="resetForm"
                    class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Reset</button>
            </div>
        </form>
    </div>
</template>