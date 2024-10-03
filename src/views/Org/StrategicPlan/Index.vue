<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id; // Assuming the user ID is stored in the logged-in user
const title = ref('');
const plan = ref(''); // This will be managed by Quill
const start_date = ref('');
const end_date = ref('');
const status = ref(1); // Default to Active (1)
const quillInstance = ref(null);
const isEditMode = ref(false); // Toggle between add and edit modes
const selectedRecordId = ref(null); // Store the ID of the record to edit
const recordList = ref([]); // Data list for table

// Fetch list of records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-strategic-plans', {}, 'GET');
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
    quillInstance.value = new Quill('#plan-editor', {
        theme: 'snow',
        placeholder: 'Enter plan...',
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
        plan.value = quillInstance.value.root.innerHTML; // Sync with Quill content
    });
};

// Reset form fields
const resetForm = () => {
    title.value = '';
    quillInstance.value.root.innerHTML = ''; // Reset Quill content
    start_date.value = '';
    end_date.value = '';
    status.value = 1; // Default to Active
    isEditMode.value = false;
    selectedRecordId.value = null;
};

// Add or update a record
const submitForm = async () => {
    const payload = {
        user_id: userId,
        title: title.value,
        plan: plan.value,
        start_date: start_date.value,
        end_date: end_date.value,
        status: status.value
    };

    try {
        let apiUrl = '/api/create-strategic-plan';
        let method = 'POST';

        // If editing, modify the API call and method
        if (isEditMode.value && selectedRecordId.value) {
            apiUrl = `/api/update-strategic-plan/${selectedRecordId.value}`;
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
    quillInstance.value.root.innerHTML = record.plan; // Load plan into Quill
    start_date.value = record.start_date;
    end_date.value = record.end_date;
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
            const response = await auth.fetchProtectedApi(`/api/delete-strategic-plan/${id}`, {}, 'DELETE');

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
                    <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Strategic Plan</h5>
                </div>
            </div>
            <form @submit.prevent="submitForm">
                <!-- Title input -->
                <div class="mb-4">
                    <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                    <input v-model="title" type="text" id="title" class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter title" required />
                </div>

                <!-- Plan Quill editor -->
                <div class="mb-4">
                    <label for="plan-editor" class="block text-gray-700 font-semibold mb-2">Plan</label>
                    <div id="plan-editor" class="w-full border border-gray-300 rounded-md" style="min-height: 150px;"></div>
                </div>

                <!-- Start Date -->
                <div class="mb-4">
                    <label for="start_date" class="block text-gray-700 font-semibold mb-2">Start Date</label>
                    <input v-model="start_date" type="date" id="start_date" class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                </div>

                <!-- End Date -->
                <div class="mb-4">
                    <label for="end_date" class="block text-gray-700 font-semibold mb-2">End Date</label>
                    <input v-model="end_date" type="date" id="end_date" class="w-full border border-gray-300 rounded-md py-2 px-4" required />
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
                <div>
                    <h5 class="text-md font-semibold mt-2">Strategic Plans List</h5>
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
                        <th class="py-2 px-4 border border-gray-300">User</th>
                        <th class="py-2 px-4 border border-gray-300">Title</th>
                        <th class="py-2 px-4 border border-gray-300">Plan</th>
                        <th class="py-2 px-4 border border-gray-300">Start Date</th>
                        <th class="py-2 px-4 border border-gray-300">End Date</th>
                        <th class="py-2 px-4 border border-gray-300">Status</th>
                        <th class="py-2 px-4 border border-gray-300">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record, index) in recordList" :key="record.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="border px-4 py-2">{{ record.user.name }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.title }}</td>
                        <td class="py-2 px-4 border border-gray-300" v-html="sanitize(record.plan)"></td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.start_date }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ record.end_date }}</td>
                        <td class="border px-4 py-2">{{ record.status === 1 ? 'Active' : 'Disabled' }}</td>
                        <td class="py-2 px-4 border border-gray-300">
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
#plan-editor {
    min-height: 150px;
}
</style>