<template>
    <div>
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
                <tr v-for="(count, index) in activeMemberCount" :key="count.date">
                    <td class="border-b border-gray-300 px-4 py-2">{{ index + 1 }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.date }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.active_member }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.is_billable ? 'Yes' : 'No' }}</td>
                </tr>
                <tr v-if="activeMemberCount.length === 0">
                    <td colspan="3" class="border-b border-gray-300 px-4 py-2 text-center text-gray-500">There are no active members</td>
                </tr>
                <tr v-if="activeMemberCount.length > 0" class="font-bold">
                    <td class="border-t border-gray-300 px-4 py-2 text-right" colspan="1">Total Active Members:</td>
                    <td class="border-t border-gray-300 px-4 py-2">{{ totalActiveMember }}</td>
                    <td class="border-t border-gray-300 px-4 py-2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Approximate Bill Calculation Section for Current Month -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-xl font-semibold mb-2">Approximate Bill Calculation for {{ currentMonthName }}</h2>
            <p><strong>Price Rate:</strong> change £{{ priceRate.toFixed(2) }}</p>
            <p><strong>Total Active Members:</strong> {{ totalActiveMember }}</p>
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
                <tr v-for="(count, index) in previousMonthActiveMemberCount" :key="count.date">
                    <td class="border-b border-gray-300 px-2 py-2">{{ index + 1 }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.date }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.active_member }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.is_billable ? 'Yes' : 'No' }}</td>
                </tr>
                <tr v-if="previousMonthActiveMemberCount.length === 0">
                    <td colspan="3" class="border-b border-gray-300 px-4 py-2 text-center text-gray-500">There are no active members for {{ previousMonthName }}</td>
                </tr>
                <tr v-if="previousMonthActiveMemberCount.length > 0" class="font-bold">
                    <td class="border-t border-gray-300 px-4 py-2 text-right" colspan="1">Total Active Members:</td>
                    <td class="border-t border-gray-300 px-4 py-2">{{ previousMonthTotalActiveMember }}</td>
                    <td class="border-t border-gray-300 px-4 py-2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Separate Section for Previous Month Bill Calculation -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-xl font-semibold mb-2">Actual Bill Calculation for {{ previousMonthName }}</h2>
            <p><strong>Price Rate:</strong> change £{{ previousMonthPriceRate.toFixed(2) }}</p>
            <p><strong>Total Active Members:</strong> {{ previousMonthTotalActiveMember }}</p>
            <p class="font-bold"><strong>Total Bill Amount:</strong> £{{ previousMonthTotalBillAmount.toFixed(2) }}</p>
        </div>
    </div>

    <br>
    <hr>
    <hr>
    <h2>Honorary Member </h2>
    <hr>
    <hr>
    <br>
    
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Active Honorary Member Count for {{ currentMonthName }}</h1>
        
        <table class="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
                <tr>
                    <th class="border-b-2 border-gray-300 px-4 py-2">SL</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Date</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Active Honorary Members</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Billable</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(count, index) in activeHonoraryMemberCount" :key="count.date">
                    <td class="border-b border-gray-300 px-4 py-2">{{ index + 1 }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.date }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.active_honorary_member }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.is_billable ? 'Yes' : 'No' }}</td>
                </tr>
                <tr v-if="activeHonoraryMemberCount.length === 0">
                    <td colspan="3" class="border-b border-gray-300 px-4 py-2 text-center text-gray-500">There are no active members</td>
                </tr>
                <tr v-if="activeHonoraryMemberCount.length > 0" class="font-bold">
                    <td class="border-t border-gray-300 px-4 py-2 text-right" colspan="1">Total Active Honorary Member:</td>
                    <td class="border-t border-gray-300 px-4 py-2">{{ totalActiveHonoraryMember }}</td>
                    <td class="border-t border-gray-300 px-4 py-2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Approximate Bill Calculation Section for Current Month -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-xl font-semibold mb-2">Approximate Bill Calculation for {{ currentMonthName }}</h2>
            <p><strong>Price Rate:</strong> change £{{ priceRate.toFixed(2) }}</p>
            <p><strong>Total Active Honorary Member:</strong> {{ totalActiveHonoraryMember }}</p>
            <p class="font-bold"><strong>Approximate Bill:</strong> £{{ approximateBill.toFixed(2) }}</p>
        </div>

        <!-- Previous Month Active Member Counts Section -->
        <h1 class="text-2xl font-bold mb-4">Active Honorary Member Count for {{ previousMonthName }}</h1>
        
        <table class="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
                <tr>
                    <th class="border-b-2 border-gray-300 px-2 py-2">SL</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Date</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Active Honorary Members</th>
                    <th class="border-b-2 border-gray-300 px-4 py-2">Billable</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(count, index) in previousMonthActiveHonoraryMemberCount" :key="count.date">
                    <td class="border-b border-gray-300 px-2 py-2">{{ index + 1 }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.date }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.active_honorary_member }}</td>
                    <td class="border-b border-gray-300 px-4 py-2">{{ count.is_billable ? 'Yes' : 'No' }}</td>
                </tr>
                <tr v-if="previousMonthActiveHonoraryMemberCount.length === 0">
                    <td colspan="3" class="border-b border-gray-300 px-4 py-2 text-center text-gray-500">There are no active Honorary members for {{ previousMonthName }}</td>
                </tr>
                <tr v-if="previousMonthActiveHonoraryMemberCount.length > 0" class="font-bold">
                    <td class="border-t border-gray-300 px-4 py-2 text-right" colspan="1">Total Active Honorary Members:</td>
                    <td class="border-t border-gray-300 px-4 py-2">{{ previousMonthTotalActiveHonoraryMember }}</td>
                    <td class="border-t border-gray-300 px-4 py-2"></td>
                </tr>
            </tbody>
        </table>

        <!-- Separate Section for Previous Month Bill Calculation -->
        <div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-xl font-semibold mb-2">Actual Bill Calculation for {{ previousMonthName }}</h2>
            <p><strong>Price Rate:</strong> change £{{ previousMonthPriceRate.toFixed(2) }}</p>
            <p><strong>Total Active Members:</strong> {{ previousMonthTotalActiveHonoraryMember }}</p>
            <p class="font-bold"><strong>Total Bill Amount:</strong> £{{ previousMonthTotalBillAmount.toFixed(2) }}</p>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const auth = authStore;

