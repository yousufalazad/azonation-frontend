<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter, useRoute } from 'vue-router';
import { authStore } from '../../../store/authStore';


const auth = authStore;
const router = useRouter();
const route = useRoute();
const id = route.params.id;
// const id = ref(route.params.id || null);

// Form fields
const title = ref('');
const privacy_setup_id = ref(1); // Default to 1 if not se
const story = ref('');
const status = ref(1);
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

// Fetch the existing record details
const fetchRecord = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/success-stories/${id}`, {}, 'GET');
        if (response.status) {
            const data = response.data;
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

            title.value = data.title || '';
            privacy_setup_id.value = data.privacy_setup_id || 1; // Default to 1 if not set
            story.value = data.story || '';
            status.value = data.status || 1;
        } else {
            Swal.fire('Error', 'Failed to fetch record details.', 'error');
        }
    } catch (error) {
        console.error('Error fetching record:', error);
        Swal.fire('Error', 'An error occurred while fetching the record.', 'error');
    }
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

// Submit the updated form
const submitForm = async () => {
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('privacy_setup_id', privacy_setup_id.value);
    formData.append('story', story.value);
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

    // try {
    //     // API call using FormData
    //     const response = await auth.uploadProtectedApi(`/api/success-stories/${id}`, formData, 'POST', {
    //         headers: { 'Content-Type': 'multipart/form-data' },
    //     });

    //     // Handle response
    //     if (response?.status) {
    //         Swal.fire('Success', 'Success story updated successfully.', 'success');
    //         router.push({ name: 'success-story' });
    //     } else {
    //         Swal.fire('Error', 'Failed to update record.', 'error');
    //     }
    // } catch (error) {
    //     Swal.fire('Error', 'An error occurred while updating the record.', 'error');
    // }

    try {
    const response = await auth.uploadProtectedApi(`/api/success-stories/${id}`, formData, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status) {
      Swal.fire('Success!', 'Success History updated successfully.', 'success');
      router.push({ name: 'success-story' });
    } else {
      Swal.fire('Failed!', 'Could not update Success History.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to update Success History', 'error');
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

// On component mount
onMounted(() => {
    getPrivacySetups();
    fetchRecord();
});
</script>

<template>
    <div class="max-w-3xl mx-auto p-5 bg-white rounded shadow">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Create Success Story</h5>
            <button @click="router.push({ name: 'success-story' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
                Back to Success Story List
            </button>
        </div>

        <form @submit.prevent="submitForm">
            <div class="mb-4">
                <label for="title" class="block font-semibold mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full p-2 border rounded"
                    placeholder="Enter title" required />
            </div>
            <div class="mb-4">
                <label for="story" class="block font-semibold mb-2">Story</label>
                <textarea v-model="story" id="story" class="w-full p-2 border rounded"
                    placeholder="Write your story here..." rows="4"></textarea>
            </div>
            <!-- Privacy -->
            <div>
                <label for="privacy_setup_id" class="block text-sm font-medium mb-1">Privacy</label>
                <select v-model="privacy_setup_id" id="privacy_setup_id" class="w-full border px-4 py-2 rounded-md">
                    <option v-for="privacy in privacySetupList" :key="privacy.id" :value="privacy.id">
                        {{ privacy.name }}
                    </option>
                </select>
            </div>
            <div class="mb-4">
                <label for="status" class="block font-semibold mb-2">Status</label>
                <select v-model="status" id="status" class="w-full p-2 border rounded">
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
            </div>
            <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                @click="() => addMoreFiles(documents)">
                Add more document
            </button>

            <div class="flex justify-center mt-6">
                <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
                    Update
                </button>
            </div>

        </form>
    </div>
</template>