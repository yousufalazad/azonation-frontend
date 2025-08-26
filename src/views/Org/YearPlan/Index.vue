<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
const auth = authStore;
const recordList = ref([]);

// Fetch the list of year plans
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/year-plans', {}, 'GET');
        if (response.status) {
            recordList.value = response.data;
        } else {
            recordList.value = [];
        }
    } catch (error) {
        console.error('Error fetching records:', error);
        recordList.value = [];
    }
};

// Delete a record
const deleteRecord = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this year plan?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/year-plans/${id}`, {}, 'DELETE');
            if (response.status) {
                await Swal.fire('Deleted!', 'Year plan has been deleted.', 'success');
                getRecords();
            } else {
                Swal.fire('Failed!', 'Failed to delete year plan.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting year plan:', error);
        Swal.fire('Error!', 'Failed to delete year plan.', 'error');
    }
};

// Fetch records on mount
onMounted(() => {
    getRecords();
});
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Year Plans</h5>
            <button @click="$router.push({ name: 'create-year-plan' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
                Add Year Plan
            </button>
        </div>
        <div class="overflow-x-auto bg-white rounded shadow">
            <table class="table-auto w-full border-collapse">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="px-4 py-2 border">ID</th>
                        <th class="px-4 py-2 border">Start Year</th>
                        <th class="px-4 py-2 border">End Year</th>
                        <th class="px-4 py-2 border">Budget</th>
                        <th class="px-4 py-2 border">Start Date</th>
                        <th class="px-4 py-2 border">End Date</th>
                        <th class="px-4 py-2 border text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="record in recordList" :key="record.id" class="hover:bg-gray-50">
                        <td class="px-4 py-2 border text-center">{{ record.id }}</td>
                        <td class="px-4 py-2 border text-center">{{ record.start_year }}</td>
                        <td class="px-4 py-2 border text-center">{{ record.end_year }}</td>
                        <td class="px-4 py-2 border text-center">{{ record.budget }}</td>
                        <td class="px-4 py-2 border text-center">{{ record.start_date }}</td>
                        <td class="px-4 py-2 border text-center">{{ record.end_date }}</td>
                        <td class="px-4 py-2 border flex justify-end">
                            <button @click="$router.push({ name: 'edit-year-plan', params: { id: record.id } })"
                                class="bg-yellow-500 text-white px-4 py-1 mx-1 rounded hover:bg-yellow-600">Edit
                            </button>
                            <button @click="$router.push({ name: 'view-year-plan', params: { id: record.id } })"
                                class="bg-green-500 text-white px-4 py-1 mx-1 rounded hover:bg-green-600">View </button>

                            <button @click="deleteRecord(record.id)"
                                class="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition ml-2">
                                Delete
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!recordList.length">
                        <td colspan="7" class="px-4 py-2 text-center text-gray-500">No records found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>