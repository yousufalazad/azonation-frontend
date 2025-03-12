<script setup>
import { ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;


// Form fields
const id = ref('');
// const invoice_code = ref('');
const billing_code = ref('');
const order_code = ref('');
const order_id = ref('');
const user_id = ref('');
const user_name = ref('');
const description = ref('');
const total_amount = ref('');
const amount_paid = ref('');
const balance_due = ref('');
const currency_code = ref('');
const generate_date = ref('');
const issue_date = ref('');
const due_date = ref('');
const terms = ref('');
const invoice_note = ref('');
const is_published = ref(false);
const invoice_status = ref('');
const payment_status = ref('');
const admin_note = ref('');
const is_active = ref(true);

const billingList = ref([]);
// Fetch billing list
const getBillingList = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/management-and-storage-billings', {}, 'GET');
    billingList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching billing list:', error);
    billingList.value = [];
  }
};

const orderList = ref([]);
const getOrders = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/orders`, {}, 'GET');
    orderList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};


// Load existing invoice details
const fetchInvoiceDetails = async () => {
  const invoiceId = route.params.id; // Assume route param holds the invoice ID
  try {
    const response = await auth.fetchProtectedApi(`/api/invoices/${invoiceId}`, {}, 'GET');
    if (response.status) {
      const data = response.data;
      // Assigning data to variables
      id.value = data.id;
      // invoice_code.value = data.invoice_code;
      billing_code.value = data.billing_code;
      order_code.value = data.order_code;
      order_id.value = data.order_id;
      user_id.value = data.user_id;
      user_name.value = data.user_name;
      description.value = data.description;
      total_amount.value = data.total_amount;
      amount_paid.value = data.amount_paid;
      balance_due.value = data.balance_due;
      currency_code.value = data.currency_code;
      generate_date.value = data.generate_date;
      issue_date.value = data.issue_date;
      due_date.value = data.due_date;
      terms.value = data.terms;
      invoice_note.value = data.invoice_note;
      is_published.value = data.is_published;
      invoice_status.value = data.invoice_status;
      payment_status.value = data.payment_status;
      admin_note.value = data.admin_note;
      is_active.value = data.is_active;
    }
    else {
      Swal.fire('Error!', 'Failed to fetch invoice details.', 'error');
      router.push({ name: 'invoice-list' }); // Redirect if data not found
    }
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    router.push({ name: 'invoice-list' });
  }
};

// Reset form
const resetForm = () => {
  // invoice_code.value = '';
  billing_code.value = '';
  order_code.value = '';
  order_id.value = '';
  user_id.value = '';
  user_name.value = '';
  description.value = '';
  total_amount.value = '';
  amount_paid.value = '';
  balance_due.value = '';
  currency_code.value = '';
  generate_date.value = '';
  issue_date.value = '';
  due_date.value = '';
  terms.value = '';
  invoice_note.value = '';
  is_published.value = false;
  invoice_status.value = '';
  payment_status.value = '';
  admin_note.value = '';
  is_active.value = true;
};

// Submit form
const submitForm = async () => {
  // if (!billing_id.value) {
  //   Swal.fire('Error!', 'Please fill in all required fields.', 'error');
  //   return;
  // }

  const payload = {
    // invoice_code: invoice_code.value,
    billing_code: billing_code.value,
    order_code: order_code.value,
    order_id: order_id.value,
    user_id: user_id.value,
    user_name: user_name.value,
    description: description.value,
    total_amount: total_amount.value,
    amount_paid: amount_paid.value,
    balance_due: balance_due.value,
    currency_code: currency_code.value,
    generate_date: generate_date.value,
    issue_date: issue_date.value,
    due_date: due_date.value,
    terms: terms.value,
    invoice_note: invoice_note.value,
    is_published: is_published.value,
    invoice_status: invoice_status.value,
    payment_status: payment_status.value,
    admin_note: admin_note.value,
    is_active: is_active.value,
  };


  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this invoice?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/invoices/${id.value}`, payload, 'PUT');
      if (response.status) {
        Swal.fire('Success!', 'Invoice updated successfully.', 'success').then(() => {
          router.push({ name: 'super-admin-invoice-list' });
        });
      } else {
        Swal.fire('Failed!', 'Failed to update the invoice.', 'error');
      }
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

// Watch for changes in order_id and update fields
watch(order_id, (newOrderId) => {
  const selectedOrder = orderList.value.find(order => order.id == newOrderId);
  if (selectedOrder) {
    order_code.value = selectedOrder.order_code;
    billing_code.value = selectedOrder.billing_code;
    user_id.value = selectedOrder.user_id;
    user_name.value = selectedOrder.user_name;
  } else {
    // Reset fields if no order is selected
    order_code.value = '';
    billing_code.value = '';
    user_id.value = '';
    user_name.value = '';
  }
});

