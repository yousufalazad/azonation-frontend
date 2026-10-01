<!-- Super Admin home: accounts on the platform, what needs attention (support, unpaid invoices),
     plans in use and the newest organisations -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { money, shortDate } from "@/helpers/billing";
import { Building2, Users, LifeBuoy, FileWarning, UserPlus, ChevronRight } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();

const loading = ref(true);
const d = ref(null);

const unpaidText = computed(() => (d.value?.unpaid_invoices || []).map((u) => money(u.total, { code: u.currency_code })).join(" + ") || money(0));
const unpaidCount = computed(() => (d.value?.unpaid_invoices || []).reduce((n, u) => n + Number(u.n), 0));
const planTotal = computed(() => (d.value?.plans || []).reduce((n, p) => n + Number(p.n), 0) || 1);

const cards = computed(() => d.value ? [
  { key: "orgs", icon: Building2, value: d.value.organisations, sub: t("adminHome.newThisMonth", { n: d.value.new_organisations }) },
  { key: "people", icon: Users, value: d.value.people, sub: t("adminHome.newThisMonth", { n: d.value.new_people }) },
  { key: "support", icon: LifeBuoy, value: d.value.open_support, sub: t("adminHome.waitingForReply"), to: { name: "superadmin-support" }, alert: d.value.open_support > 0 },
  { key: "unpaid", icon: FileWarning, value: unpaidCount.value, sub: `${unpaidText.value}${d.value.overdue_invoices ? ` · ${t("adminHome.overdue", { n: d.value.overdue_invoices })}` : ""}`, to: { name: "super-admin-invoice-list" }, alert: d.value.overdue_invoices > 0 },
] : []);

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/superadmin/overview", {}, "GET");
  d.value = res?.status ? res.data : null;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('adminHome.title')" :description="t('adminHome.description')" />

    <AzSkeleton v-if="loading" :lines="5" height="4rem" />
    <AzCard v-else-if="!d"><AzEmptyState :title="t('adminHome.failedTitle')" :description="t('adminHome.failedText')" /></AzCard>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <component :is="c.to ? 'RouterLink' : 'div'" v-for="c in cards" :key="c.key" :to="c.to"
          class="flex items-start gap-3 rounded-card border bg-surface p-5 shadow-card"
          :class="[c.alert ? 'border-warning/50' : 'border-line', c.to ? 'hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40' : '']">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" :class="c.alert ? 'bg-warning-soft text-warning' : 'bg-primary-soft text-primary-soft-ink'">
            <component :is="c.icon" class="h-5 w-5" aria-hidden="true" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm text-ink-muted">{{ t(`adminHome.card_${c.key}`) }}</span>
            <span class="block text-2xl font-semibold tabular-nums text-ink">{{ c.value }}</span>
            <span class="block truncate text-sm text-ink-muted">{{ c.sub }}</span>
          </span>
        </component>
      </div>

      <p v-if="d.pending_signups" class="flex items-center gap-2 text-sm text-ink-muted">
        <UserPlus class="h-4 w-4" aria-hidden="true" />{{ t('adminHome.pending', { n: d.pending_signups }, d.pending_signups) }}
      </p>

      <div class="grid gap-6 lg:grid-cols-2">
        <AzCard :title="t('adminHome.plans')">
          <p v-if="!d.plans.length" class="text-sm text-ink-muted">{{ t('adminHome.noPlans') }}</p>
          <ul v-else class="flex flex-col gap-3">
            <li v-for="p in d.plans" :key="p.name">
              <div class="flex justify-between text-sm"><span class="font-medium text-ink">{{ p.name }}</span><span class="tabular-nums text-ink-muted">{{ p.n }}</span></div>
              <div class="mt-1 h-2 rounded-full bg-surface-2"><div class="h-2 rounded-full bg-primary" :style="{ width: `${Math.round((p.n / planTotal) * 100)}%` }" /></div>
            </li>
          </ul>
          <template #footer>
            <AzButton variant="quiet" size="sm" :to="{ name: 'super-admin-subscription-list' }">{{ t('adminHome.seeSubscriptions') }}<ChevronRight class="h-4 w-4" aria-hidden="true" /></AzButton>
          </template>
        </AzCard>

        <AzCard :title="t('adminHome.newest')" :padded="false">
          <ul class="divide-y divide-line">
            <li v-for="o in d.recent_organisations" :key="o.id" class="flex items-center gap-3 px-5 py-3">
              <AzAvatar :name="o.org_name || o.email" size="sm" />
              <span class="min-w-0 flex-1">
                <span class="block truncate font-medium text-ink">{{ o.org_name || '—' }}</span>
                <span class="block truncate text-sm text-ink-muted">{{ o.email }}</span>
              </span>
              <span class="text-sm text-ink-muted">{{ shortDate(o.created_at, locale) }}</span>
            </li>
          </ul>
        </AzCard>
      </div>
    </template>
  </div>
</template>
