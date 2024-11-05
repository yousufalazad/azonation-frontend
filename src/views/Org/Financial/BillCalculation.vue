<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Active Member Counts for {{ currentMonthName }}</h1>
        
        <table class="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
                <tr>
                    <th class="border-b-2 border-gray-300 px-4 py-2">SL</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Date</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Active Members</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Billable</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(count, index) in activeMemberCounts" :key="count.date">
                    <td class="border-b border-gray-300 px-4 py-2">{{ index + 1 }}</td>
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

        <!-- Approximate Bill Calculation Section for Current Month -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-xl font-semibold mb-2">Approximate Bill Calculation for {{ currentMonthName }}</h2>
            <p><strong>Price Rate:</strong> change £{{ priceRate.toFixed(2) }}</p>
            <p><strong>Total Active Members:</strong> {{ totalActiveMembers }}</p>
            <p class="font-bold"><strong>Approximate Bill:</strong> £{{ approximateBill.toFixed(2) }}</p>
        </div>

        <!-- Previous Month Active Member Counts Section -->
        <h1 class="text-2xl font-bold mb-4">Active Member Counts for {{ previousMonthName }}</h1>
        
        <table class="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
                <tr>
                    <th class="border-b-2 border-gray-300 px-2 py-2">SL</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Date</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Active Members</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Billable</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(count, index) in PreviousMonthActiveMemberCounts" :key="count.date">
                    <td class="border-b border-gray-300 px-2 py-2">{{ index + 1 }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.date }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.active_member }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.is_billable ? 'Yes' : 'No' }}</td>
                </tr>
                <tr v-if="PreviousMonthActiveMemberCounts.length === 0">
                    <td colspan="3" class="border-b border-gray-300 px-4 py-2 text-center text-gray-500">There are no active members for {{ previousMonthName }}</td>
                </tr>
                <tr v-if="PreviousMonthActiveMemberCounts.length > 0" class="font-bold">
                    <td class="border-t border-gray-300 px-4 py-2 text-right" colspan="1">Total Active Members:</td>
                    <td class="border-t border-gray-300 px-4 py-2">{{ previousTotalActiveMembers }}</td>
                    <td class="border-t border-gray-300 px-4 py-2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Separate Section for Previous Month Bill Calculation -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-xl font-semibold mb-2">Actual Bill Calculation for {{ previousMonthName }}</h2>
            <p><strong>Price Rate:</strong> change £{{ previousPriceRate.toFixed(2) }}</p>
            <p><strong>Total Active Members:</strong> {{ previousTotalActiveMembers }}</p>
            <p class="font-bold"><strong>Total Bill Amount:</strong> £{{ previousTotalBillAmount.toFixed(2) }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const activeMemberCounts = ref([]);
const PreviousMonthActiveMemberCounts = ref([]);
const totalActiveMembers = ref(0);
const approximateBill = ref(0);
const priceRate = ref(0);
const previousTotalActiveMembers = ref(0);
const previousTotalBillAmount = ref(0);
const previousPriceRate = ref(0);
const currentMonthName = ref('');
const previousMonthName = ref('');

const getCurrentMonthName = () => {
    const options = { month: 'long' };
    currentMonthName.value = new Date().toLocaleDateString(undefined, options);
};

const getPreviousMonthName = () => {
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const options = { month: 'long' };
    previousMonthName.value = previousMonth.toLocaleDateString(undefined, options);
};

const getActiveMemberCounts = async () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);

    try {
        const response = await auth.fetchProtectedApi('/api/active-member-counts');

        if (response.status) {
            activeMemberCounts.value = response.data;
            totalActiveMembers.value = response.total_active_members;
            approximateBill.value = response.approximate_bill;
            priceRate.value = response.price_rate;
        } else {
            activeMemberCounts.value = [];
            totalActiveMembers.value = 0;
            approximateBill.value = 0;
            priceRate.value = 0;
        }
    } catch (error) {
        console.error('Error fetching active member counts:', error);
    }
};

// New method to get previous month's bill calculation and active member counts
const getPreviousMonthBillCalculation = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/previous-month-bill-calculation');

        if (response.status) {
            previousTotalActiveMembers.value = response.previous_total_active_members;
            previousTotalBillAmount.value = response.previous_total_bill_amount;
            previousPriceRate.value = response.previous_price_rate;
            PreviousMonthActiveMemberCounts.value = response.previous_member_counts; // Assuming the API returns this
        } else {
            previousTotalActiveMembers.value = 0;
            previousTotalBillAmount.value = 0;
            previousPriceRate.value = 0;
            PreviousMonthActiveMemberCounts.value = [];
        }
    } catch (error) {
        console.error('Error fetching previous month bill calculation:', error);
    }
};

onMounted(() => {
    getCurrentMonthName();
    getPreviousMonthName();
    getActiveMemberCounts();
    getPreviousMonthBillCalculation(); // Call the new method
});
</script>

<style scoped>
/* You can add scoped styles here if needed */
</style>
