<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Receipt details
const receipt = ref({});

const fetchReceiptDetails = async () => {
  const receiptId = route.params.id; // Assume route param holds the receipt ID
  try {
    const response = await auth.fetchProtectedApi(`/api/get-receipt/${receiptId}`, {}, 'GET');

    if (response.status) {
      receipt.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to fetch receipt details.', 'error');
      router.push({ name: 'super-admin-receipt-list' }); // Redirect if data not found
    }
  } catch (error) {
    console.error('Error fetching receipt details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    router.push({ name: 'super-admin-receipt-list' });
  }
};

// Fetch on mount
onMounted(() => {
  fetchReceiptDetails();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Receipt Details</h2>
      <button @click="$router.push({ name: 'super-admin-receipt-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Receipt List
      </button>
    </div>

    <!-- Receipt Details -->
    <div class="overflow-x-auto">
      <table class="table-auto w-full border-collapse border border-gray-300 bg-white">
        <tbody>
          <tr>
            <th class="px-4 py-2 border border-gray-300 w-36 bg-gray-100">Receipt Code</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.receipt_code }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Invoice ID</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.invoice_id }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">User ID</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.user_id }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Amount Received</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.amount_received }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Payment Method</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.payment_method }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Transaction Reference</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.transaction_reference }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Payment Date</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.payment_date }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Note</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.note }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Status</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.status }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Admin Note</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.admin_note }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Published</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ receipt.is_published ? 'Yes' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 90%;
  margin: auto;
}
</style>