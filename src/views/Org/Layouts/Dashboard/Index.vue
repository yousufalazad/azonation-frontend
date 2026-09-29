<!-- Organisation dashboard: key numbers, recent members and 12-month trends -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { authStore } from '../../../../store/authStore';
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import { CurrencyService } from '@/helpers/currency';
import { useToast } from '@/composables/useToast';
import { formatDate, membershipAge, humanize, statusTone } from '@/helpers/format';
import { Users, CalendarDays, Wallet, TrendingUp, Plus, ChevronRight } from 'lucide-vue-next';

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

const canView = computed(() => auth.isAuthenticated && auth.user?.type === 'organisation');
const orgName = computed(() => auth.user?.org_name || '');

/* ================= LOADING ================= */
const isInitialLoading = ref(true);
let failedCount = 0;

// Every loader returns the API data or null, and counts failures so we can show one message.
// Optional data (e.g. the next meeting, which is empty when none is planned) never counts as a failure.
const load = async (url, { optional = false } = {}) => {
    const res = await auth.fetchProtectedApi(url, {}, 'GET');
    if (res?.status) return res.data;
    if (!optional) failedCount++;
    return null;
};

/* ================= SUMMARY ================= */
const totalMembers = ref(0);
const newMembersThisYear = ref(0);
const nextMeetingDate = ref('');
const transactions = ref([]);
const memberList = ref([]);

const balance = computed(() =>
    transactions.value.reduce((sum, trx) => (trx.type === 'income' ? sum + Number(trx.amount) : sum - Number(trx.amount)), 0),
);

const summaryCards = computed(() => [
    { key: 'members', title: t('dashboard.totalMembers'), value: totalMembers.value, to: { name: 'index-member' }, linkText: t('dashboard.seeAll'), icon: Users, tone: 'bg-primary-soft text-primary-soft-ink' },
    { key: 'meeting', title: t('dashboard.nextMeeting'), value: nextMeetingDate.value, empty: t('dashboard.noUpcomingMeeting'), to: '/org-dashboard/meetings', linkText: nextMeetingDate.value ? t('dashboard.seeAll') : t('dashboard.scheduleMeeting'), icon: CalendarDays, tone: 'bg-warning-soft text-warning' },
    { key: 'balance', title: t('dashboard.balance'), value: CurrencyService.format(balance.value), to: '/org-dashboard/fund-management', linkText: t('dashboard.seeTransactions'), icon: Wallet, tone: 'bg-success-soft text-success' },
    { key: 'new', title: t('dashboard.newMembersThisYear'), value: newMembersThisYear.value, to: { name: 'index-member' }, linkText: t('dashboard.seeAll'), icon: TrendingUp, tone: 'bg-primary-soft text-primary-soft-ink' },
]);

/* ================= MEMBERS ================= */
const recentMembers = computed(() => memberList.value.slice(0, 5));

const memberName = (m) => [m.individual?.first_name, m.individual?.last_name].filter(Boolean).join(' ') || '—';


/* ================= TRENDS (last 12 months) ================= */
const months = Array.from({ length: 12 }, (_, i) => dayjs().subtract(11 - i, 'month'));
const monthKeys = months.map((m) => m.format('YYYY-MM'));
const monthLabels = months.map((m) => m.format('MMM'));

// [{ year, month, <field> }] -> one number per month, oldest first
const valuesByMonth = (items, field) => {
    const totals = new Map((items || []).map((item) => [`${item.year}-${String(item.month).padStart(2, '0')}`, Number(item[field]) || 0]));
    return monthKeys.map((k) => totals.get(k) ?? 0);
};

const income = ref(null);
const expense = ref(null);
const growth = ref(null);
const balanceByMonth = computed(() => (income.value && expense.value ? income.value.map((v, i) => v - expense.value[i]) : null));

const money = (v) => CurrencyService.format(v);
const count = (v) => Number(v).toLocaleString('en-US');

