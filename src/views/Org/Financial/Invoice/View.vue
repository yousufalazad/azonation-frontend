<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Invoice details
const invoiceDetails = ref({});

// Load invoice details
const fetchInvoiceDetails = async () => {
  const invoiceId = route.params.id; // Assume route param holds the invoice ID
  try {
    const response = await auth.fetchProtectedApi(`/api/get-invoice/${invoiceId}`, {}, 'GET');
    if (response.status) {
      invoiceDetails.value = response.data;
      console.log('Invoice details fetched:', invoiceDetails.value);
    } else {
      Swal.fire('Error!', 'Failed to fetch invoice details.', 'error');
      router.push({ name: 'invoice-list' }); // Redirect if data not found
    }
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    router.push({ name: 'invoice-list' });
  }
};

onMounted(() => {
  fetchInvoiceDetails();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Invoice Details</h2>
       <button @click="$router.push({ name: 'invoice-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Invoice List
      </button>
    </div>

    <!-- Details Table -->
    <table class="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
  <tbody>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Invoice Code</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.invoice_code }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Order ID</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.order_id }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Order Code</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.order_code }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Billing Code</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.billing_code }}</td>
    </tr>

    <!-- User Details -->
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">User ID</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.user_id }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">User Name</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.user_name }}</td>
    </tr>

    <!-- Financial Details -->
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Total Amount</th>
      <td class="px-6 py-3 text-right font-semibold text-gray-800 border border-gray-300">{{ invoiceDetails.total_amount }} {{ invoiceDetails.currency_code }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Amount Paid</th>
      <td class="px-6 py-3 text-right text-green-600 font-semibold border border-gray-300">{{ invoiceDetails.amount_paid }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Balance Due</th>
      <td class="px-6 py-3 text-right text-red-600 font-semibold border border-gray-300">{{ invoiceDetails.balance_due }}</td>
    </tr>

    <!-- Dates -->
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Generated At</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.generate_date }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Issued At</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.issue_date }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Due At</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.due_date }}</td>
    </tr>

    <!-- Notes -->
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Terms</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.terms }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Invoice Note</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.invoice_note }}</td>
    </tr>

    <!-- Status -->
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Invoice Status</th>
      <td class="px-6 py-3 text-right font-semibold text-blue-600 border border-gray-300">{{ invoiceDetails.invoice_status }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Payment Status</th>
      <td class="px-6 py-3 text-right font-semibold text-purple-600 border border-gray-300">{{ invoiceDetails.payment_status }}</td>
    </tr>

    <!-- Boolean Fields -->
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Is Published</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.is_published === 1 ? 'Yes' : 'No' }}</td>
    </tr>
    <tr class="even:bg-gray-50">
      <th class="px-6 py-3 text-left font-medium text-gray-700 bg-gray-100 w-48 border border-gray-300">Is Active</th>
      <td class="px-6 py-3 text-right border border-gray-300">{{ invoiceDetails.is_active === 1 ? 'Yes' : 'No' }}</td>
    </tr>
  </tbody>
</table>


  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
}
</style>