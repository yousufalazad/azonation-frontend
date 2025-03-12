<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';
const auth = authStore;
const recordList = ref([]);
const router = useRouter();

// Fetch records
const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-recognitions', {}, 'GET');
        recordList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching records:', error);
        recordList.value = [];
    }
};

// Sanitize description
const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'p', 'ul', 'li', 'strong', 'em', 'br'],
    });
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
            const response = await auth.fetchProtectedApi(`/api/delete-recognition/${id}`, {}, 'DELETE');

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


// On component mount
onMounted(() => {
    getRecords();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <!-- Header Section -->
        <div class="flex justify-between items-center mb-5">
            <h2 class="text-xl font-semibold">Recognition List</h2>
            <button @click="$router.push({ name: 'create-recognition' })"
                class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">Add recognition
            </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="min-w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100 text-left">
                        <th class="border px-4 py-2 w-1/10">SL</th> 
                        <th class="border px-4 py-2 w-1/6">Title</th> 
                        <!-- <th class="border px-4 py-2 w-1/8">Description</th> -->
                        <th class="border px-4 py-2 w-1/5">Recognition Date</th>
                        <th class="border px-4 py-2 w-1/8">Privacy</th>
                        <th class="border px-4 py-2 w-1/8">Status</th> 
                        <th class="border px-4 py-2 w-1/3">Actions</th>
                    </tr>
                </thead>
                
                <tbody>
                    <tr v-for="(record, index) in recordList" :key="record.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="border px-4 py-2">{{ record.title }}</td>
                        <!-- <td class="border px-4 py-2" v-html="sanitize(record.description)"></td> -->
                        <td class="border px-4 py-2">{{ record.recognition_date }}</td>
                        <td class="border px-4 py-2">
                            {{
                                record.privacy_setup_id === 1 ? 'Only Me' :
                                    record.privacy_setup_id === 2 ? 'Organization' :
                                        'Public'
                            }}
                        </td>
                        <td class="border px-4 py-2">{{ record.status === 1 ? 'Active' : 'Disabled' }}</td>
                        <td class="border px-4 py-2 space-x-2">
                            <button @click="$router.push({ name: 'edit-recognition', params: { id: record.id } })"
                                class="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600">Edit </button>

                            <button @click="$router.push({ name: 'view-recognition', params: { id: record.id } })"
                                class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">View </button>

                            <button class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                @click="deleteRecord(record.id)">
                                Delete
                            </button>

                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>