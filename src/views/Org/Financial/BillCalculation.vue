<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
const auth = authStore;

const dailyPriceRate = ref([]);
const currentMonthName = ref('');
const currentMonthTotalMember = ref(0);
const subMonthTotalMember = ref(0);
const subMonthTotalBillAmount = ref(0);
const approximateBill = ref(0);
const userCurrency = ref('');
const previousMonthName = ref('');
const currentMonthMemberCount = ref([]);
const previousMonthMemberCount = ref([]);
const previousMonthTotalBillAmount = ref(0);


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

const getCurrentMonthBillCalculation = async () => {
    // const firstDayOfMonth = new Date();
    // firstDayOfMonth.setDate(1);

    try {
        const response = await auth.fetchProtectedApi('/api/org-financial/current-month-bill-calculation', {}, 'GET');
        console.log(response.data)
        if (response.status) {
            currentMonthMemberCount.value = response.data;
        } else {
        }
    } catch (error) {
        console.error('Error fetching sub month bill calculation:', error);
    }
};

// New method to get sub month's bill calculation and active member counts
const getSubMonthBillCalculation = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-financial/sub-month-bill-calculation', {}, 'GET');
        console.log(response.data)
        if (response.status) {
            previousMonthMemberCount.value = response.data;
        } else {
        }
    } catch (error) {
        console.error('Error fetching sub month bill calculation:', error);
    }
};

const calculateCurrentMonthTotalMember = () => {
    currentMonthTotalMember.value = currentMonthMemberCount.value.reduce((acc, count) => acc + count.day_total_member, 0);
    approximateBill.value = dailyPriceRate.value * currentMonthTotalMember.value;
};

// const calculateSubMonthTotalMember = () => {
//     subMonthTotalMember.value = subMonthMemberCount.value.reduce((acc, count) => acc + count.day_total_member, 0);
//     subMonthTotalBillAmount.value = subMonthPriceRate.value * subMonthTotalMember.value;
// };

const getDailyPriceRate = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/management-subscriptions/daily-price-rate', {}, 'GET');
        if (response.status) {
            dailyPriceRate.value = response.daily_price_rate;
        } else {
        }
    } catch (error) {
        console.error('Error fetching price rate:', error);
    }
};

const getUserCurrency = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/management-subscriptions/currencies', {}, 'GET');
        if (response.status) {
            userCurrency.value = response.data.currency_code;
        } else {
        }
    } catch (error) {
        console.error('Error fetching price rate:', error);
    }
};

onMounted(() => {
    getCurrentMonthName();
    getPreviousMonthName();
    getCurrentMonthBillCalculation();
    getSubMonthBillCalculation();
    calculateCurrentMonthTotalMember();
    // calculateSubMonthTotalMember();
    getDailyPriceRate();
    getUserCurrency();
});
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-4">Approximate bill for {{ currentMonthName }}</h1>

        <table class="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
                <tr>
                    <th class="border-b-2 border-gray-300 px-4 py-2">#</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Date</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Day total member</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Day total bill</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(count, index) in currentMonthMemberCount" :key="count.date">
                    <td class="border-b border-gray-300 px-2 py-2">{{ index + 1 }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.date }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.day_total_member }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.day_total_bill }}</td>
                </tr>
                <tr v-if="currentMonthMemberCount.length === 0">
                    <td colspan="3" class="border-b border-gray-300 px-4 py-2 text-center text-gray-500">There are no
                        active members</td>
                </tr>
                <tr v-if="currentMonthMemberCount.length > 0" class="font-bold">
                    <td class="border-t border-gray-300 px-4 py-2 text-right" colspan="1">Total Members:</td>
                    <td class="border-t border-gray-300 px-4 py-2">{{ currentMonthTotalMember }}</td>
                    <td class="border-t border-gray-300 px-4 py-2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Approximate Bill Calculation Section for Current Month -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-xl font-semibold mb-2">Approximate bill calculation for {{ currentMonthName }}</h2>
            <p><strong>Total Members:</strong> {{ currentMonthTotalMember }}</p>
            <p><strong>Price Rate:</strong> £{{ dailyPriceRate }}</p>
            <p><strong>Approximate Bill Amount:</strong> £{{ dailyPriceRate * currentMonthTotalMember }}</p>
            <p><strong>Currency:</strong> {{ userCurrency }}</p>
        </div>

        <!-- ============================================= -->
        <!-- Sub Month Member Counts Section -->
        <!-- ============================================= -->

        <h1 class="text-2xl font-bold mb-4 mt-5 pt-5">Bill for {{ previousMonthName }}</h1>

        <table class="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
                <tr>
                    <th class="border-b-2 border-gray-300 px-4 py-2">#</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Date</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Day total member</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Day total bill</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(count, index) in previousMonthMemberCount" :key="count.date">
                    <td class="border-b border-gray-300 px-2 py-2">{{ index + 1 }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.date }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.day_total_member }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.day_total_bill }}</td>
                </tr>
                <tr v-if="previousMonthMemberCount.length === 0">
                    <td colspan="3" class="border-b border-gray-300 px-4 py-2 text-center text-gray-500">There are no
                        members for {{ previousMonthName }}</td>
                </tr>
                <tr v-if="previousMonthMemberCount.length > 0" class="font-bold">
                    <td class="border-t border-gray-300 px-4 py-2 text-right" colspan="1">Total members:</td>
                    <td class="border-t border-gray-300 px-4 py-2">{{ subMonthTotalMember }}</td>
                    <td class="border-t border-gray-300 px-4 py-2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Separate Section for sub Month Bill Calculation -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-xl font-semibold mb-2">Bill calculation for {{ previousMonthName }}</h2>
            <!-- <p><strong>Price Rate:</strong> change £{{ dailyPriceRate.toFixed(2) }}</p> -->
            <p><strong>Total Members:</strong> {{ subMonthTotalMember }}</p>
            <p class="font-bold"><strong>Total Bill Amount:</strong> £{{ previousMonthTotalBillAmount.toFixed(2) }}</p>
            <p><strong>Currency:</strong> {{ userCurrency }}</p>
        </div>
    </div>
</template>

<style scoped>
/* You can add scoped styles here if needed */
</style>