/* ================= LOAD EVERYTHING IN PARALLEL ================= */
onMounted(async () => {
    if (!canView.value) return;
    CurrencyService.showSymbol = false; // "BDT 1,600.00" rather than "৳ 1,600.00"
    failedCount = 0;

    const [members, total, trx, meeting, newCount, incomeData, expenseData, growthData] = await Promise.all([
        load('/api/org-members/'),
        load('/api/total-org-member-count'),
        load('/api/fund-transactions'),
        load('/api/org-next-meeting', { optional: true }),
        load('/api/this-year-new-member-count'),
        load('/api/reports'),
        load('/api/org-expense-reports'),
        load('/api/reports/membership-growth'),
        CurrencyService.load(),
    ]);

    memberList.value = Array.isArray(members) ? members : [];
    totalMembers.value = total || 0;
    transactions.value = Array.isArray(trx) ? trx : [];
    nextMeetingDate.value = meeting?.date ? formatDate(meeting.date) : '';
    newMembersThisYear.value = newCount || 0;
    income.value = incomeData ? valuesByMonth(incomeData, 'total_income') : null;
    expense.value = expenseData ? valuesByMonth(expenseData, 'total_expense') : null;
    growth.value = growthData ? valuesByMonth(growthData, 'total_members') : null;

    isInitialLoading.value = false;
    if (failedCount) toast.error(t('dashboard.loadFailed'));
});
</script>

