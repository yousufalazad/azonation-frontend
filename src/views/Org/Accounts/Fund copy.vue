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
const selectedFundId = ref(null);
const fundList = ref([]);

// Modal control
const showModal = ref(false);

// Fetch all funds
const getFunds = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/funds', {}, 'GET');
        fundList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        fundList.value = [];
    }
};

// Reset form
const resetForm = () => {
    name.value = '';
    is_active.value = '1';
    selectedFundId.value = null;
    isEditMode.value = false;
};

// Open modal for Add/Edit
const openModal = (fund = null) => {
    resetForm();
    if (fund) {
        name.value = fund.name;
        is_active.value = fund.is_active.toString();
        selectedFundId.value = fund.id;
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
        let apiUrl = '/api/funds';
        let method = 'POST';

        if (isEditMode.value && selectedFundId.value) {
            apiUrl = `/api/funds/${selectedFundId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this fund?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Fund ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getFunds();
                closeModal();
            } else {
                Swal.fire('Failed!', 'Failed to save fund.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} fund:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} fund.`, 'error');
    }
};

// Navigate back to accounts
const goToAccounts = () => {
    router.push({ name: 'accounts' });
};

// Fetch on mount
onMounted(() => {
    getFunds();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <!-- Header -->
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Funds Management</h5>
                <button @click="openModal()"
                    class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500">
                    Add Fund
                </button>
            </div>
        </section>

        <!-- Fund List -->
        <section class="bg-white shadow-md rounded-xl border">
            <div class="overflow-x-auto p-4">
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr class="text-gray-700">
                            <th class="border px-4 py-2">SL</th>
                            <th class="py-2 px-4 border border-gray-300">Name</th>
                            <th class="py-2 px-4 border border-gray-300">Active Status</th>
                            <th class="py-2 px-4 border border-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(fund, index) in fundList" :key="fund.id">
                            <td class="py-2 px-4 border">{{ index + 1 }}</td>
                            <td class="py-2 px-4 border">{{ fund.name }}</td>
                            <td class="py-2 px-4 border">
                                <span :class="Number(fund.is_active) === 0 ? 'text-red-500' : 'text-green-500'">
                                    {{ Number(fund.is_active) === 0 ? 'Inactive' : 'Active' }}
                                </span>
                            </td>
                            <td class="py-2 px-4 border flex gap-2">
                                <button @click="openModal(fund)"
                                    class="bg-yellow-400 text-white rounded-md py-1 px-3 hover:bg-yellow-500">Edit</button>
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
                    <h5 class="text-lg font-semibold">{{ isEditMode ? 'Edit' : 'Add' }} Fund</h5>
                    <button @click="closeModal" class="text-gray-500 hover:text-gray-700">✖</button>
                </div>

                <!-- Form -->
                <form @submit.prevent="submitForm" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
                        <!-- Fund Name -->
                        <div class="col-span-6">
                            <label class="block text-gray-700 font-semibold mb-1">Name</label>
                            <input v-model="name" type="text"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" required />
                        </div>

                        <!-- Active Status -->
                        <div class="col-span-6">
                            <label class="block text-gray-700 font-semibold mb-1">Active Status</label>
                            <select v-model="is_active" class="w-full border border-gray-300 rounded-md p-2">
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="flex justify-end gap-3 mt-4">
                        <button type="submit"
                            class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
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

        <!-- Back Button -->
        <div class="mt-6">
            <button @click="goToAccounts"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Back to Accounts
            </button>
        </div>
    </div>
</template>

<style scoped>
.left-color-shade {
    background-color: rgba(76, 175, 80, 0.1);
}
</style>
