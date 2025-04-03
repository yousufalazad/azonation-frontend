<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../../store/authStore';

import { defineProps } from 'vue';
import axios from 'axios';

const props = defineProps({
  invoiceId: Number
});

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Invoice details
const invoiceData = ref({});

// Load invoice details
const fetchInvoiceDetails = async () => {
  const invoiceId = route.params.id; // Assume route param holds the invoice ID
  try {
    const response = await auth.fetchProtectedApi(`/api/invoices/${invoiceId}`, {}, 'GET');
    if (response.status) {
      invoiceData.value = response.data;
      console.log('Invoice details fetched:', invoiceData.value);
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

const payInvoice = async () => {
  try {
    const response = await axios.get(`/payment-gateway-stripe/checkout/${props.invoiceId}`);
    window.location.href = response.data.url; // Redirect to Stripe checkout
  } catch (error) {
    console.error("Payment error:", error);
  }
};

onMounted(() => {
  fetchInvoiceDetails();
});
</script>

<template>
  <!-- Header -->
  <div class="flex justify-between items-center mb-5">
    <h2 class="text-2xl font-bold text-gray-800">Invoice Details</h2>
    <button @click="$router.push({ name: 'invoice-list' })"
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
      Back to Invoice List
    </button>
  </div>

  <div class="mx-auto bg-white p-6 rounded-lg shadow-lg mx-0">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <div>
        <h1 class="text-xl font-bold">{{ invoiceData.user_name }}</h1>
        <p class="text-sm text-gray-600">Mirpur, Dhaka, Bangladesh
          <br>
          {{ invoiceData?.order?.user?.email }}
          <br>
        </p>
      </div>
      <div class="text-right">
        <h2 class="text-2xl font-bold text-blue-600">INVOICE</h2>
        <p class="text-sm text-gray-600">Invoice #: <strong>{{ invoiceData?.invoice_code }}</strong></p>
        <p class="text-sm text-gray-600">Invoice Date: <strong>{{ invoiceData?.issue_date }}</strong></p>
        <p class="text-sm text-gray-600">Terms: <strong>{{ invoiceData?.terms }}</strong></p>
        <p class="text-sm text-gray-600">Due Date: <strong>{{ invoiceData?.due_date }}</strong></p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <h3 class="font-bold">Bill To</h3>
        <p class="text-sm text-gray-600">{{ invoiceData.user_name }}
          <br>{{ invoiceData?.order?.user?.email }}
        </p>
      </div>

      <div v-if="invoiceData?.order?.order_detail?.shipping_address">
        <h3 class="font-bold">Ship To</h3>
        <p class="text-sm text-gray-600">{{ invoiceData?.order?.order_detail?.shipping_address }}</p>
      </div>

    </div>

    <table class="w-full border-collapse border border-gray-300 mb-4">
      <thead>
        <tr class="bg-blue-600 text-white">
          <th class="p-2 text-left">#</th>
          <th class="p-2 text-left">Item</th>
          <th class="p-2 text-right">Qty</th>
          <th class="p-2 text-right">Rate</th>
          <th class="p-2 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in invoiceData?.order?.order_items ?? []" :key="item?.id ?? index"
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
        <tr>
          <td class="p-2">Subtotal:</td>
          <td class="p-2 font-bold">
            {{ invoiceData?.order?.sub_total ?? '0.00' }}
          </td>
        </tr>
        <tr>
          <td class="p-2">
            Tax Rate ({{ invoiceData?.order?.tax_rate ?? '0.00' }}%):
          </td>
          <td class="p-2 font-bold">
            {{ invoiceData?.order?.total_tax ?? '0.00' }}
          </td>
        </tr>
        <tr class="bg-blue-100">
          <td class="p-2 font-bold">Total:</td>
          <td class="p-2 font-bold">
            {{ invoiceData?.order?.total_amount ?? '0.00' }}
          </td>
        </tr>
        <tr class="bg-blue-200">
          <td class="p-2 font-bold">Total Paid:</td>
          <td class="p-2 font-bold">
            {{ invoiceData?.order?.credit_applied ?? '0.00' }}
          </td>
        </tr>
        <tr class="bg-blue-300">
          <td class="p-2 font-bold">Balance Due:</td>
          <td class="p-2 font-bold">
            {{
              (parseFloat(invoiceData?.order?.total_amount ?? 0) -
                parseFloat(invoiceData?.order?.credit_applied ?? 0)).toFixed(2)
            }}
          </td>
        </tr>
      </table>


    </div>

    <p class="text-sm text-gray-600 mt-4">Thanks for your business.</p>
    <p class="text-xs text-gray-500">{{ invoiceData.invoice_note }}</p>
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