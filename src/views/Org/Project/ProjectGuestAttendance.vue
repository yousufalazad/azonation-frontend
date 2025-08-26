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
const attendance_type_id = ref("");
const date = ref('');
const time = ref('');
const note = ref('');
const is_active = ref('1');

const isEditMode = ref(false);
const selectedProjectAttendanceId = ref(null);
const projectId = ref(route.params.id);

// Data lists
const projectDetails = ref([]);
const attendanceTypeList = ref([]);
const projectGuestAttendanceList = ref([]);

// Modal control
const showModal = ref(false);

// Fetch project details
const fetchProjectDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/projects/${projectId.value}`, {}, 'GET');
        projectDetails.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching project:', error);
        projectDetails.value = [];
    }
};

// Fetch attendance types
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
const getProjectGuestAttendanceList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/project-guest-attendances', {}, 'GET');
        projectGuestAttendanceList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching guest attendances:', error);
        projectGuestAttendanceList.value = [];
    }
};

// Reset form
const resetForm = () => {
    guest_name.value = '';
    about_guest.value = '';
    attendance_type_id.value = '';
    date.value = '';
    time.value = '';
    note.value = '';
    is_active.value = '1';
    selectedProjectAttendanceId.value = null;
    isEditMode.value = false;
};

// Open modal for Add/Edit
const openModal = (attendance = null) => {
    resetForm();
    if (attendance) {
        guest_name.value = attendance.guest_name;
        about_guest.value = attendance.about_guest;
        attendance_type_id.value = attendance.attendance_type_id;
        date.value = attendance.date;
        time.value = attendance.time;
        note.value = attendance.note;
        is_active.value = attendance.is_active;
        selectedProjectAttendanceId.value = attendance.id;
        isEditMode.value = true;
    }
    showModal.value = true;
};

// Close modal
const closeModal = () => {
    resetForm();
    showModal.value = false;
};

// Submit form (Add/Update)
const submitForm = async () => {
    const payload = {
        project_id: projectId.value,
        guest_name: guest_name.value,
        about_guest: about_guest.value,
        attendance_type_id: attendance_type_id.value,
        date: date.value,
        time: time.value,
        note: note.value,
        is_active: is_active.value
    };
    try {
        let apiUrl = '/api/project-guest-attendances';
        let method = 'POST';
        if (isEditMode.value && selectedProjectAttendanceId.value) {
            apiUrl = `/api/project-guest-attendances/${selectedProjectAttendanceId.value}`;
            method = 'PUT';
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this project guest attendance?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);
            if (response.status) {
                await Swal.fire('Success!', `Project guest attendance ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getProjectGuestAttendanceList();
                closeModal();
            } else {
                Swal.fire('Failed!', 'Failed to save project guest attendance.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} project guest attendance:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} project guest attendance.`, 'error');
    }
};

