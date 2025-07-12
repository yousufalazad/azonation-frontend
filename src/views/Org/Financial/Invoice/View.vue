<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../../store/authStore';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Store the invoice ID from the route
const invoiceId = ref(route.params.id);
console.log("Initial Invoice ID:", invoiceId.value);

// Invoice details
const invoiceData = ref({});

// Fetch Invoice Details
const fetchInvoiceDetails = async () => {
  if (!invoiceId.value) {
    Swal.fire('Error!', 'Invalid invoice ID.', 'error');
    router.push({ name: 'invoice-list' });
    return;
  }

  try {
    const response = await auth.fetchProtectedApi(`/api/invoices/${invoiceId.value}`, {}, 'GET');
    if (response.status) {
      invoiceData.value = response.data;
      console.log('Invoice details fetched:', invoiceData.value);
    } else {
      Swal.fire('Error!', 'Failed to fetch invoice details.', 'error');
      router.push({ name: 'invoice-list' });
    }
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    router.push({ name: 'invoice-list' });
  }
};

// Pay Invoice
const payInvoice = async () => {
  try {
    const response = await axios.get(`/payment-gateway-stripe/checkout/${invoiceId.value}`);
    window.location.href = response.data.url; // Redirect to Stripe checkout
  } catch (error) {
    console.error("Payment error:", error);
  }
};

// Fetch data when component is mounted
onMounted(() => {
  console.log("Route params:", route.params);
  fetchInvoiceDetails();
});

// Watch for route changes (useful if switching invoices without reloading)
watch(() => route.params.id, (newId) => {
  invoiceId.value = newId;
  fetchInvoiceDetails();
});
</script>

<template>
  <div class="flex justify-between items-center mb-5">
    <h2 class="text-2xl font-bold text-gray-800">Invoice Details</h2>
    <button @click="$router.push({ name: 'invoices' })"
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
      Back to Invoice List
    </button>
  </div>

  <div class="mx-auto bg-white p-6 rounded-lg shadow-lg">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold">{{ invoiceData?.invoice?.org_name }}</h1>
        <p class="text-sm text-gray-600">
          ATTN: {{ invoiceData?.org_administrator_full_name ?? '--' }}
        </p>

        <p class="text-sm text-gray-600">
          Address: {{ invoiceData?.billing_address ?? '' }}
        </p>

        <p class="text-sm text-gray-600">
          {{ invoiceData?.user_country ?? '--' }}
        </p>

        <p class="text-sm text-gray-600">
          Phone: {{ invoiceData?.billing_phone }}
        </p>

        <p class="text-sm text-gray-600">
          Email: {{ invoiceData?.billing_email ?? '--' }}
        </p>
      </div>

      <div class="text-right">
        <h2 class="text-2xl font-bold text-blue-600">INVOICE</h2>
        <p class="text-sm text-gray-600">Invoice # {{ invoiceData?.invoice?.invoice_code }}</p>
        <p class="text-sm text-gray-600">Invoice Date: {{ invoiceData?.invoice?.issue_date }}</p>
        <p class="text-sm text-gray-600">Due Date: {{ invoiceData?.invoice?.due_date }}</p>
        <p class="text-sm text-gray-600">Status: {{ invoiceData?.invoice?.payment_status }}</p>
        <p class="text-xs text-gray-500">{{ invoiceData?.invoice?.invoice_note }}</p>
      </div>
    </div>

    <table class="w-full border-collapse border border-gray-300 mb-4">
      <thead>
        <tr class="border border-gray-300 text-gray-700">
          <th class="p-2 text-left">#</th>
          <th class="p-2 text-left">Item</th>
          <th class="p-2 text-right">Qty</th>
          <th class="p-2 text-right">Rate</th>
          <th class="p-2 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in invoiceData?.invoice?.order?.order_items ?? []" :key="item?.id ?? index"
          class="border-b border-gray-300">
          <td class="p-2">{{ index + 1 }}</td>
          <td class="p-2">{{ item?.product_name ?? '--' }}</td>
          <td class="p-2 text-right">{{ item?.quantity ? parseFloat(item.quantity).toFixed(2) : '0.00' }}</td>
          <td class="p-2 text-right">{{ item?.unit_price ? parseFloat(item.unit_price).toFixed(2) : '0.00' }}</td>
          <td class="p-2 text-right">{{ item?.total_price ? parseFloat(item.total_price).toFixed(2) : '0.00' }}</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-end">
      <table class="text-right">
        <tbody>
          <tr>
            <td class="p-2">Subtotal:</td>
            <td class="p-2">{{ invoiceData?.invoice?.order?.sub_total ?? '0.00' }}</td>
          </tr>
          <tr>
            <td class="p-2">Discount:</td>
            <td class="p-2">{{ invoiceData?.invoice?.order?.discount_amount ?? '0.00' }}</td>
          </tr>
          <tr>
            <td class="p-2">Tax:</td>
            <td class="p-2">{{ invoiceData?.invoice?.order?.total_tax ?? '0.00' }}</td>
          </tr>

          <!-- <tr>
            <td class="p-2 font-bold">Total:</td>
            <td class="p-2 font-bold">{{ invoiceData?.invoice?.total_amount ?? '0.00' }}</td>
          </tr> -->
          <!-- <tr>
            <td class="p-2">Paid amount:</td>
            <td class="p-2 font-bold">{{ invoiceData?.invoice?.amount_paid ?? '0.00' }}</td>
          </tr> -->

          <tr>
            <td class="p-2">Balance due:</td>
            <td class="p-2 font-bold">{{ invoiceData?.invoice?.balance_due ?? '0.00' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <div>
    <button @click="payInvoice" class="bg-green-500 text-white px-4 py-2 rounded">
      Pay with Stripe
    </button>
  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
}
</style>
