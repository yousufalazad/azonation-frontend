<!-- meeting att -->

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const auth = authStore;

const user_id = ref(null);
const attendance_type_id = ref(null);
const date = ref('');
const time = ref('');
const note = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedMeetingAttendanceId = ref(null);
const meetingId = ref(route.params.id);

// Modal toggle
const showFormModal = ref(false);

const meetingDetails = ref([]);
// Fetch meeting details
const fetchMeetingDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/meetings/${meetingId.value}`, {}, 'GET');
        meetingDetails.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching meetings:', error);
        meetingDetails.value = [];
    }
};

const userList = ref([]);
const getOrgUserList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-all-member-name', {}, 'GET');
        userList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        userList.value = [];
    }
};

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

const meetingAttendanceList = ref([]);
const getMeetingAttendanceList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/meeting-attendances', {}, 'GET');
        meetingAttendanceList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching meeting attendance:', error);
        meetingAttendanceList.value = [];
    }
};

// Reset form
const resetForm = () => {
    user_id.value = null;
    attendance_type_id.value = null;
    date.value = '';
    time.value = '';
    note.value = '';
    is_active.value = '1';
    selectedMeetingAttendanceId.value = null;
    isEditMode.value = false;
};

// Open modal for add
const openAddModal = () => {
    resetForm();
    isEditMode.value = false;
    showFormModal.value = true;
};

// Add / Update attendance
const submitForm = async () => {
    const payload = {
        meeting_id: meetingId.value,
        user_id: user_id.value,
        attendance_type_id: attendance_type_id.value || null,
        date: date.value,
        time: time.value,
        note: note.value,
        is_active: is_active.value
    };
    try {
        let apiUrl = '/api/meeting-attendances';
        let method = 'POST';
        if (isEditMode.value && selectedMeetingAttendanceId.value) {
            apiUrl = `/api/meeting-attendances/${selectedMeetingAttendanceId.value}`;
            method = 'PUT';
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this meeting attendance?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Meeting attendance ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getMeetingAttendanceList();
                resetForm();
                showFormModal.value = false;
            } else {
                Swal.fire('Failed!', 'Failed to save meeting attendance.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} meeting attendance:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} meeting attendance.`, 'error');
    }
};

// Edit meetingAttendance
const editMeetingAttendance = (meetingAttendance) => {
    user_id.value = meetingAttendance.user_id;
    attendance_type_id.value = meetingAttendance.attendance_type_id;
    date.value = meetingAttendance.date;
    time.value = meetingAttendance.time;
    note.value = meetingAttendance.note;
    is_active.value = meetingAttendance.is_active;
    selectedMeetingAttendanceId.value = meetingAttendance.id;
    isEditMode.value = true;
    showFormModal.value = true;
};

