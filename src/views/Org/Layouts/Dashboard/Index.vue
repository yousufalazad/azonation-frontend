<!-- Org dashboard initial content -->
<script setup>
import { ref, onMounted, computed, h } from 'vue';
import { authStore } from '../../../../store/authStore';
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
import { CurrencyService } from '@/helpers/currency';
import LineChartBalance from '../../Report/LineChartBalance.vue';

dayjs.extend(duration);
dayjs.extend(relativeTime);
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

/* ================= AUTH ================= */
const auth = authStore;
const userType = computed(() => auth.user?.type);

/* ================= TOAST (non-blocking background-fetch feedback) ================= */
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (t) => {
        t.addEventListener('mouseenter', Swal.stopTimer);
        t.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

/* ================= UI STATE ================= */
const isInitialLoading = ref(true);

/* ================= MEMBERS ================= */
const totalOrgMember = ref(0);
const memberList = ref([]);
const membershipTypes = ref([]);
const thisYearNewMemberCount = ref(0);

const fetchMemberList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-members/', {}, 'GET');
        memberList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching member list:', error);
        memberList.value = [];
    }
};

const fetchMembershipType = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/membership-types', {}, 'GET');
        membershipTypes.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching membership types:', error);
        membershipTypes.value = [];
    }
};

const totalOrgMemberCount = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/total-org-member-count', {}, 'GET');
        totalOrgMember.value = response.status && response.data ? response.data : 0;
    } catch (error) {
        console.error('Error fetching total members:', error);
    }
};

const getThisYearNewMemberCount = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/this-year-new-member-count', {}, 'GET');
        thisYearNewMemberCount.value = response.status && response.data ? response.data : 0;
    } catch (error) {
        console.error('Error fetching this year new member count:', error);
    }
};

const calculateMembershipAge = (startDate) => {
    if (!startDate) return '';
    const start = dayjs(startDate);
    const now = dayjs();
    const diffYears = now.diff(start, 'year');
    const diffMonths = now.diff(start.add(diffYears, 'year'), 'month');
    const diffDays = now.diff(start.add(diffYears, 'year').add(diffMonths, 'month'), 'day');
    return `${diffYears}y ${diffMonths}m ${diffDays}d`;
};

const statusBadgeClass = (statusName) => {
    const s = (statusName || '').toLowerCase();
    if (s.includes('active')) return 'bg-green-50 text-green-700';
    if (s.includes('terminat') || s.includes('inactive') || s.includes('expired')) return 'bg-red-50 text-red-600';
    if (s.includes('pending')) return 'bg-amber-50 text-amber-700';
    return 'bg-gray-100 text-gray-600';
};

/* ================= FINANCE (SUMMARY BALANCE) ================= */
const transactionList = ref([]);
const transactionCurrencySymbol = ref('');

const getTransactions = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/fund-transactions', {}, 'GET');
        transactionList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
};

const balance = computed(() =>
    transactionList.value.reduce((acc, trx) => (
        trx.type === 'income' ? acc + Number(trx.amount) : acc - Number(trx.amount)
    ), 0)
);

const fetchCurrencyPreference = async () => {
    try {
        const res = await auth.fetchProtectedApi('/api/fund-transaction-currencies', {}, 'GET');
        transactionCurrencySymbol.value = res?.data?.currency?.currency_code ?? '';
    } catch (error) {
        console.error('Failed to fetch user currency preference:', error);
        transactionCurrencySymbol.value = '';
    }
};

const formatCurrency = (amount) => CurrencyService.format(amount);

/* ================= MEETINGS ================= */
const nextMeetingDate = ref('');

const orgNextMeeting = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-next-meeting', {}, 'GET');
        if (response.status && response.data?.date) {
            nextMeetingDate.value = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }).format(new Date(response.data.date));
        }
    } catch (error) {
        console.error('Error fetching next meeting:', error);
        nextMeetingDate.value = '';
    }
};

