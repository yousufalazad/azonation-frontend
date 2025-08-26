<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const auth = authStore;
const recordList = ref([]);

// Fetch list of records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/success-stories', {}, 'GET');
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

// Delete record
const deleteRecord = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this record?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/success-stories/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                getRecords();
            } else {
                Swal.fire('Failed!', 'Failed to delete record.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        Swal.fire('Error!', 'Failed to delete record.', 'error');
    }
};

onMounted(() => {
    getRecords();
});
</script>

<template>
    <div>
        <!-- Add button -->
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Success Story List</h5>
            <button @click="router.push({ name: 'create-success-story' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
                Add New SuccessStory
            </button>
        </div>

        <!-- Record table -->
        <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
            <thead class="bg-gray-100">
                <tr>
                    <th class="border px-4 py-2">SL</th>
                    <th class="border px-4 py-2">Title</th>
                    <th class="border px-4 py-2">Story</th>
                    <th class="border px-4 py-2">Privacy</th>
                    <th class="border px-4 py-2">Status</th>
                    <th class="border px-4 py-2 text-right">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(record, index) in recordList" :key="record.id"
                    class="hover:bg-gray-50 transition-colors duration-200">
                    <td class="border px-4 py-2">{{ index + 1 }}</td>
                    <td class="border px-4 py-2">{{ record.title }}</td>
                    <td class="border px-4 py-2">{{ record.story }}</td>
                    <td class="border px-4 py-2">{{ record.privacy_name }}</td>
                    <td class="border px-4 py-2">
                        <span :class="record.status == 1 ? 'text-green-600' : 'text-red-600'">
                            {{ record.status == 1 ? 'Active' : 'Disabled' }}
                        </span>
                    </td>
                    <td class="border px-4 py-2 flex justify-end">                        
                        <button @click="router.push({ name: 'edit-success-story', params: { id: record.id } })"
                                class="bg-yellow-500 text-white px-4 py-1 mx-1 rounded hover:bg-yellow-600">Edit </button>
                        <button @click="router.push({ name: 'view-success-story', params: { id: record.id } })"
                            class="bg-green-500 text-white px-4 py-1 mx-1 rounded hover:bg-green-600">View </button>

                        <button @click="deleteRecord(record.id)" class="bg-red-500 text-white rounded-md py-1 mx-1 px-2">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>