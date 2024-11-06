<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = authStore;
const name = ref('');
const status = ref('1'); // Default to 'Active' status
const isEditMode = ref(false);
const selectedFundId = ref(null);
const fundList = ref([]);

// Fetch funds
const getFunds = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-funds', {}, 'GET');
        fundList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        fundList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    name.value = '';
    status.value = '1';
    selectedFundId.value = null;
    isEditMode.value = false;
};

// Add or update fund
const submitForm = async () => {
    const payload = {
        name: name.value,
        status: status.value
    };

    try {
        let apiUrl = '/api/create-fund';
        let method = 'POST';

        if (isEditMode.value && selectedFundId.value) {
            apiUrl = `/api/update-fund/${selectedFundId.value}`;
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
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save fund.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} fund:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} fund.`, 'error');
    }
};

// Edit fund
const editFund = (fund) => {
    name.value = fund.name;
    status.value = fund.status.toString();
    selectedFundId.value = fund.id;
    isEditMode.value = true;
};

// Delete fund
const deleteFund = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this fund?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-fund/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Fund has been deleted.', 'success');
                getFunds();
            } else {
                Swal.fire('Failed!', 'Failed to delete fund.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting fund:', error);
        Swal.fire('Error!', 'Failed to delete fund.', 'error');
    }
};

// Fetch funds on mount
onMounted(() => {
    getFunds();
});

// Navigate to add form
const accounts = () => {
    router.push({ name: 'accounts' });
};
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Fund</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Name -->
                    <div class="col-span-4 mb-4">
                        <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
                        <input v-model="name" id="name" type="text" class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>

                    <!-- Status dropdown -->
                    <div class="col-span-2 mb-4">
                        <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
                        <select v-model="status" id="status" class="w-full border border-gray-300 rounded-md py-2 px-4">
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                    <!-- Submit button -->
                    <div class="col-span-6 mb-4 flex items-end">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Submit' }}
                        </button>
                        <button type="button" @click="resetForm" class="bg-blue-600 text-white rounded-md py-2 px-4 mx-4 hover:bg-blue-700">
                            Reset
                        </button>
                        <button type="button" @click="accounts" class="bg-yellow-500 text-white rounded-md py-2 px-4 hover:bg-yellow-600">
                            Back Accounts
                        </button>
                    </div>
                </div>
            </form>
        </section>

        <!-- Fund list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Fund List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Name</th>
                        <th class="py-2 px-4 border border-gray-300">Status</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(fund, index) in fundList" :key="fund.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ fund.name }}</td>
                        <td class="py-2 px-4 border">{{ fund.status === 1 ? 'Active' : 'Inactive' }}</td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editFund(fund)" class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteFund(fund.id)" class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">Delete</button>
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