<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id; // Assuming the org ID is stored in the logged-in user
// Form data properties
const title = ref('');
const story = ref(''); // This will be managed by Quill
const status = ref(1); // Default to Active (1)
const quillInstance = ref(null);
const isEditMode = ref(false); // Toggle between add and edit modes
const selectedRecordId = ref(null); // Store the ID of the record to edit

// Data list for table
const recordList = ref([]);

// Fetch list of records (e.g., titles with story)
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-records', {}, 'GET');
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
    quillInstance.value = new Quill('#story-editor', {
        theme: 'snow',
        placeholder: 'Enter story...',
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
        story.value = quillInstance.value.root.innerHTML; // Sync with Quill content
    });
};

// Reset form fields
const resetForm = () => {
    title.value = '';
    quillInstance.value.root.innerHTML = ''; // Reset Quill content
    status.value = 1; // Default to Active
    isEditMode.value = false;
    selectedRecordId.value = null;
};

// Add or update a record
const submitForm = async () => {
    const payload = {
        user_id: userId,
        title: title.value,
        story: story.value,
        status: status.value
    };

    try {
        let apiUrl = '/api/create-record';
        let method = 'POST';

        // If editing, modify the API call and method
        if (isEditMode.value && selectedRecordId.value) {
            apiUrl = `/api/update-record/${selectedRecordId.value}`;
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
    quillInstance.value.root.innerHTML = record.story; // Load story into Quill
    status.value = record.status;
    selectedRecordId.value = record.id;
    isEditMode.value = true; // Switch to edit mode
};

// Delete record (optional)
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
            const response = await auth.fetchProtectedApi(`/api/delete-record/${id}`, {}, 'DELETE');

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
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'br', 'img'],
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
                <div>
                    <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Record</h5>
                </div>
            </div>
            <form @submit.prevent="submitForm">
                <!-- Title input -->
                <div class="mb-4">
                    <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                    <input v-model="title" type="text" id="title"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter title" required />
                </div>

                <!-- Story Quill editor -->
                <div class="mb-4">
                    <label for="story-editor" class="block text-gray-700 font-semibold mb-2">Story</label>
                    <div id="story-editor" class="w-full border border-gray-300 rounded-md" style="min-height: 150px;">
                    </div>
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
                    <button type="submit" class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">{{
                        isEditMode ? 'Update' : 'Submit' }}</button>
                </div>
            </form>
        </section>

        <!-- Record list -->
        <section>
            <!-- Card header -->
            <div class="flex justify-between left-color-shade py-2 my-3">
                <div>
                    <h5 class="text-md font-semibold mt-2">Records List</h5>
                </div>
                <div>
                    <a href="/org-dashboard/add-member">
                        <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mr-2">
                            Full list
                        </button>
                    </a>
                    <a href="/org-dashboard/add-member">
                        <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
                            Print
                        </button>
                    </a>
                    <a href="/org-dashboard/add-member">
                        <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
                            PDF
                        </button>
                    </a>
                    <a href="/org-dashboard/add-member">
                        <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
                            Excel
                        </button>
                    </a>
                   
                </div>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="border px-4 py-2">User</th>
                        <th class="border px-4 py-2">Title</th>
                        <th class="border px-4 py-2">Story</th>
                        <th class="border px-4 py-2">Status</th>
                        <th class="border px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record, index) in recordList" :key="record.id"
                        class="hover:bg-gray-50 transition-colors duration-200">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="border px-4 py-2">{{ record.user.name }}</td>
                        <td class="border px-4 py-2">{{ record.title }}</td>
                        <!-- <td class="border px-4 py-2" v-html="record.story"></td> -->
                        <td class="border px-4 py-2" v-html="sanitize(record.story)"></td>
                        <td class="border px-4 py-2">{{ record.status === 1 ? 'Active' : 'Disabled' }}</td>
                        <td class="border px-4 py-2">
                            <button @click="editRecord(record)"
                                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2">Edit</button>
                            <button @click="deleteRecord(record.id)"
                                class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style scoped>
#story-editor {
    min-height: 150px;
}

table {
    border-spacing: 0;
    width: 100%;
}

table thead th {
    background-color: #f3f3f3;
}

table tbody tr:hover {
    background-color: #f9fafb;
}

table td {
    padding: 10px;
    border: 1px solid #e5e7eb;
}
</style>