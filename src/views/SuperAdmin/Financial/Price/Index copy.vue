<template>
  <div class="container mx-auto p-6">
      <h1 class="text-2xl font-semibold mb-4">All invoices</h1>
      <button @click="" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4">
    Create priceRates
  </button>
      <!-- Error State -->
      <div v-if="errorMessage" class="text-red-500 text-center py-8">
          {{ errorMessage }}
      </div>

      <!-- No priceRates Found -->
      <div v-else-if="priceRates.length === 0" class="text-gray-500 text-center py-8">
          No priceRates found.
      </div>

      <!-- priceRates Table -->
      <table v-else class="min-w-full bg-white border">
          <thead>
              <tr>
                  <th class="py-2 px-4 border">Sl</th>
                  <th class="py-2 px-4 border">priceRates ID</th>
                  <th class="py-2 px-4 border">Tire 1</th>
                  <th class="py-2 px-4 border">Tire 2</th>
                  <th class="py-2 px-4 border">Tire 3</th>
                  <th class="py-2 px-4 border">Tire 4</th>
                  <th class="py-2 px-4 border">Tire 5</th>
                  <th class="py-2 px-4 border">Tire 6</th>
                  <th class="py-2 px-4 border">Tire 7</th>
                  <th class="py-2 px-4 border">Tire 8</th>
                  <th class="py-2 px-4 border">Tire 9</th>
                  <th class="py-2 px-4 border">Tire 10</th>
                  <th class="py-2 px-4 border">Tire 11</th>
                  <th class="py-2 px-4 border">Tire 12</th>
                  <th class="py-2 px-4 border">Tire 13</th>
                  <th class="py-2 px-4 border">Tire 14</th>
                  <th class="py-2 px-4 border">Tire 15</th>
                  <th class="py-2 px-4 border">Tire 16</th>
                  <th class="py-2 px-4 border">Tire 17</th>
                  <th class="py-2 px-4 border">Tire 18</th>
                  <th class="py-2 px-4 border">Tire 19</th>
                  <th class="py-2 px-4 border">Tire 20</th>                  
                  <th class="py-2 px-4 border">Status</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="(priceRate, index) in priceRates" :key="priceRate.id">
                  <td class="py-2 px-4 border">{{ index +1 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.package_id }}</td> 
                  <td class="py-2 px-4 border">{{ priceRate.tier1 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier2 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier3 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier4 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier5 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier6 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier7 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier8 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier9 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier10 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier11 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier12 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier13 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier14 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier15 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier16 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier17 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier18 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier19 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.tier20 }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.status }}</td>
                  <!-- <td class="py-2 px-4 border">{{ priceRate.created_at }}</td>
                  <td class="py-2 px-4 border">{{ priceRate.updated_at }}</td> -->
              </tr>
          </tbody>
      </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../../store/authStore';
const auth = authStore;
const priceRates = ref([]); // Initialize as an empty array
const errorMessage = ref(null);

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const fetchPriceRate = async () => {
  try {
      const response = await auth.fetchProtectedApi('/api/price-rate');
      //console.log(response.data);
      // Set priceRates to the response data or an empty array
      priceRates.value = response.status ? response.data : [];

  } catch (error) {
      console.error("Error fetching priceRates:", error);
      errorMessage.value = "Error loading priceRates. Please try again later.";
      priceRates.value = []; // Ensure invoices is empty on error
  }
};

// Fetch invoices on component mount
onMounted(fetchPriceRate);
</script>

<style scoped>
.container { max-width: 800px; }
</style>
