<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();

const auth = authStore;

// Form fields
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
const admin_notes = ref('');
const is_active = ref(1);


const billingId = route.params.id; // Assume the billing ID is passed as a route parameter

// Fetch record for editing
const getRecord = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/management-and-storage-billings/${billingId}`, {}, 'GET');
    if (response.status) {
      const data = response.data;
      billing_code.value = data.billing_code || '';
      period_start.value = data.period_start || '';
      period_end.value = data.period_end || '';
      service_month.value = data.service_month || '';
      service_year.value = data.service_year || '';
      billing_month.value = data.billing_month || '';
      billing_year.value = data.billing_year || '';
      total_member.value = data.total_member || '';
      total_management_bill_amount.value = data.total_management_bill_amount || '';
      total_storage_bill_amount.value = data.total_storage_bill_amount || '';
      currency_code.value = data.currency_code || '';
      bill_status.value = data.bill_status || '';
      admin_notes.value = data.admin_notes || '';
      is_active.value = data.is_active || 1;
    } else {
      Swal.fire('Error!', 'Failed to fetch billing data.', 'error');
    }
  } catch (error) {
    console.error('Error fetching record:', error);
    Swal.fire('Error!', 'An error occurred while fetching data.', 'error');
  }
};

// Update record
const submitForm = async () => {
  // if (!billing_code.value) {
  //   Swal.fire('Error!', 'Please fill in all required fields.', 'error');
  //   return;
  // }

  const payload = {
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
    admin_notes: admin_notes.value,
    is_active: is_active.value,
  };

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this billing?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/management-and-storage-billings/${billingId}`, payload, 'PUT');

      if (response.status) {
        Swal.fire('Success!', 'Billing updated successfully.', 'success').then(() => {
          router.push({ name: 'super-admin-billing-list' });
        });
      } else {
        Swal.fire('Failed!', 'Failed to update the billing.', 'error');
      }
    }
  } catch (error) {
    console.error('Error updating billing:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

onMounted(() => {
  getRecord();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Edit Billing</h2>
      <button @click="$router.push({ name: 'super-admin-billing-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300 focus:outline-none">
        Back to Billing List
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Form grid layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="col-span-full">
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
        <label for="admin_notes" class="block text-sm font-medium text-gray-700">Admin Notes</label>
        <input v-model="admin_notes" type="text" id="admin_notes"
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
