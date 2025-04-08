<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// paymentLog details
const paymentLog = ref({});

const fetchPaymentLogDetails = async () => {
  const paymentLogId = route.params.id; // Assume route param holds the invoice ID
  try {
    const response = await auth.fetchProtectedApi(`/api/get-payment-log/${paymentLogId}`, {}, 'GET');

    // const response = await auth.fetchProtectedApi(`/api/invoices/${invoiceId}`, {}, 'GET');
    if (response.status) {
      paymentLog.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to fetch payment log list details.', 'error');
      router.push({ name: 'super-admin-payment-log-list' }); // Redirect if data not found
    }
  } catch (error) {
    console.error('Error fetching payment log list details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    router.push({ name: 'super-admin-payment-log-list' });
  }
};

// Fetch on mount
onMounted(() => {
  fetchPaymentLogDetails();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Payment Log Details</h2>
      <button @click="$router.push({ name: 'super-admin-payment-log-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Payment Log List
      </button>
    </div>

    <!-- Payment Log Details -->
    <div class="overflow-x-auto">
      <table class="table-auto w-full border-collapse border border-gray-300 bg-white">
        <tbody>
          <tr>
            <th class="px-4 py-2 border border-gray-300 w-36 bg-gray-100">Invoice Code</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.invoice_code }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Payment Gateway</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.gateway }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Transaction ID</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.transaction_id }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Payment Status</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.payment_status }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Payment Method</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.payment_method }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Currency</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.currency }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Amount Paid</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.amount_paid }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Exchange Rate</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.exchange_rate }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Note</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.note }}</td>
          </tr>
          <tr>
            <th class="px-4 py-2 border border-gray-300 bg-gray-100">Admin Note</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ paymentLog.admin_note }}</td>
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