/* ================= SUMMARY CARDS (config-driven, avoids repeated markup) ================= */
const summaryCards = computed(() => [
    {
        title: 'Total Member',
        value: totalOrgMember.value,
        link: '/org-dashboard/index-member',
        linkText: 'See all',
        iconPath: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
    },
    {
        title: 'Next Meeting',
        value: nextMeetingDate.value,
        emptyText: 'No upcoming meeting found',
        link: '/org-dashboard/meetings',
        linkText: 'See all',
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600'
    },
    {
        title: 'Balance',
        value: formatCurrency(balance.value),
        link: '/org-dashboard/fund-management',
        linkText: 'See all transactions',
        iconPath: 'M3 10h18M7 15h1m4 0h1M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600'
    },
    {
        title: 'This Year New Members',
        value: thisYearNewMemberCount.value,
        link: '/org-dashboard/index-member',
        linkText: 'See all',
        iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600'
    }
]);

/* ================= INCOME / EXPENSE / BALANCE REPORTS ================= */
// Income and expense are fetched once and shared by the income, expense and balance charts.
const chartDataIncome = ref(null);
const chartData = ref(null);
const chartDataBalance = ref(null);

// Last 12 months as "YYYY-MM", oldest first
const lastTwelveMonths = () =>
    Array.from({ length: 12 }, (_, i) => dayjs().subtract(11 - i, 'month').format('YYYY-MM'));

// Turns [{ year, month, <field> }] into one value per month
const valuesByMonth = (months, items, field) => {
    const totals = new Map((items || []).map(item => [
        `${item.year}-${String(item.month).padStart(2, '0')}`,
        Number(item[field]) || 0,
    ]));
    return months.map(m => totals.get(m) ?? 0);
};

const lineDataset = (label, color, data, extra = {}) => ({
    labels: extra.labels,
    datasets: [{ label, backgroundColor: color, borderColor: color, data, fill: false, ...extra.dataset }],
});

const fetchFinanceReports = async () => {
    chartDataIncome.value = null;
    chartData.value = null;
    chartDataBalance.value = null;
    try {
        const [incomeResponse, expenseResponse] = await Promise.all([
            auth.fetchProtectedApi('/api/reports', {}, 'GET'),
            auth.fetchProtectedApi('/api/org-expense-reports', {}, 'GET'),
        ]);
        const months = lastTwelveMonths();
        const income = incomeResponse.status ? valuesByMonth(months, incomeResponse.data, 'total_income') : null;
        const expense = expenseResponse.status ? valuesByMonth(months, expenseResponse.data, 'total_expense') : null;

        if (income) chartDataIncome.value = lineDataset('Income', '#4CAF50', income, { labels: months });
        else Toast.fire({ icon: 'error', title: 'Failed to load income report' });

        if (expense) chartData.value = lineDataset('Expense', '#FF5722', expense, { labels: months });
        else Toast.fire({ icon: 'error', title: 'Failed to load expense report' });

        if (income && expense) {
            const balance = income.map((value, i) => value - expense[i]);
            chartDataBalance.value = lineDataset('Balance', '#3B82F6', balance, { labels: months });
        }
    } catch (error) {
        console.error('Error fetching finance reports:', error);
        Toast.fire({ icon: 'error', title: 'Error fetching finance reports' });
    }
};

/* ================= CHART COMPONENT ================= */
// Render function instead of a runtime template string, so the app does not
// need Vue's in-browser template compiler (smaller bundle, CSP-safe).
const monthsAxis = { title: { display: true, text: 'Months' } };
const moneyChartOptions = { responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true }, x: monthsAxis } };
const makeLineChart = (propName, options) => ({
    props: { [propName]: { type: Object, required: true } },
    setup(props) {
        return () => h(Line, { data: props[propName], options });
    },
});
const LineChartIncome = makeLineChart('chartDataIncome', moneyChartOptions);
const LineChart = makeLineChart('chartData', moneyChartOptions);

/* ================= MEMBERSHIP GROWTH REPORT ================= */
const chartDataMembership = ref(null);

const fetchMembershipGrowthReportData = async () => {
    try {
        chartDataMembership.value = null;
        const response = await auth.fetchProtectedApi('/api/reports/membership-growth', {}, 'GET');
        if (!response.status) {
            Toast.fire({ icon: 'error', title: 'Failed to load membership growth report' });
            return;
        }
        const months = lastTwelveMonths();
        chartDataMembership.value = lineDataset(
            'Total Members', '#6366F1', valuesByMonth(months, response.data, 'total_members'),
            { labels: months, dataset: { tension: 0.3 } },
        );
    } catch (error) {
        console.error('Error fetching membership growth report:', error);
        Toast.fire({ icon: 'error', title: 'Error fetching membership growth report' });
    }
};

