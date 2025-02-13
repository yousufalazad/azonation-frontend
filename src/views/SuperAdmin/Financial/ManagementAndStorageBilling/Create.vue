<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();

const auth = authStore;
const userId = auth.user.id;

// Fetch user list for order
const userList = ref([]);
const getUserList = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/get-all-org-user', {}, 'GET');
    userList.value = response.data ? response.data : [];
  } catch (error) {
    console.error('Error fetching user list:', error);
    userList.value = [];
  }
}

// Form fields
const user_id = ref('');
const billing_code = ref('');
const period_start = ref('');
const period_end = ref('');
const service_month = ref('');
const service_year = ref('');
const billing_month = ref('');
const billing_year = ref('');
const total_member = ref('');
const total_management_bill_amount = ref('');
const total_storage_bill_amount = ref('');
const currency_code = ref('');
const bill_status = ref("");
const admin_note = ref('');
const is_active = ref(1);

// Reset form fields
const resetForm = () => {
  user_id.value = '';
  billing_code.value = '';
  period_start.value = '';
  period_end.value = '';
  service_month.value = '';
  service_year.value = '';
  billing_month.value = '';
  billing_year.value = '';
  total_member.value = '';
  total_management_bill_amount.value = '';
  total_storage_bill_amount.value = '';
  currency_code.value = '';
  bill_status.value = "";
  admin_note.value = '';
  is_active.value = 1;
};

// Submit form (create billing)
const submitForm = async () => {
  // if (!billing_code.value) {
  //   Swal.fire('Error!', 'Please fill in all required fields.', 'error');
  //   return;
  // }

  const payload = {
    // user_id: userId,
    user_id: user_id.value,
    billing_code: billing_code.value,
    period_start: period_start.value,
    period_end: period_end.value,
    service_month: service_month.value,
    service_year: service_year.value,
    billing_month: billing_month.value,
    billing_year: billing_year.value,
    total_member: total_member.value,
    total_management_bill_amount: total_management_bill_amount.value,
    total_storage_bill_amount: total_storage_bill_amount.value,
    currency_code: currency_code.value,
    bill_status: bill_status.value,
    admin_note: admin_note.value,
    is_active: is_active.value,
  };

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to add this billing?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi('/api/system-create-billing', payload, 'POST');

      if (response.status) {
        Swal.fire('Success!', 'Billing added successfully.', 'success').then(() => {
          resetForm(); // Reset the form after successful submission
          router.push({ name: 'super-admin-billing-list' }); // Redirect to the billing list
        });
      } else {
        Swal.fire('Failed!', 'Failed to add the billing.', 'error');
      }
    }
  } catch (error) {
    console.error('Error adding billing:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

onMounted(() => {
  getUserList();
  resetForm();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Add New Billing</h2>
      <button @click="$router.push({ name: 'super-admin-management-and-storage-billing-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300 focus:outline-none">
        Back to Billing List
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Form grid layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="user_id" class="block text-sm font-medium text-gray-700">User ID</label>
          <select v-model="user_id" id="user_id" class="w-full border border-gray-300 rounded-md p-2">
            <option value="">Select User</option>
            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }}</option>
          </select>
        </div>
        <div>
          <label for="billing_code"
            class="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">
            Billing Code
          </label>
          <input v-model="billing_code" type="text" id="billing_code"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2"
            placeholder="Enter billing code" required />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="period_start" class="block text-sm font-medium text-gray-700">Period Start</label>
          <input v-model="period_start" type="date" id="period_start"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="period_end" class="block text-sm font-medium text-gray-700">Period End</label>
          <input v-model="period_end" type="date" id="period_end"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="service_month" class="block text-sm font-medium text-gray-700">Service Month</label>
          <input v-model="service_month" type="month" id="service_month"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="service_year" class="block text-sm font-medium text-gray-700">Service Year</label>
          <input v-model="service_year" type="month" id="service_year"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="billing_month" class="block text-sm font-medium text-gray-700">Billing Month</label>
          <input v-model="billing_month" type="month" id="billing_month"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="billing_year" class="block text-sm font-medium text-gray-700">Billing Year</label>
          <input v-model="billing_year" type="month" id="billing_year"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="total_member" class="block text-sm font-medium text-gray-700">Total Member</label>
          <input v-model="total_member" type="number" id="total_member"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="total_management_bill_amount" class="block text-sm font-medium text-gray-700">Total Management
            Bill Amount</label>
          <input v-model="total_management_bill_amount" type="number" id="total_management_bill_amount"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="total_storage_bill_amount" class="block text-sm font-medium text-gray-700">Total Storage Bill
            Amount</label>
          <input v-model="total_storage_bill_amount" type="number" id="total_storage_bill_amount"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="currency_code" class="block text-sm font-medium text-gray-700">Currency Code</label>
          <input v-model="currency_code" type="text" id="currency_code"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
      </div>
      <div>
        <label for="admin_note" class="block text-sm font-medium text-gray-700">Admin Notes</label>
        <input v-model="admin_note" type="text" id="admin_note"
          class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
      </div>
      <!-- bill_status and Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="bill_status" class="block text-sm font-medium text-gray-700">Bill Status</label>
          <select v-model="bill_status" id="bill_status"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2">
            <option value="">Select Bill Status</option>
            <option value="issued">Issued</option>
            <option value="unissued">Unissued</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label for="is_active" class="block text-sm font-medium text-gray-700">Active</label>
          <select v-model="is_active" id="is_active"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2">
            <option value="0">Active</option>
            <option value="1">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Submit and Reset buttons -->
      <div class="flex justify-between items-center">
        <button @click="resetForm" type="button"
          class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">Reset</button>
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg focus:ring-2 focus:ring-blue-300">
          Submit
        </button>
      </div>
    </form>
  </div>
</template>
