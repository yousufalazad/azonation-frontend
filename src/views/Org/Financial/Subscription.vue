<!-- Your plan: what it includes, what it costs in your country, and switching to another plan -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { loadBillingCurrency, rate, money, shortDate } from "@/helpers/billing";
import { Check, Minus, Package, Users, Calculator } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const switching = ref(null);
const subscription = ref(null);
const packages = ref([]);
const prices = ref([]); // price per member per day for this organisation's region
const currency = ref({});
const members = ref(null); // members who count towards the bill today

const DAYS_IN_MONTH = 30;

const priceOf = (pkgId) => {
  const p = prices.value.find((x) => String(x.management_package_id) === String(pkgId));
  return p ? Number(p.price_rate) : null;
};
const current = computed(() => subscription.value?.management_package || null);
const currentPrice = computed(() => (current.value ? priceOf(current.value.id) : null));

// Storage is stored in MB
const storageText = (mb) => {
  const n = Number(mb || 0);
  if (!n) return "—";
  return n < 1024 ? t("subscriptionPage.mb", { n }) : t("subscriptionPage.gb", { n: Math.round((n / 1024) * 10) / 10 });
};

const LIMITS = [
  { key: "max_member", label: "limitMembers" },
  { key: "storage_limit", label: "limitStorage", format: storageText },
  { key: "meeting_limit", label: "limitMeetings" },
  { key: "event_limit", label: "limitEvents" },
  { key: "project_limit", label: "limitProjects" },
  { key: "asset_limit", label: "limitAssets" },
  { key: "document_limit", label: "limitDocuments" },
];
const FEATURES = ["report", "advanced_report", "custom_report", "premium_support", "priority_support", "custom_branding", "web_profile", "custom_domain", "dedicated_account_manager"];
const limitText = (pkg, l) => {
  const v = pkg[l.key];
  if (v === null || v === undefined || v === "") return t("subscriptionPage.unlimited");
  return l.format ? l.format(v) : Number(v).toLocaleString(locale.value === "bn" ? "bn-BD" : "en-US");
};
const on = (v) => v === 1 || v === "1" || v === true;

// A plan is too small when the organisation already has more members than it allows
const tooSmall = (pkg) => members.value !== null && pkg.max_member && members.value > Number(pkg.max_member);

async function load() {
  const [subs, pkgs, priceRes, cur, bill] = await Promise.all([
    auth.fetchProtectedApi("/api/management-subscriptions", {}, "GET"),
    auth.fetchProtectedApi("/api/management-packages", {}, "GET"),
    auth.fetchProtectedApi("/api/management-subscriptions/management-package-prices", {}, "GET"),
    loadBillingCurrency(),
    auth.fetchProtectedApi("/api/org-financial/current-month-bill-calculation", {}, "GET"),
  ]);
  subscription.value = subs?.status ? subs.data?.[0] || null : null;
  prices.value = priceRes?.package_prices || [];
  // Cheapest first
  packages.value = (pkgs?.managementPackages || []).slice().sort((a, b) => (priceOf(a.id) ?? 0) - (priceOf(b.id) ?? 0) || a.id - b.id);
  currency.value = cur;
  members.value = bill?.status && bill.billable_members !== undefined ? Number(bill.billable_members) : null;
}

