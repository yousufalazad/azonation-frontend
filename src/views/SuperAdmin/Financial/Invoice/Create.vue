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
// const invoice_code = ref('');
// const user_id = ref(auth.user.id); // Automatically assigned
// const user_name = ref('');
const billing_address = ref('');
const billing_id = ref('');
const billing_code = ref('');
const item_name = ref('');
const item_description = ref('');
const generated_at = ref('');
const issued_at = ref('');
const due_at = ref('');
const total_active_member = ref('');
const total_active_honorary_member = ref('');
const total_billable_active_member = ref('');
const subscribed_package_name = ref('');
const price_rate = ref('');
const currency = ref('');
const subtotal = ref('');
const discount_title = ref('');
const discount = ref('');
const tax = ref('');
const balance = ref('');
const invoice_note = ref('');
const invoice_status = ref('');
const credit_applied = ref('');
const is_published = ref(1);
const payment_status = ref('');
const payment_status_reason = ref('');
const admin_note = ref('');
const billingList = ref([]);

// Fetch billingList
const getBillingList = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/billing-list', {}, 'GET');
    billingList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching billing list:', error);
    billingList.value = [];
  }
};

// Reset form
const resetForm = () => {
  id.value = '';
  // invoice_code.value = '';
  // user_name.value = '';
  billing_address.value = '';
  billing_id.value = '';
  billing_code.value = '';
  item_name.value = '';
  item_description.value = '';
  generated_at.value = '';
  issued_at.value = '';
  due_at.value = '';
  total_active_member.value = '';
  total_active_honorary_member.value = '';
  total_billable_active_member.value = '';
  subscribed_package_name.value = '';
  price_rate.value = '';
  currency.value = '';
  subtotal.value = '';
  discount_title.value = '';
  discount.value = '';
  tax.value = '';
  balance.value = '';
  invoice_note.value = '';
  invoice_status.value = '';
  credit_applied.value = '';
  is_published.value = 1;
  payment_status.value = '';
  payment_status_reason.value = '';
  admin_note.value = '';
};

