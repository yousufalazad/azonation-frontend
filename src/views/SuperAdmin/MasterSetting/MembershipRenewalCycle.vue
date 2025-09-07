<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = authStore;

// Form fields
const name = ref('');
const duration_in_months = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedCycleId = ref(null);
const renewalCycleList = ref([]);

// Fetch Membership Renewal Cycles
const getRenewalCycles = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/membership-renewal-cycles', {}, 'GET');
        renewalCycleList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching membership renewal cycles:', error);
        renewalCycleList.value = [];
    }
};

// Reset form
const resetForm = () => {
    name.value = '';
    duration_in_months.value = '';
    is_active.value = '1';
    selectedCycleId.value = null;
    isEditMode.value = false;
};

// Add or update renewal cycle
const submitForm = async () => {
    const payload = {
        name: name.value,
        duration_in_months: duration_in_months.value,
        is_active: is_active.value,
    };

    try {
        let apiUrl = '/api/membership-renewal-cycles';
        let method = 'POST';

        if (isEditMode.value && selectedCycleId.value) {
            apiUrl = `/api/membership-renewal-cycles/${selectedCycleId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this membership renewal cycle?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Membership renewal cycle ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getRenewalCycles();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save membership renewal cycle.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} membership renewal cycle:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} membership renewal cycle.`, 'error');
    }
};

// Edit renewal cycle
const editRenewalCycle = (cycle) => {
    name.value = cycle.name;
    duration_in_months.value = cycle.duration_in_months;
    is_active.value = cycle.is_active;
    selectedCycleId.value = cycle.id;
    isEditMode.value = true;
};

// Delete renewal cycle
const deleteRenewalCycle = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this membership renewal cycle?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/membership-renewal-cycles/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Membership renewal cycle has been deleted.', 'success');
                getRenewalCycles();
            } else {
                Swal.fire('Failed!', 'Failed to delete membership renewal cycle.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting membership renewal cycle:', error);
        Swal.fire('Error!', 'Failed to delete membership renewal cycle.', 'error');
    }
};

// Fetch on mount
onMounted(() => {
    getRenewalCycles();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Membership Renewal Cycle</h5>
            </div>
            <form @submit.prevent="submitForm">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Name -->
                    <div class="col-span-5 mb-4">
                        <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
                        <input v-model="name" id="name" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    <!-- Duration in Months -->
                    <div class="col-span-3 mb-4">
                        <label for="duration_in_months" class="block text-gray-700 font-semibold mb-2">Duration (Months)</label>
                        <input v-model="duration_in_months" id="duration_in_months" type="number" min="1"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    <!-- Active -->
                    <div class="col-span-2 mb-4">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Active</option>
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

        <!-- Renewal Cycle List -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Membership Renewal Cycle List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border">Name</th>
                        <th class="py-2 px-4 border">Duration (Months)</th>
                        <th class="py-2 px-4 border">Active</th>
                        <th class="py-2 px-4 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(cycle, index) in renewalCycleList" :key="cycle.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ cycle.name }}</td>
                        <td class="py-2 px-4 border">{{ cycle.duration_in_months }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="cycle.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ cycle.is_active === 0 ? 'No' : 'Yes' }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editRenewalCycle(cycle)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteRenewalCycle(cycle.id)"
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
}
</style>
