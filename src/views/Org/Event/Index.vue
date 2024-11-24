<!-- Event Index.vue -->
<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const userId = auth.user.id;
const recordList = ref([]);

const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/get-events/${userId}`, {}, 'GET');
        recordList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching events:', error);
    }
};

// Delete a meeting
const deleteRecord = async (eventId) => {
    try {
        const confirmed = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (confirmed.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-event/${eventId}`, {}, 'DELETE');
            if (response.status) {
                recordList.value = recordList.value.filter(record => record.id !== eventId);
                Swal.fire('Deleted!', 'Meeting has been deleted.', 'success');
            } else {
                Swal.fire('Error!', 'Failed to delete meeting.', 'error');
            }
        }
    } catch (error) {
        Swal.fire('Error!', 'Failed to delete meeting.', 'error');
    }
};

onMounted(() => getRecords());
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Event List</h5>
                <div>
                    <button @click="$router.push({ name: 'create-event' })"
                        class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
                        Add Event
                    </button>
                    <button @click="$router.push({ name: 'index-event-summary' })"
                        class="bg-blue-500 text-white font-semibold py-2 px-2 mx-2 rounded-md">
                        Event Summary List
                    </button>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th class="border px-4 py-2"> ID</th>
                            <th class="border px-4 py-2">Title</th>
                            <th class="border px-4 py-2">Name</th>
                            <!-- <th class="border px-4 py-2">Short Description</th>
                            <th class="border px-4 py-2">Description</th> -->
                            <th class="border px-4 py-2">Date</th>
                            <th class="border px-4 py-2">Time</th>
                            <th class="border px-4 py-2">Venue</th>
                            <!-- <th class="border px-4 py-2">Venue Address</th>
                            <th class="border px-4 py-2">Note</th> -->
                            <th class="border px-4 py-2">Status</th>
                            <th class="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(record, index) in recordList" :key="index">
                            <td class="border px-4 py-2">{{ record.user_id }}</td>
                            <td class="border px-4 py-2">{{ record.title }}</td>
                            <td class="border px-4 py-2">{{ record.name }}</td>
                            <!-- <td class="border px-4 py-2">{{ record.short_description }}</td>
                            <td class="border px-4 py-2">{{ record.description }}</td> -->
                            <td class="border px-4 py-2">{{ record.date }}</td>
                            <td class="border px-4 py-2">{{ record.time }}</td>
                            <td class="border px-4 py-2">{{ record.venue_name }}</td>
                            <!-- <td class="border px-4 py-2">{{ record.venue_address }}</td>
                            <td class="border px-4 py-2">{{ record.note }}</td> -->
                            <td class="border px-4 py-2">{{ record.status === 0 ? 'Active' : 'Disable' }}</td>
                            <td class="border px-1 py-2 w-50">
                                <button
                                    @click="$router.push({ name: 'create-event-summary', params: { eventId: record.id } })"
                                    class="bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 m-2 rounded">Event Summary
                                </button>

                                <button @click="$router.push({ name: 'event-attendances', params: { id: record.id } })"
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 m-2 rounded">Attendances
                                </button>

                                <button @click="$router.push({ name: 'edit-event', params: { id: record.id } })"
                                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                                <button @click="$router.push({ name: 'view-event', params: { id: record.id } })"
                                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                                <button @click="deleteRecord(record.id)"
                                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>
