<script setup>
import { ref } from 'vue';
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
};

// Submit form (create event)
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
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to add this event?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi('/api/events', payload, 'POST');

            if (response.status) {
                Swal.fire('Success!', 'Event added successfully.', 'success').then(() => {
                    // Redirect to event list
                    router.push({ name: 'index-event' });
                });
            } else {
                Swal.fire('Failed!', 'Failed to added event.', 'error');
            } 
        }
    } catch (error) {
        console.error('Error adding event:', error);
        Swal.fire('Error!', 'Failed to add event.', 'error');
    }
};
</script>

<template>
    <div class="container mx-auto max-w-7xl mx-auto w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Add New Event</h5>
            <button @click="$router.push({ name: 'index-event' })"
                class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                Back to Event List
            </button>
        </div>

        <form @submit.prevent="submitForm">

            <!-- Date and Time -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full  border border-gray-300 rounded-md py-2 px-4"
                    required />
                </div>
                <div>
                    <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
                <input v-model="name" type="text" id="name" class="w-full  border border-gray-300 rounded-md py-2 px-4"
                    required />
                </div>
            </div>
            

            <!-- Short Description -->
            <div class="mb-4">
                <label for="short_description" class="block text-gray-700 font-semibold mb-2">Short Description</label>
                <input v-model="short_description" type="text" id="short_description"
                    class="w-full  border border-gray-300 rounded-md py-2 px-4" />
            </div>

            <!-- Description -->
            <div class="mb-4">
                <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                <input v-model="description" id="description" type="text"
                    class="w-full  border border-gray-300 rounded-md py-2 px-4" />
            </div>

            <!-- Date and Time -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
                    <input v-model="date" type="date" id="date"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                </div>
                <div>
                    <label for="time" class="block text-gray-700 font-semibold mb-2">Time</label>
                    <input v-model="time" type="time" id="time"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                </div>
            </div>

            <!-- Venue -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="venue_name" class="block text-gray-700 font-semibold mb-2">Venue Name</label>
                    <input v-model="venue_name" type="text" id="venue_name"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
                <div>
                    <label for="venue_address" class="block text-gray-700 font-semibold mb-2">Venue Address</label>
                    <input v-model="venue_address" type="text" id="venue_address"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
            </div>

            <!-- Requirements and Note -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="requirements" class="block text-gray-700 font-semibold mb-2">Requirements</label>
                    <input v-model="requirements" type="text" id="requirements"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
                <div>
                    <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
                    <input v-model="note" type="text" id="note"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" />
                </div>
            </div>

            <!-- Status and Conduct Type -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
                    <select v-model="status" id="status" class="w-full  border border-gray-300 rounded-md py-2 px-4">
                        <option value="0">Active</option>
                        <option value="1">Disabled</option>
                    </select>
                </div>
                <div>
                    <label for="conduct_type" class="block text-gray-700 font-semibold mb-2">Conduct Type</label>
                    <select v-model="conduct_type" id="conduct_type"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4">
                        <option value="1">In Person</option>
                        <option value="2">Online</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end gap-4">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Event</button>
                <button type="button" @click="resetForm" class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Reset</button>
            </div>
        </form>
    </div>
</template>