// Initialize component
onMounted(() => {
  getOrders();
  getBillingList();
  fetchInvoiceDetails();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Edit Invoice</h2>
      <button @click="$router.push({ name: 'super-admin-invoice-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Invoice List
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- <div>
          <label for="invoice_code" class="block text-sm font-medium text-gray-700">Invoice Code</label>
          <input v-model="invoice_code" type="text" id="invoice_code" class="input-field" required />
        </div> -->

        <div>
          <label for="order_id" class="block text-sm font-medium text-gray-700">Order</label>
          <select v-model="order_id" id="order_id" class="w-full border border-gray-300 rounded-md p-2">
            <option value="">Select Order</option>
            <option v-for="order in orderList" :key="order.id" :value="order.id">
              {{ order.order_code }}
            </option>
          </select>
        </div>

        <div>
          <label for="order_code" class="block text-sm font-medium text-gray-700">Order Code</label>
          <input v-model="order_code" type="text" id="order_code" class="input-field" required />
        </div>

        <div>
          <label for="billing_code" class="block text-sm font-medium text-gray-700">Billing Code</label>
          <input v-model="billing_code" type="text" id="billing_code" class="input-field" required />
        </div>

        <div>
          <label for="user_id" class="block text-sm font-medium text-gray-700">User ID</label>
          <input v-model="user_id" type="number" id="user_id" class="input-field" required />
        </div>

        <div>
          <label for="user_name" class="block text-sm font-medium text-gray-700">User Name</label>
          <input v-model="user_name" type="text" id="user_name" class="input-field" required />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="description" id="description" class="input-field"></textarea>
        </div>

        <div>
          <label for="total_amount" class="block text-sm font-medium text-gray-700">Total Amount</label>
          <input v-model="total_amount" type="number" step="0.01" id="total_amount" class="input-field" required />
        </div>

        <div>
          <label for="amount_paid" class="block text-sm font-medium text-gray-700">Amount Paid</label>
          <input v-model="amount_paid" type="number" step="0.01" id="amount_paid" class="input-field" required />
        </div>

        <div>
          <label for="balance_due" class="block text-sm font-medium text-gray-700">Balance Due</label>
          <input v-model="balance_due" type="number" step="0.01" id="balance_due" class="input-field" required />
        </div>

        <div>
          <label for="currency_code" class="block text-sm font-medium text-gray-700">Currency Code</label>
          <input v-model="currency_code" type="text" id="currency_code" class="input-field" required />
        </div>

        <div>
          <label for="generate_date" class="block text-sm font-medium text-gray-700">Generate Date</label>
          <input v-model="generate_date" type="date" id="generate_date" class="input-field" required />
        </div>

        <div>
          <label for="issue_date" class="block text-sm font-medium text-gray-700">Issue Date</label>
          <input v-model="issue_date" type="date" id="issue_date" class="input-field" required />
        </div>

        <div>
          <label for="due_date" class="block text-sm font-medium text-gray-700">Due Date</label>
          <input v-model="due_date" type="date" id="due_date" class="input-field" required />
        </div>

        <div>
          <label for="terms" class="block text-sm font-medium text-gray-700">Terms</label>
          <textarea v-model="terms" id="terms" class="input-field"></textarea>
        </div>

        <div>
          <label for="invoice_note" class="block text-sm font-medium text-gray-700">Invoice Note</label>
          <textarea v-model="invoice_note" id="invoice_note" class="input-field"></textarea>
        </div>

        <div>
          <label for="is_published" class="block text-sm font-medium text-gray-700">Published</label>
          <select v-model="is_published" id="is_published" class="input-field">
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>

        <div>
          <label for="invoice_status" class="block text-sm font-medium text-gray-700">Invoice Status</label>
          <select v-model="invoice_status" id="invoice_status" class="input-field" required>
            <option value="issued">Issued</option>
            <option value="unissued">Unissued</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>
          <!-- <input v-model="invoice_status" type="text" id="invoice_status" class="input-field" required /> -->
        </div>

        <div>
          <label for="payment_status" class="block text-sm font-medium text-gray-700">Payment Status</label>
          <select v-model="payment_status" id="payment_status" class="input-field" required>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
          <option value="collections">Collections</option>
          <option value="payment_pending">Payment Pending</option>
          <option value="processing">Processing</option>
        </select>
          <!-- <input v-model="payment_status" type="text" id="payment_status" class="input-field" required /> -->
        </div>

        <div>
          <label for="admin_note" class="block text-sm font-medium text-gray-700">Admin Note</label>
          <textarea v-model="admin_note" id="admin_note" class="input-field"></textarea>
        </div>

        <div>
          <label for="is_active" class="block text-sm font-medium text-gray-700">Active</label>
          <select v-model="is_active" id="is_active" class="input-field">
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>
      </div>

      <div class="flex justify-between">
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
          Submit
        </button>
        <button type="button" @click="resetForm"
          class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-gray-300">
          Reset
        </button>
      </div>
    </form>

  </div>
</template>

<style scoped>
.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 8px;
  border-radius: 6px;
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