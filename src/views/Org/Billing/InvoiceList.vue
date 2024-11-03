<template>
  <div class="container mx-auto p-6">
      <h1 class="text-2xl font-semibold mb-4">Invoices</h1>

      <!-- Error State -->
      <div v-if="errorMessage" class="text-red-500 text-center py-8">
          {{ errorMessage }}
      </div>

      <!-- No Invoices Found -->
      <div v-else-if="invoices.length === 0" class="text-gray-500 text-center py-8">
          No invoices found.
      </div>

      <!-- Invoices Table -->
      <table v-else class="min-w-full bg-white border">
          <thead>
              <tr>
                  <th class="py-2 px-4 border">Invoice ID</th>
                  <th class="py-2 px-4 border">Billing ID</th>
                  <th class="py-2 px-4 border">Generate Date</th>
                  <th class="py-2 px-4 border">Issue Date</th>
                  <th class="py-2 px-4 border">Due Date</th>
                  <th class="py-2 px-4 border">Sub Total</th>
                  <th class="py-2 px-4 border">Discount</th>
                  <th class="py-2 px-4 border">Total</th>
                  <th class="py-2 px-4 border">Status</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="invoice in invoices" :key="invoice.id">
                  <td class="py-2 px-4 border">{{ invoice.invoice_id }}</td>
                  <td class="py-2 px-4 border">{{ invoice.billing_id }}</td>
                  <td class="py-2 px-4 border">{{ formatDate(invoice.generate_date) }}</td>
                  <td class="py-2 px-4 border">{{ formatDate(invoice.issue_date) }}</td>
                  <td class="py-2 px-4 border">{{ formatDate(invoice.due_date) }}</td>
                  <!-- <td class="py-2 px-4 border">£{{ invoice.sub_total.toFixed(2) }}</td>
                  <td class="py-2 px-4 border">£{{ invoice.discount.toFixed(2) }}</td>
                  <td class="py-2 px-4 border">£{{ invoice.total.toFixed(2) }}</td> -->
                  <td class="py-2 px-4 border">{{ invoice.status }}</td>
              </tr>
          </tbody>
      </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
const auth = authStore;
const invoices = ref([]); // Initialize as an empty array
const errorMessage = ref(null);

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const fetchInvoices = async () => {
  try {
      const response = await auth.fetchProtectedApi('/api/invoices');

      // Set invoices to the response data or an empty array
      invoices.value = response.status ? response.data : [];

  } catch (error) {
      console.error("Error fetching invoices:", error);
      errorMessage.value = "Error loading invoices. Please try again later.";
      invoices.value = []; // Ensure invoices is empty on error
  }
};

// Fetch invoices on component mount
onMounted(fetchInvoices);
</script>

<style scoped>
.container { max-width: 800px; }
</style>
