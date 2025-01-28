<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';
const auth = authStore;
const recordList = ref([]);

// Fetch list of records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-org-histories', {}, 'GET');
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
const __deleteRecord = async (id) => {
    try {
        const response = await auth.fetchProtectedApi(`/api/delete-org-history/${id}`, {}, 'DELETE');
        if (response.status) {
            getRecords(); // Refresh the record list
        } else {
            alert('Failed to delete record.');
        }
    } catch (error) {
        console.error('Error deleting record:', error);
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
            const response = await auth.fetchProtectedApi(`/api/delete-org-history/${id}`, {}, 'DELETE');

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


// Sanitize the HTML content
const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'br', 'img'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    });
};

// Initialize and fetch records on mounted
onMounted(() => {
    getRecords();
});
</script>
<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section>
            <!-- Header Section -->
            <div class="flex justify-between items-center mb-5">
                <h2 class="text-xl font-semibold">Organizational History Records</h2>
                <button @click="$router.push({ name: 'create-history' })"
                    class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">Add History
                </button>
            </div>

            <!-- Table Section -->
            <div class="overflow-auto">
                <table class="min-w-full border-collapse block md:table">
                    <thead class="block md:table-header-group">
                        <tr class="border border-gray-300 md:border-none block md:table-row">
                            <th class="p-2 md:border md:border-gray-300 text-left block md:table-cell">#</th>
                            <th class="p-2 md:border md:border-gray-300 text-left block md:table-cell">Title</th>
                            <th class="p-2 md:border md:border-gray-300 text-left block md:table-cell">History</th>
                            <th class="p-2 md:border md:border-gray-300 text-left block md:table-cell">Status</th>
                            <th class="p-2 md:border md:border-gray-300 text-left block md:table-cell">Action</th>
                        </tr>
                    </thead>
                    <tbody class="block md:table-row-group">
                        <tr v-for="(record, index) in recordList" :key="record.id"
                            class="border border-gray-300 md:border-none block md:table-row">
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell">{{ index + 1 }}</td>
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell">{{ record.title }}</td>
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell"
                                v-html="sanitize(record.history)"></td>
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell">{{ record.status === 1 ?
                                'Active' : 'Disabled' }}</td>
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell">
                                <button @click="$router.push({ name: 'edit-history', params: { id: record.id } })"
                                    class="bg-yellow-500 text-white px-4 py-1 mx-1 rounded hover:bg-yellow-600">Edit
                                </button>

                                <button @click="$router.push({ name: 'view-history', params: { id: record.id } })"
                                    class="bg-green-500 text-white px-4 py-1 mx-1 rounded hover:bg-green-600">View </button>
                                <button @click="deleteRecord(record.id)"
                                    class="bg-red-500 text-white px-4 py-1 mx-1 rounded hover:bg-red-600">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>