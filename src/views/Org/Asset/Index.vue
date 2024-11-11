
<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const userId = auth.user.id;
const recordList = ref([]);

const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/get-assets/${userId}`, {}, 'GET');
        recordList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching assets:', error);
        recordList.value = [];
    }
};

// Delete a meeting
const deleteRecord = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this asset?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-asset/${id}`, {}, 'DELETE');
            if (response.status) {
                await Swal.fire('Deleted!', 'Asset has been deleted.', 'success');
                getRecords();
            } else {
                Swal.fire('Failed!', 'Failed to delete asset.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting asset:', error);
        Swal.fire('Error!', 'Failed to delete asset.', 'error');
    }
};

onMounted(() => getRecords());
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Asset List</h5>
                <button @click="$router.push({ name: 'create-asset' })"
                    class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
                    Add Asset
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th class="p-3 border">#</th>
                        <th class="p-3 border">Name</th>
                        <!-- <th class="p-3 border">Description</th> -->
                        <th class="p-3 border">Qty</th>
                        <!-- <th class="p-3 border">Value</th> -->
                        <!-- <th class="p-3 border">In-kind Value</th> -->
                        <!-- <th class="p-3 border">Long Term</th> -->
                        <!-- <th class="p-3 border">Tangible</th> -->
                        <!-- <th class="p-3 border">Privacy Setup</th>
                        <th class="p-3 border">Active</th> -->
                        <th class="p-3 border">Responsible Person</th>
                        <!-- <th class="p-3 border">Responsible From</th>
                        <th class="p-3 border">Responsible End</th> -->
                        <th class="p-3 border">Status</th>
                        <!-- <th class="p-3 border">Note</th> -->
                        <th class="p-3 border min-w-[190px]">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(record, index) in recordList" :key="record.id">
                        <td class="p-3 border">{{ index + 1 }}</td>
                        <td class="p-3 border">{{ record.name }}</td>
                        <!-- <td class="p-3 border">{{ record.description }}</td> -->
                        <td class="p-3 border">{{ record.quantity }}</td>
                        <!-- <td class="p-3 border">{{ record.value_amount }}</td> -->
                        <!-- <td class="p-3 border">{{ record.inkind_value }}</td> -->
                        <!-- <td class="p-3 border">{{ record.is_long_term === 0 ? 'No' : 'Yes' }}</td> -->
                        <!-- <td class="p-3 border">{{ record.is_tangible === 0 ? 'No' : 'Yes' }}</td> -->
                        <!-- <td class="p-3 border">{{ record.privacy_setup_name }}</td>
                        <td class="p-3 border">{{ record.is_active === 0 ? 'No' : 'Yes' }}</td> -->
                        <td class="p-3 border">{{ record.responsible_user_name }}</td>
                        <!-- <td class="p-3 border">{{ record.assignment_start_date }}</td>
                        <td class="p-3 border">{{ record.assignment_end_date }}</td> -->
                        <td class="p-3 border">{{ record.asset_lifecycle_statuses_name }}</td>
                        <!-- <td class="p-3 border">{{ record.note }}</td> -->

                            <td class="border px-1 py-2 w-50">
                                <button @click="$router.push({ name: 'edit-asset', params: { id: record.id } })"
                                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Edit</button>
                                <button @click="$router.push({ name: 'view-asset', params: { id: record.id } })"
                                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                                <button @click="deleteRecord(record.id)"
                                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>