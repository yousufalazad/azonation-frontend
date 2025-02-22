<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { useRouter, useRoute } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();
const userId = auth.user.id;
const start_year = ref('');
const end_year = ref('');
const goals = ref('');
const activities = ref('');
const budget = ref('');
const start_date = ref('');
const end_date = ref('');
const privacy_setup_id = ref(1); // Default to "Only Me"
const published = ref(1); // Default to "Active"
const status = ref(1); // Default to "Active"
const goalsQuill = ref(null);
const activitiesQuill = ref(null);
const isEditMode = ref(false);
const selectedRecordId = ref(null);
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

const privacySetups = ref([]);
// Fetch Dropdown Data
const fetchPrivacySetups = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/privacy-setups');
    if (response.status) {
      privacySetups.value = response.data;
    } else {
      errorMessage.value = 'Error loading privacy setups.';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load privacy setups. Please try again later.';
  }
};


// Initialize Quill editors
const initializeQuill = () => {
    goalsQuill.value = new Quill('#goals-editor', {
        theme: 'snow',
        placeholder: 'Enter goals...',
        // modules: {
        //     toolbar: [
        //         [{ header: [1, 2, false] }],
        //         ['bold', 'italic', 'underline'],
        //         [{ list: 'ordered' }, { list: 'bullet' }],
        //         ['link']
        //     ]
        // }
    });

    activitiesQuill.value = new Quill('#activities-editor', {
        theme: 'snow',
        placeholder: 'Enter activities...',
        // modules: {
        //     toolbar: [
        //         [{ header: [1, 2, false] }],
        //         ['bold', 'italic', 'underline'],
        //         [{ list: 'ordered' }, { list: 'bullet' }],
        //         ['link']
        //     ]
        // }
    });

    goalsQuill.value.on('text-change', () => {
        goals.value = goalsQuill.value.root.innerHTML;
    });

    activitiesQuill.value.on('text-change', () => {
        activities.value = activitiesQuill.value.root.innerHTML;
    });
};

// Reset form fields
const resetForm = () => {
    start_year.value = '';
    end_year.value = '';
    goalsQuill.value.root.innerHTML = '';
    activitiesQuill.value.root.innerHTML = '';
    budget.value = '';
    start_date.value = '';
    end_date.value = '';
    privacy_setup_id.value = 1;
    published.value = 1;
    status.value = 1;
    isEditMode.value = false;
    selectedRecordId.value = null;
    images.value = [{ id: Date.now(), file: null }];
    documents.value = [{ id: Date.now(), file: null }];
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


// Add or update a record
const submitForm = async () => {
    // Prepare the form data
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('start_year', start_year.value);
    formData.append('end_year', end_year.value);
    formData.append('goals', goals.value);
    formData.append('activities', activities.value);
    formData.append('budget', budget.value);
    formData.append('start_date', start_date.value);
    formData.append('end_date', end_date.value);
    formData.append('privacy_setup_id', privacy_setup_id.value);
    formData.append('published', published.value ? 1 : 0);
    formData.append('status', status.value);

    // Append images
    images.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`images[${index}]`, fileData.file.file);
        }
    });

    // Append documents
    documents.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`documents[${index}]`, fileData.file.file);
        }
    });

    try {
        // Display confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to add this year plan?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        // If user confirms
        if (result.isConfirmed) {
            const response = await auth.uploadProtectedApi('/api/create-year-plan', formData, 'POST', {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status) {
                Swal.fire('Success!', 'Year plan added successfully.', 'success').then(() => {
                    router.push({ name: 'year-plan' });
                });
            } else {
                Swal.fire('Failed!', 'Failed to save year plan.', 'error');
            }
        }
    } catch (error) {
        console.error('Error adding year plan:', error);
        Swal.fire('Error!', 'Failed to add year plan.', 'error');
    }
};