const LineChartMembership = makeLineChart('chartDataMembership', {
    responsive: true,
    maintainAspectRatio: true,
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Total Members' } }, x: monthsAxis },
});

/* ================= MOUNT: LOAD EVERYTHING IN PARALLEL ================= */
onMounted(async () => {
    CurrencyService.showSymbol = false; // false => "USD", true => "$"
    try {
        await CurrencyService.load();
        await Promise.allSettled([
            fetchMemberList(),
            fetchMembershipType(),
            totalOrgMemberCount(),
            getTransactions(),
            orgNextMeeting(),
            getThisYearNewMemberCount(),
            fetchFinanceReports(),
            fetchMembershipGrowthReportData(),
            fetchCurrencyPreference()
        ]);
    } finally {
        isInitialLoading.value = false;
    }
});
</script>

<template>
    <div class="py-2">
        <div v-if="auth.isAuthenticated && userType === 'organisation'">

            <!-- SUMMARY CARDS -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div v-for="card in summaryCards" :key="card.title"
                    class="bg-white shadow rounded-xl p-5 border border-gray-100 hover:shadow-lg transition">
                    <div :class="['w-10 h-10 rounded-lg flex items-center justify-center mb-3', card.iconBg]">
                        <svg class="w-5 h-5" :class="card.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.iconPath" />
                        </svg>
                    </div>

                    <h5 class="text-sm text-gray-500 font-medium mb-1">{{ card.title }}</h5>

                    <div v-if="isInitialLoading" class="h-7 w-20 bg-gray-100 rounded animate-pulse"></div>
                    <template v-else>
                        <p v-if="card.value" class="text-2xl font-bold text-gray-800">{{ card.value }}</p>
                        <p v-else class="text-gray-400 text-sm">{{ card.emptyText }}</p>
                    </template>

                    <router-link :to="card.link">
                        <button class="text-blue-600 text-sm hover:underline mt-2 inline-block font-medium">
                            {{ card.linkText }}
                        </button>
                    </router-link>
                </div>
            </div>

            <!-- TABLE TOP CONTROLS -->
            <div class="mt-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 class="text-base sm:text-lg font-semibold text-gray-700 truncate">Members</h2>

                <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto sm:ml-auto">
                    <div class="flex flex-row gap-2 justify-end w-full sm:w-auto">
                        <router-link :to="{ name: 'index-member' }">
                            <button class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition">
                                Full Member List
                            </button>
                        </router-link>
                    </div>

                    <router-link :to="{ path: '/org-dashboard/create-member' }">
                        <button class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition w-full sm:w-auto">
                            + Add Member
                        </button>
                    </router-link>
                </div>
            </div>

            <!-- MEMBER LIST TABLE -->
            <div class="mt-2">
                <div class="bg-white shadow-md rounded-2xl overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-20">Image</th>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">Name</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/5">Membership ID</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/5">Membership Type</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/5">Joining Date</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/5">Membership Age</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">Status</th>
                            </tr>
                        </thead>

                        <tbody class="bg-white divide-y divide-gray-100">
                            <!-- Skeleton rows while loading -->
                            <template v-if="isInitialLoading">
                                <tr v-for="n in 3" :key="'sk-' + n">
                                    <td class="px-4 py-4"><div class="h-10 w-10 rounded-full bg-gray-100 animate-pulse"></div></td>
                                    <td class="px-6 py-4"><div class="h-4 w-32 bg-gray-100 rounded animate-pulse"></div></td>
                                    <td class="px-4 py-4"><div class="h-4 w-20 bg-gray-100 rounded animate-pulse"></div></td>
                                    <td class="px-4 py-4"><div class="h-4 w-24 bg-gray-100 rounded animate-pulse"></div></td>
                                    <td class="px-4 py-4"><div class="h-4 w-28 bg-gray-100 rounded animate-pulse"></div></td>
                                    <td class="px-4 py-4"><div class="h-4 w-20 bg-gray-100 rounded animate-pulse"></div></td>
                                    <td class="px-4 py-4"><div class="h-5 w-16 bg-gray-100 rounded-full animate-pulse"></div></td>
                                </tr>
                            </template>

                            <template v-else-if="memberList.length">
                                <tr v-for="member in memberList.slice(0, 5)" :key="member.id" class="hover:bg-gray-50 transition">
                                    <td class="px-4 py-4 text-sm text-gray-800">
                                        <img :src="member.image_url ? member.image_url : placeholderImage" alt="Member Image"
                                            class="h-10 w-10 rounded-full object-cover">
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-800 font-medium">
                                        {{ member.individual.first_name }} {{ member.individual.last_name }}
                                    </td>
                                    <td class="px-4 py-4 text-sm text-gray-800">{{ member.existing_membership_id || '--' }}</td>
                                    <td class="px-4 py-4 text-sm text-gray-800">{{ member.membership_type?.name || '--' }}</td>
                                    <td class="px-4 py-4 text-sm text-gray-800">
                                        {{
                                            member.membership_start_date
                                                ? new Date(member.membership_start_date).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })
                                                : '--'
                                        }}
                                    </td>
                                    <td class="px-4 py-4 text-sm text-gray-800">
                                        {{ calculateMembershipAge(member.membership_start_date) || '--' }}
                                    </td>
                                    <td class="px-4 py-4 text-sm">
                                        <span :class="['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', statusBadgeClass(member.membership_status?.name)]">
                                            {{ member.membership_status?.name || '--' }}
                                        </span>
                                    </td>
                                </tr>
                            </template>

                            <tr v-else>
                                <td colspan="7" class="p-10 text-center text-gray-400">
                                    <svg class="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a3 3 0 00-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2a3 3 0 01.356-1.857m0 0a5.002 5.002 0 019.288 0M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <p class="text-sm">No members found.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="!isInitialLoading && memberList.length" class="px-6 py-4 text-right">
                        <router-link to="/org-dashboard/index-member">
                            <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                                See all members →
                            </button>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex items-center justify-center h-screen">
            <p class="text-gray-500 text-lg">You are not authorized to view this page.</p>
        </div>

        <!-- FINANCIAL REPORTS -->
        <div class="mt-8">
            <h2 class="text-lg font-semibold text-gray-600 mb-4">Financial Reports (Last 12 Months)</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white shadow-md rounded-2xl p-6">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h3 class="text-base font-medium text-gray-700">Income</h3>
                    </div>
                    <line-chart-income v-if="chartDataIncome" :chart-data-income="chartDataIncome" />
                    <div v-else class="space-y-2 animate-pulse">
                        <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div class="h-32 bg-gray-100 rounded"></div>
                    </div>
                </div>

                <div class="bg-white shadow-md rounded-2xl p-6">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17H5m0 0V9m0 8l8-8 4 4 6-6" />
                            </svg>
                        </div>
                        <h3 class="text-base font-medium text-gray-700">Expense</h3>
                    </div>
                    <line-chart v-if="chartData" :chart-data="chartData" />
                    <div v-else class="space-y-2 animate-pulse">
                        <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div class="h-32 bg-gray-100 rounded"></div>
                    </div>
                </div>

                <div class="bg-white shadow-md rounded-2xl p-6">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 class="text-base font-medium text-gray-700">Balance Trend</h3>
                    </div>
                    <line-chart-balance v-if="chartDataBalance" :chart-data-balance="chartDataBalance" />
                    <div v-else class="space-y-2 animate-pulse">
                        <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div class="h-32 bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MEMBERSHIP GROWTH REPORT -->
        <div class="mt-8">
            <h2 class="text-lg font-semibold text-gray-600 mb-4">Membership Growth Reports (Last 12 Months)</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white shadow-md rounded-2xl p-6">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                            <svg class="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                            </svg>
                        </div>
                        <h3 class="text-base font-medium text-gray-700">Total Member</h3>
                    </div>
                    <line-chart-membership v-if="chartDataMembership" :chart-data-membership="chartDataMembership" />
                    <div v-else class="space-y-2 animate-pulse">
                        <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div class="h-32 bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>
        </div>

        <!--
          Future work: Program-related charts (Meeting / Event / Project) can follow the
          same "icon header + LineChart component + skeleton fallback" pattern used above.
        -->

        <div class="py-5 mt-8"></div>
    </div>
</template>