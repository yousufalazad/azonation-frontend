<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Form fields
const id = ref('');
const invoice_code = ref('');
const user_id = ref(auth.user.id); // Automatically assigned
const billing_id = ref('');
const item_name = ref('');
const item_description = ref('');
const generated_at = ref('');
const issued_at = ref('');
const due_at = ref('');
const subtotal_amount = ref('');
const discount_description = ref('');
const discount_value = ref('');
const tax_amount = ref('');
const credit_applied = ref('');
const total_amount_due = ref('');
const additional_note = ref('');
const is_published = ref(1);
const payment_status = ref('');
const status_reason = ref('');
const admin_note = ref('');
const billingList = ref([]);

// Fetch billing list
const getBillingList = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/billing-list', {}, 'GET');
    billingList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching billing list:', error);
    billingList.value = [];
  }
};

// Load existing invoice details
const fetchInvoiceDetails = async () => {
  const invoiceId = route.params.id; // Assume route param holds the invoice ID
  try {
    const response = await auth.fetchProtectedApi(`/api/get-invoice/${invoiceId}`, {}, 'GET');
    if (response.status) {
      const data = response.data;
      id.value = data.id;
      invoice_code.value = data.invoice_code;
      billing_id.value = data.billing_id;
      item_name.value = data.item_name;
      item_description.value = data.item_description;
      generated_at.value = data.generated_at;
      issued_at.value = data.issued_at;
      due_at.value = data.due_at;
      subtotal_amount.value = data.subtotal_amount;
      discount_description.value = data.discount_description;
      discount_value.value = data.discount_value;
      tax_amount.value = data.tax_amount;
      credit_applied.value = data.credit_applied;
      total_amount_due.value = data.total_amount_due;
      additional_note.value = data.additional_note;
      is_published.value = data.is_published;
      payment_status.value = data.payment_status;
      status_reason.value = data.status_reason;
      admin_note.value = data.admin_note;
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

// Reset form
const resetForm = () => {
  fetchInvoiceDetails(); // Reset to fetched data
};

// Submit form
const submitForm = async () => {
  if (!invoice_code.value || !billing_id.value || !item_name.value || !generated_at.value) {
    Swal.fire('Error!', 'Please fill in all required fields.', 'error');
    return;
  }

  const payload = {
    id: id.value,
    invoice_code: invoice_code.value,
    user_id: user_id.value,
    billing_id: billing_id.value,
    item_name: item_name.value,
    item_description: item_description.value,
    generated_at: generated_at.value,
    issued_at: issued_at.value,
    due_at: due_at.value,
    subtotal_amount: subtotal_amount.value,
    discount_description: discount_description.value,
    discount_value: discount_value.value,
    tax_amount: tax_amount.value,
    credit_applied: credit_applied.value,
    total_amount_due: total_amount_due.value,
    additional_note: additional_note.value,
    is_published: is_published.value,
    payment_status: payment_status.value,
    status_reason: status_reason.value,
    admin_note: admin_note.value,
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
      const response = await auth.fetchProtectedApi(`/api/update-invoice/${id.value}`, payload, 'PUT');
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

// Initialize component
onMounted(() => {
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
    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Grid for general fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Invoice Code -->
        <div>
          <label for="invoice_code" class="block text-sm font-medium text-gray-700">Invoice Code</label>
          <input v-model="invoice_code" type="text" id="invoice_code" class="input-field" required />
        </div>
        <!-- Billing ID -->
        <div>
          <label for="billing_id" class="block text-sm font-medium text-gray-700">Billing ID</label>
          <!-- <input v-model="billing_id" type="text" id="billing_id" class="input-field" required /> -->
          <select v-model="billing_id" id="billing_id" class="w-full border border-gray-300 rounded-md p-2" required>
            <option value="">Select Billing</option>
            <option v-for="billing in billingList" :key="billing.id" :value="billing.id">{{
              billing.id }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Item Name -->
        <div>
          <label for="item_name" class="block text-sm font-medium text-gray-700">Item Name</label>
          <input v-model="item_name" type="text" id="item_name" class="input-field" required />
        </div>
        <!-- Item Description -->
        <div>
          <label for="item_description" class="block text-sm font-medium text-gray-700">Item Description</label>
          <textarea v-model="item_description" id="item_description" class="input-field"></textarea>
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="generated_at" class="block text-sm font-medium text-gray-700">Generated At</label>
          <input v-model="generated_at" type="date" id="generated_at" class="input-field" required />
        </div>
        <div>
          <label for="issued_at" class="block text-sm font-medium text-gray-700">Issued At</label>
          <input v-model="issued_at" type="date" id="issued_at" class="input-field" />
        </div>
        <div>
          <label for="due_at" class="block text-sm font-medium text-gray-700">Due At</label>
          <input v-model="due_at" type="date" id="due_at" class="input-field" />
        </div>
      </div>

      <!-- Financial Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="subtotal_amount" class="block text-sm font-medium text-gray-700">Subtotal Amount</label>
          <input v-model="subtotal_amount" type="number" id="subtotal_amount" class="input-field" />
        </div>
        <div>
          <label for="tax_amount" class="block text-sm font-medium text-gray-700">Tax Amount</label>
          <input v-model="tax_amount" type="number" id="tax_amount" class="input-field" />
        </div>
        <div>
          <label for="credit_applied" class="block text-sm font-medium text-gray-700">Credit Applied</label>
          <input v-model="credit_applied" type="number" id="credit_applied" class="input-field" />
        </div>
      </div>

      <!-- Total and Discounts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="discount_description" class="block text-sm font-medium text-gray-700">Discount Description</label>
          <input v-model="discount_description" type="text" id="discount_description" class="input-field" />
        </div>
        <div>
          <label for="discount_value" class="block text-sm font-medium text-gray-700">Discount Value</label>
          <input v-model="discount_value" type="number" id="discount_value" class="input-field" />
        </div>
      </div>
      <div>
        <label for="total_amount_due" class="block text-sm font-medium text-gray-700">Total Amount Due</label>
        <input v-model="total_amount_due" type="number" id="total_amount_due" class="input-field" required />
      </div>

      <!-- Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="additional_note" class="block text-sm font-medium text-gray-700">Additional Note</label>
          <textarea v-model="additional_note" id="additional_note" class="input-field"></textarea>
        </div>
        <div>
          <label for="admin_note" class="block text-sm font-medium text-gray-700">Admin Note</label>
          <textarea v-model="admin_note" id="admin_note" class="input-field"></textarea>
        </div>
      </div>

      <!-- Status -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div>
          <label for="payment_status" class="block text-sm font-medium text-gray-700">Payment Status</label>
          <!-- <input v-model="payment_status" type="text" id="payment_status" class="input-field" /> -->
          <select v-model="payment_status" id="payment_status"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2">
            <option value="">Select Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="collections">Collections</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="processing">Processing</option>
          </select>
        </div>
        <div>
          <label for="status_reason" class="block text-sm font-medium text-gray-700">Status Reason</label>
          <input v-model="status_reason" type="text" id="status_reason" class="input-field" />
        </div>
        <div>
          <label for="is_published" class="block text-sm font-medium text-gray-700">Is Published</label>
          <select v-model="is_published" id="is_published"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between">
        <button type="button" @click="resetForm" class="btn-secondary">Reset</button>
        <button type="submit" class="btn-primary">Submit</button>
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