const priceRate = ref(0);
const currentMonthName = ref('');

const activeMemberCount = ref([]);
const totalActiveMember = ref(0);
const approximateBill = ref(0);

const activeHonoraryMemberCount = ref([]);
const totalActiveHonoraryMember = ref(0);
const approximateBillHonorary = ref(0);

const previousMonthName = ref('');
const previousMonthPriceRate = ref(0);

const previousMonthActiveMemberCount = ref([]);
const previousMonthTotalActiveMember = ref(0);
const previousMonthTotalBillAmount = ref(0);

const previousMonthActiveHonoraryMemberCount = ref([]);
const previousMonthTotalActiveHonoraryMember = ref(0);
const previousMonthTotalBillAmountHonorary = ref(0);


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

const getActiveMemberCount = async () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);

    try {
        const response = await auth.fetchProtectedApi('/api/active-member-count');

        if (response.status) {
            activeMemberCount.value = response.data;
            totalActiveMember.value = response.total_active_member;
            approximateBill.value = response.approximate_bill;
            priceRate.value = response.price_rate;
        } else {
            activeMemberCount.value = [];
            totalActiveMember.value = 0;
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
            previousMonthTotalActiveMember.value = response.previous_month_total_active_member;
            previousMonthTotalBillAmount.value = response.previous_month_total_bill_amount;
            previousMonthPriceRate.value = response.previous_month_price_rate;
            previousMonthActiveMemberCount.value = response.previous_month_member_count; // Assuming the API returns this
        } else {
            previousMonthTotalActiveMember.value = 0;
            previousMonthTotalBillAmount.value = 0;
            previousMonthPriceRate.value = 0;
            previousMonthActiveMemberCount.value = [];
        }
    } catch (error) {
        console.error('Error fetching previous month bill calculation:', error);
    }
};



//HONORARY member
const getActiveHonoraryMemberCount = async () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);

    try {
        const response = await auth.fetchProtectedApi('/api/active-honorary-member-count');

        if (response.status) {
            activeHonoraryMemberCount.value = response.data;
            totalActiveHonoraryMember.value = response.total_active_honorary_member;
            approximateBillHonorary.value = response.approximate_bill_honorary;
            priceRate.value = response.price_rate;
        } else {
            activeHonoraryMemberCount.value = [];
            totalActiveHonoraryMember.value = 0;
            approximateBillHonorary.value = 0;
            priceRate.value = 0;
        }
    } catch (error) {
        console.error('Error fetching active honorary member counts:', error);
    }
};

// New method to get previous month's bill calculation and active member counts
const getPreviousMonthBillCalculationHonoraryMember = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/previous-month-bill-calculation-honorary-member');

        if (response.status) {
            previousMonthTotalActiveHonoraryMember.value = response.previous_month_total_active_honorary_member;
            previousMonthTotalBillAmountHonorary.value = response.previous_month_total_bill_amount;
            previousMonthPriceRate.value = response.previous_month_price_rate;
            previousMonthActiveHonoraryMemberCount.value = response.previous_month_active_honorary_member_count; // Assuming the API returns this
        } else {
            previousMonthTotalActiveMember.value = 0;
            previousMonthTotalBillAmount.value = 0;
            previousMonthPriceRate.value = 0;
            previousMonthActiveHonoraryMemberCount.value = [];
        }
    } catch (error) {
        console.error('Error fetching previous month Active Honorary Member bill calculation:', error);
    }
};

onMounted(() => {
    getCurrentMonthName();
    getPreviousMonthName();
    getActiveMemberCount();
    getActiveHonoraryMemberCount();
    getPreviousMonthBillCalculation(); // Call the new method
    getPreviousMonthBillCalculationHonoraryMember(); // Call the new method
});
</script>

<style scoped>
/* You can add scoped styles here if needed */
</style>
