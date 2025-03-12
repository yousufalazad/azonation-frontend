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
const selectedAttendanceType = ref(null);
const attendanceTypeList = ref([]);


// Fetch ConductTypes
const getConductTypes = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-attendance-types', {}, 'GET');
        attendanceTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        attendanceTypeList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    name.value = '';
    is_active.value = '1';
    selectedAttendanceType.value = null;
    isEditMode.value = false;
};

// Add or update attendanceType
const submitForm = async () => {
    const payload = {
        name: name.value,
        is_active: is_active.value,
    };

    try {
        let apiUrl = '/api/create-attendance-type';
        let method = 'POST';

        if (isEditMode.value && selectedAttendanceType.value) {
            apiUrl = `/api/update-attendance-type/${selectedAttendanceType.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this attendance type?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `attendance type ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getConductTypes();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save attendance type.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} attendance type:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} attendance type.`, 'error');
    }
};

// Edit attendanceType
const editAttendanceType = (attendanceType) => {
    name.value = attendanceType.name;
    is_active.value = attendanceType.is_active;
    selectedAttendanceType.value = attendanceType.id;
    isEditMode.value = true;
};

// Delete attendanceType
const deleteAttendanceType = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this attendance type?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-attendance-type/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'attendance type has been deleted.', 'success');
                getConductTypes();
            } else {
                Swal.fire('Failed!', 'Failed to delete attendance type.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting attendance type:', error);
        Swal.fire('Error!', 'Failed to delete attendance type.', 'error');
    }
};

// Fetch Dialing Codes on mount
onMounted(() => {
    getConductTypes();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Attendance Type</h5>
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
                        <select v-model="is_active" id="is_active" class="w-full border border-gray-300 rounded-md p-2"
                            required>
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
                <h5 class="text-md font-semibold mt-2">Attendance Type List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Name</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300 flex justify-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(attendanceType, index) in attendanceTypeList" :key="attendanceType.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ attendanceType.name }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="attendanceType.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ attendanceType.is_active === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex justify-end gap-2">
                            <button @click="editAttendanceType(attendanceType)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteAttendanceType(attendanceType.id)"
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
