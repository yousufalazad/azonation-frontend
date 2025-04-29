<template>
  <div class="p-6">
    <h1 class="text-3xl font-semibold mb-6">Subscriptions</h1>

    <!-- managementSubscriptions Table -->
    <div class="overflow-x-auto shadow rounded-lg">
      <table class="min-w-full bg-white border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Package name</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Started from</th>
            <th class="px-4 py-3 text-left font-medium text-gray-700">Subscription status</th>
            <!-- <th class="px-4 py-3 text-left font-medium text-gray-700">Actions</th> -->
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="managementSubscription in managementSubscriptions"
            :key="managementSubscription.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-3 border-t text-gray-600">{{ managementSubscription.management_package.name }}</td>
            <td class="px-4 py-3 border-t text-gray-600">{{ managementSubscription.start_date }}</td>
            <td class="px-4 py-3 border-t">
              <span
                :class="managementSubscription.subscription_status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                class="inline-block px-3 py-1 text-sm rounded-full"
              >
                {{ managementSubscription.subscription_status }}
              </span>
            </td>
            <!-- <td class="px-4 py-3 border-t">
              <button
                @click="editSubscription(managementSubscription)"
                class="text-blue-500 hover:underline"
              >
                Edit
              </button>
            </td> -->
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Subscription Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-center mb-4">Edit Subscription</h2>
        <p class="text-sm text-gray-500 text-center mb-6">
          The start date will be set to today by default.
        </p>
        <form @submit.prevent="updateSubscription">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              v-model="user_id"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Package ID</label>
            <input
              type="text"
              v-model="package_id"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              v-model="end_date"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex items-center mb-4">
            <input
              type="checkbox"
              v-model="status"
              class="form-checkbox border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Active</span>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Pricing Section -->
    <section class="mt-12">
      <h2 class="text-2xl font-semibold mb-4">Your Pricing</h2>
      <div v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</div>
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="px-4 py-3 text-center text-gray-600">
                <span class="font-bold">{{ currency.currency_code }} {{ userPriceRate }}</span>
                <br />
                <span class="text-sm">Per member per day</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const managementSubscriptions = ref([]);
const isModalOpen = ref(false);

const subscription_id = ref(null);
const user_id = ref('');
const package_id = ref('');
// const package_name = ref('');
const end_date = ref('');
const status = ref(true);
const userPriceRate = ref([]);
const errorMessage = ref('');
const currency = ref([]);

const getSubscriptions = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/management-subscriptions', {}, 'GET');
    managementSubscriptions.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching managementSubscriptions:', error);
  }
};

const editSubscription = (subscription) => {
  subscription_id.value = subscription.id;
  user_id.value = subscription.user_id;
  package_id.value = subscription.package_id;
  // package_name.value = subscription.package_id;
  end_date.value = subscription.end_date;
  status.value = subscription.status;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const updateSubscription = async () => {
  const payload = {
    user_id: user_id.value,
    package_id: package_id.value,
    end_date: end_date.value,
    status: status.value,
    start_date: new Date().toISOString().slice(0, 10), // Sets start date to today's date
  };

  try {
    const response = await auth.fetchProtectedApi(`/api/subscription/${subscription_id.value}`, payload, 'PUT');
    if (response.status) {
      await getSubscriptions();
      Swal.fire('Success', 'Subscription updated successfully!', 'success'); // Success message
      closeModal();
    } else {
      console.error('Error updating subscription:', response);
      Swal.fire('Error', 'Failed to update subscription!', 'error'); // Error message
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    Swal.fire('Error', 'An error occurred while updating subscription!', 'error'); // Error message
  }
};


// Fetch data from the API
const fetchUserPriceRate = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/management-subscriptions/daily-price-rate', {}, 'GET');
    if (response.status) {
      userPriceRate.value = response.daily_price_rate;
      console.log(userPriceRate.value);
    } else {
      userPriceRate.value = [];
    }
  }
  catch (error) {
    errorMessage.value = error.message;
  }
};

const fetchCurrency = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/management-subscriptions/currencies', {}, 'GET');
    if (response.status) {
      currency.value = response.data;
    } else {
      currency.value = [];
    }
  } catch (error) {
    errorMessage.value = error.message;
  }
};

onMounted(() => {
  getSubscriptions();
  fetchUserPriceRate();
  fetchCurrency();
});
</script>