<template>
    <div v-if="canView" class="mx-auto flex max-w-7xl flex-col gap-8">
        <AzPageHeader :title="t('dashboard.welcome')" :description="orgName ? t('dashboard.subtitle', { org: orgName }) : ''">
            <AzButton variant="secondary" to="/org-dashboard/fund-management">{{ t('dashboard.fundManagement') }}</AzButton>
            <AzButton to="/org-dashboard/create-member">
                <template #icon><Plus class="h-[18px] w-[18px]" /></template>
                {{ t('dashboard.addMember') }}
            </AzButton>
        </AzPageHeader>

        <!-- KEY NUMBERS: each card opens the related page -->
        <section class="-mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" :aria-label="t('nav.home')">
            <router-link v-for="card in summaryCards" :key="card.key" :to="card.to"
                class="group flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card transition hover:border-primary/40 hover:shadow-pop">
                <div class="flex items-center justify-between gap-3">
                    <span class="text-sm font-medium text-ink-2">{{ card.title }}</span>
                    <span class="flex h-10 w-10 items-center justify-center rounded-control" :class="card.tone">
                        <component :is="card.icon" class="h-5 w-5" aria-hidden="true" />
                    </span>
                </div>
                <AzSkeleton v-if="isInitialLoading" height="2rem" />
                <p v-else-if="card.value || (card.value === 0 && !card.empty)"
                    class="text-2xl font-bold tabular-nums text-ink sm:text-[28px]">{{ card.value }}</p>
                <p v-else class="text-[15px] text-ink-muted">{{ card.empty }}</p>
                <span class="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
                    {{ card.linkText }}
                    <ChevronRight class="h-4 w-4" aria-hidden="true" />
                </span>
            </router-link>
        </section>

        <!-- RECENT MEMBERS -->
        <AzCard :title="t('dashboard.recentMembers')" :description="t('dashboard.recentMembersHint')" :padded="false">
            <template #actions>
                <AzButton variant="quiet" size="sm" :to="{ name: 'index-member' }">{{ t('dashboard.seeAllMembers') }}</AzButton>
            </template>

            <div v-if="isInitialLoading" class="p-5">
                <AzSkeleton :lines="5" height="2.5rem" />
            </div>

            <AzEmptyState v-else-if="!recentMembers.length" :title="t('dashboard.noMembersTitle')" :description="t('dashboard.noMembersText')">
                <template #icon><Users class="h-7 w-7" /></template>
                <AzButton to="/org-dashboard/create-member">{{ t('dashboard.addMember') }}</AzButton>
            </AzEmptyState>

            <template v-else>
                <!-- Phones: one card per member -->
                <ul class="divide-y divide-line md:hidden">
                    <li v-for="member in recentMembers" :key="member.id" class="flex items-center gap-3 px-5 py-4">
                        <img :src="member.image_url || placeholderImage" :alt="t('member.photoOf', { name: memberName(member) })"
                            class="h-11 w-11 max-w-none shrink-0 rounded-full border border-line object-cover" loading="lazy" />
                        <div class="min-w-0 flex-1">
                            <p class="truncate font-semibold text-ink">{{ memberName(member) }}</p>
                            <p class="truncate text-sm text-ink-muted">
                                {{ member.membership_type?.name || '—' }} · {{ formatDate(member.membership_start_date) }}
                            </p>
                        </div>
                        <AzBadge :tone="statusTone(member.membership_status?.name)">{{ humanize(member.membership_status?.name) }}</AzBadge>
                    </li>
                </ul>

                <!-- Tablets and desktops: table -->
                <div class="hidden overflow-x-auto md:block">
                    <table class="az-table min-w-full">
                        <thead>
                            <tr>
                                <th scope="col" class="w-16"><span class="sr-only">{{ t('member.photo') }}</span></th>
                                <th scope="col">{{ t('member.name') }}</th>
                                <th scope="col">{{ t('member.membershipId') }}</th>
                                <th scope="col">{{ t('member.membershipType') }}</th>
                                <th scope="col">{{ t('member.joined') }}</th>
                                <th scope="col">{{ t('member.membershipAge') }}</th>
                                <th scope="col">{{ t('member.status') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="member in recentMembers" :key="member.id">
                                <td>
                                    <img :src="member.image_url || placeholderImage" :alt="t('member.photoOf', { name: memberName(member) })"
                                        class="h-10 w-10 max-w-none rounded-full border border-line object-cover" loading="lazy" />
                                </td>
                                <td class="font-semibold text-ink">{{ memberName(member) }}</td>
                                <td class="tabular-nums">{{ member.existing_membership_id || '—' }}</td>
                                <td>{{ member.membership_type?.name || '—' }}</td>
                                <td class="whitespace-nowrap tabular-nums">{{ formatDate(member.membership_start_date) }}</td>
                                <td class="whitespace-nowrap">{{ membershipAge(member.membership_start_date) }}</td>
                                <td>
                                    <AzBadge :tone="statusTone(member.membership_status?.name)">{{ humanize(member.membership_status?.name) }}</AzBadge>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </AzCard>

        <!-- MONEY TRENDS -->
        <section class="flex flex-col gap-4">
            <h2 class="text-xl font-semibold text-ink">{{ t('dashboard.financeTitle') }}</h2>
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <AzCard :title="t('dashboard.income')">
                    <AzLineChart v-if="income" :labels="monthLabels" :values="income" :label="t('dashboard.income')" tone="success" :format-value="money" />
                    <AzSkeleton v-else-if="isInitialLoading" height="180px" />
                </AzCard>
                <AzCard :title="t('dashboard.expense')">
                    <AzLineChart v-if="expense" :labels="monthLabels" :values="expense" :label="t('dashboard.expense')" tone="danger" :format-value="money" />
                    <AzSkeleton v-else-if="isInitialLoading" height="180px" />
                </AzCard>
                <AzCard :title="t('dashboard.balanceTrend')">
                    <AzLineChart v-if="balanceByMonth" :labels="monthLabels" :values="balanceByMonth" :label="t('dashboard.balance')" tone="primary" :format-value="money" />
                    <AzSkeleton v-else-if="isInitialLoading" height="180px" />
                </AzCard>
            </div>
        </section>

        <!-- MEMBERSHIP GROWTH -->
        <section class="flex flex-col gap-4 pb-8">
            <h2 class="text-xl font-semibold text-ink">{{ t('dashboard.growthTitle') }}</h2>
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <AzCard :title="t('dashboard.totalMembersChart')" class="lg:col-span-2">
                    <AzLineChart v-if="growth" :labels="monthLabels" :values="growth" :label="t('dashboard.totalMembersChart')" tone="primary" :format-value="count" :height="220" />
                    <AzSkeleton v-else-if="isInitialLoading" height="220px" />
                </AzCard>
            </div>
        </section>
    </div>

    <AzEmptyState v-else :title="t('dashboard.notAllowed')" />
</template>
