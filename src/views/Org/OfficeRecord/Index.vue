<!-- Office record -->
<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id; // Assuming the user ID is stored in the logged-in user
const title = ref('');
const images = ref([]); // Multiple images for upload
const document = ref(null); // Document file for upload
const description = ref(''); // This will be managed by Quill
const privacySetupId = ref(1); // Default to "Only Me"
const quillInstance = ref(null);
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
        description.value = quillInstance.value.root.innerHTML; // Sync with Quill content
    });
};

// Reset form fields
const resetForm = () => {
    title.value = '';
    images.value = [];
    document.value = null;
    quillInstance.value.root.innerHTML = ''; // Reset Quill content
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
const __submitForm = async () => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('status', privacySetupId.value);
    formData.append('_method', 'PUT');

    if (document.value) {
        formData.append('document', document.value); // Handle document upload
    }
    if (images.value.length) {
        images.value.forEach((img, index) => {
            formData.append(`images[${index}]`, img.file); // Handle multiple image upload
        });
    }

    try {
        // let apiUrl = '/api/create-office-record';
        // let method = 'POST';

        // if (isEditMode.value && selectedRecordId.value) {
        //     apiUrl = `/api/update-office-record/${selectedRecordId.value}`;
        //     method = 'PUT';
        // }

        let apiUrl = '/api/create-office-record';
        let method = 'POST';

        if (isEditMode.value && selectedRecordId.value) {
            apiUrl = `/api/update-office-record/${selectedRecordId.value}`;
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
        let method = 'POST';

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
    quillInstance.value.root.innerHTML = record.description; // Load description into Quill
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
            <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Office Record</h5>
            <form @submit.prevent="submitForm">
                <!-- Title input -->
                <div class="mb-4">
                    <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                    <input v-model="title" type="text" id="title"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Enter title" required />
                </div>

                <!-- Image input with preview and remove button -->
                <div class="mb-4">
                    <label for="images" class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                    <input @change="handleImages" type="file" id="images"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" accept="image/*" multiple />

                    <!-- Image preview -->
                    <div class="mt-3 flex flex-wrap">
                        <div v-for="(img, index) in images" :key="index" class="relative group w-32 h-32 mr-2 mb-2">
                            <img :src="img.preview" class="w-full h-full object-cover rounded-md">
                            <button @click="removeImage(index)"
                                class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                &times;
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Description Quill editor -->
                <div class="mb-4">
                    <label for="description-editor" class="block text-gray-700 font-semibold mb-2">Description</label>
                    <div id="description-editor" class="w-full border border-gray-300 rounded-md"
                        style="min-height: 150px;"></div>
                </div>

                <!-- Document input -->
                <div class="mb-4">
                    <label for="document" class="block text-gray-700 font-semibold mb-2">Upload Document (PDF)</label>
                    <input @change="handleDocument" type="file" id="document"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" accept=".pdf" />
                </div>

                <!-- Privacy setup -->
                <div class="mb-4">
                    <label class="block text-gray-700 font-semibold mb-2">Privacy Setup</label>
                    <select v-model="privacySetupId" class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="1">Only Me</option>
                        <option value="2">Public</option>
                        <option value="3">Friends</option>
                    </select>
                </div>

                <!-- Submit button -->
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md">
                    {{ isEditMode ? 'Update Record' : 'Add Record' }}
                </button>
            </form>
        </section>

        <!-- Records table -->
        <section class="mt-8">
            <h5 class="text-md font-semibold mb-4">Office Records List</h5>
            <table class="w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 px-4 py-2">Title</th>
                        <th class="border border-gray-300 px-4 py-2">Description</th>
                        <th class="border border-gray-300 px-4 py-2">Document</th>
                        <th class="border border-gray-300 px-4 py-2">Images</th>
                        <th class="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="record in recordList" :key="record.id">
                        <td class="border border-gray-300 px-4 py-2">{{ record.title }}</td>
                        <td class="border border-gray-300 px-4 py-2" v-html="sanitize(record.description)"></td>
                        <td class="border border-gray-300 px-4 py-2 text-center">
                            <button @click="viewDocument(record)" class="bg-blue-500 text-white px-2 py-1 rounded-md">
                                View Document
                            </button>
                        </td>
                        <!-- <td class="border border-gray-300 px-4 py-2 text-center">
                            <button @click="viewImages(record)" class="bg-blue-500 text-white px-2 py-1 rounded-md">
                                View Images
                            </button>
                        </td> -->
                        <!-- View Images -->
                        <td class="border border-gray-300 p-2">
                            <div v-if="record.images && record.images.length">
                                <!-- Display only one image -->
                                <!-- <img :src="`${baseURL}${record.images[0].image}`" alt="Image"
                                    class="rounded-md w-20 h-20 object-cover mr-2" /> -->

                                <!-- Show 'View All' button if there are multiple images -->
                                <button v-if="record.images.length > 0" @click="viewImages(record)"
                                    class="bg-green-500 text-white rounded-md py-1 px-3 hover:bg-green-600 transition">
                                    View Image
                                </button>
                            </div>
                            <div v-else>
                            </div>
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-center">
                            <button @click="editRecord(record)" class="bg-green-500 text-white px-2 py-1 rounded-md">
                                Edit
                            </button>
                            <button @click="deleteRecord(record.id)"
                                class="bg-red-500 text-white px-2 py-1 rounded-md ml-2">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style scoped>
/* Add hover effect for delete button on image preview */
.group:hover .group-hover\:opacity-100 {
    opacity: 1;
}
</style>
