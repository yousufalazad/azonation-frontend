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
const time = ref('');
const note = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedProjectAttendanceId = ref(null);

const projectId = ref(route.params.id);
const projectAttendanceList = ref([]);
const projectDetails = ref([]);

const userList = ref([]);
const attendanceTypeList = ref([]);
const showFormModal = ref(false);

// Fetch user list
const getOrgUserList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-all-member-name', {}, 'GET');
        userList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        userList.value = [];
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

// Fetch project attendance list
const getProjectAttendanceList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/project-attendances', {}, 'GET');
        projectAttendanceList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching attendance:', error);
        projectAttendanceList.value = [];
    }
};

// Fetch project details
const fetchProjectDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/projects/${projectId.value}`, {}, 'GET');
        projectDetails.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching project details:', error);
        projectDetails.value = [];
    }
};

// Reset form
const resetForm = () => {
    user_id.value = "";
    attendance_type_id.value = "";
    time.value = '';
    note.value = '';
    is_active.value = '1';
    selectedProjectAttendanceId.value = null;
    isEditMode.value = false;
};

// Open modal for Add
const openAddModal = () => {
    resetForm();
    isEditMode.value = false;
    showFormModal.value = true;
};

// Add / Update
const submitForm = async () => {
    const payload = {
        project_id: projectId.value,
        user_id: user_id.value,
        attendance_type_id: attendance_type_id.value,
        time: time.value,
        note: note.value,
        is_active: is_active.value
    };

    try {
        let apiUrl = '/api/project-attendances';
        let method = 'POST';
        if (isEditMode.value && selectedProjectAttendanceId.value) {
            apiUrl = `/api/project-attendances/${selectedProjectAttendanceId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this project attendance?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Project attendance ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getProjectAttendanceList();
                resetForm();
                showFormModal.value = false;
            } else {
                Swal.fire('Failed!', 'Failed to save project attendance.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error saving project attendance:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} project attendance.`, 'error');
    }
};

// Edit
const editProjectAttendance = (projectAttendance) => {
    user_id.value = projectAttendance.user_id;
    attendance_type_id.value = projectAttendance.attendance_type_id;
    time.value = projectAttendance.time;
    note.value = projectAttendance.note;
    is_active.value = projectAttendance.is_active;
    selectedProjectAttendanceId.value = projectAttendance.id;
    isEditMode.value = true;
    showFormModal.value = true;
};

// Delete
const deleteProjectAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this project attendance?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/project-attendances/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Project attendance has been deleted.', 'success');
                getProjectAttendanceList();
            } else {
                Swal.fire('Failed!', 'Failed to delete project attendance.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting project attendance:', error);
        Swal.fire('Error!', 'Failed to delete project attendance.', 'error');
    }
};

onMounted(() => {
    getOrgUserList();
    getAttendanceTypeList();
    getProjectAttendanceList();
    fetchProjectDetails();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <!-- Project Info -->
        <section class="mb-6">
            <div class="bg-white shadow-md rounded-xl p-4 border">
                <h5 class="text-md text-gray-800">
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
                    <button @click="openAddModal"
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 w-full sm:w-auto">
                        Add Project Attendance
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
                            <th class="px-4 py-2 border">Member</th>
                            <th class="px-4 py-2 border">Attendance Type</th>
                            <th class="px-4 py-2 border">Attendance Time</th>
                            <th class="px-4 py-2 border">Active</th>
                            <th class="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(projectAttendance, index) in projectAttendanceList" :key="projectAttendance.id"
                            class="hover:bg-gray-50">
                            <td class="px-4 py-2 border">{{ index + 1 }}</td>
                            <td class="px-4 py-2 border">{{ projectAttendance.user_first_name }} {{ projectAttendance.user_last_name }}</td>
                            <td class="px-4 py-2 border">{{ projectAttendance.attendance_types_name }}</td>
                            <td class="px-4 py-2 border">{{ projectAttendance.time }}</td>
                            <td class="px-4 py-2 border">
                                <span :class="Number(projectAttendance.is_active) === 0 ? 'text-red-600' : 'text-green-600'">
                                    {{ Number(projectAttendance.is_active) === 0 ? "No" : "Yes" }}
                                </span>
                            </td>
                            <td class="px-4 py-2 border flex gap-2">
                                <button @click="editProjectAttendance(projectAttendance)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Edit
                                </button>
                                <button @click="deleteProjectAttendance(projectAttendance.id)"
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
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2 sm:px-4">
            <div class="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">

                <!-- Header -->
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h5 class="text-base sm:text-lg md:text-xl font-semibold text-gray-700">
                        {{ isEditMode ? 'Edit' : 'Add' }} Project Attendance
                    </h5>
                    <button @click="showFormModal = false" class="text-gray-500 hover:text-gray-700">✖</button>
                </div>

                <!-- Form -->
                <form @submit.prevent="submitForm" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <!-- Members -->
                        <div class="sm:col-span-4">
                            <label for="user_id"
                                class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Members</label>
                            <select v-model="user_id" id="user_id"
                                class="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                                required>
                                <option value="">Select User</option>
                                <option v-for="user in userList" :key="user.individual.id" :value="user.individual.id">
                                    {{ user.individual.first_name }} {{ user.individual.last_name }}
                                </option>
                            </select>
                        </div>

                        <!-- Attendance Type -->
                        <div class="sm:col-span-4">
                            <label for="attendance_type_id"
                                class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Attendance Type</label>
                            <select v-model="attendance_type_id" id="attendance_type_id"
                                class="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400">
                                <option value="">Select Attendance Type</option>
                                <option v-for="attendanceType in attendanceTypeList" :key="attendanceType.id"
                                    :value="attendanceType.id">
                                    {{ attendanceType.name }}
                                </option>
                            </select>
                        </div>

                        <!-- Time -->
                        <div class="sm:col-span-4">
                            <label for="time"
                                class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Time</label>
                            <input v-model="time" type="time"
                                class="w-full border border-gray-300 rounded-md py-2 px-3 sm:py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-green-400" />
                        </div>

                        <!-- Note -->
                        <div class="sm:col-span-8">
                            <label for="note"
                                class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Note</label>
                            <input v-model="note" type="text" placeholder="Optional note"
                                class="w-full border border-gray-300 rounded-md py-2 px-3 sm:py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-green-400" />
                        </div>

                        <!-- Active -->
                        <div class="sm:col-span-4">
                            <label for="is_active"
                                class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Active</label>
                            <select v-model="is_active" id="is_active"
                                class="w-full border border-gray-300 rounded-md p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400">
                                <option value="">Select Status</option>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="col-span-full flex justify-end gap-3 mt-4">
                        <button type="submit"
                            class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500 w-full sm:w-auto">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 hover:bg-yellow-700 w-full sm:w-auto">
                            Reset
                        </button>
                        <button type="button" @click="showFormModal = false"
                            class="bg-gray-500 text-white rounded-md py-2 px-4 hover:bg-gray-600 w-full sm:w-auto">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>