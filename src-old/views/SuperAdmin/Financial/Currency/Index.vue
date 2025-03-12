<template>
    <div class="container mx-auto p-6">
      <h1 class="text-2xl font-semibold mb-6 text-center">Currency Management</h1>
  
      <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded mb-4">Add Currency</button>
  
      <div v-if="errorMessage" class="text-red-500 text-center py-4">
        {{ errorMessage }}
      </div>
  
      <div v-else class="bg-white border rounded-md overflow-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="py-2 px-4 border">Name</th>
              <th class="py-2 px-4 border">Code</th>
              <th class="py-2 px-4 border">Symbol</th>
              <th class="py-2 px-4 border">Unit Name</th>
              <th class="py-2 px-4 border">Status</th>
              <th class="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="currency in currencies" :key="currency.id">
              <td class="py-2 px-4 border">{{ currency.name }}</td>
              <td class="py-2 px-4 border">{{ currency.currency_code }}</td>
              <td class="py-2 px-4 border">{{ currency.symbol }}</td>
              <td class="py-2 px-4 border">{{ currency.unit_name }}</td>
              <td class="py-2 px-4 border">{{ currency.status ? 'Active' : 'Inactive' }}</td>
              <td class="py-2 px-4 border text-center">
                <button @click="openModal(currency)" class="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2">Edit</button>
                <button @click="deleteCurrency(currency.id)" class="bg-red-600 text-white px-3 py-1 rounded-md">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-semibold mb-4">{{ editMode ? 'Edit' : 'Add' }} Currency</h2>
  
          <form @submit.prevent="saveCurrency">
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2 mb-3" required />
  
            <label class="block text-sm font-medium mb-1">Currency Code</label>
            <input v-model="form.currency_code" type="text" class="w-full border rounded px-3 py-2 mb-3" required />
  
            <label class="block text-sm font-medium mb-1">Symbol</label>
            <input v-model="form.symbol" type="text" class="w-full border rounded px-3 py-2 mb-3" required />
  
            <label class="block text-sm font-medium mb-1">Unit Name</label>
            <input v-model="form.unit_name" type="text" class="w-full border rounded px-3 py-2 mb-3" />
  
            <label class="block text-sm font-medium mb-1">Status</label>
            <select v-model="form.status" class="w-full border rounded px-3 py-2 mb-3">
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
  
            <div class="flex justify-end mt-4">
              <button type="button" @click="closeModal" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{{ editMode ? 'Update' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const currencies = ref([]);
const form = ref({});
const isModalOpen = ref(false);
const editMode = ref(false);
const errorMessage = ref(null);

const fetchCurrencies = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/currencies');
    currencies.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading currencies. Please try again later.';
  }
};

const openModal = (currency = null) => {
  form.value = currency ? { ...currency } : { status: true };
  editMode.value = !!currency;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  form.value = {};
  editMode.value = false;
};

const saveCurrency = async () => {
  try {
    const endpoint = editMode.value ? `/api/currencies/${form.value.id}` : '/api/currencies';
    const method = editMode.value ? 'PUT' : 'POST';
    const response = await auth.fetchProtectedApi(endpoint, form.value, method);

    if (response.status) {
      await fetchCurrencies();
      closeModal();

      // SweetAlert success notification with correct message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Currency ${editMode.value ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      errorMessage.value = 'Error saving currency. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not save the currency. Please try again.',
      });
    }
  } catch (error) {
    errorMessage.value = 'Error saving currency. Please try again later.';
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while saving the currency.',
    });
  }
};

const deleteCurrency = async (id) => {
  // SweetAlert confirmation dialog
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the currency permanently.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await auth.fetchProtectedApi(`/api/currencies/${id}`, {}, 'DELETE');
        if (response.status) {
          await fetchCurrencies();

          // SweetAlert success notification for deletion
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Currency has been deleted.',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not delete the currency. Please try again.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting the currency.',
        });
      }
    }
  });
};

onMounted(fetchCurrencies);
</script>

  
  <style scoped>
  .container {
    max-width: 1200px;
  }
  </style>
  