// Delete meetingAttendance
const deleteMeetingAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this meeting attendance?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/meeting-attendances/${id}`, {}, 'DELETE');
            if (response.status) {
                await Swal.fire('Deleted!', 'Meeting attendance has been deleted.', 'success');
                getMeetingAttendanceList();
            } else {
                Swal.fire('Failed!', 'Failed to delete meeting attendance.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting meeting attendance:', error);
        Swal.fire('Error!', 'Failed to delete meeting attendance.', 'error');
    }
};

onMounted(() => {
    fetchMeetingDetails();
    getOrgUserList();
    getAttendanceTypeList();
    getMeetingAttendanceList();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <!-- Meeting Details Card -->
        <section class="mb-6">
            <div class="bg-white shadow-md rounded-xl p-4 border">
                <h5 class="text-md  text-gray-800">
                    Name: {{ meetingDetails.name }}
                    <span class="mx-2">•</span>
                    Date: {{ meetingDetails.date }}
                    <span class="mx-2">•</span>
                    Time: {{ meetingDetails.time }}
                </h5>
            </div>
        </section>

        <!-- Attendance Card -->
        <section class="bg-white shadow-md rounded-xl border">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                <h5 class="text-lg font-semibold text-gray-700">Members Attendance List</h5>

                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button @click="openAddModal"
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 w-full sm:w-auto">
                        Add Member Attendance
                    </button>
                    <button @click="router.push({ name: 'index-meeting' })"
                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto">
                        Back to Meeting List
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto p-4">
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr class="text-gray-700">
                            <th class="border px-4 py-2">SL</th>
                            <th class="px-4 py-2 border">Members</th>
                            <th class="px-4 py-2 border">Attendance Type</th>
                            <th class="px-4 py-2 border">Attendance Time</th>
                            <th class="px-4 py-2 border">Active</th>
                            <th class="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(meetingAttendance, index) in meetingAttendanceList" :key="meetingAttendance.id"
                            class="hover:bg-gray-50">
                            <td class="px-4 py-2 border">{{ index + 1 }}</td>
                            <td class="px-4 py-2 border">
                                {{ meetingAttendance.user_first_name }} {{ meetingAttendance.user_last_name }}
                            </td>
                            <td class="px-4 py-2 border">{{ meetingAttendance.attendance_types_name }}</td>
                            <td class="px-4 py-2 border">{{ meetingAttendance.time }}</td>
                            <td class="px-4 py-2 border">
                                <span
                                    :class="Number(meetingAttendance.is_active) === 0 ? 'text-red-600' : 'text-green-600'">
                                    {{ Number(meetingAttendance.is_active) === 0 ? "No" : "Yes" }}
                                </span>
                            </td>
                            <td class="px-4 py-2 border flex gap-2">
                                <button @click="editMeetingAttendance(meetingAttendance)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Edit
                                </button>
                                <button @click="deleteMeetingAttendance(meetingAttendance.id)"
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
        <div v-if="showFormModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div class="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <!-- Header -->
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h5 class="text-lg font-semibold text-gray-700">
                        {{ isEditMode ? 'Edit' : 'Add' }} Meeting Attendance
                    </h5>
                    <button @click="showFormModal = false" class="text-gray-500 hover:text-gray-700">✖</button>
                </div>

                <!-- Form -->
                <form @submit.prevent="submitForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <!-- Member -->
                        <div class="col-span-4">
                            <label for="user_id" class="block text-gray-700 font-semibold mb-2">Member Name</label>
                            <select v-model="user_id" id="user_id" class="w-full border border-gray-300 rounded-md p-2"
                                required>
                                <option value="">Select member</option>
                                <option v-for="user in userList" :key="user.individual.id" :value="user.individual.id">
                                    {{ user.individual.first_name }} {{ user.individual.last_name }}
                                </option>
                            </select>
                        </div>

                        <!-- Attendance Type -->
                        <div class="col-span-4">
                            <label for="attendance_type_id" class="block text-gray-700 font-semibold mb-2">Type
                                Name</label>
                            <select v-model="attendance_type_id" id="attendance_type_id"
                                class="w-full border border-gray-300 rounded-md p-2">
                                <option value="">Select Attendance Type</option>
                                <option v-for="attendanceType in attendanceTypeList" :key="attendanceType.id"
                                    :value="attendanceType.id">
                                    {{ attendanceType.name }}
                                </option>
                            </select>
                        </div>

                        <!-- Date -->
                        <div class="col-span-4">
                            <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
                            <input v-model="date" type="date"
                                class="w-full border border-gray-300 rounded-md py-2 px-4" />
                        </div>

                        <!-- Time -->
                        <div class="col-span-4">
                            <label for="time" class="block text-gray-700 font-semibold mb-2">Time</label>
                            <input v-model="time" type="time"
                                class="w-full border border-gray-300 rounded-md py-2 px-4" />
                        </div>

                        <!-- Note -->
                        <div class="col-span-4">
                            <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
                            <input v-model="note" type="text"
                                class="w-full border border-gray-300 rounded-md py-2 px-4" />
                        </div>

                        <!-- Active -->
                        <div class="col-span-4">
                            <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                            <select v-model="is_active" id="is_active"
                                class="w-full border border-gray-300 rounded-md py-2 px-3">
                                <option value="">Select is Active</option>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="col-span-full flex justify-end gap-3 mt-4">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 hover:bg-yellow-700">
                            Reset
                        </button>
                        <button type="button" @click="showFormModal = false"
                            class="bg-gray-500 text-white rounded-md py-2 px-4 hover:bg-gray-600">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
