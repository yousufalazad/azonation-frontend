<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';
const auth = authStore;
const recordList = ref([]);

// Fetch the list of records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/strategic-plans', {}, 'GET');
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

// Sanitize the HTML content
const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br'],
        ALLOWED_ATTR: [],
    });
};

// Delete a record
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
            const response = await auth.fetchProtectedApi(`/api/strategic-plans/${id}`, {}, 'DELETE');

            if (response.status) {
                Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                getRecords(); // Refresh the list
            } else {
                Swal.fire('Failed!', 'Failed to delete the record.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        Swal.fire('Error!', 'Failed to delete the record.', 'error');
    }
};

// Fetch records on component mount
onMounted(() => {
    getRecords();
});
</script>

<template>
    <div>
        <section>
            <div class="flex justify-between">
                <h5 class="text-md font-semibold">Strategic Plans List</h5>
                <button @click="$router.push({ name: 'create-strategic-plan' })"
                    class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">Add Strategic Plan
                </button>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="px-4 py-2 border">Title</th>
                        <th class="px-4 py-2 border">Plan</th>
                        <th class="px-4 py-2 border">Start Date</th>
                        <th class="px-4 py-2 border">End Date</th>
                        <th class="px-4 py-2 border">Status</th>
                        <th class="px-4 py-2 border text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record, index) in recordList" :key="record.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="border px-4 py-2">{{ record.title }}</td>
                        <td class="border px-4 py-2" v-html="sanitize(record.plan)"></td>
                        <td class="border px-4 py-2">{{ record.start_date }}</td>
                        <td class="border px-4 py-2">{{ record.end_date }}</td>
                        <td class="border px-4 py-2">
                            {{ record.is_active === 1 ? 'Active' : 'Disabled' }}
                        </td>
                        <td class="border px-4 py-2 flex space-x-2 justify-end">
                            <button @click="$router.push({ name: 'edit-strategic-plan', params: { id: record.id } })"
                                class="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600">Edit </button>
                            <button @click="$router.push({ name: 'view-strategic-plan', params: { id: record.id } })"
                                class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">View </button>
                            <button class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                @click="deleteRecord(record.id)">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>