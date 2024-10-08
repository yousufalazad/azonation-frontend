<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
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
const recordList = ref([]);

// Fetch list of records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-year-plans', {}, 'GET');
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

// Initialize Quill editors
const initializeQuill = () => {
    goalsQuill.value = new Quill('#goals-editor', {
        theme: 'snow',
        placeholder: 'Enter goals...',
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link']
            ]
        }
    });

    activitiesQuill.value = new Quill('#activities-editor', {
        theme: 'snow',
        placeholder: 'Enter activities...',
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link']
            ]
        }
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
};

// Add or update a record
const submitForm = async () => {
    const payload = {
        user_id: userId,
        start_year: start_year.value,
        end_year: end_year.value,
        goals: goals.value,
        activities: activities.value,
        budget: budget.value,
        start_date: start_date.value,
        end_date: end_date.value,
        privacy_setup_id: privacy_setup_id.value,
        published: published.value,
        status: status.value
    };

    try {
        let apiUrl = '/api/create-year-plan';
        let method = 'POST';

        if (isEditMode.value && selectedRecordId.value) {
            apiUrl = `/api/update-year-plan/${selectedRecordId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this year plan?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Year plan ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getRecords();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save year plan.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} year plan:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} year plan.`, 'error');
    }
};

// Edit record
const editRecord = (record) => {
    start_year.value = record.start_year;
    end_year.value = record.end_year;
    goalsQuill.value.root.innerHTML = record.goals;
    activitiesQuill.value.root.innerHTML = record.activities;
    budget.value = record.budget;
    start_date.value = record.start_date;
    end_date.value = record.end_date;
    privacy_setup_id.value = record.privacy_setup_id;
    published.value = record.published;
    status.value = record.status;
    selectedRecordId.value = record.id;
    isEditMode.value = true;
};

// Delete record
const deleteRecord = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this year plan?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-year-plan/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Year plan has been deleted.', 'success');
                getRecords();
            } else {
                Swal.fire('Failed!', 'Failed to delete year plan.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting year plan:', error);
        Swal.fire('Error!', 'Failed to delete year plan.', 'error');
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
                    <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Year Plan</h5>
                </div>
            </div>
            <form @submit.prevent="submitForm">
                <!-- Start Year -->
                <div class="mb-4">
                    <label for="start_year" class="block text-gray-700 font-semibold mb-2">Start Year</label>
                    <input v-model="start_year" type="text" id="start_year" class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter start year" required />
                </div>

                <!-- End Year -->
                <div class="mb-4">
                    <label for="end_year" class="block text-gray-700 font-semibold mb-2">End Year</label>
                    <input v-model="end_year" type="text" id="end_year" class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter end year" required />
                </div>

                <!-- Goals -->
                <div class="mb-4">
                    <label for="goals-editor" class="block text-gray-700 font-semibold mb-2">Goals</label>
                    <div id="goals-editor" class="w-full border border-gray-300 rounded-md" style="min-height: 150px;"></div>
                </div>

                <!-- Activities -->
                <div class="mb-4">
                    <label for="activities-editor" class="block text-gray-700 font-semibold mb-2">Activities</label>
                    <div id="activities-editor" class="w-full border border-gray-300 rounded-md" style="min-height: 150px;"></div>
                </div>

                <!-- Budget -->
                <div class="mb-4">
                    <label for="budget" class="block text-gray-700 font-semibold mb-2">Budget</label>
                    <input v-model="budget" type="number" min="0" id="budget" class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter budget" required />
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

                <!-- Privacy Setup -->
                <div class="mb-4">
                    <label for="privacy_setup_id" class="block text-gray-700 font-semibold mb-2">Privacy Setup</label>
                    <select v-model="privacy_setup_id" id="privacy_setup_id" class="w-full border border-gray-300 rounded-md py-2 px-4" required>
                        <option value="1">Only Me</option>
                        <option value="2">Organization</option>
                        <option value="3">Public</option>
                    </select>
                </div>

                <!-- Published -->
                <div class="mb-4">
                    <label for="published" class="block text-gray-700 font-semibold mb-2">Published</label>
                    <select v-model="published" id="published" class="w-full border border-gray-300 rounded-md py-2 px-4" required>
                        <option value="1">Published</option>
                        <option value="0">Unpublished</option>
                    </select>
                </div>

                <!-- Status -->
                <div class="mb-4">
                    <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
                    <select v-model="status" id="status" class="w-full border border-gray-300 rounded-md py-2 px-4" required>
                        <option value="1">Draft</option>
                        <option value="2">Approved</option>
                        <option value="3">Completed</option>
                        <option value="4">Archived</option>
                    </select>
                </div>

                <!-- Submit Button -->
                <div class="mb-4">
                    <button type="submit" class="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">{{ isEditMode ? 'Update' : 'Add' }} Year Plan</button>
                    <button type="button" @click="resetForm" class="bg-gray-500 text-white py-2 px-4 rounded-md ml-2 hover:bg-gray-600">Reset</button>
                </div>
            </form>
        </section>

        <!-- Display List of Records -->
        <section>
            <h5 class="text-md font-semibold mb-2">Year Plans</h5>
            <table class="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="border border-gray-300 p-2">#</th>
                        <th class="border border-gray-300 p-2">Start Year</th>
                        <th class="border border-gray-300 p-2">End Year</th>
                        <th class="border border-gray-300 p-2">Goals</th>
                        <th class="border border-gray-300 p-2">Activities</th>
                        <th class="border border-gray-300 p-2">Budget</th>
                        <th class="border border-gray-300 p-2">Start Date</th>
                        <th class="border border-gray-300 p-2">End Date</th>
                        <th class="border border-gray-300 p-2">Privacy</th>
                        <th class="border border-gray-300 p-2">Published</th>
                        <th class="border border-gray-300 p-2">status</th>
                        <th class="border border-gray-300 p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record, index) in recordList" :key="record.id" class="border border-gray-300">
                        <td class="border border-gray-300 p-2">{{ index + 1 }}</td>
                        <td class="border border-gray-300 p-2">{{ record.start_year }}</td>
                        <td class="border border-gray-300 p-2">{{ record.end_year }}</td>
                        <td class="border border-gray-300 p-2" v-html="sanitize(record.goals)"></td>
                        <td class="border border-gray-300 p-2" v-html="sanitize(record.activities)"></td>
                        <td class="border border-gray-300 p-2">{{ record.budget }}</td>
                        <td class="border border-gray-300 p-2">{{ record.start_date }}</td>
                        <td class="border border-gray-300 p-2">{{ record.end_date }}</td>
                        <td class="border border-gray-300 p-2">{{ record.privacy_setup_id === 1 ? 'Only Me' : record.privacy_setup_id === 2 ? 'Organization' : 'Public' }}</td>
                        <td class="border border-gray-300 p-2">{{ record.published === 1 ? 'Published' : 'Unpublished' }}</td>
                        <td class="border border-gray-300 p-2">{{ record.status === 1 ? 'Draft' : record.status === 2 ? 'Approved' : record.status === 3 ? 'Completed' : 'Archived' }}</td>
                        <td class="border border-gray-300 p-2">
                            <button @click="editRecord(record)" class="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600">Edit</button>
                            <button @click="deleteRecord(record.id)" class="bg-red-500 text-white py-1 px-2 rounded-md ml-2 hover:bg-red-600">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>