// Delete attendance
const deleteMeetingAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this project guest attendance?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/project-guest-attendances/${id}`, {}, 'DELETE');
            if (response.status) {
                await Swal.fire('Deleted!', 'Project guest attendance has been deleted.', 'success');
                getProjectGuestAttendanceList();
            } else {
                Swal.fire('Failed!', 'Failed to delete project guest attendance.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting project guest attendance:', error);
        Swal.fire('Error!', 'Failed to delete project guest attendance.', 'error');
    }
};

// Fetch initial data
onMounted(() => {
    fetchProjectDetails();
    getAttendanceTypeList();
    getProjectGuestAttendanceList();
});
</script>

<template>

    <div class="max-w-7xl mx-auto w-11/12">
        <!-- Project Info -->
        <section class="mb-6">
            <div class="bg-white shadow-md rounded-xl p-4 border">
                <h5 class="text-md font-bold text-gray-800">
                    Name: {{ projectDetails.title }}
                    <span class="mx-2">•</span>
                    Start Date: {{ projectDetails.start_date }}
                </h5>
            </div>
        </section>

        <!-- Attendance List -->
        <section class="bg-white shadow-md rounded-xl border">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                <h5 class="text-lg font-semibold text-gray-700">Project Attendance List</h5>

                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button @click="openModal()"
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 w-full sm:w-auto">
                        Add Guest Attendance
                    </button>
                    <button @click="router.push({ name: 'index-project' })"
                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto">
                        Back to Project List
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto p-4">
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr class="text-gray-700">
                            <th class="border px-4 py-2">SL</th>
                            <th class="py-2 px-4 border border-gray-300">Guest Name</th>
                            <th class="py-2 px-4 border border-gray-300">About Guest</th>
                            <th class="py-2 px-4 border border-gray-300">Attendance Type</th>
                            <th class="py-2 px-4 border border-gray-300">Time</th>
                            <th class="py-2 px-4 border border-gray-300">Active</th>
                            <th class="py-2 px-4 border border-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(attendance, index) in projectGuestAttendanceList" :key="attendance.id">
                            <td class="py-2 px-4 border">{{ index + 1 }}</td>
                            <td class="py-2 px-4 border">{{ attendance.guest_name }}</td>
                            <td class="py-2 px-4 border">{{ attendance.about_guest }}</td>
                            <td class="py-2 px-4 border">{{ attendance.attendance_types_name }}</td>
                            <td class="py-2 px-4 border">{{ attendance.time }}</td>
                            <td class="py-2 px-4 border">
                                <span :class="Number(attendance.is_active) === 0 ? 'text-red-500' : 'text-green-500'">
                                    {{ Number(attendance.is_active) === 0 ? "No" : "Yes" }}
                                </span>
                            </td>
                            <td class="py-2 px-4 border flex gap-2">
                                <button @click="openModal(attendance)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Edit</button>
                                <button @click="deleteMeetingAttendance(attendance.id)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div
                class="bg-white rounded-xl shadow-lg w-full max-w-3xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <!-- Header -->
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h5 class="text-lg font-semibold">{{ isEditMode ? 'Edit' : 'Add' }} Project Guest Attendance</h5>
                    <button @click="closeModal" class="text-gray-500 hover:text-gray-700">✖</button>
                </div>

                <!-- Form -->
                <form @submit.prevent="submitForm" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
                        <!-- Guest Name -->
                        <div class="col-span-1 sm:col-span-1 md:col-span-6">
                            <label class="block text-gray-700 font-semibold mb-1">Guest Name</label>
                            <input v-model="guest_name" type="text"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" required />
                        </div>

                        <!-- About Guest -->
                        <div class="col-span-1 sm:col-span-1 md:col-span-6">
                            <label class="block text-gray-700 font-semibold mb-1">About Guest</label>
                            <input v-model="about_guest" type="text"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>

                        <!-- Attendance Type -->
                        <div class="col-span-1 sm:col-span-1 md:col-span-6">
                            <label class="block text-gray-700 font-semibold mb-1">Attendance Type</label>
                            <select v-model="attendance_type_id" class="w-full border border-gray-300 rounded-md p-2"
                                required>
                                <option value="">Select Attendance Type</option>
                                <option v-for="type in attendanceTypeList" :key="type.id" :value="type.id">{{ type.name
                                }}</option>
                            </select>
                        </div>

                        <!-- Date -->
                        <div class="col-span-1 sm:col-span-1 md:col-span-3">
                            <label class="block text-gray-700 font-semibold mb-1">Date</label>
                            <input v-model="date" type="date"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>

                        <!-- Time -->
                        <div class="col-span-1 sm:col-span-1 md:col-span-3">
                            <label class="block text-gray-700 font-semibold mb-1">Time</label>
                            <input v-model="time" type="time"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>

                        <!-- Note -->
                        <div class="col-span-1 sm:col-span-1 md:col-span-6">
                            <label class="block text-gray-700 font-semibold mb-1">Note</label>
                            <input v-model="note" type="text"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>

                        <!-- Active -->
                        <div class="col-span-1 sm:col-span-1 md:col-span-6">
                            <label class="block text-gray-700 font-semibold mb-1">Active</label>
                            <select v-model="is_active" class="w-full border border-gray-300 rounded-md p-2">
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="col-span-full flex justify-end gap-3 mt-4">
                        <button type="submit"
                            class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500 w-full sm:w-auto">{{
                                isEditMode ? 'Update' : 'Add' }}</button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 hover:bg-yellow-700 w-full sm:w-auto">Reset</button>
                        <button type="button" @click="closeModal"
                            class="bg-gray-500 text-white rounded-md py-2 px-4 hover:bg-gray-600 w-full sm:w-auto">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>