async function switchTo(pkg) {
  if (!subscription.value || switching.value) return;
  const price = priceOf(pkg.id);
  const ok = await confirm({
    title: t("subscriptionPage.switchTitle", { name: pkg.name }),
    message: price !== null
      ? t("subscriptionPage.switchText", { price: rate(price, currency.value) })
      : t("subscriptionPage.switchTextNoPrice"),
    confirmText: t("subscriptionPage.switchConfirm"),
  });
  if (!ok) return;
  switching.value = pkg.id;
  try {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const res = await auth.fetchProtectedApi(`/api/management-subscriptions/${subscription.value.id}`, {
      user_id: subscription.value.user_id,
      management_package_id: pkg.id,
      start_date: iso,
      is_active: true,
    }, "PUT");
    if (res?.status) {
      toast.success(t("subscriptionPage.switched", { name: pkg.name }));
      // The new plan changes what this account may use, so refresh the session's access
      await auth.fetchUser();
      await load();
    } else {
      toast.error(t("subscriptionPage.switchFailed"));
    }
  } finally {
    switching.value = null;
  }
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('accountNav.subscription')" :description="t('subscriptionPage.description')" />

    <AzSkeleton v-if="loading" :lines="6" height="4rem" />

    <template v-else>
      <!-- Current plan -->
      <AzCard v-if="current">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-start gap-4">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-ink">
              <Package class="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p class="text-sm text-ink-muted">{{ t('subscriptionPage.yourPlan') }}</p>
              <h2 class="flex flex-wrap items-center gap-2 text-2xl font-semibold text-ink">
                {{ current.name }}
                <AzBadge :tone="subscription.subscription_status === 'active' ? 'success' : 'warning'">{{ t(`subscriptionPage.status_${subscription.subscription_status}`, subscription.subscription_status) }}</AzBadge>
              </h2>
              <p v-if="subscription.start_date" class="mt-1 text-sm text-ink-muted">{{ t('subscriptionPage.since', { date: shortDate(subscription.start_date, locale) }) }}</p>
            </div>
          </div>
          <div v-if="currentPrice !== null" class="sm:text-right">
            <p class="text-2xl font-semibold tabular-nums text-ink">{{ rate(currentPrice, currency) }}</p>
            <p class="text-sm text-ink-muted">{{ t('subscriptionPage.perMemberDay') }}</p>
          </div>
        </div>

        <div class="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
          <div class="flex items-center gap-3">
            <Users class="h-5 w-5 text-ink-muted" aria-hidden="true" />
            <div>
              <p class="text-sm text-ink-muted">{{ t('subscriptionPage.membersNow') }}</p>
              <p class="font-semibold tabular-nums text-ink">
                {{ members ?? '—' }}<span v-if="current.max_member" class="font-normal text-ink-muted"> / {{ current.max_member }}</span>
              </p>
            </div>
          </div>
          <div v-if="currentPrice !== null && members !== null">
            <p class="text-sm text-ink-muted">{{ t('subscriptionPage.costToday') }}</p>
            <p class="font-semibold tabular-nums text-ink">{{ money(currentPrice * members, currency) }}</p>
          </div>
          <div v-if="currentPrice !== null && members !== null">
            <p class="text-sm text-ink-muted">{{ t('subscriptionPage.costMonth') }}</p>
            <p class="font-semibold tabular-nums text-ink">{{ t('subscriptionPage.about', { amount: money(currentPrice * members * DAYS_IN_MONTH, currency) }) }}</p>
          </div>
        </div>
        <template #footer>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-ink-muted">{{ t('subscriptionPage.howBilled') }}</p>
            <AzButton variant="secondary" size="sm" :to="{ name: 'bill-calculation' }">
              <template #icon><Calculator class="h-4 w-4" /></template>
              {{ t('subscriptionPage.seeBill') }}
            </AzButton>
          </div>
        </template>
      </AzCard>

      <AzCard v-else>
        <AzEmptyState :title="t('subscriptionPage.noneTitle')" :description="t('subscriptionPage.noneText')">
          <AzButton variant="secondary" :to="{ name: 'support', query: { new: 'billing' } }">{{ t('orgSettings.contactSupport') }}</AzButton>
        </AzEmptyState>
      </AzCard>

      <!-- Compare plans -->
      <section v-if="packages.length" class="flex flex-col gap-4">
        <div>
          <h2 class="text-lg font-semibold text-ink">{{ t('subscriptionPage.compare') }}</h2>
          <p class="text-sm text-ink-muted">{{ t('subscriptionPage.compareHelp') }}</p>
        </div>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article v-for="pkg in packages" :key="pkg.id"
            class="flex flex-col rounded-card border bg-surface p-5"
            :class="current && current.id === pkg.id ? 'border-primary ring-1 ring-primary' : 'border-line'">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-lg font-semibold text-ink">{{ pkg.name }}</h3>
              <AzBadge v-if="current && current.id === pkg.id" tone="info" :dot="false">{{ t('subscriptionPage.current') }}</AzBadge>
            </div>
            <p v-if="pkg.description" class="mt-1 text-sm text-ink-muted">{{ pkg.description }}</p>
            <div class="mt-3">
              <template v-if="priceOf(pkg.id) !== null">
                <p class="text-2xl font-semibold tabular-nums text-ink">{{ rate(priceOf(pkg.id), currency) }}</p>
                <p class="text-sm text-ink-muted">{{ t('subscriptionPage.perMemberDay') }}</p>
                <p class="text-sm text-ink-muted">{{ t('subscriptionPage.perMemberMonth', { amount: money(priceOf(pkg.id) * DAYS_IN_MONTH, currency) }) }}</p>
              </template>
              <p v-else class="text-sm text-ink-muted">{{ t('subscriptionPage.noPrice') }}</p>
            </div>

            <ul class="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <li v-for="l in LIMITS" :key="l.key" class="flex justify-between gap-3">
                <span class="text-ink-muted">{{ t(`subscriptionPage.${l.label}`) }}</span>
                <span class="font-medium tabular-nums text-ink">{{ limitText(pkg, l) }}</span>
              </li>
            </ul>
            <ul class="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <li v-for="f in FEATURES" :key="f" class="flex items-center gap-2" :class="on(pkg[f]) ? 'text-ink' : 'text-ink-muted'">
                <Check v-if="on(pkg[f])" class="h-4 w-4 shrink-0 text-success" :aria-label="t('subscriptionPage.included')" />
                <Minus v-else class="h-4 w-4 shrink-0" :aria-label="t('subscriptionPage.notIncluded')" />
                <span :class="on(pkg[f]) ? '' : 'line-through decoration-line-strong'">{{ t(`subscriptionPage.feature_${f}`) }}</span>
              </li>
            </ul>

            <div class="mt-auto pt-5">
              <AzButton v-if="current && current.id === pkg.id" variant="quiet" block disabled>{{ t('subscriptionPage.yourPlan') }}</AzButton>
              <template v-else>
                <AzButton variant="secondary" block :disabled="!subscription || tooSmall(pkg) || (!!switching && switching !== pkg.id)" :loading="switching === pkg.id" @click="switchTo(pkg)">
                  {{ t('subscriptionPage.switch') }}
                </AzButton>
                <p v-if="tooSmall(pkg)" class="mt-2 text-xs text-ink-muted">{{ t('subscriptionPage.tooSmall', { members, max: pkg.max_member }) }}</p>
              </template>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>