// Initialize Quill and fetch records on mount
onMounted(() => {
    initializeQuill();
    fetchPrivacySetups();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-xl font-semibold">Add New Year Plan</h5>
                <button @click="$router.push({ name: 'year-plan' })"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                    Back to Year Plan List
                </button>
            </div>
            <form @submit.prevent="submitForm">
                <div class="grid grid-cols-2 gap-4 mb-4">

                    <!-- Start Year -->
                    <div class="mb-4">
                        <label for="start_year" class="block text-gray-700 font-semibold mb-2">Start Year</label>
                        <input v-model="start_year" type="text" id="start_year"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter start year"
                            required />
                    </div>

                    <!-- End Year -->
                    <div class="mb-4">
                        <label for="end_year" class="block text-gray-700 font-semibold mb-2">End Year</label>
                        <input v-model="end_year" type="text" id="end_year"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter end year"
                            required />
                    </div>
                </div>
                <div class="grid mb-4">
                    <!-- Goals -->
                    <div class="mb-4">
                        <label for="goals-editor" class="block text-gray-700 font-semibold mb-2">Goals</label>
                        <div id="goals-editor" class="w-full border border-gray-300 rounded-md"
                            style="min-height: 100px;">
                        </div>
                    </div>
                </div>
                <div class="grid mb-4">
                    <!-- Activities -->
                    <div class="mb-4">
                        <label for="activities-editor" class="block text-gray-700 font-semibold mb-2">Activities</label>
                        <div id="activities-editor" class="w-full border border-gray-300 rounded-md"
                            style="min-height: 100px;"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <!-- Budget -->
                    <div class="mb-4">
                        <label for="budget" class="block text-gray-700 font-semibold mb-2">Budget</label>
                        <input v-model="budget" type="number" min="0" id="budget"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter budget"
                            required />
                    </div>

                    <!-- Start Date -->
                    <div class="mb-4">
                        <label for="start_date" class="block text-gray-700 font-semibold mb-2">Start Date</label>
                        <input v-model="start_date" type="date" id="start_date"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>

                    <!-- End Date -->
                    <div class="mb-4">
                        <label for="end_date" class="block text-gray-700 font-semibold mb-2">End Date</label>
                        <input v-model="end_date" type="date" id="end_date"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>

                    <!-- Privacy Setup -->
                    <div class="mb-4">
                        <label for="privacy_setup_id" class="block text-gray-700 font-semibold mb-2">Privacy
                            Setup</label>

                        <select v-model="privacy_setup_id" id="privacy_setup_id"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required>
                            <option v-for="privacy in privacySetups" :key="privacy.id" :value="privacy.id">{{ privacy.name }}</option>
                        </select>
                    </div>

                    <!-- Published -->
                    <div class="mb-4">
                        <label for="published" class="block text-gray-700 font-semibold mb-2">Published</label>
                        <select v-model="published" id="published"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required>
                            <option value="1">Published</option>
                            <option value="0">Unpublished</option>
                        </select>
                    </div>

                    <!-- Status -->
                    <div class="mb-4">
                        <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
                        <select v-model="status" id="status" class="w-full border border-gray-300 rounded-md py-2 px-4"
                            required>
                            <option value="1">Draft</option>
                            <option value="2">Approved</option>
                            <option value="3">Completed</option>
                            <option value="4">Archived</option>
                        </select>
                    </div>



                    <!-- Images Upload -->
                    <div class="mb-4">
                        <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                        <div class="space-y-3">
                            <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
                                <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept="image/*"
                                    @change="event => handleFileChange(event, images, index)" />

                                <div v-if="file.file && file.file.preview"
                                    class="w-16 h-16 border rounded-md overflow-hidden">
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

                </div>

                <!-- Documents Upload -->
                <div class="mb-4">
                    <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
                    <div class="space-y-3">
                        <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
                            <input type="file" class="border border-gray-300 rounded-md py-2 px-4"
                                accept=".pdf,.doc,.docx" @change="event => handleFileChange(event, documents, index)" />

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
                <div class="mb-4 flex justify-end">
                    <button type="submit" class="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
                        Add Year Plan
                    </button>
                    <button type="button" @click="resetForm"
                        class="bg-gray-500 text-white py-2 px-4 rounded-md ml-2 hover:bg-gray-600">Reset</button>
                </div>

            </form>
        </section>
    </div>
</template>