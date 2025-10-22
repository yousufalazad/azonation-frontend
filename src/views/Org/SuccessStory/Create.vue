<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const auth = authStore;
const title = ref('');
const story = ref('');
const privacy_setup_id = ref(1);
// const image = ref(null);
// File Management
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);
const status = ref(1);

// Handle File Change
const handleFileChange = (event, fileList, index) => {
    const file = event.target.files[0];
    if (file) {
        fileList[index].file = {
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
        };
    }
};

// Add More Files
const addMoreFiles = (fileList) => {
    fileList.push({ id: Date.now(), file: null });
};

// Remove File
const removeFile = (fileList, index) => {
    if (fileList[index].file && fileList[index].file.preview) {
        URL.revokeObjectURL(fileList[index].file.preview); // Release memory
    }
    fileList.splice(index, 1);
};

const submitForm = async () => {
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('story', story.value);
    formData.append('privacy_setup_id', privacy_setup_id.value);
    formData.append('status', status.value);
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

    // if (image.value) formData.append('image', image.value);

    try {
        // Make API request
        const response = await auth.uploadProtectedApi('/api/success-stories', formData, 'POST', {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Handle response
        if (response.status) {
            await Swal.fire('Success', 'Record added successfully.', 'success');
            router.push({ name: 'success-story' });
        } else {
            Swal.fire('Failed', 'Failed to add record.', 'error');
        }
    } catch (error) {
        console.error('Error adding record:', error);
        Swal.fire('Error', 'An error occurred. Please try again.', 'error');
    }

};

const privacySetupList = ref([]);
const getPrivacySetups = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/privacy-setups', {}, 'GET');
        privacySetupList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching privacy setups:', error);
        privacySetupList.value = [];
    }
};
onMounted(() => {
    getPrivacySetups();
});
</script>

<template>
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Create Success Story</h5>
            <button @click="router.push({ name: 'success-story' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
                Back Success Story
            </button>
        </div>
        <form @submit.prevent="submitForm">
            <div class="mb-4">
                <label for="title" class="block font-medium mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full border rounded-md p-2" required />
            </div>

            <div class="mb-4">
                <label for="story" class="block font-medium mb-2">Story</label>
                <textarea v-model="story" class="w-full border rounded-md p-2" rows="4"></textarea>
            </div>
            <!-- Privacy Field -->
            <div class="mb-5">
                <label for="privacy_setup_id" class="block text-sm font-medium mb-2">Privacy</label>
                <select v-model="privacy_setup_id" id="privacy_setup_id" class="w-full border px-4 py-2 rounded-md">
                    <option value="" disabled>Select Privacy Setup</option>
                    <option v-for="privacy in privacySetupList" :key="privacy.id" :value="privacy.id">
                        {{ privacy.name }}
                    </option>
                </select>
            </div>

            <div class="mb-4">
                <label for="status" class="block font-medium mb-2">Status</label>
                <select v-model="status" id="status" class="w-full border rounded-md p-2">
                    <option value="1">Active</option>
                    <option value="0">Disabled</option>
                </select>
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

            <!-- Submit Button -->
            <div class="flex justify-end mt-6">
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
                    Submit
                </button>
            </div>
        </form>
    </div>
</template>
