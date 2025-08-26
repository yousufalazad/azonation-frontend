<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const auth = authStore;

// Form fields
const guest_name = ref('');
const about_guest = ref('');
const attendance_type_id = ref('');
const date = ref('');
const time = ref('');
const note = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedEventAttendanceId = ref(null);

// Event ID from route
const eventId = ref(route.params.id);

// Modal state
const isModalOpen = ref(false);

// Event details
const eventDetails = ref([]);
const fetchEventDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/events/event/${eventId.value}`, {}, 'GET');
        eventDetails.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching event details:', error);
        eventDetails.value = [];
    }
};

// Attendance type list
const attendanceTypeList = ref([]);
const getAttendanceTypeList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/attendance-types', {}, 'GET');
        attendanceTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching attendance types:', error);
        attendanceTypeList.value = [];
    }
};

// Event guest attendance list
const eventGuestAttendanceList = ref([]);
const getEventGuestAttendanceList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/event-guest-attendances', {}, 'GET');
        eventGuestAttendanceList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching event guest attendances:', error);
        eventGuestAttendanceList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    guest_name.value = '';
    about_guest.value = '';
    attendance_type_id.value = '';
    date.value = '';
    time.value = '';
    note.value = '';
    is_active.value = '1';
    selectedEventAttendanceId.value = null;
    isEditMode.value = false;
};

// Open modal for Add
const openAddModal = () => {
    resetForm();
    isModalOpen.value = true;
};

// Open modal for Edit
const editEventGuestAttendance = (attendance) => {
    guest_name.value = attendance.guest_name;
    about_guest.value = attendance.about_guest;
    attendance_type_id.value = attendance.attendance_type_id;
    date.value = attendance.date;
    time.value = attendance.time;
    note.value = attendance.note;
    is_active.value = attendance.is_active;
    selectedEventAttendanceId.value = attendance.id;
    isEditMode.value = true;
    isModalOpen.value = true;
};

// Submit form
const submitForm = async () => {
    const payload = {
        event_id: eventId.value,
        guest_name: guest_name.value,
        about_guest: about_guest.value,
        attendance_type_id: attendance_type_id.value,
        date: date.value,
        time: time.value,
        note: note.value,
        is_active: is_active.value
    };

    try {
        let apiUrl = '/api/event-guest-attendances';
        let method = 'POST';
        if (isEditMode.value && selectedEventAttendanceId.value) {
            apiUrl = `/api/event-guest-attendances/${selectedEventAttendanceId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this guest attendance?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);
            if (response.status) {
                await Swal.fire('Success!', `Guest attendance ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getEventGuestAttendanceList();
                resetForm();
                isModalOpen.value = false;
            } else {
                Swal.fire('Failed!', 'Failed to save guest attendance.', 'error');
            }
        }
    } catch (error) {
        console.error('Error saving guest attendance:', error);
        Swal.fire('Error!', 'Failed to save guest attendance.', 'error');
    }
};

// Delete guest attendance
const deleteEventGuestAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this guest attendance?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/event-guest-attendances/${id}`, {}, 'DELETE');
            if (response.status) {
                await Swal.fire('Deleted!', 'Guest attendance has been deleted.', 'success');
                getEventGuestAttendanceList();
            } else {
                Swal.fire('Failed!', 'Failed to delete guest attendance.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting guest attendance:', error);
        Swal.fire('Error!', 'Failed to delete guest attendance.', 'error');
    }
};

