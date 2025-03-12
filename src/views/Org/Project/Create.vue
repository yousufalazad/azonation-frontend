<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const route = useRoute();
const router = useRouter();

const auth = authStore;
const userId = auth.user.id;

// Form fields
const title = ref('');
const venue_name = ref('');
const venue_address = ref('');
const start_date = ref('');
const end_date = ref('');
const start_time = ref('');
const end_time = ref('');
const status = ref(0);
const conduct_type = ref(1);

// Quill editor references
let requirementsEditor, noteEditor, descriptionEditor, shortDescriptionEditor;

// Quill editor content
const requirements = ref('');
const note = ref('');
const description = ref('');
const short_description = ref('');

// Initialize Quill editors
onMounted(() => {
    const options = {
        theme: 'snow',
        placeholder: 'Type here...',
    };

    requirementsEditor = new Quill('#requirements-editor', options);
    noteEditor = new Quill('#note-editor', options);
    descriptionEditor = new Quill('#description-editor', options);
    shortDescriptionEditor = new Quill('#short-description-editor', options);

    // Update refs when content changes
    requirementsEditor.on('text-change', () => {
        requirements.value = requirementsEditor.root.innerHTML;
    });
    noteEditor.on('text-change', () => {
        note.value = noteEditor.root.innerHTML;
    });
    descriptionEditor.on('text-change', () => {
        description.value = descriptionEditor.root.innerHTML;
    });
    shortDescriptionEditor.on('text-change', () => {
        short_description.value = shortDescriptionEditor.root.innerHTML;
    });
});

// Reset form fields
const resetForm = () => {
    title.value = '';
    venue_name.value = '';
    venue_address.value = '';
    start_date.value = '';
    end_date.value = '';
    start_time.value = '';
    end_time.value = '';
    status.value = 0;
    conduct_type.value = 1;

    requirements.value = '';
    note.value = '';
    description.value = '';
    short_description.value = '';

    requirementsEditor.setText('');
    noteEditor.setText('');
    descriptionEditor.setText('');
    shortDescriptionEditor.setText('');
};

// Submit form (create event)
const submitForm = async () => {
    if (!title.value || !venue_name.value) {
        Swal.fire('Error!', 'Please fill in all required fields.', 'error');
        return;
    }

    const payload = {
        user_id: userId,
        title: title.value,
        venue_name: venue_name.value,
        venue_address: venue_address.value,
        start_date: start_date.value,
        end_date: end_date.value,
        start_time: start_time.value,
        end_time: end_time.value,
        status: status.value,
        conduct_type: conduct_type.value,
        requirements: requirements.value,
        note: note.value,
        description: description.value,
        short_description: short_description.value,
    };

    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to add this event?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi('/api/projects', payload, 'POST');

            if (response.status) {
                Swal.fire('Success!', 'Project added successfully.', 'success').then(() => {
                    resetForm(); // Reset the form after successful submission
                    router.push({ name: 'index-project' }); // Redirect to the project list
                });
            } else {
                Swal.fire('Failed!', 'Failed to add the project.', 'error');
            }
        }
    } catch (error) {
        console.error('Error adding event:', error);
        Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    }
};

</script>

<template>
    <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-bold text-gray-800">Add New Project</h2>
            <button @click="$router.push({ name: 'index-project' })"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300 focus:outline-none">
                Back to Project List
            </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Form grid layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="col-span-full">
                    <label for="title"
                        class="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">
                        Project Title
                    </label>
                    <input v-model="title" type="text" id="title"
                        class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2"
                        placeholder="Enter project title" required />
                </div>
                <div>
                    <label for="venue_name"
                        class="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">Venue
                        Name</label>
                    <input v-model="venue_name" type="text" id="venue_name"
                        class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2"
                        placeholder="Venue name" required />
                </div>
                <div>
                    <label for="venue_address" class="block text-sm font-medium text-gray-700">Venue Address</label>
                    <input v-model="venue_address" type="text" id="venue_address"
                        class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2"
                        placeholder="Venue address" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
                    <input v-model="start_date" type="date" id="start_date"
                        class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
                </div>
                <div>
                    <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
                    <input v-model="end_date" type="date" id="end_date"
                        class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
                </div>
                <div>
                    <label for="start_time" class="block text-sm font-medium text-gray-700">Start Time</label>
                    <input v-model="start_time" type="time" id="start_time"
                        class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
                </div>
                <div>
                    <label for="end_time" class="block text-sm font-medium text-gray-700">End Time</label>
                    <input v-model="end_time" type="time" id="end_time"
                        class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
                </div>
            </div>
            <!-- Editors -->
            <div>
                <label class="block text-sm font-medium text-gray-700">Requirements</label>
                <div id="requirements-editor" style="height: 5rem"
                    class="mt-2 h-40 border border-gray-300 rounded-lg shadow-sm"></div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Note</label>
                <div id="note-editor" style="height: 5rem"
                    class="mt-2 h-40 border border-gray-300 rounded-lg shadow-sm"></div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <div id="description-editor" style="height: 5rem"
                    class="mt-2 h-40 border border-gray-300 rounded-lg shadow-sm"></div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Short Description</label>
                <div id="short-description-editor" style="height: 5rem"
                    class="mt-2 h-40 border border-gray-300 rounded-lg shadow-sm"></div>
            </div>

            <!-- status and Conduct type -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select v-model="status" id="status"
                        class="mt-2 w-full border border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                        <option value="0">Active</option>
                        <option value="1">Disabled</option>
                    </select>
                </div>
                <div>
                    <label for="conduct_type" class="block text-sm font-medium text-gray-700">Conduct Type</label>
                    <select v-model="conduct_type" id="conduct_type"
                        class="mt-2 w-full border border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                        <option value="1">In Person</option>
                        <option value="2">Online</option>
                    </select>
                </div>
            </div>
            <!-- Actions -->
            <div class="flex justify-end gap-4">
                <button type="submit"
                    class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow focus:ring-2 focus:ring-blue-400 focus:outline-none">
                    Add Project
                </button>
                <button type="button" @click="resetForm"
                    class="px-6 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 shadow focus:ring-2 focus:ring-gray-400 focus:outline-none">
                    Reset
                </button>
            </div>
        </form>
    </div>
</template>
