<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Receipts</h1>

    <!-- Error State -->
    <div v-if="errorMessage" class="text-red-500 text-center py-8">
      {{ errorMessage }}
    </div>

    <!-- No Receipts Found -->
    <div v-else-if="receipts.length === 0" class="text-gray-500 text-center py-8">
      No receipts found.
    </div>

    <!-- Receipts Table -->
    <table v-else class="min-w-full bg-white border rounded shadow-sm">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="py-2 px-4 border">Sl</th>
          <th class="py-2 px-4 border">Receipt Code</th>
          <th class="py-2 px-4 border">Invoice ID</th>
          <th class="py-2 px-4 border">Amount Received</th>
          <th class="py-2 px-4 border">Currency</th>
          <th class="py-2 px-4 border">Payment Method</th>
          <th class="py-2 px-4 border">Payment Date</th>
          <th class="py-2 px-4 border">Status</th>
          <th class="py-2 px-4 border">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(receipt, index) in receipts" :key="receipt.id" class="hover:bg-gray-50 transition">
          <td class="py-2 px-4 border">{{ index + 1 }}</td>
          <td class="py-2 px-4 border">{{ receipt.receipt_code }}</td>
          <td class="py-2 px-4 border">{{ receipt.invoice_id }}</td>
          <td class="py-2 px-4 border">{{ receipt.amount_received }}</td>
          <td class="py-2 px-4 border">{{ receipt.currency_code }}</td>
          <td class="py-2 px-4 border">{{ receipt.payment_method }}</td>
          <td class="py-2 px-4 border">{{ formatDate(receipt.payment_date) }}</td>
          <td class="py-2 px-4 border">
            <span
              :class="{
                'text-green-600': receipt.status === 'processed',
                'text-yellow-500': receipt.status === 'pending',
                'text-red-500': receipt.status === 'refunded'
              }"
              class="capitalize font-medium"
            >
              {{ receipt.status }}
            </span>
          </td>
          <td class="py-2 px-4 border">
            <button
              @click="$router.push({ name: 'view-receipt', params: { id: receipt.id } })"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../../store/authStore';
const auth = authStore;

const receipts = ref([]);
const errorMessage = ref(null);

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateStr).toLocaleDateString('en-GB', options);
};

// Fetch receipts
const fetchReceipts = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/receipts');
    receipts.value = response.status ? response.data : [];
  } catch (error) {
    console.error("Error fetching receipts:", error);
    errorMessage.value = "Error loading receipts. Please try again later.";
    receipts.value = [];
  }
};

onMounted(fetchReceipts);
</script>

<style scoped>
.container {
  max-width: 1000px;
}
</style>
