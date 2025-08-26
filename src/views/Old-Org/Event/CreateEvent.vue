<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

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

// State Management
const isEditMode = ref(false);
const selectedRecordId = ref(null);
const recordList = ref([]);

// Fetch list of events
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/events`, {}, 'GET');

        if (response.status) {
            recordList.value = response.data;
            console.log(response.data);
        } else {
            recordList.value = [];
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        recordList.value = [];
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
    isEditMode.value = false;
    selectedRecordId.value = null;
};

// Add or update event
const submitForm = async () => {
    const payload = {
        user_id: userId,
        title: title.value,
        name: name.value,
        short_description: short_description.value,
        description: description.value,
        date: date.value,
        time: time.value,
        venue_name: venue_name.value,
        venue_address: venue_address.value,
        requirements: requirements.value,
        note: note.value,
        status: status.value,
        conduct_type: conduct_type.value,
    };

    try {
        let apiUrl = '/api/events';
        let method = 'POST';

        if (isEditMode.value && selectedRecordId.value) {
            apiUrl = `/api/events/${selectedRecordId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this event?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Event ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getRecords();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save event.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} event:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} event.`, 'error');
    }
};

// Edit record
const editRecord = (record) => {
    title.value = record.title;
    name.value = record.name;
    short_description.value = record.short_description;
    description.value = record.description;
    date.value = record.date;
    time.value = record.time;
    venue_name.value = record.venue_name;
    venue_address.value = record.venue_address;
    requirements.value = record.requirements;
    note.value = record.note;
    status.value = record.status;
    conduct_type.value = record.conduct_type;
    selectedRecordId.value = record.id;
    isEditMode.value = true;
};

// Delete record
const deleteRecord = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this event?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/events/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Event has been deleted.', 'success');
                getRecords();
            } else {
                Swal.fire('Failed!', 'Failed to delete event.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        Swal.fire('Error!', 'Failed to delete event.', 'error');
    }
};

// Fetch records on mount
onMounted(() => {
    getRecords();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <div>
                    <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Event</h5>
                </div>
            </div>
            <form @submit.prevent="submitForm">
                <!-- Title -->
                <div class="mb-4">
                    <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                    <input v-model="title" type="text" id="title"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                </div>

                <!-- Name -->
                <div class="mb-4">
                    <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
                    <input v-model="name" type="text" id="name"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                </div>

                <!-- Short Description -->
                <div class="mb-4">
                    <label for="short_description" class="block text-gray-700 font-semibold mb-2">Short
                        Description</label>
                    <textarea v-model="short_description" id="short_description"
                        class="w-full border border-gray-300 rounded-md py-2 px-4"></textarea>
                </div>

                <!-- Description -->
                <div class="mb-4">
                    <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                    <textarea v-model="description" id="description"
                        class="w-full border border-gray-300 rounded-md py-2 px-4"></textarea>
                </div>

                <!-- Date -->
                <div class="mb-4">
                    <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
                    <input v-model="date" type="date" id="date"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" />
                </div>

                <!-- Time -->
                <div class="mb-4">
                    <label for="time" class="block text-gray-700 font-semibold mb-2">Time</label>
                    <input v-model="time" type="time" id="time"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" />
                </div>

                <!-- Venue Name -->
                <div class="mb-4">
                    <label for="venue_name" class="block text-gray-700 font-semibold mb-2">Venue Name</label>
                    <input v-model="venue_name" type="text" id="venue_name"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" />
                </div>

                <!-- Venue Address -->
                <div class="mb-4">
                    <label for="venue_address" class="block text-gray-700 font-semibold mb-2">Venue Address</label>
                    <input v-model="venue_address" type="text" id="venue_address"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" />
                </div>

                <!-- Requirements -->
                <div class="mb-4">
                    <label for="requirements" class="block text-gray-700 font-semibold mb-2">Requirements</label>
                    <input v-model="requirements" type="text" id="requirements"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" />
                </div>

                <!-- Note -->
                <div class="mb-4">
                    <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
                    <input v-model="note" type="text" id="note"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" />
                </div>

                <!-- Status -->
                <div class="mb-4">
                    <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
                    <select v-model="status" id="status" class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="0">Active</option>
                        <option value="1">Disable</option>
                    </select>
                </div>

                <!-- Conduct Type -->
                <div class="mb-4">
                    <label for="conduct_type" class="block text-gray-700 font-semibold mb-2">Conduct Type</label>
                    <select v-model="conduct_type" id="conduct_type"
                        class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="1">In Person</option>
                        <option value="2">Online</option>
                    </select>
                </div>

                <button type="submit" class="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md">
                    {{ isEditMode ? 'Update' : 'Add' }} Event
                </button>
            </form>
        </section>

        <section>
            <h5 class="text-lg font-semibold mb-4">Event List</h5>

            <div class="overflow-x-auto">
                <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th class="border px-4 py-2"> ID</th>
                            <th class="border px-4 py-2">Title</th>
                            <th class="border px-4 py-2">Name</th>
                            <th class="border px-4 py-2">Short Description</th>
                            <th class="border px-4 py-2">Description</th>
                            <th class="border px-4 py-2">Date</th>
                            <th class="border px-4 py-2">Time</th>
                            <th class="border px-4 py-2">Venue</th>
                            <th class="border px-4 py-2">Venue Address</th>
                            <th class="border px-4 py-2">Note</th>
                            <th class="border px-4 py-2">Status</th>
                            <th class="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 text-md font-medium">
                        <tr v-for="(record, index) in recordList" :key="index"
                            class="border-b border-gray-200 hover:bg-gray-100 transition duration-200">
                            <td class="border px-4 py-2">{{ record.user_id }}</td>
                            <td class="border px-4 py-2">{{ record.title }}</td>
                            <td class="border px-4 py-2">{{ record.name }}</td>
                            <td class="border px-4 py-2">{{ record.short_description }}</td>
                            <td class="border px-4 py-2">{{ record.description }}</td>
                            <td class="border px-4 py-2">{{ record.date }}</td>
                            <td class="border px-4 py-2">{{ record.time }}</td>
                            <td class="border px-4 py-2">{{ record.venue_name }}</td>
                            <td class="border px-4 py-2">{{ record.venue_address }}</td>
                            <td class="border px-4 py-2">{{ record.note }}</td>
                            <td class="border px-4 py-2">{{ record.status === 0 ? 'Active' : 'Disable' }}</td>
                            <td class="border px-4 py-2">
                                <button @click="editRecord(record)"
                                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 m-2 rounded">Edit</button>
                                <button @click="deleteRecord(record.id)"
                                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  padding: 12px;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

td {
  border-bottom: 1px solid #ddd;
}

button {
  margin-right: 5px;
}
</style>
