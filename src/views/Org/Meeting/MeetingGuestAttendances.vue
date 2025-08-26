<!-- Meeting Guest Attendance -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const auth = authStore;

const guest_name = ref('');
const about_guest = ref('');
const attendance_type_id = ref("");
const date = ref('');
const time = ref('');
const note = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedMeetingAttendanceId = ref(null);

// Selected Meeting ID
const meetingId = ref(route.params.id);
const meetingDetails = ref([]);
const attendanceTypeList = ref([]);
const meetingGuestAttendanceList = ref([]);
const isModalOpen = ref(false);

// Fetch meeting details on mount
const fetchMeetingDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/meetings/${meetingId.value}`, {}, 'GET');
        meetingDetails.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching meetings:', error);
        meetingDetails.value = [];
    }
};

// Fetch attendance type list
const getAttendanceTypeList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/attendance-types', {}, 'GET');
        attendanceTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching attendance types:', error);
        attendanceTypeList.value = [];
    }
};

// Fetch guest attendance list
const getMeetingGuestAttendanceList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/meeting-guest-attendances', {}, 'GET');
        meetingGuestAttendanceList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching meeting guest attendances:', error);
        meetingGuestAttendanceList.value = [];
    }
};

// Reset form
const resetForm = () => {
    guest_name.value = '';
    about_guest.value = '';
    attendance_type_id.value = "";
    date.value = '';
    time.value = '';
    note.value = '';
    is_active.value = '1';
    selectedMeetingAttendanceId.value = null;
    isEditMode.value = false;
};

// Open modal
const openModal = () => {
    resetForm();
    isModalOpen.value = true;
};

// Close modal
const closeModal = () => {
    resetForm();
    isModalOpen.value = false;
};

// Add or update guest attendance
const submitForm = async () => {
    const payload = {
        meeting_id: meetingId.value,
        guest_name: guest_name.value,
        about_guest: about_guest.value,
        attendance_type_id: attendance_type_id.value,
        date: date.value,
        time: time.value,
        note: note.value,
        is_active: is_active.value
    };
    try {
        let apiUrl = '/api/meeting-guest-attendances';
        let method = 'POST';
        if (isEditMode.value && selectedMeetingAttendanceId.value) {
            apiUrl = `/api/meeting-guest-attendances/${selectedMeetingAttendanceId.value}`;
            method = 'PUT';
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this meeting guest attendance?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Meeting guest attendance ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getMeetingGuestAttendanceList();
                closeModal();
            } else {
                Swal.fire('Failed!', 'Failed to save meeting guest attendance.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} meeting guest attendance:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} meeting guest attendance.`, 'error');
    }
};

// Edit guest attendance
const editMeetingAttendance = (attendance) => {
    guest_name.value = attendance.guest_name;
    about_guest.value = attendance.about_guest;
    attendance_type_id.value = attendance.attendance_type_id;
    date.value = attendance.date;
    time.value = attendance.time;
    note.value = attendance.note;
    is_active.value = attendance.is_active;
    selectedMeetingAttendanceId.value = attendance.id;
    isEditMode.value = true;
    isModalOpen.value = true;
};

