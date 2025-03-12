<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const router = useRouter();
const auth = authStore;

// Form fields
const receipt_code = ref('');
const invoice_id = ref('');
const user_id = ref('');
const amount_received = ref('');
const payment_method = ref('');
const transaction_reference = ref('');
const payment_date = ref('');
const note = ref('');
const status = ref('');
const admin_note = ref('');
const is_published = ref(false);

const invoiceList = ref([]);
const userList = ref([]);

// Fetch data
const fetchData = async () => {
  try {
    const invoices = await auth.fetchProtectedApi('/api/invoices', {}, 'GET');
    invoiceList.value = invoices.status ? invoices.data : [];

    const users = await auth.fetchProtectedApi('/api/project-attendances/org-user-list', {}, 'GET');
    userList.value = users.status ? users.data : [];
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Reset form
const resetForm = () => {
  receipt_code.value = '';
  invoice_id.value = '';
  user_id.value = '';
  amount_received.value = '';
  payment_method.value = '';
  transaction_reference.value = '';
  payment_date.value = '';
  note.value = '';
  status.value = '';
  admin_note.value = '';
  is_published.value = false;
};

// Submit form
const submitForm = async () => {
  if (
    !receipt_code.value ||
    !invoice_id.value ||
    !user_id.value ||
    !amount_received.value ||
    !payment_method.value ||
    !transaction_reference.value ||
    !payment_date.value ||
    !status.value
  ) {
    Swal.fire('Error!', 'Please fill in all required fields.', 'error');
    return;
  }

  const payload = {
    receipt_code: receipt_code.value,
    invoice_id: invoice_id.value,
    user_id: user_id.value,
    amount_received: amount_received.value,
    payment_method: payment_method.value,
    transaction_reference: transaction_reference.value,
    payment_date: payment_date.value,
    note: note.value,
    status: status.value,
    admin_note: admin_note.value,
    is_published: is_published.value,
  };

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this receipt?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi('/api/create-receipt', payload, 'POST');
      if (response.status) {
        Swal.fire('Success!', 'Receipt created successfully.', 'success').then(() => {
          resetForm();
          router.push({ name: 'super-admin-receipt-list' }); // Redirect if data not found
        });
      } else {
        Swal.fire('Failed!', 'Failed to create the receipt.', 'error');
      }
    }
  } catch (error) {
    console.error('Error creating receipt:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

// Fetch on mount
onMounted(() => {
  resetForm();
  fetchData();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Add New Receipt</h2>
      <button @click="$router.push({ name: 'super-admin-receipt-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Receipt List
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Receipt Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="receipt_code" class="block text-sm font-medium text-gray-700">Receipt Code</label>
          <input v-model="receipt_code" type="text" id="receipt_code" class="input-field" required />
        </div>
        <div>
          <label for="invoice_id" class="block text-sm font-medium text-gray-700">Invoice</label>
          <select v-model="invoice_id" id="invoice_id" class="input-field" required>
            <option value="">Select Invoice</option>
            <option v-for="invoice in invoiceList" :key="invoice.id" :value="invoice.id">{{ invoice.invoice_code }}</option>
          </select>
        </div>
      </div>

      <!-- User & Amount -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="user_id" class="block text-sm font-medium text-gray-700">User</label>
          <select v-model="user_id" id="user_id" class="input-field" required>
            <option value="">Select User</option>
            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }}</option>
          </select>
        </div>
        <div>
          <label for="amount_received" class="block text-sm font-medium text-gray-700">Amount Received</label>
          <input v-model="amount_received" type="number" id="amount_received" class="input-field" required />
        </div>
      </div>

      <!-- Payment Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="payment_method" class="block text-sm font-medium text-gray-700">Payment Method</label>
          <select v-model="payment_method" id="payment_method" class="input-field" required>
            <option value="">Select Payment Method</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="mobile_payment">Mobile Payment</option>
            <option value="payPal">PayPal</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div>
          <label for="transaction_reference" class="block text-sm font-medium text-gray-700">Transaction Reference</label>
          <input v-model="transaction_reference" type="text" id="transaction_reference" class="input-field" required />
        </div>
      </div>

      <!-- Additional Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="payment_date" class="block text-sm font-medium text-gray-700">Payment Date</label>
          <input v-model="payment_date" type="date" id="payment_date" class="input-field" required />
        </div>
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="status" id="status" class="input-field" required>
            <option value="">Select Status</option>
            <option value="processed">Processed</option>
            <option value="refunded">Refunded</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <!-- Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
          <textarea v-model="note" id="note" class="input-field"></textarea>
        </div>
        <div>
          <label for="admin_note" class="block text-sm font-medium text-gray-700">Admin Note</label>
          <textarea v-model="admin_note" id="admin_note" class="input-field"></textarea>
        </div>
      </div>

      <!-- Publish -->
      <div class="flex items-center">
        <input v-model="is_published" type="checkbox" id="is_published" class="mr-2">
        <label for="is_published" class="text-sm font-medium text-gray-700">Published</label>
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
</style>