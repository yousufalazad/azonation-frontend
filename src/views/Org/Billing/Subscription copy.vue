<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Subscriptions</h1>
    <table class="min-w-full bg-white border border-gray-300">
      <thead>
        <tr>
          <th class="border-b-2 border-gray-300 px-4 py-2">User</th>
          <th class="border-b-2 border-gray-300 px-4 py-2">Package</th>
          <th class="border-b-2 border-gray-300 px-4 py-2">Start Date</th>
          <th class="border-b-2 border-gray-300 px-4 py-2">End Date</th>
          <th class="border-b-2 border-gray-300 px-4 py-2">Status</th>
          <th class="border-b-2 border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="subscription in subscriptions" :key="subscription.id">
          <td class="border-b border-gray-300 px-4 py-2">{{ subscription.user_id }}</td>
          <td class="border-b border-gray-300 px-4 py-2">{{ subscription.package_id }}</td>
          <td class="border-b border-gray-300 px-4 py-2">{{ subscription.start_date }}</td>
          <td class="border-b border-gray-300 px-4 py-2">{{ subscription.end_date }}</td>
          <td class="border-b border-gray-300 px-4 py-2">{{ subscription.status ? 'Active' : 'Inactive' }}</td>
          <td class="border-b border-gray-300 px-4 py-2">
            <button @click="editSubscription(subscription)" class="text-blue-500">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal component for editing subscriptions -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-1/3 mx-auto px-8 h-3/4 overflow-y-auto">
        <h2 class="text-xl font-semibold mb-6 text-center">Edit Subscription</h2>
        <form @submit.prevent="updateSubscription">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">User ID</label>
            <input type="text" v-model="user_id" class="mt-1 block w-full px-3 py-2 border rounded-md" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Package ID</label>
            <input type="text" v-model="package_id" class="mt-1 block w-full px-3 py-2 border rounded-md" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" v-model="start_date" class="mt-1 block w-full px-3 py-2 border rounded-md" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">End Date</label>
            <input type="date" v-model="end_date" class="mt-1 block w-full px-3 py-2 border rounded-md" />
          </div>
          <div class="mb-4">
            <label class="inline-flex items-center">
              <input type="checkbox" v-model="status" class="form-checkbox" />
              <span class="ml-2">Active</span>
            </label>
          </div>
          <button @click="closeModal" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md">Cancel</button>
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded mt-4">Update</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const subscriptions = ref([]);
const isModalOpen = ref(false);

const subscription_id = ref(null);
const user_id = ref('');
const package_id = ref('');
const start_date = ref('');
const end_date = ref('');
const status = ref(true);

const getSubscriptions = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/subscription', {}, 'GET');
    subscriptions.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
  }
};

const editSubscription = (subscription) => {
  subscription_id.value = subscription.id;
  user_id.value = subscription.user_id;
  package_id.value = subscription.package_id;
  start_date.value = subscription.start_date;
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
    start_date: start_date.value,
    end_date: end_date.value,
    status: status.value,
  };

  try {
    const response = await auth.fetchProtectedApi(`/api/subscription/${subscription_id.value}`, payload, 'PUT');
    if (response.status) {
      await getSubscriptions();
      closeModal();
    } else {
      console.error('Error updating subscription:', response);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
};

onMounted(() => {
  getSubscriptions();
});
</script>
