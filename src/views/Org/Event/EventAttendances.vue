<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();

const auth = authStore;
const user_id = ref("");
const attendance_type_id = ref("");
// const date = ref('');
const time = ref('');
const note = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedEventAttendanceId = ref(null);
// Selected EventID
const eventId = ref(route.params.id);


const userList = ref([]);
// Fetch userList
const getOrgUserList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/project-attendances/org-user-list', {}, 'GET');
        userList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        userList.value = [];
    }
};

const attendanceTypeList = ref([]);
// Fetch getAttendanceTypeList
const getAttendanceTypeList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/attendance-types', {}, 'GET');
        attendanceTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        attendanceTypeList.value = [];
    }
};

const eventAttendanceList = ref([]);
// Fetch geteventAttendanceList
const getEventAttendanceList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/event-attendances', {}, 'GET');
        eventAttendanceList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        eventAttendanceList.value = [];
    }
};

const eventDetails = ref([]);
// Fetch Eventdetails on mount
const fetchEventDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/events/event/${eventId.value}`, {}, 'GET');
        eventDetails.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching events:', error);
        eventDetails.value = [];
    }
};


// Reset form fields
const resetForm = () => {
    user_id.value = "";
    attendance_type_id.value = "";
    // date.value = '';
    time.value = '';
    note.value = '';
    is_active.value = '1';
    selectedEventAttendanceId.value = null;
    isEditMode.value = false;
};

// Add or update eventAttendance
const submitForm = async () => {
    const payload = {
        event_id: eventId.value,
        user_id: user_id.value,
        attendance_type_id: attendance_type_id.value,
        // date: date.value,
        time: time.value,
        note: note.value,
        is_active: is_active.value
    };
    try {
        let apiUrl = '/api/event-attendances';
        let method = 'POST';
        if (isEditMode.value && selectedEventAttendanceId.value) {
            apiUrl = `/api/event-attendances/${selectedEventAttendanceId.value}`;
            method = 'PUT';
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this event attendance?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Event attendance ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getEventAttendanceList();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save Event attendance.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} Event attendance:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} Event attendance.`, 'error');
    }
};

// Edit eventAttendance
const editEventAttendance = (eventAttendance) => {
    user_id.value = eventAttendance.user_id;
    attendance_type_id.value = eventAttendance.attendance_type_id;
    // date.value = eventAttendance.date;
    time.value = eventAttendance.time;
    note.value = eventAttendance.note;
    is_active.value = eventAttendance.is_active;
    selectedEventAttendanceId.value = eventAttendance.id;
    isEditMode.value = true;
};

// Delete eventAttendance
const deleteEventAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this Event attendance?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/event-attendances/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'event attendance has been deleted.', 'success');
                getEventAttendanceList();
            } else {
                Swal.fire('Failed!', 'Failed to delete event attendance.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting event attendance:', error);
        Swal.fire('Error!', 'Failed to delete event attendance.', 'error');
    }
};

// Fetch Dialing Codes on mount
onMounted(() => {
    getOrgUserList();
    getAttendanceTypeList();
    getEventAttendanceList();
    fetchEventDetails();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-bold mt-2">Name:{{ eventDetails.name }} - Time:{{ eventDetails.time }}</h5>
            </div>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Event Attendance</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="user_id" class="block text-gray-700 font-semibold mb-2">User Name</label>
                        <select v-model="user_id" id="user_id" class="w-full border border-gray-300 rounded-md p-2"
                            required>
                            <option value="">Select User</option>
                            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.first_name }} {{ user.last_name }}</option>
                        </select>
                    </div>
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="attendance_type_id" class="block text-gray-700 font-semibold mb-2">Type Name</label>
                        <select v-model="attendance_type_id" id="attendance_type_id"
                            class="w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select Attendance Type</option>
                            <option v-for="attendanceType in attendanceTypeList" :key="attendanceType.id" :value="attendanceType.id">
                                {{ attendanceType.name }}</option>
                        </select>
                    </div>
                    <!-- date -->
                    <!-- <div class="col-span-2 mb-4">
                        <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
                        <input v-model="date" type="date" class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div> -->
                    <!-- time -->
                    <div class="col-span-2 mb-4">
                        <label for="time" class="block text-gray-700 font-semibold mb-2">Time</label>
                        <input v-model="time" type="time" class="w-full border border-gray-300 rounded-md py-2 px-4"/>
                    </div>
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
                        <input v-model="note" type="text" class="w-full border border-gray-300 rounded-md py-2 px-4"/>
                    </div>
                    <!-- is_active -->
                    <div class="col-span-3 mb-4">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active" class="w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select is Active</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                    <!-- Submit button -->
                    <div class="col-span-5 mb-4 flex items-end">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 mx-4 hover:bg-yellow-700">
                            Reset
                        </button>
                        <button type="button" @click="router.push({ name: 'index-event' })" class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">
                            Back to Event List
                        </button>
                    </div>
                </div>
            </form>
        </section>
        <!-- country list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Event Attendance List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">User</th>
                        <th class="py-2 px-4 border border-gray-300">Attendance Type</th>
                        <th class="py-2 px-4 border border-gray-300">Attendance Time</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(eventAttendance, index) in eventAttendanceList" :key="eventAttendance.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ eventAttendance.user_name }}</td>
                        <td class="py-2 px-4 border">{{ eventAttendance.attendance_types_name }}</td>
                        <td class="py-2 px-4 border">{{ eventAttendance.time }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="Number(eventAttendance.is_active) === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ Number(eventAttendance.is_active) === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editEventAttendance(eventAttendance)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteEventAttendance(eventAttendance.id)"
                                class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style scoped>
.left-color-shade {
    background-color: rgba(76, 175, 80, 0.1);
    /* Slightly green background */
}
</style>