// Delete guest attendance
const deleteMeetingAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this meeting guest attendance?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/meeting-guest-attendances/${id}`, {}, 'DELETE');
            if (response.status) {
                await Swal.fire('Deleted!', 'Meeting guest attendance has been deleted.', 'success');
                getMeetingGuestAttendanceList();
            } else {
                Swal.fire('Failed!', 'Failed to delete meeting guest attendance.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting meeting guest attendance:', error);
        Swal.fire('Error!', 'Failed to delete meeting guest attendance.', 'error');
    }
};

// On mount
onMounted(() => {
    fetchMeetingDetails();
    getAttendanceTypeList();
    getMeetingGuestAttendanceList();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <!-- Meeting Info -->
        <section class="mb-5">
            <div class="bg-white shadow rounded-lg p-4 border">
                <h5 class="text-md  text-gray-800">
                    Name: {{ meetingDetails.name }} - Date: {{ meetingDetails.date }} - Time:
                    {{ meetingDetails.time }}
                </h5>
            </div>
        </section>

        <!-- Guest Attendance List -->
        <section class="bg-white shadow-md rounded-xl border">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">

                <!-- Title -->
                <h5 class="text-md font-semibold text-gray-800">
                    Guest Attendance List
                </h5>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button @click="openModal"
                        class="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-500 transition">
                        Add Guest Attendance
                    </button>
                    <button @click="router.push({ name: 'index-meeting' })"
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
                        Back to Meeting List
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto p-4">
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="border px-4 py-2">SL</th>
                            <th class="py-2 px-4 border">Guest Name</th>
                            <th class="py-2 px-4 border">About Guest</th>
                            <th class="py-2 px-4 border">Attendance Type</th>
                            <th class="py-2 px-4 border">Attendance Time</th>
                            <th class="py-2 px-4 border">Active</th>
                            <th class="py-2 px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(attendance, index) in meetingGuestAttendanceList" :key="attendance.id"
                            class="hover:bg-gray-50 transition">
                            <td class="py-2 px-4 border">{{ index + 1 }}</td>
                            <td class="py-2 px-4 border">{{ attendance.guest_name }}</td>
                            <td class="py-2 px-4 border">{{ attendance.about_guest }}</td>
                            <td class="py-2 px-4 border">
                                {{ attendance.attendance_types_name }}
                            </td>
                            <td class="py-2 px-4 border">{{ attendance.time }}</td>
                            <td class="py-2 px-4 border">
                                <span :class="Number(attendance.is_active) === 0
                                        ? 'text-red-500 font-semibold'
                                        : 'text-green-600 font-semibold'
                                    ">
                                    {{ Number(attendance.is_active) === 0 ? "No" : "Yes" }}
                                </span>
                            </td>
                            <td class="py-2 px-4 border flex gap-2">
                                <button @click="editMeetingAttendance(attendance)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Edit
                                </button>
                                <button @click="deleteMeetingAttendance(attendance.id)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh] border">
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">
                        {{ isEditMode ? "Edit" : "Add" }} Meeting Guest Attendance
                    </h3>
                    <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
                        ✖
                    </button>
                </div>

                <form @submit.prevent="submitForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Guest Name -->
                    <div>
                        <label for="guest_name" class="block text-gray-700 font-semibold mb-1">Guest Name</label>
                        <input v-model="guest_name" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring focus:ring-green-200" />
                    </div>

                    <!-- About Guest -->
                    <div>
                        <label for="about_guest" class="block text-gray-700 font-semibold mb-1">About Guest</label>
                        <input v-model="about_guest" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring focus:ring-green-200" />
                    </div>

                    <!-- Attendance Type -->
                    <div>
                        <label for="attendance_type_id" class="block text-gray-700 font-semibold mb-1">Type</label>
                        <select v-model="attendance_type_id" id="attendance_type_id"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring focus:ring-green-200">
                            <option value="">Select Attendance Type</option>
                            <option v-for="attendanceType in attendanceTypeList" :key="attendanceType.id"
                                :value="attendanceType.id">
                                {{ attendanceType.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Date -->
                    <div>
                        <label for="date" class="block text-gray-700 font-semibold mb-1">Date</label>
                        <input v-model="date" type="date"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring focus:ring-green-200" />
                    </div>

                    <!-- Time -->
                    <div>
                        <label for="time" class="block text-gray-700 font-semibold mb-1">Time</label>
                        <input v-model="time" type="time"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring focus:ring-green-200" />
                    </div>

                    <!-- Note -->
                    <div>
                        <label for="note" class="block text-gray-700 font-semibold mb-1">Note</label>
                        <input v-model="note" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring focus:ring-green-200" />
                    </div>

                    <!-- Active -->
                    <div>
                        <label for="is_active" class="block text-gray-700 font-semibold mb-1">Active</label>
                        <select v-model="is_active" id="is_active"
                            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring focus:ring-green-200">
                            <option value="">Select</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>

                    <!-- Buttons -->
                    <div class="col-span-full flex justify-end gap-3 mt-4">
                        <button type="submit"
                            class="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-500 transition">
                            {{ isEditMode ? "Update" : "Add" }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 transition">
                            Reset
                        </button>
                        <button type="button" @click="closeModal"
                            class="bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition">
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
