<template>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">User Price Rates</h2>
      
      <!-- Search Input -->
      <input
        v-model="searchQuery"
        @input="filterResults"
        type="text"
        placeholder="Search by user or package"
        class="border p-2 rounded w-1/3 mb-6"
      />

      <!-- Error Message -->
      <div v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</div>
  
      <!-- User Price Rates Table -->
      <table class="table-auto w-full bg-white shadow rounded">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2">User</th>
            <th class="px-4 py-2">Package</th>
            <th class="px-4 py-2">Country</th>
            <th class="px-4 py-2">Currency</th>
            <th class="px-4 py-2">Price Rate</th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr v-for="userPrice in filteredUserPriceRates" :key="userPrice.id"> -->
            <tr v-for="userPrice in userPriceRates" :key="userPrice.id">
            <td class="border px-4 py-2">{{ userPrice.subscription.user_id }}</td>
            <td class="border px-4 py-2">{{ userPrice.subscription.package_id }}</td>
            <td class="border px-4 py-2">{{ userPrice.country.name }}</td>
            <td class="border px-4 py-2">{{ userPrice.currency.name }}</td>
            <td class="border px-4 py-2">{{ userPrice.rate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
  
  const userPriceRates = ref([]);
  const filteredUserPriceRates = ref([]);
  const searchQuery = ref('');
  const errorMessage = ref('');
  

  // Fetch data from the API
  const fetchUserPriceRate = async () => {
    try {
      const response = await auth.fetchProtectedApi('/api/user-price-rates', {}, 'GET');
      console.log(response.data);
        if (response.status) {
      userPriceRates.value = response.data;
      // filteredUserPriceRates.value = data.data;
        } else {
          userPriceRates.value = [];
        }
    } 
    catch (error) {
      errorMessage.value = error.message;
    }
  };
  
  // Filter results based on search query
  // const filterResults = () => {
  //   const query = searchQuery.value.toLowerCase();
  //   filteredUserPriceRates.value = userPriceRates.value.filter(
  //     (userPrice) =>
  //       userPrice.name.toLowerCase().includes(query) ||
  //       userPrice.package.toLowerCase().includes(query)
  //   );
  // };
  
  // Fetch data on component mount
  onMounted(fetchUserPriceRate);
  </script>
  
  <style scoped>
  /* Add some basic styling */
  table {
    border-collapse: collapse;
  }
  th,
  td {
    text-align: left;
  }
  </style>
  