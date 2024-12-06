<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const auth = authStore;

// Record data
const record = ref({});

const billingId = route.params.id; // Assume the billing ID is passed as a route parameter

// Fetch record
const getRecord = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-billing/${billingId}`, {}, 'GET');
    if (response.status) {
      record.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to fetch billing data.', 'error');
    }
  } catch (error) {
    console.error('Error fetching record:', error);
    Swal.fire('Error!', 'An error occurred while fetching data.', 'error');
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
      <h2 class="text-2xl font-bold text-gray-800">View Billing Details</h2>
      <button @click="$router.push({ name: 'super-admin-billing-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300 focus:outline-none">
        Back to Billing List
      </button>
    </div>

    <!-- Table -->
    <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
      <tbody class="text-gray-600 text-md font-medium">
        <tr>
          <td class="p-2 text-left font-semibold w-36">Billing Code</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.billing_code }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Description</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.description }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Billing Address</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.billing_address }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Item Name</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.item_name }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Period Start</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.period_start }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Period End</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.period_end }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Service Month</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.service_month }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Billing Month</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.billing_month }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Active Member Count</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.active_member_count }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Billable Active Member Count</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.billable_active_member_count }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Member Daily Rate</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.member_daily_rate }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Total Bill Amount</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.total_bill_amount }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Status</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.status }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Admin Notes</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.admin_notes }}</td>
        </tr>
        <tr>
          <td class="p-2 text-left font-semibold w-36">Active</td>
          <td class="p-2">:</td>
          <td class="p-2">{{ record.is_active ? 'Inactive' : 'Active' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
