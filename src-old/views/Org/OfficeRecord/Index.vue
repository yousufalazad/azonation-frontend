<!-- Office record -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id; // Assuming the user ID is stored in the logged-in user
const title = ref('');
const images = ref([]); // Multiple images for upload
const document = ref(null); // Document file for upload
const description = ref(''); // Plain textarea for description
const privacySetupId = ref(1); // Default to "Only Me"
const isEditMode = ref(false); // Toggle between add and edit modes
const selectedRecordId = ref(null); // Store the ID of the record to edit
const recordList = ref([]); // Data list for the table
const baseURL = 'http://localhost:8000/storage/'; // Adjust baseURL as per your setup

// Fetch list of records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-office-records', {}, 'GET');
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

// Reset form fields
const resetForm = () => {
    title.value = '';
    images.value = [];
    document.value = null;
    description.value = ''; // Reset description text
    privacySetupId.value = 1; // Default to "Only Me"
    isEditMode.value = false;
    selectedRecordId.value = null;
};

// Handle document file change
const handleDocument = (event) => {
    document.value = event.target.files[0]; // Store the uploaded document
};

// Handle multiple image file change and show preview
const handleImages = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    uploadedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            images.value.push({
                file,
                preview: e.target.result
            });
        };
        reader.readAsDataURL(file);
    });
};

// Remove image from the list
const removeImage = (index) => {
    images.value.splice(index, 1);
};

// Add or update a record
const submitForm = async () => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('status', privacySetupId.value);

    if (document.value) {
        formData.append('document', document.value); // Handle document upload
    }
    if (images.value.length) {
        images.value.forEach((img, index) => {
            formData.append(`images[${index}]`, img.file); // Handle multiple image upload
        });
    }

    // Add _method='PUT' only if editing
    if (isEditMode.value) {
        formData.append('_method', 'PUT');
    }

    try {
        let apiUrl = '/api/create-office-record';

        if (isEditMode.value && selectedRecordId.value) {
            apiUrl = `/api/update-office-record/${selectedRecordId.value}`;
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
            const response = await auth.uploadProtectedApi(apiUrl, formData, 'POST', {
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
    description.value = record.description; // Load description text
    privacySetupId.value = record.status;
    selectedRecordId.value = record.id;
    isEditMode.value = true; // Switch to edit mode
};

// View PDF document
const viewDocument = (record) => {
    if (record.document) {
        window.open(`${baseURL}${record.document}`, '_blank'); // Open PDF in a new tab
    } else {
        Swal.fire('No Document', 'This record does not have a document attached.', 'info');
    }
};

// View Images
const viewImages = (record) => {
    if (record.images && record.images.length) {
        // Open modal to view multiple images
        Swal.fire({
            title: 'Images',
            html: record.images.map((img) => `<img src="${baseURL}${img.image}" style="width: 100%; max-width: 300px; margin: 5px;">`).join(''),
            showCloseButton: true,
            focusConfirm: false,
        });
    } else {
        Swal.fire('No Images', 'This record does not have images attached.', 'info');
    }
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
            const response = await auth.fetchProtectedApi(`/api/delete-office-record/${id}`, {}, 'DELETE');

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

// Fetch records when component is mounted
onMounted(() => {
    getRecords();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Record List</h5>
                <button @click="$router.push({ name: 'create-record' })"
                    class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
                    Add Record
                </button>
            </div>
            <div class="overflow-x-auto">

                <table class="w-full border-collapse border border-gray-200 rounded-md overflow-hidden">
                    <thead>
                        <tr class="bg-gray-200 text-left">
                            <th class="p-3 border border-gray-200">Title</th>
                            <th class="p-3 border border-gray-200">Description</th>
                            <th class="p-3 border border-gray-200">Privacy</th>
                            <th class="p-3 border border-gray-200">Document</th>
                            <th class="p-3 border border-gray-200">Images</th>
                            <th class="p-3 border border-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="record in recordList" :key="record.id" class="border border-gray-200">
                            <td class="p-3">{{ record.title }}</td>
                            <td class="p-3" v-html="sanitize(record.description)"></td>
                            <td class="p-3">
                                <span v-if="record.status === 1">Only Me</span>
                                <span v-else-if="record.status === 2">Public</span>
                                <span v-else-if="record.status === 3">Selected Users</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-center">
                                <div v-if="record.documents && record.documents.length">
                                    <button @click="viewDocument(record)"
                                        class="bg-blue-500 text-white px-2 py-1 rounded-md">
                                        View Document
                                    </button>
                                </div>
                                <div v-else>
                                </div>
                            </td>
                            <!-- View Images -->
                            <td class="border border-gray-300 p-2">
                                <div v-if="record.images && record.images.length">
                                    <button v-if="record.images.length > 0" @click="viewImages(record)"
                                        class="bg-green-500 text-white rounded-md py-1 px-3 hover:bg-green-600 transition">
                                        View Image
                                    </button>
                                </div>
                                <div v-else>
                                </div>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-center">
                                <!-- <button @click="editRecord(record)" class="bg-green-500 text-white px-2 py-1 rounded-md">
                                Edit
                            </button> -->
                                <button @click="$router.push({ name: 'edit-record', params: { id: record.id } })"
                                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                                <button @click="deleteRecord(record.id)"
                                    class="bg-red-500 text-white px-2 py-1 rounded-md ml-2">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>
