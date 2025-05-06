<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import Quill from 'quill';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();

const id = route.params.id;
const title = ref('');
const description = ref('');
const recognition_date = ref('');
const privacy_setup_id = ref(1);
const is_active = ref(1);
const quillInstance = ref(null);

const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

// Fetch record data for editing
const fetchRecord = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/recognitions/${id}`, {}, 'GET');
        if (response?.status) {
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

            title.value = data.title;
            description.value = data.description;
            recognition_date.value = data.recognition_date;
            privacy_setup_id.value = data.privacy_setup_id;
            is_active.value = data.is_active;

            // Populate Quill editor with fetched description
            if (quillInstance.value) {
                quillInstance.value.root.innerHTML = description.value;
            }
        } else {
            handleError('Failed to fetch record details.');
        }
    } catch (error) {
        handleError('An error occurred while fetching the record.');
    }
};

// Initialize Quill editor
const initializeQuill = () => {
    quillInstance.value = new Quill('#description-editor', {
        theme: 'snow',
        placeholder: 'Enter description...',
        modules: {
            toolbar: [['bold', 'italic'], ['link'], [{ list: 'bullet' }]],
        },
    });

    quillInstance.value.on('text-change', () => {
        description.value = quillInstance.value.root.innerHTML;
    });
};

// Cleanup Quill instance on unmount
onBeforeUnmount(() => {
    if (quillInstance.value) {
        quillInstance.value.off('text-change');
        quillInstance.value = null;
    }
});

// Handle errors with consistent messaging
const handleError = (message) => {
    Swal.fire('Error', message, 'error');
    router.push({ name: 'recognition-list' });
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

// Submit edited data

const submitForm = async () => {
    // Validate required fields
    if (!title.value || !description.value || !recognition_date.value || !privacy_setup_id.value) {
        Swal.fire('Error!', 'Please fill out all required fields.', 'error');
        return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('recognition_date', recognition_date.value);
    formData.append('privacy_setup_id', privacy_setup_id.value);
    formData.append('is_active', is_active.value);

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
        // API call using FormData
        const response = await auth.uploadProtectedApi(`/api/recognitions/${id}`, formData, 'POST', {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Handle response
        if (response?.status) {
            Swal.fire('Success', 'Record updated successfully.', 'success');
            router.push({ name: 'recognition' });
        } else {
            Swal.fire('Error', 'Failed to update record.', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'An error occurred while updating the record.', 'error');
    }
};


// Initialize component on mount
onMounted(() => {
    initializeQuill();
    fetchRecord();
});
</script>

<template>
    <div class="max-w-3xl mx-auto p-6 bg-white shadow rounded-md">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Edit Recognition</h5>
            <button @click="router.push({ name: 'recognition' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
                Back to Recognition List
            </button>
        </div>
        <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Title -->
            <div>
                <label for="title" class="block text-sm font-medium mb-1">Title</label>
                <input v-model="title" type="text" id="title" class="w-full border px-4 py-2 rounded-md"
                    placeholder="Enter title" required />
            </div>

            <!-- Description -->
            <div>
                <label for="description-editor" class="block text-sm font-medium mb-1">Description</label>
                <div id="description-editor" class="border rounded-md min-h-[150px]"></div>
            </div>

            <!-- Recognition Date -->
            <div>
                <label for="recognition_date" class="block text-sm font-medium mb-1">Recognition Date</label>
                <input v-model="recognition_date" type="date" id="recognition_date"
                    class="w-full border px-4 py-2 rounded-md" required />
            </div>

            <!-- Privacy -->
            <div>
                <label for="privacy_setup_id" class="block text-sm font-medium mb-1">Privacy</label>
                <select v-model="privacy_setup_id" id="privacy_setup_id" class="w-full border px-4 py-2 rounded-md">
                    <option value="1">Only Me</option>
                    <option value="2">Organization</option>
                    <option value="3">Public</option>
                </select>
            </div>

            <!-- Status -->
            <div>
                <label for="is_active" class="block text-sm font-medium mb-1">Status</label>
                <select v-model="is_active" id="is_active" class="w-full border px-4 py-2 rounded-md">
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
            <div class="flex justify-center mt-6">
                <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">
                    Update
                </button>
            </div>
        </form>
    </div>
</template>
