<template>
    <div class="container mx-auto p-6">
        <h1 class="text-2xl font-semibold mb-4">Bills</h1>
  
        <!-- Error State -->
        <div v-if="errorMessage" class="text-red-500 text-center py-8">
            {{ errorMessage }}
        </div>
  
        <!-- No Invoices Found -->
        <div v-else-if="billingList.length === 0" class="text-gray-500 text-center py-8">
            No invoices found.
        </div>
  
        <!-- Invoices Table -->
        <table v-else class="min-w-full bg-white border">
            <thead>
                <tr>
                    <th class="py-2 px-4 border">Sl</th>
                    <th class="py-2 px-4 border">Billing ID</th>
                    <th class="py-2 px-4 border">Item</th>
                    <th class="py-2 px-4 border">period_start</th>
                    <th class="py-2 px-4 border">period_end</th>
                    <th class="py-2 px-4 border">service_month</th>
                    <th class="py-2 px-4 border">billing_month</th>
                    <th class="py-2 px-4 border">total_active_member</th>
                    <th class="py-2 px-4 border">total_billable_active_member</th>
                    <th class="py-2 px-4 border">price_rate</th>
                    <th class="py-2 px-4 border">bill_amount</th>
                    <th class="py-2 px-4 border">status</th>
                    <th class="py-2 px-4 border">is_active</th>
                    <th class="py-2 px-4 border">admin_notes</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(bill, index) in billingList" :key="bill.id">
                    <td class="py-2 px-4 border">{{ index + 1 }}</td>
                    <td class="py-2 px-4 border">{{ bill.billing_code }}</td> 
                    <td class="py-2 px-4 border">{{ bill.item_name }}</td>
                    <td class="py-2 px-4 border">{{ formatDate(bill.period_start) }}</td>
                    <td class="py-2 px-4 border">{{ formatDate(bill.period_end) }}</td>
                    <td class="py-2 px-4 border">{{ bill.service_month }}</td>
                    <td class="py-2 px-4 border">{{ bill.billing_month }}</td>
                    <td class="py-2 px-4 border">{{ bill.total_active_member }}</td>
                    <td class="py-2 px-4 border">{{ bill.total_billable_active_member }}</td>
                    <td class="py-2 px-4 border">{{ bill.price_rate }}</td>
                    <td class="py-2 px-4 border">{{ bill.bill_amount }}</td>
                    <td class="py-2 px-4 border">{{ bill.status }}</td>
                    <td class="py-2 px-4 border">{{ bill.is_active }}</td>
                    <td class="py-2 px-4 border">{{ bill.admin_notes }}</td>
                </tr>
            </tbody>
        </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { authStore } from '../../../store/authStore';
  const auth = authStore;
  const billingList = ref([]); // Initialize as an empty array
  const errorMessage = ref(null);
  
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };
  
  const fetchBillingList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/billing-list');
  
        // Set billing to the response data or an empty array
        billingList.value = response.status ? response.data : [];
  
    } catch (error) {
        console.error("Error fetching billing:", error);
        errorMessage.value = "Error loading billing. Please try again later.";
        invoices.value = []; // Ensure billing is empty on error
    }
  };
  
  // Fetch billing on component mount
  onMounted(fetchBillingList);
  </script>
  
  <style scoped>
  .container { max-width: 800px; }
  </style>
  