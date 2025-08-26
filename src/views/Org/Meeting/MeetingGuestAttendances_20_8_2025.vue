<!-- meeting g att -->

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

const attendanceTypeList = ref([]);
// Fetch attendance type list
const getAttendanceTypeList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/attendance-types', {}, 'GET');
        attendanceTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        attendanceTypeList.value = [];
    }
};

const meetingGuestAttendanceList = ref([]);
// Fetch getMeetingGuestAttendanceList
const getMeetingGuestAttendanceList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/meeting-guest-attendances', {}, 'GET');
        meetingGuestAttendanceList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        meetingGuestAttendanceList.value = [];
    }
};

// Reset form fields
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

// Add or update meetingGuestAttendance
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
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this meeting guest attendances?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `meeting guest attendances ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getMeetingGuestAttendanceList();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save meeting guest attendances.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} meeting guest attendances:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} meeting guest attendances.`, 'error');
    }
};

// Edit meetingGuestAttendance
const editMeetingAttendance = (meetingGuestAttendance) => {
    guest_name.value = meetingGuestAttendance.guest_name;
    about_guest.value = meetingGuestAttendance.about_guest;
    attendance_type_id.value = meetingGuestAttendance.attendance_type_id;
    date.value = meetingGuestAttendance.date;
    time.value = meetingGuestAttendance.time;
    note.value = meetingGuestAttendance.note;
    is_active.value = meetingGuestAttendance.is_active;
    selectedMeetingAttendanceId.value = meetingGuestAttendance.id;
    isEditMode.value = true;
};

// Delete meetingGuestAttendance
const deleteMeetingAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this meeting guest attendances?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/meeting-guest-attendances/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'meeting guest attendances has been deleted.', 'success');
                getMeetingGuestAttendanceList();
            } else {
                Swal.fire('Failed!', 'Failed to delete meeting guest attendances.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting meeting guest attendances:', error);
        Swal.fire('Error!', 'Failed to delete meeting guest attendances.', 'error');
    }
};


// Fetch Dialing Codes on mount
onMounted(() => {
    fetchMeetingDetails();
    getAttendanceTypeList();
    getMeetingGuestAttendanceList();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-bold mt-2">Name:{{ meetingDetails.name }} - Date:{{ meetingDetails.date }} -
                    Time:{{ meetingDetails.time }}</h5>
            </div>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Meeting Guest Attendance</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-2">
                        <label for="guest_name" class="block text-gray-700 font-semibold mb-2">Guest Name</label>
                        <input v-model="guest_name" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" />
                    </div>
                    <div class="col-span-4 mb-2">
                        <label for="about_guest" class="block text-gray-700 font-semibold mb-2">About Guest</label>
                        <input v-model="about_guest" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" />
                    </div>
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-2">
                        <label for="attendance_type_id" class="block text-gray-700 font-semibold mb-2">Type Name</label>
                        <select v-model="attendance_type_id" id="attendance_type_id"
                            class="w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select Attendance Type</option>
                            <option v-for="attendanceType in attendanceTypeList" :key="attendanceType.id"
                                :value="attendanceType.id">
                                {{ attendanceType.name }}</option>
                        </select>
                    </div>
                    <!-- date -->
                    <div class="col-span-3 mb-2">
                        <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
                        <input v-model="date" type="date" class="w-full border border-gray-300 rounded-md py-2 px-4" />
                    </div>
                    <!-- time -->
                    <div class="col-span-3 mb-2">
                        <label for="time" class="block text-gray-700 font-semibold mb-2">Time</label>
                        <input v-model="time" type="time" class="w-full border border-gray-300 rounded-md py-2 px-4" />
                    </div>
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-2">
                        <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
                        <input v-model="note" type="text" class="w-full border border-gray-300 rounded-md py-2 px-4" />
                    </div>

                    <!-- is_active -->
                    <div class="col-span-2 mb-2">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active" class="w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select is Active</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                    <!-- Submit button -->
                    <div class="col-span-12 mb-2 flex items-end justify-end">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 mx-4 hover:bg-yellow-700">
                            Reset
                        </button>
                         <button type="button" @click="router.push({ name: 'index-meeting' })" class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">
                            Back to Meeting List
                        </button>
                    </div>
                </div>
            </form>
        </section>
        <!-- country list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Meeting Guest Attendance List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Guest Name</th>
                        <th class="py-2 px-4 border border-gray-300">About Guest</th>
                        <th class="py-2 px-4 border border-gray-300">Attendance Type</th>
                        <th class="py-2 px-4 border border-gray-300">Attendance Time</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(meetingGuestAttendance, index) in meetingGuestAttendanceList"
                        :key="meetingGuestAttendance.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ meetingGuestAttendance.guest_name }}</td>
                        <td class="py-2 px-4 border">{{ meetingGuestAttendance.about_guest }}</td>
                        <td class="py-2 px-4 border">{{ meetingGuestAttendance.attendance_types_name }}</td>
                        <td class="py-2 px-4 border">{{ meetingGuestAttendance.time }}</td>
                        <td class="py-2 px-4 border">
                            <span
                                :class="Number(meetingGuestAttendance.is_active) === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ Number(meetingGuestAttendance.is_active) === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editMeetingAttendance(meetingGuestAttendance)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">
                                Edit</button>
                            <button @click="deleteMeetingAttendance(meetingGuestAttendance.id)"
                                class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">
                                Delete</button>
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