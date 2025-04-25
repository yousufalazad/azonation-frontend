<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const userId = auth.user.id;
const recordList = ref([]);

const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/assets`, {}, 'GET');
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
            const response = await auth.fetchProtectedApi(`/api/assets/${id}`, {}, 'DELETE');
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
    <section>
      <!-- Header Section -->
      <div class="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-md shadow-sm mb-4">
        <h2 class="text-lg font-semibold text-gray-700">Assets</h2>
        <button
          @click="$router.push({ name: 'create-asset' })"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition">
          + Add Asset
        </button>
      </div>
  
      <!-- Table Section -->
      <div class="overflow-x-auto bg-white rounded-lg shadow-md">
        <table class="min-w-full table-auto text-sm text-left">
            <thead class="bg-gray-50">
                <tr>
                <th class="px-3 py-2 text-left font-medium text-gray-700">#</th>
                <th class="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                <th class="px-3 py-2 text-left font-medium text-gray-700">Quantity</th>
                <th class="px-3 py-2 text-left font-medium text-gray-700">Responsible User</th>
                <th class="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                <th class="px-3 py-2 font-medium text-gray-700 text-center">Actions</th>
                </tr>   
            </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(record, index) in recordList"
              :key="record.id"
              class="hover:bg-gray-50 transition">
              <td class="px-4 py-2">{{ index + 1 }}</td>
              <td class="px-4 py-2">{{ record.name }}</td>
              <td class="px-4 py-2">{{ record.quantity }}</td>
              <td class="px-4 py-2">{{ record.responsible_user_name }}</td>
              <td class="px-4 py-2">{{ record.asset_lifecycle_statuses_name }}</td>
              <td class="px-2 py-2 text-center">
                <div class="flex justify-center gap-2">
                  <button
                    @click="$router.push({ name: 'edit-asset', params: { id: record.id } })"
                    class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs transition">
                    Edit
                  </button>
                  <button
                    @click="$router.push({ name: 'view-asset', params: { id: record.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition">
                    View
                  </button>
                  <button
                    @click="deleteRecord(record.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </template>
  