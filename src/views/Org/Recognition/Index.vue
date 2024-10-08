<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id;
const title = ref('');
const description = ref(''); // Managed by Quill
const recognition_date = ref('');
const privacy_setup_id = ref(1); // Default to "Only Me"
const status = ref(1); // Default to "Active"
const quillInstance = ref(null);
const isEditMode = ref(false);
const selectedRecordId = ref(null);
const recordList = ref([]);

// Fetch list of records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-recognitions', {}, 'GET');
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
    quillInstance.value = new Quill('#description-editor', {
        theme: 'snow',
        placeholder: 'Enter description...',
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
        description.value = quillInstance.value.root.innerHTML;
    });
};

// Reset form fields
const resetForm = () => {
    title.value = '';
    quillInstance.value.root.innerHTML = '';
    recognition_date.value = '';
    privacy_setup_id.value = 1;
    status.value = 1;
    isEditMode.value = false;
    selectedRecordId.value = null;
};

// Add or update a record
const submitForm = async () => {
    const payload = {
        user_id: userId,
        title: title.value,
        description: description.value,
        recognition_date: recognition_date.value,
        privacy_setup_id: privacy_setup_id.value,
        status: status.value
    };

    try {
        let apiUrl = '/api/create-recognition';
        let method = 'POST';

        if (isEditMode.value && selectedRecordId.value) {
            apiUrl = `/api/update-recognition/${selectedRecordId.value}`;
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
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Record ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getRecords();
                resetForm();
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
    quillInstance.value.root.innerHTML = record.description;
    recognition_date.value = record.recognition_date;
    privacy_setup_id.value = record.privacy_setup_id;
    status.value = record.status;
    selectedRecordId.value = record.id;
    isEditMode.value = true;
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
            const response = await auth.fetchProtectedApi(`/api/delete-recognition/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                getRecords();
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
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'br', 'img'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    });
};

// Initialize Quill and fetch records on mount
onMounted(() => {
    initializeQuill();
    getRecords();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <div>
                    <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Recognition</h5>
                </div>
            </div>
            <form @submit.prevent="submitForm">
                <!-- Title input -->
                <div class="mb-4">
                    <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                    <input v-model="title" type="text" id="title" class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter title" required />
                </div>

                <!-- Description Quill editor -->
                <div class="mb-4">
                    <label for="description-editor" class="block text-gray-700 font-semibold mb-2">Description</label>
                    <div id="description-editor" class="w-full border border-gray-300 rounded-md" style="min-height: 150px;"></div>
                </div>

                <!-- Recognition Date -->
                <div class="mb-4">
                    <label for="recognition_date" class="block text-gray-700 font-semibold mb-2">Recognition Date</label>
                    <input v-model="recognition_date" type="date" id="recognition_date" class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                </div>

                <!-- Privacy Setup dropdown -->
                <div class="mb-4">
                    <label for="privacy_setup_id" class="block text-gray-700 font-semibold mb-2">Privacy Setup</label>
                    <select v-model="privacy_setup_id" id="privacy_setup_id" class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="1">Only Me</option>
                        <option value="2">Organization</option>
                        <option value="3">Public</option>
                    </select>
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
                <h5 class="text-md font-semibold mt-2">Recognition List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Title</th>
                        <th class="py-2 px-4 border border-gray-300">Description</th>
                        <th class="py-2 px-4 border border-gray-300">Recognition Date</th>
                        <th class="py-2 px-4 border border-gray-300">Privacy</th>
                        <th class="py-2 px-4 border border-gray-300">Status</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record, index) in recordList" :key="record.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.title }}</td>
                        <td class="py-2 px-4 border border-gray-300" v-html="sanitize(record.description)"></td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.recognition_date }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.privacy_setup_id === 1 ? 'Only Me' : record.privacy_setup_id === 2 ? 'Organization' : 'Public' }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.status === 1 ? 'Active' : 'Disabled' }}</td>
                        <td class="py-2 px-4 border border-gray-300">
                            <button @click="editRecord(record)" class="bg-yellow-500 text-white rounded-md py-1 px-2">Edit</button>
                            <button @click="deleteRecord(record.id)" class="bg-red-600 text-white rounded-md py-1 px-2">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>