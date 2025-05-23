<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const route = useRoute();
const router = useRouter();
const record = ref([]);

// Selected Record ID
const selectedRecordId = ref(route.params.id);

// Fetch Event details on mount
const fetchEventDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/events/event/${selectedRecordId.value}`, {}, 'GET');
        record.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching events:', error);
        record.value = [];
    }
};

// Fetch the Event details on component mount
onMounted(() => {
    fetchEventDetails();
});
</script>
<template>
    <div class="container mx-auto max-w-7xl w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">View Event</h5>
            <div>
                <button @click="$router.push({ name: 'edit-event', params: { id: record.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white p-2 m-2 rounded">Event Edit </button>

                <button @click="$router.push({ name: 'index-event' })"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                    Back to Event List
                </button>
            </div>
        </div>

        <!-- Event Details Table -->
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <tbody class="text-gray-600 text-md font-medium">
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Event ID</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.id }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Title</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.title }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Name</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.name }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Short Description</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.short_description }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Description</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.description }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Date</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.date }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Time</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.time }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Venue Name</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.venue_name }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Venue Address</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.venue_address }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Requirements</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.requirements }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Note</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.note }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Status</td>
                        <td class="p-2">:</td>
                        <td class="p-2">
                            <span :class="record.status === 0 ? 'text-green-500' : 'text-red-500'">
                                {{ record.status === 0 ? 'Active' : 'Disabled' }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Conduct Type</td>
                        <td class="p-2">:</td>
                        <td class="p-2">
                            <span :class="record.conduct_type === 1 ? 'text-blue-500' : 'text-yellow-500'">
                                {{ record.conduct_type === 1 ? 'In Person' : 'Online' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>