onMounted(() => {
    fetchEventDetails();
    getAttendanceTypeList();
    getEventGuestAttendanceList();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <!-- Event Info -->
        <section class="mb-6">
            <div class="bg-white shadow-md rounded-xl p-4 border">
                <h5 class="text-md  text-gray-800">
                    Name: {{ eventDetails.name }} {{ eventDetails.title }}
                    <span class="mx-2">•</span>
                    Date: {{ eventDetails.date }}
                    <span class="mx-2">•</span>
                    Time: {{ eventDetails.time }}
                </h5>
            </div>
        </section>

        <!-- Attendance Table -->
        <section class="bg-white shadow-md rounded-xl border">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                <h5 class="text-lg font-semibold text-gray-700">Guest Attendance List</h5>

                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button @click="openAddModal"
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 w-full sm:w-auto">
                        Add Guest Attendance
                    </button>
                    <button @click="router.push({ name: 'index-event' })"
                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto">
                        Back to Event List
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto p-4">
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr class="text-gray-700">
                            <th class="border px-4 py-2">SL</th>
                            <th class="border px-4 py-2">Guest Name</th>
                            <th class="border px-4 py-2">About Guest</th>
                            <th class="border px-4 py-2">Type</th>
                            <th class="border px-4 py-2">Time</th>
                            <th class="border px-4 py-2">Active</th>
                            <th class="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(attendance, index) in eventGuestAttendanceList" :key="attendance.id">
                            <td class="px-4 py-2 border">{{ index + 1 }}</td>
                            <td class="px-4 py-2 border">{{ attendance.guest_name }}</td>
                            <td class="px-4 py-2 border">{{ attendance.about_guest }}</td>
                            <td class="px-4 py-2 border">{{ attendance.attendance_types_name }}</td>
                            <td class="px-4 py-2 border">{{ attendance.time }}</td>
                            <td class="px-4 py-2 border">
                                <span :class="Number(attendance.is_active) === 0 ? 'text-red-500' : 'text-green-500'">
                                    {{ Number(attendance.is_active) === 0 ? 'No' : 'Yes' }}
                                </span>
                            </td>
                            <td class="px-4 py-2 border flex gap-2">
                                <button @click="editEventGuestAttendance(attendance)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Edit
                                </button>
                                <button @click="deleteEventGuestAttendance(attendance.id)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Modal Form -->
        <div v-if="isModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6">
            <div class="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-4 sm:p-6">

                <!-- Modal Header -->
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg sm:text-xl font-semibold">
                        {{ isEditMode ? 'Edit' : 'Add' }} Guest Attendance
                    </h3>
                    <button @click="isModalOpen = false" class="text-gray-500 hover:text-gray-700">✖</button>
                </div>

                <!-- Modal Form -->
                <form @submit.prevent="submitForm" class="grid grid-cols-1 sm:grid-cols-12 gap-4">

                    <!-- Guest Name -->
                    <div class="sm:col-span-4">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Guest Name</label>
                        <input v-model="guest_name" type="text" placeholder="Enter guest name"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 sm:py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>

                    <!-- About Guest -->
                    <div class="sm:col-span-4">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">About Guest</label>
                        <input v-model="about_guest" type="text" placeholder="About guest"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 sm:py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>

                    <!-- Attendance Type -->
                    <div class="sm:col-span-4">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Attendance
                            Type</label>
                        <select v-model="attendance_type_id"
                            class="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400">
                            <option value="">Select Type</option>
                            <option v-for="type in attendanceTypeList" :key="type.id" :value="type.id">{{ type.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Date -->
                    <div class="sm:col-span-3">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Date</label>
                        <input v-model="date" type="date"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 sm:py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>

                    <!-- Time -->
                    <div class="sm:col-span-3">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Time</label>
                        <input v-model="time" type="time"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 sm:py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>

                    <!-- Note -->
                    <div class="sm:col-span-4">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Note</label>
                        <input v-model="note" type="text" placeholder="Optional note"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 sm:py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>

                    <!-- Active -->
                    <div class="sm:col-span-2">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Active</label>
                        <select v-model="is_active"
                            class="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400">
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>

                    <!-- Action Buttons -->
                    <div class="col-span-full flex justify-end gap-3 mt-4">
                        <button type="submit"
                            class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500 w-full sm:w-auto">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm()"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 hover:bg-yellow-700 w-full sm:w-auto">
                            Reset
                        </button>
                        <button type="button" @click="isModalOpen = false"
                            class="bg-gray-500 text-white rounded-md py-2 px-4 hover:bg-gray-600 w-full sm:w-auto">
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>

    </div>
</template>

<style scoped>
.left-color-shade {
    background-color: rgba(76, 175, 80, 0.1);
}
</style>
