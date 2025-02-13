<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const auth = authStore;

// Record data
const record = ref({});

const id = route.params.id; // Assume the billing ID is passed as a route parameter

// Fetch record
const getRecord = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-everyday-storage-billing/${id}`, {}, 'GET');
    if (response.status) {
      record.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to fetch billing data.', 'error');
    }
  } catch (error) {
    console.error('Error fetching record:', error);
    Swal.fire('Error!', 'An error occurred while fetching data.', 'error');
  }
};

onMounted(() => {
  getRecord();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">View Details</h2>
      <button @click="$router.push({ name: 'super-admin-everyday-storage-billing-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300 focus:outline-none">
        Back to List
      </button>
    </div>

    <!-- Table -->
    <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
      <tbody class="text-gray-600 text-md font-medium">
        <tr>
          <td class="p-2 text-left font-semibold w-36">User</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.user?.name || 'N/A' }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Date</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.date }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Day  Bill Amount</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.day_bill_amount }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Active</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.is_active ? 'Inactive' : 'Active' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
