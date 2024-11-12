<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = authStore;
const name = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedMeetingAttendanceType = ref(null);
const meetingAttendanceTypeList = ref([]);


// Fetch meetingConductTypes
const getMeetingConductTypes = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-meeting-attendance-types', {}, 'GET');
        meetingAttendanceTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        meetingAttendanceTypeList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    name.value = '';
    is_active.value = '1';
    selectedMeetingAttendanceType.value = null;
    isEditMode.value = false;
};

// Add or update meetingAttendanceType
const submitForm = async () => {
    const payload = {
        name: name.value,
        is_active: is_active.value,
    };

    try {
        let apiUrl = '/api/create-meeting-attendance-type';
        let method = 'POST';

        if (isEditMode.value && selectedMeetingAttendanceType.value) {
            apiUrl = `/api/update-meeting-attendance-type/${selectedMeetingAttendanceType.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this meeting attendance type?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `meeting attendance type ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getMeetingConductTypes();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save meeting attendance type.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} meeting attendance type:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} meeting attendance type.`, 'error');
    }
};

// Edit meetingAttendanceType
const editMeetingAttendanceType = (meetingAttendanceType) => {
    name.value = meetingAttendanceType.name;
    is_active.value = meetingAttendanceType.is_active;
    selectedMeetingAttendanceType.value = meetingAttendanceType.id;
    isEditMode.value = true;
};

// Delete meetingAttendanceType
const deleteMeetingAttendanceType = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this meeting attendance type?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-meeting-attendance-type/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'meeting attendance type has been deleted.', 'success');
                getMeetingConductTypes();
            } else {
                Swal.fire('Failed!', 'Failed to delete meeting attendance type.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting meeting attendance type:', error);
        Swal.fire('Error!', 'Failed to delete meeting attendance type.', 'error');
    }
};

// Fetch Dialing Codes on mount
onMounted(() => {
    getMeetingConductTypes();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Meeting Attendance Type</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                     <!-- Name -->
                     <div class="col-span-7 mb-4">
                        <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
                        <input v-model="name" id="name" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    <!-- is_active -->
                    <div class="col-span-3 mb-4">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select is_active</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                    <!-- Submit button -->
                    <div class="col-span-2 mb-4 flex items-end">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-blue-600 text-white rounded-md py-2 px-4 mx-4 hover:bg-blue-700">
                            Reset
                        </button>
                    </div>
                </div>
            </form>
        </section>

        <!-- country list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Meeting Attendance Type List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Name</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(meetingAttendanceType, index) in meetingAttendanceTypeList" :key="meetingAttendanceType.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ meetingAttendanceType.name }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="meetingAttendanceType.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ meetingAttendanceType.is_active === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editMeetingAttendanceType(meetingAttendanceType)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteMeetingAttendanceType(meetingAttendanceType.id)"
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