// Submit form
const submitForm = async () => {
  if (!billing_id.value) {
    Swal.fire('Error!', 'Please fill in all required fields.', 'error');
    return;
  }

  const payload = {
    id: id.value,
    // invoice_code: invoice_code.value,
    // user_id: user_id.value,
    // user_name: user_name.value,
    billing_address: billing_address.value,
    billing_id: billing_id.value,
    billing_code: billing_code.value,
    item_name: item_name.value,
    item_description: item_description.value,
    generated_at: generated_at.value,
    issued_at: issued_at.value,
    due_at: due_at.value,
    total_active_member: total_active_member.value,
    total_active_honorary_member: total_active_honorary_member.value,
    total_billable_active_member: total_billable_active_member.value,
    subscribed_package_name: subscribed_package_name.value,
    price_rate: price_rate.value,
    currency: currency.value,
    subtotal: subtotal.value,
    discount_title: discount_title.value,
    discount: discount.value,
    tax: tax.value,
    balance: balance.value,
    invoice_note: invoice_note.value,
    invoice_status: invoice_status.value,
    credit_applied: credit_applied.value,
    is_published: is_published.value,
    payment_status: payment_status.value,
    payment_status_reason: payment_status_reason.value,
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
      const response = await auth.fetchProtectedApi('/api/create-invoice', payload, 'POST');
      if (response.status) {
        Swal.fire('Success!', 'Invoice created successfully.', 'success').then(() => {
          resetForm();
          router.push({ name: 'super-admin-invoice-list' }); // Adjust route name
        });
      } else {
        Swal.fire('Failed!', 'Failed to create the invoice.', 'error');
      }
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

// Fetch billing list on mount
onMounted(() => {
  getBillingList();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Add New Invoice</h2>
      <button @click="$router.push({ name: 'super-admin-invoice-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Invoice List
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- General Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- <div>
          <label for="invoice_code" class="block text-sm font-medium text-gray-700">Invoice Code</label>
          <input v-model="invoice_code" type="text" id="invoice_code" class="input-field" required />
        </div> -->

        <div>
          <label for="billing_id" class="block text-sm font-medium text-gray-700">Billing ID</label>
          <!-- <input v-model="billing_id" type="text" id="billing_id" class="input-field" required /> -->
          <select v-model="billing_id" id="billing_id" class="w-full border border-gray-300 rounded-md p-2" required>
            <option value="">Select Billing</option>
            <option v-for="billing in billingList" :key="billing.id" :value="billing.id">{{
              billing.id }}</option>
          </select>
        </div>

        <div>
          <label for="billing_code" class="block text-sm font-medium text-gray-700">Billing Code</label>
          <!-- <input v-model="billing_code" type="text" id="billing_code" class="input-field" required /> -->
          <select v-model="billing_code" id="billing_code" class="w-full border border-gray-300 rounded-md p-2"
            required>
            <option value="">Select Billing Code</option>
            <option v-for="billing in billingList" :key="billing.billing_code" :value="billing.billing_code">{{
              billing.billing_code }}</option>
          </select>
        </div>

      </div>

      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <!-- <div>
          <label for="user_name" class="block text-sm font-medium text-gray-700">User Name</label>
          <input v-model="user_name" type="text" id="user_name" class="input-field" />
        </div> -->
        <div>
          <label for="billing_address" class="block text-sm font-medium text-gray-700">Billing Address</label>
          <input v-model="billing_address" type="text" id="billing_address" class="input-field" />
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="generated_at" class="block text-sm font-medium text-gray-700">Generated At</label>
          <input v-model="generated_at" type="date" id="generated_at" class="input-field" />
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

      <!-- Item Details -->
      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div>
          <label for="item_name" class="block text-sm font-medium text-gray-700">Item Name</label>
          <input v-model="item_name" type="text" id="item_name" class="input-field" />
        </div>
        <div>
          <label for="item_description" class="block text-sm font-medium text-gray-700">Item Description</label>
          <textarea v-model="item_description" id="item_description" class="input-field"></textarea>
        </div>
      </div>

      <!-- Financial Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="total_active_member" class="block text-sm font-medium text-gray-700">Total Active Members</label>
          <input v-model="total_active_member" type="number" id="total_active_member" class="input-field" />
        </div>
        <div>
          <label for="total_active_honorary_member" class="block text-sm font-medium text-gray-700">Total Active
            Honorary Members</label>
          <input v-model="total_active_honorary_member" type="number" id="total_active_honorary_member"
            class="input-field" />
        </div>
        <div>
          <label for="total_billable_active_member" class="block text-sm font-medium text-gray-700">Total Billable
            Active Members</label>
          <input v-model="total_billable_active_member" type="number" id="total_billable_active_member"
            class="input-field" />
        </div>
      </div>

      <!-- Package & Pricing -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="subscribed_package_name" class="block text-sm font-medium text-gray-700">Subscribed
            Package</label>
          <input v-model="subscribed_package_name" type="text" id="subscribed_package_name" class="input-field" />
        </div>
        <div>
          <label for="price_rate" class="block text-sm font-medium text-gray-700">Price Rate</label>
          <input v-model="price_rate" type="number" id="price_rate" class="input-field" />
        </div>
        <div>
          <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
          <input v-model="currency" type="text" id="currency" class="input-field" />
        </div>
        <div>
          <label for="subtotal" class="block text-sm font-medium text-gray-700">Subtotal</label>
          <input v-model="subtotal" type="number" id="subtotal" class="input-field" />
        </div>
        <div>
          <label for="discount_title" class="block text-sm font-medium text-gray-700">Discount Title</label>
          <input v-model="discount_title" type="text" id="discount_title" class="input-field" />
        </div>
        <div>
          <label for="discount" class="block text-sm font-medium text-gray-700 ">Discount</label>
          <input v-model="discount" type="number" id="discount" class="input-field" />
        </div>
        <div>
          <label for="tax" class="block text-sm font-medium text-gray-700">Tax</label>
          <input v-model="tax" type="number" id="tax" class="input-field" />
        </div>
        <div>
          <label for="balance" class="block text-sm font-medium text-gray-700">Balance</label>
          <input v-model="balance" type="number" id="balance" class="input-field" />
        </div>
        <div>
          <label for="credit_applied" class="block text-sm font-medium text-gray-700">Credit Applied</label>
          <input v-model="credit_applied" type="number" id="credit_applied" class="input-field" />
        </div>
      </div>



      <!-- Payment & Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="payment_status" class="block text-sm font-medium text-gray-700">Payment Status</label>
          <select v-model="payment_status" id="payment_status" class="input-field">
            <option value="">Select Payment Status</option>
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
          <label for="payment_status_reason" class="block text-sm font-medium text-gray-700">Payment Status
            Reason</label>
          <input v-model="payment_status_reason" type="text" id="payment_status_reason" class="input-field" />
        </div>
        <div>
          <label for="invoice_status" class="block text-sm font-medium text-gray-700">Invoice Status</label>
          <select v-model="invoice_status" id="invoice_status" class="input-field">
            <option value="">Select Invoice Status</option>
            <option value="issued">Issued</option>
            <option value="unissued">Unissued</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label for="is_published" class="block text-sm font-medium text-gray-700">Is Published</label>
          <select v-model="is_published" id="is_published" class="input-field">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
      </div>

      <!-- Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="invoice_note" class="block text-sm font-medium text-gray-700">Invoice Note</label>
          <textarea v-model="invoice_note" id="invoice_note" class="input-field"></textarea>
        </div>
        <div>
          <label for="admin_note" class="block text-sm font-medium text-gray-700">Admin Note</label>
          <textarea v-model="admin_note" id="admin_note" class="input-field"></textarea>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between">
        <!-- <button type="button" @click="resetForm"
          class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-lg shadow">
          Reset
        </button> -->
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
