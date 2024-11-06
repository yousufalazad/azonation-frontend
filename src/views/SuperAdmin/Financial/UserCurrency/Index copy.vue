<template>
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">User Currencies</h2>
      <button @click="openModal" class="bg-green-500 text-white px-4 py-2 rounded-md mb-4">Add User Currency</button>
  
      <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
  
      <table class="table-auto w-full bg-white shadow rounded">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2">User</th>
            <th class="px-4 py-2">Currency</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="userCurrency in userCurrencies" :key="userCurrency.id">
            <td class="border px-4 py-2">{{ userCurrency.user.name }}</td>
            <td class="border px-4 py-2">{{ userCurrency.currency.name }}</td>
            <td class="border px-4 py-2">
              <span :class="userCurrency.status ? 'text-green-500' : 'text-red-500'">
                {{ userCurrency.status ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="border px-4 py-2">
              <button @click="openModal(userCurrency)" class="text-blue-500 mr-2">Edit</button>
              <button @click="confirmDelete(userCurrency.id)" class="text-red-500">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-md w-full max-w-lg">
          <h3 class="text-xl font-semibold">{{ editMode ? 'Edit' : 'Add' }} User Currency</h3>
  
          <div class="my-4">
            <label class="block">User</label>
            <select v-model="form.user_id" :disabled="editMode" class="w-full p-2 border border-gray-300 rounded-md">
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
          </div>
  
          <div class="my-4">
            <label class="block">Currency</label>
            <select v-model="form.currency_id" class="w-full p-2 border border-gray-300 rounded-md">
              <option v-for="currency in currencies" :key="currency.id" :value="currency.id">{{ currency.name }}</option>
            </select>
          </div>
  
          <div class="my-4">
            <label class="block">Status</label>
            <select v-model="form.status" class="w-full p-2 border border-gray-300 rounded-md">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
  
          <div class="flex justify-end mt-4">
            <button @click="closeModal" class="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">Cancel</button>
            <button @click="saveUserCurrency" class="bg-green-500 text-white px-4 py-2 rounded-md">{{ editMode ? 'Update' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { authStore } from '../../../../store/authStore';
  import Swal from 'sweetalert2';
  
  const auth = authStore;
  const userCurrencies = ref([]);
  const users = ref([]);
  const currencies = ref([]);
  const form = ref({ status: true });
  const isModalOpen = ref(false);
  const editMode = ref(false);
  const errorMessage = ref(null);
  
  const fetchData = async () => {
    try {
      const [userResponse, currencyResponse, userCurrencyResponse] = await Promise.all([
        auth.fetchProtectedApi('/api/users'),
        auth.fetchProtectedApi('/api/currencies'),
        auth.fetchProtectedApi('/api/user-currencies'),
      ]);
      users.value = userResponse.status ? userResponse.data : [];
      currencies.value = currencyResponse.status ? currencyResponse.data : [];
      userCurrencies.value = userCurrencyResponse.status ? userCurrencyResponse.data : [];
    } catch (error) {
      errorMessage.value = 'Error loading data. Please try again later.';
    }
  };
  
  const openModal = (userCurrency = null) => {
    form.value = userCurrency ? { ...userCurrency } : { status: true };
    editMode.value = !!userCurrency;
    isModalOpen.value = true;
  };
  
  const closeModal = () => {
    isModalOpen.value = false;
    form.value = { status: true };
    editMode.value = false;
  };
  
  const saveUserCurrency = async () => {
    try {
      const endpoint = editMode.value ? `/api/user-currencies/${form.value.id}` : '/api/user-currencies';
      const method = editMode.value ? 'PUT' : 'POST';
      const response = await auth.fetchProtectedApi(endpoint, form.value, method);
  
      if (response.status) {
        await fetchData();
        closeModal();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `User currency ${editMode.value ? 'updated' : 'created'} successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        errorMessage.value = 'Error saving user currency. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not save the user currency.',
        });
      }
    } catch (error) {
      errorMessage.value = 'Error saving user currency. Please try again later.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while saving the user currency.',
      });
    }
  };
  
  const confirmDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await auth.fetchProtectedApi(`/api/user-currencies/${id}`, null, 'DELETE');
        if (response.status) {
          await fetchData();
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'User currency deleted successfully.',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not delete the user currency.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting the user currency.',
        });
      }
    }
  };
  
  onMounted(fetchData);
  </script>
  