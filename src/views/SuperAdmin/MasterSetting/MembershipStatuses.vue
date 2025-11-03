<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = authStore;

// Form fields
const name = ref('');
const is_active = ref('1'); // Default Active
const isEditMode = ref(false);
const selectedStatusId = ref(null);
const statusList = ref([]);

// Modal control
const showModal = ref(false);

// Fetch all membership statuses
const getMembershipStatuses = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/membership-statuses', {}, 'GET');
        statusList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching membership statuses:', error);
        statusList.value = [];
    }
};

// Reset form
const resetForm = () => {
    name.value = '';
    is_active.value = '1';
    selectedStatusId.value = null;
    isEditMode.value = false;
};

// Open modal for Add/Edit
const openModal = (status = null) => {
    resetForm();
    if (status) {
        name.value = status.name;
        is_active.value = status.is_active.toString();
        selectedStatusId.value = status.id;
        isEditMode.value = true;
    }
    showModal.value = true;
};

// Close modal
const closeModal = () => {
    resetForm();
    showModal.value = false;
};

// Submit (Add/Update)
const submitForm = async () => {
    const payload = { name: name.value, is_active: is_active.value };
    try {
        let apiUrl = '/api/membership-statuses';
        let method = 'POST';

        if (isEditMode.value && selectedStatusId.value) {
            apiUrl = `/api/membership-statuses/${selectedStatusId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this membership status?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Membership status ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getMembershipStatuses();
                closeModal();
            } else {
                Swal.fire('Failed!', 'Failed to save membership status.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} membership status:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} membership status.`, 'error');
    }
};

// Fetch on mount
onMounted(() => {
    getMembershipStatuses();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <section class="bg-white shadow-md rounded-xl border">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                <h5 class="text-lg font-semibold text-gray-700">Membership Status Management</h5>

                <button @click="openModal()"
                    class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 w-full sm:w-auto">
                    Add Membership Status
                </button>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto p-4">
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr class="text-gray-700">
                            <th class="border px-4 py-2">SL</th>
                            <th class="py-2 px-4 border">Name</th>
                            <th class="py-2 px-4 border">Active Status</th>
                            <th class="py-2 px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(status, index) in statusList" :key="status.id">
                            <td class="py-2 px-4 border">{{ index + 1 }}</td>
                            <td class="py-2 px-4 border">{{ status.name }}</td>
                            <td class="py-2 px-4 border">
                                <span :class="Number(status.is_active) === 0 ? 'text-red-500' : 'text-green-500'">
                                    {{ Number(status.is_active) === 0 ? 'Inactive' : 'Active' }}
                                </span>
                            </td>
                            <td class="py-2 px-4 border flex gap-2">
                                <button @click="openModal(status)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Edit</button>
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
                    <h5 class="text-lg font-semibold">{{ isEditMode ? 'Edit' : 'Add' }} Membership Status</h5>
                    <button @click="closeModal" class="text-gray-500 hover:text-gray-700">✖</button>
                </div>

                <!-- Form -->
                <form @submit.prevent="submitForm" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Name -->
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1">Name</label>
                            <input v-model="name" type="text" class="w-full border border-gray-300 rounded-md py-2 px-3"
                                required />
                        </div>

                        <!-- Active Status -->
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1">Active Status</label>
                            <select v-model="is_active" class="w-full border border-gray-300 rounded-md p-2">
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="flex justify-end gap-3 mt-4">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Submit' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 hover:bg-yellow-700">Reset</button>
                        <button type="button" @click="closeModal"
                            class="bg-gray-500 text-white rounded-md py-2 px-4 hover:bg-gray-600">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>