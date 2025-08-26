<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

const auth = authStore;
const userId = auth.user.id;


// Form Fields
const title = ref('');
const name = ref('');
const short_description = ref('');
const description = ref('');
const date = ref('');
const time = ref('');
const venue_name = ref('');
const venue_address = ref('');
const requirements = ref('');
const note = ref('');
const status = ref(0); // Default to Active (0)
const conduct_type = ref(1); // Default to In Person (1)
const eventId = route.params.id;

const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

const conductTypeList = ref([]);
const getConductTypes = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/conduct-types', {}, 'GET');
        conductTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching conduct types:', error);
        conductTypeList.value = [];
    }
};

// Fetch event details for editing
const getEventDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/events/event/${eventId}`, {}, 'GET');
        if (response.status) {
            const event = response.data;
            title.value = event.title;
            name.value = event.name;
            short_description.value = event.short_description;
            description.value = event.description;
            date.value = event.date;
            time.value = event.time;
            venue_name.value = event.venue_name;
            venue_address.value = event.venue_address;
            requirements.value = event.requirements;
            note.value = event.note;
            status.value = event.status;
            conduct_type.value = event.conduct_type;

            // Files
            images.value = (event.images || []).map((image) => ({
                id: image.id,
                file: {
                    preview: image.image_url || '',
                    name: image.file_name || '',
                },
            }));

            documents.value = (event.documents || []).map((doc) => ({
                id: doc.id,
                file: {
                    preview: doc.document_url || '',
                    name: doc.file_name || '',
                },
            }));

        }
    } catch (error) {
        console.error('Error fetching event details:', error);
        Swal.fire('Error!', 'Failed to fetch event details.', 'error');
    }
};

// Reset form fields
const resetForm = () => {
    title.value = '';
    name.value = '';
    short_description.value = '';
    description.value = '';
    date.value = '';
    time.value = '';
    venue_name.value = '';
    venue_address.value = '';
    requirements.value = '';
    note.value = '';
    status.value = 0;
    conduct_type.value = 1;

    images.value = [{ id: Date.now(), file: null }];
    documents.value = [{ id: Date.now(), file: null }];
};


// Handle File Attachments
const handleDocument = (event) => {
  file_attachments.value = event.target.files[0];
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

// Submit form (edit event)
const submitForm = async () => {
    const formData = new FormData(); // You must create this!

    // Append basic fields
    formData.append('user_id', userId);
    formData.append('title', title.value);
    formData.append('name', name.value);
    formData.append('short_description', short_description.value);
    formData.append('description', description.value);
    formData.append('date', date.value);
    formData.append('time', time.value);
    formData.append('venue_name', venue_name.value);
    formData.append('venue_address', venue_address.value);
    formData.append('requirements', requirements.value);
    formData.append('note', note.value);
    formData.append('status', status.value);
    formData.append('conduct_type', conduct_type.value);

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
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to save the changes?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.uploadProtectedApi(
                `/api/events/${eventId}`,
                formData,
                'POST', // or 'PUT' if your API expects it for updates
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (response.status) {
                Swal.fire('Success!', 'Event updated successfully.', 'success').then(() => {
                    router.push({ name: 'view-event' });
                });
            } else {
                Swal.fire('Failed!', 'Failed to update event.', 'error');
            }
        }
    } catch (error) {
        console.error('Error updating event:', error);
        Swal.fire('Error!', 'Failed to update event.', 'error');
    }
};

// Fetch event details when component is mounted
onMounted(() => {
    getEventDetails();
    getConductTypes();
});

</script>

<template>
    <div class="container mx-auto max-w-7xl mx-auto w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Edit Event</h5>
            <div>
                <button @click="$router.push({ name: 'view-event', params: { id: eventId } })"
                    class="bg-green-500 hover:bg-green-600 text-white p-2 m-2 rounded">Event View </button>

                <button @click="$router.push({ name: 'index-event' })"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                    Back to Event List
                </button>
            </div>
        </div>
        <form @submit.prevent="submitForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Same form fields as in create.vue -->
                <!-- The fields will be populated with the event's current values upon loading -->
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="title" v-model="title"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                </div>
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" v-model="name"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
            </div>
            <!-- Short Description -->
            <div class="mb-4">
                <label for="short_description" class="block text-gray-700 font-semibold mb-2">Short
                    Description</label>
                <input v-model="short_description" type="text" id="short_description"
                    class="w-full  border border-gray-300 rounded-md py-2 px-4" />
            </div>

            <!-- Description -->
            <div class="mb-4">
                <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                <input v-model="description" id="description" type="text"
                    class="w-full  border border-gray-300 rounded-md py-2 px-4" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                    <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="date" v-model="date"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
                <div>
                    <label for="time" class="block text-sm font-medium text-gray-700">Time</label>
                    <input type="time" id="time" v-model="time"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
                <div>
                    <label for="venue_name" class="block text-sm font-medium text-gray-700">Venue Name</label>
                    <input type="text" id="venue_name" v-model="venue_name"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
                <div>
                    <label for="venue_address" class="block text-sm font-medium text-gray-700">Venue Address</label>
                    <input type="text" id="venue_address" v-model="venue_address"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
                <div>
                    <label for="requirements" class="block text-sm font-medium text-gray-700">Requirements</label>
                    <input type="text" id="requirements" v-model="requirements"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
                <div>
                    <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
                    <input type="text" id="note" v-model="note"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
                <div>
                    <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" v-model="status" class="w-full  border border-gray-300 rounded-md py-2 px-4">
                        <option value="0">Active</option>
                        <option value="1">Disabled</option>
                    </select>
                </div>
                <div>
                    <label for="conduct_type" class="block text-sm font-medium text-gray-700">Conduct Type</label>
                    <select id="conduct_type" v-model="conduct_type"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4">
                        <option v-for="type in conductTypeList" :key="type.id" :value="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                </div>
            </div>
            <!-- Images Upload -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                <div class="space-y-3">
                    <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
                        <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept="image/*"
                            @change="event => handleFileChange(event, images, index)" />

                        <div v-if="file.file && file.file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
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

            <!-- Documents Upload -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
                <div class="space-y-3">
                    <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
                        <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept=".pdf,.doc,.docx"
                            @change="event => handleFileChange(event, documents, index)" />

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

            <div class="flex justify-end gap-4 mt-6">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update
                    Event</button>
                <button type="button" @click="resetForm"
                    class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Reset</button>
            </div>
        </form>
    </div>
</template>
