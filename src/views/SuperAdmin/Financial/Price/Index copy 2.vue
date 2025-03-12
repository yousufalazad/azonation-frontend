<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Price Rate</h1>

    <!-- Error State -->
    <div v-if="errorMessage" class="text-red-500 text-center py-8">
      {{ errorMessage }}
    </div>

    <!-- No PriceRates Found -->
    <div v-else-if="priceRates.length === 0" class="text-gray-500 text-center py-8">
      No price rates found.
    </div>

    <!-- Price Rates Horizontal Layout -->
    <div v-else class="bg-white border rounded-md overflow-auto">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="py-2 px-4 border">Tier/Fields</th>
            <th v-for="priceRate in priceRates" :key="priceRate.id" class="py-2 px-4 border">
              {{ priceRate.package_id }}
            </th>
            <th class="py-2 px-4 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tierIndex in 20" :key="tierIndex">
            <td class="py-2 px-4 border">Tier {{ tierIndex }}</td>
            <td v-for="priceRate in priceRates" :key="priceRate.id" class="py-2 px-4 border">
              {{ priceRate[`tier${tierIndex}`] }}
            </td>
            <td class="py-2 px-4 border text-center">
              <button @click="editTierPrice(tierIndex)" class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                Edit
              </button>
            </td>
          </tr>
          <tr>
            <td class="py-2 px-4 border">Status</td>
            <td v-for="priceRate in priceRates" :key="priceRate.id" class="py-2 px-4 border">{{ priceRate.status }}</td>
            <td class="py-2 px-4 border"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const priceRates = ref([]);
const errorMessage = ref(null);

const fetchPriceRate = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/management-pricings');
    priceRates.value = response.status ? response.data : [];
  } catch (error) {
    console.error("Error fetching price rates:", error);
    errorMessage.value = "Error loading price rates. Please try again later.";
    priceRates.value = [];
  }
};

// Handle edit action for each tier
const editTierPrice = (tierIndex) => {
  console.log(`Editing prices for Tier ${tierIndex}`);
  // You can open a modal or navigate to an edit form for the specific tier
};

onMounted(fetchPriceRate);
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
