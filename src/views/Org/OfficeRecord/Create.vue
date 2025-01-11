<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = authStore;
const userId = auth.user.id;

const title = ref('');
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);
const description = ref('');
const privacySetupId = ref(1);

const resetForm = () => {
    title.value = '';
    images.value = [{ id: Date.now(), file: null }];
    documents.value = [{ id: Date.now(), file: null }];
    description.value = '';
    privacySetupId.value = 1;
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
        let apiUrl = '/api/create-office-record';
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to add this record?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            const response = await auth.uploadProtectedApi(apiUrl, formData, 'POST', {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status) {
                Swal.fire('Success!', 'Record added successfully.', 'success').then(() => {
                    router.push({ name: 'index-record' });
                    resetForm();
                });
            } else {
                Swal.fire('Failed!', 'Failed to add record.', 'error');
            }
        }
    } catch (error) {
        console.error('Error adding record:', error);
        Swal.fire('Error!', 'Failed to add record.', 'error');
    }
};
</script>

<template>
    <div class="container mx-auto max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">
        <form @submit.prevent="submitForm">
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
                            @change="event => handleFileChange(event, images, index)"
                        />

                        <div v-if="file.file && file.file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
                            <img :src="file.file.preview" alt="Preview" class="w-full h-full object-cover" />
                        </div>

                        <button
                            type="button"
                            class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                            @click="removeFile(images, index)"
                        >X</button>
                    </div>
                </div>
                <button
                    type="button"
                    class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(images)"
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
                            @change="event => handleFileChange(event, documents, index)"
                        />

                        <span v-if="file.file" class="truncate w-32">{{ file.file.name }}</span>

                        <button
                            type="button"
                            class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                            @click="removeFile(documents, index)"
                        >X</button>
                    </div>
                </div>
                <button
                    type="button"
                    class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(documents)"
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
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Record</button>
                <button type="button" @click="resetForm" class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Reset</button>
            </div>
        </form>
    </div>
</template>