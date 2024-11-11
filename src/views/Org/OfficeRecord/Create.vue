<!-- create.vue -->
<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const auth = authStore;
const userId = auth.user.id;

const title = ref('');
const images = ref([]);
const description = ref('');
const privacySetupId = ref(1);
const document = ref(null);

const resetForm = () => {
    title.value = '';
    images.value = [];
    document.value = null;
    description.value = '';
    privacySetupId.value = 1;
};

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
const handleDocument = (event) => {
    document.value = event.target.files[0];
};

const submitForm = async () => {
    // Create FormData object to send images and other form data
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('status', privacySetupId.value);

    // Append each image file to the FormData
    if (images.value.length) {
        images.value.forEach((img, index) => {
            formData.append(`images[${index}]`, img.file); // Handle multiple image upload
        });
    }

    // Append document file if it exists
    if (document.value) {
        formData.append('document', document.value); // Handle document upload
    }

    try {
        let apiUrl = '/api/create-office-record';
        // if (isEditMode.value && selectedRecordId.value) {
        //     apiUrl = `/api/update-office-record/${selectedRecordId.value}`;
        // }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to add this record?',
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
                Swal.fire('Success!', 'Record added successfully.', 'success').then(() => {
                    // Redirect to event list
                    router.push({ name: 'index-record' });
                    resetForm(); // Reset the form fields
                    // getRecords(); // Refresh the record list
                });
            } else {
                Swal.fire('Failed!', 'Failed to added record.', 'error');
            } 
        }
        
    } catch (error) {
        console.error('Error adding record:', error);
        Swal.fire('Error!', 'Failed to add record.', 'error');
    }
};
</script>
<template>
    <div class="container mx-auto max-w-7xl mx-auto w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Add New Record</h5>
            <button @click="$router.push({ name: 'index-record' })"
                class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                Back to Record List
            </button>
        </div>

        <form @submit.prevent="submitForm">
            <!-- Title input -->
            <div class="mb-4">
                <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full border border-gray-300 rounded-md py-2 px-4"
                    placeholder="Enter title" required />
            </div>

            <!-- Image input with preview and remove button -->
            <div class="mb-4">
                <label for="images" class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                <input @change="handleImages" type="file" id="images"
                    class="w-full border border-gray-300 rounded-md py-2 px-4" accept="image/*" multiple />
                <!-- Image preview -->
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

            <!-- Description input -->
            <div class="mb-4">
                <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea v-model="description" id="description" class="w-full border border-gray-300 rounded-md"
                    placeholder="Enter description"></textarea>
            </div>

            <!-- Document input -->
            <div class="mb-4">
                <label for="document" class="block text-gray-700 font-semibold mb-2">Upload Document (PDF)</label>
                <input @change="handleDocument" type="file" id="document"
                    class="w-full border border-gray-300 rounded-md py-2 px-4" accept=".pdf" />
            </div>

            <!-- Privacy setup -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Privacy Setup</label>
                <select v-model="privacySetupId" class="w-full border border-gray-300 rounded-md py-2 px-4">
                    <option value="1">Only Me</option>
                    <option value="2">Public</option>
                    <option value="3">Friends</option>
                </select>
            </div>

            <!-- Submit button -->
            <div class="flex justify-end gap-4">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add
                    Record</button>
                <button type="button" @click="resetForm"
                    class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Reset</button>
            </div>
        </form>
    </div>
</template>