<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';
const auth = authStore;
const historyList = ref([]);

// Fetch list of Histories
const getHistories = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/histories', {}, 'GET');
        if (response.status) {
            historyList.value = response.data;
        } else {
            historyList.value = [];
        }
    } catch (error) {
        console.error('Error fetching Histories:', error);
        historyList.value = [];
    }
};

// Delete history
const __deleteHistory = async (id) => {
    try {
        const response = await auth.fetchProtectedApi(`/api/histories/${id}`, {}, 'DELETE');
        if (response.status) {
            getHistories(); // Refresh the history list
        } else {
            alert('Failed to delete history.');
        }
    } catch (error) {
        console.error('Error deleting history:', error);
    }
};

// Delete history
const deleteHistory = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this history?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/histories/${id}`, {}, 'DELETE');

            if (response.status) {
                Swal.fire('Deleted!', 'history has been deleted.', 'success');
                getHistories(); // Refresh the list
            } else {
                Swal.fire('Failed!', 'Failed to delete the history.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting history:', error);
        Swal.fire('Error!', 'Failed to delete the history.', 'error');
    }
};


// Sanitize the HTML content
const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'br', 'img'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    });
};

// Initialize and fetch Histories on mounted
onMounted(() => {
    getHistories();
});
</script>
<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section>
            <!-- Header Section -->
            <div class="flex justify-between items-center mb-5">
                <h2 class="text-xl font-semibold">Organizational History</h2>
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
                            <th class="p-2 md:border md:border-gray-300 text-left block md:table-cell">Active</th>
                            <th class="p-2 md:border md:border-gray-300 text-left block md:table-cell">Action</th>
                        </tr>
                    </thead>
                    <tbody class="block md:table-row-group">
                        <tr v-for="(history, index) in historyList" :key="history.id"
                            class="border border-gray-300 md:border-none block md:table-row">
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell">{{ index + 1 }}</td>
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell">{{ history.title }}</td>
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell"
                                v-html="sanitize(history.history)"></td>
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell">{{ history.is_active === 1 ?
                                'Yes' : 'No' }}</td>
                            <td class="p-2 md:border md:border-gray-300 block md:table-cell">
                                <button @click="$router.push({ name: 'edit-history', params: { id: history.id } })"
                                    class="bg-yellow-500 text-white px-4 py-1 mx-1 rounded hover:bg-yellow-600">Edit
                                </button>

                                <button @click="$router.push({ name: 'view-history', params: { id: history.id } })"
                                    class="bg-green-500 text-white px-4 py-1 mx-1 rounded hover:bg-green-600">View </button>
                                <button @click="deleteHistory(history.id)"
                                    class="bg-red-500 text-white px-4 py-1 mx-1 rounded hover:bg-red-600">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>