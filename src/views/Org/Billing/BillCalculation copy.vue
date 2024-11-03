<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Active Member Counts for {{ currentMonthName }}</h1>
        
        <table class="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
                <tr>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Date</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Active Members</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Billable</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="count in activeMemberCounts" :key="count.date">
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.date }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.active_member }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.is_billable ? 'Yes' : 'No' }}</td>
                </tr>
                <tr v-if="activeMemberCounts.length === 0">
                    <td colspan="3" class="border-b border-gray-300 px-4 py-2 text-center text-gray-500">There are no active members</td>
                </tr>
                <tr v-if="activeMemberCounts.length > 0" class="font-bold">
                    <td class="border-t border-gray-300 px-4 py-2 text-right" colspan="1">Total Active Members:</td>
                    <td class="border-t border-gray-300 px-4 py-2">{{ totalActiveMembers }}</td>
                    <td class="border-t border-gray-300 px-4 py-2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Approximate Bill Calculation Section -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-2">Approximate Bill Calculation for {{ currentMonthName }}</h2>
            <p><strong>Price Rate:</strong> £{{ priceRate.toFixed(2) }}</p>
            <p><strong>Total Active Members:</strong> {{ totalActiveMembers }}</p>
            <p class="font-bold"><strong>Approximate Bill:</strong> £{{ approximateBill.toFixed(2) }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const activeMemberCounts = ref([]);
const totalActiveMembers = ref(0);
const approximateBill = ref(0); // Initialize approximate bill
const priceRate = ref(0); // Initialize price rate
const currentMonthName = ref(''); // Initialize current month name

// Get current month name
const getCurrentMonthName = () => {
    const options = { month: 'long' };
    currentMonthName.value = new Date().toLocaleDateString(undefined, options);
};

// Fetch active member counts from the API
const getActiveMemberCounts = async () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const today = new Date();

    try {
        const response = await auth.fetchProtectedApi('/api/active-member-counts', {
            start_date: firstDayOfMonth.toISOString().split('T')[0],
            end_date: today.toISOString().split('T')[0]
        });

        // Update activeMemberCounts, totalActiveMembers, and approximateBill based on API response
        if (response.status) {
            activeMemberCounts.value = response.data;
            totalActiveMembers.value = response.total_active_members; 
            approximateBill.value = response.approximate_bill; // Set the approximate bill
            priceRate.value = response.price_rate; // Set the price rate
        } else {
            activeMemberCounts.value = [];
            totalActiveMembers.value = 0;
            approximateBill.value = 0;
            priceRate.value = 0; // Reset price rate
        }
    } catch (error) {
        console.error('Error fetching active member counts:', error);
    }
};

// Fetch data when the component is mounted
onMounted(() => {
    getCurrentMonthName(); // Get current month name when the component mounts
    getActiveMemberCounts();
});
</script>

<style scoped>
/* You can add scoped styles here if needed */
</style>
