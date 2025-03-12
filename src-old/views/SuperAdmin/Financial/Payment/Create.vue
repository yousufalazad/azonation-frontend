<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Form fields
const invoice_id = ref('');
const gateway = ref('');
const transaction_id = ref('');
const payment_status = ref('');
const payment_method = ref('');
const currency = ref('');
const amount_paid = ref('');
const exchange_rate = ref('');
const note = ref('');
const admin_note = ref('');

const invoiceList = ref([]);
// Fetch invoiceList
const getInvoiceList = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/invoices', {}, 'GET');
    invoiceList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching invoice list:', error);
    invoiceList.value = [];
  }
};

// Reset form
const resetForm = () => {
  invoice_id.value = '';
  gateway.value = '';
  transaction_id.value = '';
  payment_status.value = '';
  payment_method.value = '';
  currency.value = '';
  amount_paid.value = '';
  exchange_rate.value = '';
  note.value = '';
  admin_note.value = '';
};

// Submit form
const submitForm = async () => {
  if (!invoice_id.value || !gateway.value || !transaction_id.value || !payment_status.value || !payment_method.value || !currency.value || !amount_paid.value) {
    Swal.fire('Error!', 'Please fill in all required fields.', 'error');
    return;
  }

  const payload = {
    invoice_id: invoice_id.value,
    gateway: gateway.value,
    transaction_id: transaction_id.value,
    payment_status: payment_status.value,
    payment_method: payment_method.value,
    currency: currency.value,
    amount_paid: amount_paid.value,
    exchange_rate: exchange_rate.value,
    note: note.value,
    admin_note: admin_note.value,
  };

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this invoice?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi('/api/create-payment-log', payload, 'POST');
      if (response.status) {
        Swal.fire('Success!', 'Invoice created successfully.', 'success').then(() => {
          resetForm();
          router.push({ name: 'super-admin-payment-log-list' }); // Adjust route name
        });
      } else {
        Swal.fire('Failed!', 'Failed to create the payment-log.', 'error');
      }
    }
  } catch (error) {
    console.error('Error creating payment-log:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

// Fetch on mount
onMounted(() => {
  resetForm();
  getInvoiceList();
});
</script>



<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Add New Payment Log</h2>
      <button @click="$router.push({ name: 'super-admin-payment-log-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Payment Log List
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Invoice Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="invoice_id" class="block text-sm font-medium text-gray-700">Invoice ID</label>
          <select v-model="invoice_id" id="invoice_id" class="w-full border border-gray-300 rounded-md p-2" required>
            <option value="">Select Invoice</option>
            <option v-for="invoice in invoiceList" :key="invoice.id" :value="invoice.id">{{invoice.invoice_code }}</option>
          </select>
        </div>
        <div>
          <label for="gateway" class="block text-sm font-medium text-gray-700">Payment Gateway</label>
          <input v-model="gateway" type="text" id="gateway" class="input-field" required />
        </div>
      </div>

      <!-- Transaction Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="transaction_id" class="block text-sm font-medium text-gray-700">Transaction ID</label>
          <input v-model="transaction_id" type="text" id="transaction_id" class="input-field" required />
        </div>
        <div>
          <label for="payment_status" class="block text-sm font-medium text-gray-700">Payment Status</label>
          <select v-model="payment_status" id="payment_status" class="input-field" required>
            <option value="">Select Payment Status</option>
            <option value="initiated">Initiated</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="payment_method" class="block text-sm font-medium text-gray-700">Payment Method</label>
          <!-- <input v-model="payment_method" type="text" id="payment_method" class="input-field" required /> -->
          <select v-model="payment_method" id="payment_method" class="input-field" required>
            <option value="">Select Payment Method</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="mobile_payment">Mobile Payment</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div>
          <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
          <input v-model="currency" type="text" id="currency" class="input-field" required />
        </div>
      </div>

      <!-- Financial Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="amount_paid" class="block text-sm font-medium text-gray-700">Amount Paid</label>
          <input v-model="amount_paid" type="number" id="amount_paid" class="input-field" required />
        </div>
        <div>
          <label for="exchange_rate" class="block text-sm font-medium text-gray-700">Exchange Rate</label>
          <input v-model="exchange_rate" type="number" step="0.01" id="exchange_rate" class="input-field" required />
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between">
        <button type="button" @click="resetForm"
          class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-lg shadow">
          Reset
        </button>
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
          Submit
        </button>
      </div>
    </form>
  </div>
</template>


<style scoped>
.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
}
</style>
