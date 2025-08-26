<script setup>
import { ref, onMounted } from 'vue';
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
    <div>
        <section>
            <!-- Header Section -->
            <div class="flex justify-between items-center mb-5">
                <h2 class="text-xl font-semibold">Organizational History</h2>
                <button @click="$router.push({ name: 'create-history' })"
                    class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">Add History
                </button>
            </div>

            <!-- Table Section -->
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
    <thead class="bg-gray-100">
        <tr>
            <th class="border px-4 py-2">SL</th>
            <th class="border px-4 py-2">Title</th>
            <th class="border px-4 py-2">History</th>
            <th class="border px-4 py-2">Privacy</th>
            <th class="border px-4 py-2">Active</th>
            <th class="border px-4 py-2 text-right">Action</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(history, index) in historyList" :key="history.id" class="hover:bg-gray-50 transition-colors duration-200">
            <td class="border px-4 py-2">{{ index + 1 }}</td>
            <td class="border px-4 py-2">{{ history.title }}</td>
            <td class="border px-4 py-2" v-html="sanitize(history.history)"></td>
            <td class="border px-4 py-2">{{ history.privacy_name }}</td>
            <td class="border px-4 py-2">
                <span :class="history.is_active === 1 ? 'text-green-600' : 'text-red-600'">
                    {{ history.is_active === 1 ? 'Yes' : 'No' }}
                </span>
            </td>
            <td class="flex justify-end px-4 py-2">
                <button @click="$router.push({ name: 'edit-history', params: { id: history.id } })"
                        class="bg-yellow-500 text-white px-4 py-2 mx-1 rounded hover:bg-yellow-600">
                    Edit
                </button>
                <button @click="$router.push({ name: 'view-history', params: { id: history.id } })"
                        class="bg-green-500 text-white px-4 py-2 mx-1 rounded hover:bg-green-600">
                    View
                </button>
                <button @click="deleteHistory(history.id)"
                        class="bg-red-500 text-white px-4 py-2 mx-1 rounded hover:bg-red-600">
                    Delete
                </button>
            </td>
        </tr>
    </tbody>
</table>

        </section>
    </div>
</template>