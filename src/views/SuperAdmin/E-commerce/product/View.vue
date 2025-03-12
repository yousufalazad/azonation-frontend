<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Product details
const product = ref({});

// Fetch product details
const fetchProductDetails = async () => {
  try {
    const { id } = route.params;
    const response = await auth.fetchProtectedApi(`/api/products/${id}`, {}, 'GET');
    if (response.status) {
      product.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to fetch product details.', 'error');
      router.push({ name: 'products-list' });
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    router.push({ name: 'products-list' });
  }
};

// Fetch on mount
onMounted(() => {
  fetchProductDetails();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Product Details</h2>
      <button @click="$router.push({ name: 'products-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Product List
      </button>
    </div>

    <!-- Product Details Table -->
    <div class="overflow-x-auto">
      <table class="table-auto w-full border-collapse border border-gray-300 bg-white">
        <tbody>
          <tr v-for="(value, key) in product" :key="key">
            <th class="px-4 py-2 text-left border border-gray-300 w-130 bg-gray-100 capitalize">{{ key.replace(/_/g, ' ') }}</th>
            <th class="px-2 py-2 border border-gray-300 bg-gray-100">:</th>
            <td class="px-4 py-2 border border-gray-300">{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 90%;
  margin: auto;
}
</style>
