<!-- Pricing: the real plans and prices from the server. Prices depend on the country;
     an estimator shows the monthly cost for a number of members. -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import PublicPage from "@/components/public/PublicPage.vue";
import FaqGroups from "@/components/public/FaqGroups.vue";
import { Check, Minus } from "lucide-vue-next";

const { t, locale } = useI18n();

const DAYS_IN_MONTH = 30;
const LIMITS = ["meeting_limit", "event_limit", "project_limit", "asset_limit", "document_limit", "storage_limit"];
const EXTRAS = ["advanced_report", "premium_support", "custom_email_template", "custom_username", "custom_branding", "custom_domain", "web_profile", "api_access", "dedicated_account_manager"];

const countries = ref([]);
const countryId = ref("");
const data = ref(null);
const loading = ref(true);
const failed = ref(false);
const members = ref(25);

const countryOptions = computed(() => countries.value.map((c) => ({ value: c.id, label: c.name })));
const plans = computed(() => data.value?.plans || []);
const currency = computed(() => data.value?.currency);
const hasPrices = computed(() => !!currency.value && plans.value.some((p) => p.price_rate !== null));
// Only the extras at least one plan has are worth listing
const extras = computed(() => EXTRAS.filter((f) => plans.value.some((p) => Number(p.features[f]))));

const numberLocale = computed(() => (locale.value === "bn" ? "bn-BD" : "en-GB"));
const num = (n, digits = 0) => Number(n).toLocaleString(numberLocale.value, { minimumFractionDigits: digits, maximumFractionDigits: Math.max(digits, 2) });
const price = (n, digits = 2) => `${currency.value?.symbol || currency.value?.code || ""} ${num(n, digits)}`.trim();
const storage = (mb) => (mb >= 1024 ? t("pricingPage.gb", { n: num(Math.round((mb / 1024) * 10) / 10) }) : t("pricingPage.mb", { n: num(mb) }));
const limitText = (key, value) => (key === "storage_limit" ? storage(value) : t(`pricingPage.limit_${key}`, { n: num(value) }));

const memberCount = computed(() => Math.max(0, Math.min(100000, Math.floor(Number(members.value) || 0))));
const monthly = (plan) => plan.price_rate * memberCount.value * DAYS_IN_MONTH;
const fits = (plan) => memberCount.value <= Number(plan.features.max_member || 0);

async function loadPlans() {
  loading.value = true;
  failed.value = false;
  const res = await authStore.fetchPublicApi("/api/public/plans", countryId.value ? { country_id: countryId.value } : {}, "GET");
  loading.value = false;
  if (res?.status !== true) {
    failed.value = true;
    return;
  }
  data.value = res.data;
  if (!countryId.value && res.data.country_id) countryId.value = res.data.country_id;
}

watch(countryId, (v, old) => {
  if (old !== "" && v !== data.value?.country_id) loadPlans();
});

onMounted(async () => {
  const [countryRes] = await Promise.all([authStore.fetchPublicApi("/api/countries", {}, "GET"), loadPlans()]);
  countries.value = Array.isArray(countryRes?.data) ? countryRes.data : [];
});
</script>

<template>
  <PublicPage :title="t('pricingPage.title')" :description="t('pricingPage.intro')">
    <div class="mb-8 grid gap-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-2 sm:p-6">
      <AzSelect v-model="countryId" :label="t('pricingPage.country')" :options="countryOptions" :help="currency ? t('pricingPage.currency', { code: currency.code }) : ''" />
      <AzInput v-model="members" type="number" min="0" max="100000" inputmode="numeric" :label="t('pricingPage.members')" :help="t('pricingPage.membersHelp')" />
    </div>

    <div v-if="loading && !data" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AzSkeleton v-for="i in 4" :key="i" class="h-96 rounded-card" />
    </div>
    <AzEmptyState v-else-if="failed" :title="t('pricingPage.failedTitle')" :description="t('authPages.genericError')">
      <AzButton variant="secondary" @click="loadPlans">{{ t('pricingPage.retry') }}</AzButton>
    </AzEmptyState>
    <template v-else>
      <p v-if="!hasPrices" class="mb-6 rounded-card bg-warning-soft p-4 text-[15px] text-ink" role="status">
        {{ t('pricingPage.noPrices') }}
        <RouterLink :to="{ name: 'contact-us' }" class="font-medium text-primary hover:underline">{{ t('pricingPage.askUs') }}</RouterLink>
      </p>

      <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-4" :aria-busy="loading">
        <li v-for="plan in plans" :key="plan.id" class="flex flex-col rounded-card border bg-surface p-6 shadow-card"
          :class="hasPrices && fits(plan) && memberCount ? 'border-line' : 'border-line opacity-90'">
          <h2 class="text-lg font-semibold text-ink">{{ plan.name }}</h2>
          <p class="mt-1 text-sm text-ink-muted">{{ t('pricingPage.upTo', { n: num(plan.features.max_member) }) }}</p>

          <div class="mt-4 min-h-[5.5rem]">
            <template v-if="plan.price_rate !== null && currency">
              <p class="text-3xl font-bold text-ink">{{ price(plan.price_rate) }}</p>
              <p class="text-sm text-ink-2">{{ t('pricingPage.perMemberDay') }}</p>
              <p class="mt-1 text-sm text-ink-muted">{{ t('pricingPage.aboutMonth', { price: price(plan.price_rate * DAYS_IN_MONTH) }) }}</p>
            </template>
            <p v-else class="text-[15px] text-ink-2">{{ t('pricingPage.askPrice') }}</p>
          </div>

          <div v-if="plan.price_rate !== null && currency && memberCount" class="mt-3 rounded-control bg-surface-2 p-3 text-sm">
            <template v-if="fits(plan)">
              <span class="block text-ink-2">{{ t('pricingPage.estimate', { n: num(memberCount) }) }}</span>
              <strong class="text-lg text-ink">{{ price(monthly(plan)) }}</strong> <span class="text-ink-2">{{ t('pricingPage.perMonth') }}</span>
            </template>
            <span v-else class="text-ink-2">{{ t('pricingPage.tooMany', { n: num(plan.features.max_member) }) }}</span>
          </div>

          <ul class="mt-5 flex flex-1 flex-col gap-2 text-[15px] text-ink-2">
            <li v-for="key in LIMITS" :key="key" class="flex items-start gap-2">
              <Check class="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{{ limitText(key, plan.features[key]) }}
            </li>
            <li v-for="key in extras" :key="key" class="flex items-start gap-2" :class="Number(plan.features[key]) ? '' : 'text-ink-muted'">
              <Check v-if="Number(plan.features[key])" class="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              <Minus v-else class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{{ t(`pricingPage.extra_${key}`) }}<span v-if="!Number(plan.features[key])" class="sr-only"> — {{ t('pricingPage.notIncluded') }}</span></span>
            </li>
          </ul>

          <AzButton class="mt-6" block :variant="fits(plan) ? 'primary' : 'secondary'" :to="{ name: 'signup' }">{{ t('pricingPage.start') }}</AzButton>
        </li>
      </ul>
    </template>

    <div class="mx-auto mt-14 max-w-3xl">
      <h2 class="mb-4 text-2xl font-bold text-ink">{{ t('pricingPage.faqTitle') }}</h2>
      <FaqGroups source="pricingPage" />
    </div>
  </PublicPage>
</template>
