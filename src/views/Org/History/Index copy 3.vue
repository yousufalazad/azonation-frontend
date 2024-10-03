<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id; // Assuming the user ID is stored in the logged-in user
const title = ref('');
const image = ref(null);
const document = ref(null);
const history = ref(''); // This will be managed by Quill
const status = ref(1); // Default to Active (1)
const quillInstance = ref(null);
const isEditMode = ref(false); // Toggle between add and edit modes
const selectedRecordId = ref(null); // Store the ID of the record to edit
const recordList = ref([]); // Data list for table

// Fetch list of records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-org-histories', {}, 'GET');
        if (response.status) {
            recordList.value = response.data;
        } else {
            recordList.value = [];
        }
    } catch (error) {
        console.error('Error fetching records:', error);
        recordList.value = [];
    }
};

// Initialize Quill editor
const initializeQuill = () => {
    quillInstance.value = new Quill('#history-editor', {
        theme: 'snow',
        placeholder: 'Enter history...',
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link']
            ]
        }
    });

    quillInstance.value.on('text-change', () => {
        history.value = quillInstance.value.root.innerHTML; // Sync with Quill content
    });
};

// Reset form fields
const resetForm = () => {
    title.value = '';
    image.value = null;
    quillInstance.value.root.innerHTML = ''; // Reset Quill content
    status.value = 1; // Default to Active
    isEditMode.value = false;
    selectedRecordId.value = null;
};

// Handle image file change
const handleImageChange = (event) => {
    image.value = event.target.files[0]; // Store the uploaded file
};

// Add or update a record
const submitForm = async () => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('history', history.value);
    formData.append('status', status.value);
    if (image.value) {
        formData.append('image', image.value); // Handle image upload
    }
    if (document.value) {
        formData.append('document', document.value); // Handle document upload
    }

    try {
        let apiUrl = '/api/create-org-history';
        let method = 'POST';

        if (isEditMode.value && selectedRecordId.value) {
            apiUrl = `/api/update-org-history/${selectedRecordId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this record?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.uploadProtectedApi(apiUrl, formData, method, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status) {
                await Swal.fire('Success!', `Record ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getRecords(); // Refresh the record list
                resetForm(); // Reset the form fields
            } else {
                Swal.fire('Failed!', 'Failed to save record.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} record:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} record.`, 'error');
    }
};

// Edit record
const editRecord = (record) => {
    title.value = record.title;
    quillInstance.value.root.innerHTML = record.history; // Load history into Quill
    status.value = record.status;
    selectedRecordId.value = record.id;
    isEditMode.value = true; // Switch to edit mode
};

// Delete record
const deleteRecord = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this record?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-org-history/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                getRecords(); // Refresh the record list
            } else {
                Swal.fire('Failed!', 'Failed to delete record.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        Swal.fire('Error!', 'Failed to delete record.', 'error');
    }
};

// Sanitize the HTML content
const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'br', 'img'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    });
};

// Initialize Quill and fetch records when component is mounted
onMounted(() => {
    initializeQuill();
    getRecords();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <!-- Form for adding/updating records -->
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Organizational History</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- Title input -->
                <div class="mb-4">
                    <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                    <input v-model="title" type="text" id="title" class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter title" required />
                </div>

                <!-- Image input -->
                <div class="mb-4">
                    <label for="image" class="block text-gray-700 font-semibold mb-2">Upload Image</label>
                    <input @change="handleImageChange" type="file" id="image" class="w-full border border-gray-300 rounded-md py-2 px-4" accept="image/*" />
                </div>

                <!-- History Quill editor -->
                <div class="mb-4">
                    <label for="history-editor" class="block text-gray-700 font-semibold mb-2">History</label>
                    <div id="history-editor" class="w-full border border-gray-300 rounded-md" style="min-height: 150px;"></div>
                </div>

                 <!-- document input -->
                 <div class="mb-4">
                    <label for="document" class="block text-gray-700 font-semibold mb-2">Upload document</label>
                    <input @change="handleDocumentUpload" type="file" id="document" class="w-full border border-gray-300 rounded-md py-2 px-4" accept="image/*" />
                </div>

                <!-- Status dropdown -->
                <div class="mb-4">
                    <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
                    <select v-model="status" id="status" class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="1">Active</option>
                        <option value="0">Disabled</option>
                    </select>
                </div>

                <!-- Submit button -->
                <div>
                    <button type="submit" class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">{{ isEditMode ? 'Update' : 'Submit' }}</button>
                </div>
            </form>
        </section>

        <!-- Record list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Organizational Histories List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">User</th>
                        <th class="py-2 px-4 border border-gray-300">Title</th>
                        <th class="py-2 px-4 border border-gray-300">History</th>
                        <th class="py-2 px-4 border border-gray-300">Status</th>
                        <th class="py-2 px-4 border border-gray-300">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record, index) in recordList" :key="record.id">
                        <td class="py-2 px-4 border border-gray-300">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.user.name }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.title }}</td>
                        <td class="py-2 px-4 border border-gray-300" v-html="sanitize(record.history)"></td>
                        <td class="py-2 px-4 border border-gray-300">
                            <span :class="record.status ? 'text-green-600' : 'text-red-600'">
                                {{ record.status ? 'Active' : 'Disabled' }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border border-gray-300">
                            <button @click="editRecord(record)" class="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md py-1 px-3 mr-2">Edit</button>
                            <button @click="deleteRecord(record.id)" class="bg-red-600 hover:bg-red-700 text-white rounded-md py-1 px-3">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>
