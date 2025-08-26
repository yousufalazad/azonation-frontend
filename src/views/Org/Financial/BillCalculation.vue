<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
const auth = authStore;

const dailyPriceRate = ref([]);
const currentMonthName = ref('');
const currentMonthTotalMember = ref(0);
const subMonthTotalMember = ref(0);
const subMonthTotalBillAmount = ref(0);
// Removed duplicate declaration of approximateBill
const userCurrency = ref('');
const previousMonthName = ref('');
const currentMonthMemberCount = ref([]);
const subMonthMemberCount = ref([]);
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
            calculateCurrentMonthTotalMember(); // ✅ Call here after data is loaded
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
            subMonthMemberCount.value = response.data;
            calculateSubMonthTotalMember(); // ✅ Call here after data is loaded
        } else {
        }
    } catch (error) {
        console.error('Error fetching sub month bill calculation:', error);
    }
};

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

const calculateCurrentMonthTotalMember = () => {
    currentMonthTotalMember.value = currentMonthMemberCount.value.reduce((acc, count) => acc + count.day_total_member, 0);
};

const calculateSubMonthTotalMember = () => {
    subMonthTotalMember.value = subMonthMemberCount.value.reduce((acc, count) => acc + count.day_total_member, 0);
};


const approximateBill = computed(() => {
    return dailyPriceRate.value * currentMonthTotalMember.value;
});

const subMonthActualBill = computed(() => {
    return dailyPriceRate.value * subMonthTotalMember.value;
});

onMounted(() => {
    getDailyPriceRate();
    getUserCurrency();
    getCurrentMonthName();
    getPreviousMonthName();
    getCurrentMonthBillCalculation();
    getSubMonthBillCalculation();
    });
</script>

<template>
    <div class="max-w-6xl mb-5 pb-5">
      <!-- Current Month Bill -->
      <section class="mb-10">
        <h1 class="text-2xl font-semibold text-gray-800 mb-6">Approximate bill — {{ currentMonthName }}</h1>
  
        <div class="overflow-x-auto bg-white shadow rounded-lg">
          <table class="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium">#</th>
                <th class="px-4 py-3 font-medium">Date</th>
                <th class="px-4 py-3 font-medium">Total member</th>
                <th class="px-4 py-3 font-medium">Day bill</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(count, index) in currentMonthMemberCount" :key="count.date" class="hover:bg-gray-50">
                <td class="px-4 py-2">{{ index + 1 }}</td>
                <td class="px-4 py-2">{{ count.date }}</td>
                <td class="px-4 py-2">{{ count.day_total_member }}</td>
                <td class="px-4 py-2">{{ count.day_total_bill }}</td>
              </tr>
              <tr v-if="currentMonthMemberCount.length === 0">
                <td colspan="4" class="text-center text-gray-500 px-4 py-4">There are no members</td>
              </tr>
              <tr v-if="currentMonthMemberCount.length > 0" class="font-semibold bg-gray-50">
                <td colspan="2" class="px-4 py-3 text-right">Total member: {{ currentMonthTotalMember }}</td>
                <td colspan="2" class="px-4 py-3 text-center">Total bill: {{ userCurrency }} {{ approximateBill }}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Calculation Summary -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h2 class="text-lg font-medium mb-3">Calculation summary</h2>
          <div class="space-y-1">
            <p><span class="font-medium">Total member:</span> {{ currentMonthTotalMember }}</p>
            <p><span class="font-medium">Price per member per day:</span> {{ userCurrency }} {{ dailyPriceRate }}</p>
            <p><span class="font-medium">Approximate bill:</span> {{ userCurrency }} {{ approximateBill }}</p>
          </div>
        </div>
      </section>
  
      <!-- Previous Month Bill -->
      <section>
        <h1 class="text-2xl font-semibold text-gray-800 mb-6">Bill — {{ previousMonthName }}</h1>
  
        <div class="overflow-x-auto bg-white shadow rounded-lg">
          <table class="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium">#</th>
                <th class="px-4 py-3 font-medium">Date</th>
                <th class="px-4 py-3 font-medium">Total member</th>
                <th class="px-4 py-3 font-medium">Total bill</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(count, index) in subMonthMemberCount" :key="count.date" class="hover:bg-gray-50">
                <td class="px-4 py-2">{{ index + 1 }}</td>
                <td class="px-4 py-2">{{ count.date }}</td>
                <td class="px-4 py-2">{{ count.day_total_member }}</td>
                <td class="px-4 py-2">{{ count.day_total_bill }}</td>
              </tr>
              <tr v-if="subMonthMemberCount.length === 0">
                <td colspan="4" class="text-center text-gray-500 px-4 py-4">
                  There are no members for {{ previousMonthName }}
                </td>
              </tr>
              <tr v-if="subMonthMemberCount.length > 0" class="font-semibold bg-gray-50">
                <td colspan="2" class="px-4 py-3 text-right">Total member: {{ subMonthTotalMember }}</td>
                <td colspan="2" class="px-4 py-3 text-center">Total bill: {{ userCurrency }} {{ subMonthActualBill }}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Sub Month Calculation Summary -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h2 class="text-lg font-medium mb-3">Summary</h2>
          <div class="space-y-1">
            <p><span class="font-medium">Total member:</span> {{ subMonthTotalMember }}</p>
            <p><span class="font-medium">Price per member per day:</span> {{ userCurrency }} {{ dailyPriceRate }}</p>
            <p><span class="font-medium">Total bill:</span> {{ userCurrency }} {{ subMonthActualBill }}</p>
          </div>
        </div>
      </section>
    </div>
    <div class="mb-5 pb-5"></div>
  </template>
  

<style scoped>
/* You can add scoped styles here if needed */
</style>
