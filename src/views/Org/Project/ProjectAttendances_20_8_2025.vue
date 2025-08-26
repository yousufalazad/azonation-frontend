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
const selectedProjectAttendanceId = ref(null);
// Selected EventID
const projectId = ref(route.params.id);
const projectAttendanceList = ref([]);



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

// Fetch getProjectAttendanceList
const getProjectAttendanceList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/project-attendances', {}, 'GET');
        projectAttendanceList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        projectAttendanceList.value = [];
    }
};

const projectDetails = ref([]);
// Fetch project details on mount
const fetchProjectDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/projects/${projectId.value}`, {}, 'GET');
        projectDetails.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching events:', error);
        projectDetails.value = [];
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
    selectedProjectAttendanceId.value = null;
    isEditMode.value = false;
};

// Add or update projectAttendance
const submitForm = async () => {
    const payload = {
        project_id: projectId.value,
        user_id: user_id.value,
        attendance_type_id: attendance_type_id.value,
        // date: date.value,
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
            } else {
                Swal.fire('Failed!', 'Failed to save Project attendance.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} Project attendance:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} Project attendance.`, 'error');
    }
};

// Edit projectAttendance
const editProjectAttendance = (projectAttendance) => {
    user_id.value = projectAttendance.user_id;
    attendance_type_id.value = projectAttendance.attendance_type_id;
    // date.value = projectAttendance.date;
    time.value = projectAttendance.time;
    note.value = projectAttendance.note;
    is_active.value = projectAttendance.is_active;
    selectedProjectAttendanceId.value = projectAttendance.id;
    isEditMode.value = true;
};

// Delete projectAttendance
const deleteProjectAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this Project attendance?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/project-attendances/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'project attendance has been deleted.', 'success');
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

// Fetch Dialing Codes on mount
onMounted(() => {
    getOrgUserList();
    getAttendanceTypeList();
    getProjectAttendanceList();
    fetchProjectDetails();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-bold mt-2">Name:{{ projectDetails.title }} - Time:{{ projectDetails.time }}</h5>
            </div>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Project Attendance</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- members -->
                    <div class="col-span-4 mb-4">
                        <label for="user_id" class="block text-gray-700 font-semibold mb-2">Members</label>
                        <select v-model="user_id" id="user_id" class="w-full border border-gray-300 rounded-md p-2"
                            required>
                            <option value="">Select User</option>
                            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.first_name }} {{ user.last_name }}</option>
                        </select>
                    </div>
                    <!--   Attendance Type -->
                    <div class="col-span-4 mb-4">
                        <label for="attendance_type_id" class="block text-gray-700 font-semibold mb-2">Type Name</label>
                        <select v-model="attendance_type_id" id="attendance_type_id"
                            class="w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select Attendance Type</option>
                            <option v-for="attendanceType in attendanceTypeList" :key="attendanceType.id" :value="attendanceType.id">
                                {{ attendanceType.name }}</option>
                        </select>
                    </div>
                    <!-- is_active -->
                    <!-- date -->
                    <!-- <div class="col-span-2 mb-4">
                        <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
                        <input v-model="date" type="date" class="w-full border border-gray-300 rounded-md py-2 px-4"/>
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
                        <button type="button" @click="router.push({ name: 'index-project' })" class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">
                            Back to Project List
                        </button>
                    </div>
                </div>
            </form>
        </section>
        <!-- Attendance list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Project Attendance List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Members</th>
                        <th class="py-2 px-4 border border-gray-300">Attendance Type</th>
                        <th class="py-2 px-4 border border-gray-300">Attendance Time</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(projectAttendance, index) in projectAttendanceList" :key="projectAttendance.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ projectAttendance.user_first_name }} {{ projectAttendance.user_last_name }}</td>
                        <td class="py-2 px-4 border">{{ projectAttendance.attendance_types_name }}</td>
                        <td class="py-2 px-4 border">{{ projectAttendance.time }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="Number(projectAttendance.is_active) === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ Number(projectAttendance.is_active) === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editProjectAttendance(projectAttendance)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteProjectAttendance(projectAttendance.id)"
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