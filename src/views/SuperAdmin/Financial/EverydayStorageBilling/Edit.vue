<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Form fields
const user_id = ref('');
const date = ref('');
const day_bill_amount = ref('');
const is_active = ref(1);

const id = route.params.id; // Assume the billing ID is passed as a route parameter

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

// Fetch record for editing
const getRecord = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/every-day-storage-billings/${id}`, {}, 'GET');
    if (response.status) {
      const data = response.data;
        user_id.value = data.user_id,
        date.value = data.date,
        day_bill_amount.value = data.day_bill_amount,
        is_active.value = data.is_active
    } else {
      Swal.fire('Error!', 'Failed to fetch billing data.', 'error');
    }
  } catch (error) {
    console.error('Error fetching record:', error);
    Swal.fire('Error!', 'An error occurred while fetching data.', 'error');
  }
};

// Reset form fields
const resetForm = () => {
  user_id.value = '';
  date.value = '';
  day_bill_amount.value = '';
  is_active.value = 1;
};

// Update record
const submitForm = async () => {
  // if (!date.value) {
  //   Swal.fire('Error!', 'Please fill in all required fields.', 'error');
  //   return;
  // }

  const payload = {
    // user_id: userId,
    user_id: user_id.value,
    date: date.value,
    day_bill_amount: day_bill_amount.value,
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
      const response = await auth.fetchProtectedApi(`/api/every-day-storage-billings/${id}`, payload, 'PUT');

      if (response.status) {
        Swal.fire('Success!', 'Billing updated successfully.', 'success').then(() => {
          router.push({ name: 'super-admin-everyday-storage-billing-list' });
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
  getUserList();
  getRecord();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Edit </h2>
      <button @click="$router.push({ name: 'super-admin-everyday-storage-billing-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300 focus:outline-none">
        Back to List
      </button>
    </div>

    <!-- Form -->

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Form grid layout -->
      <div>
        <label for="user_id" class="block text-sm font-medium text-gray-700">User ID</label>
        <select v-model="user_id" id="user_id" class="w-full border border-gray-300 rounded-md p-2">
          <option value="">Select User</option>
          <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
          <input v-model="date" type="date" id="date"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        
        <div>
          <label for="day_bill_amount" class="block text-sm font-medium text-gray-700">Day Bill Amount</label>
          <input v-model="day_bill_amount" type="number" id="day_bill_amount"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>

        <div>
          <label for="is_active" class="block text-sm font-medium text-gray-700">Active</label>
          <select v-model="is_active" id="is_active"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2">
            <option value="0">No</option>
            <option value="1">Yes</option>
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
