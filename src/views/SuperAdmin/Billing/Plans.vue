<!-- Plans: what each includes, its price per member per day in each region, and how many organisations use it -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { Pencil } from "lucide-vue-next";

const auth = authStore;
const { t, te } = useI18n();
const toast = useToast();

const LIMITS = ["max_member", "storage_limit", "meeting_limit", "event_limit", "project_limit", "asset_limit", "document_limit"];
const FEATURES = ["report", "advanced_report", "custom_report", "support", "priority_support", "premium_support", "custom_branding", "web_profile",
  "custom_domain", "custom_email_template", "custom_username", "multi_currency_payment", "api_access", "dedicated_account_manager",
  "is_storage_grace_period_allow", "is_billing_grace_period_allow"];

const loading = ref(true);
const plans = ref([]);
const regions = ref([]);
const priceInputs = reactive({}); // `${planId}-${regionId}` -> value
const savingPrice = ref("");

const on = (v) => v === 1 || v === "1" || v === true;
const label = (f) => (te(`subscriptionPage.limit_${f}`) ? t(`subscriptionPage.limit_${f}`) : te(`adminBilling.field_${f}`) ? t(`adminBilling.field_${f}`) : f.replace(/_/g, " "));
const priceOf = (plan, regionId) => plan.prices.find((p) => String(p.region_id) === String(regionId));

async function load() {
  const res = await auth.fetchProtectedApi("/api/superadmin/billing/plans", {}, "GET");
  plans.value = res?.status ? res.data.plans : [];
  regions.value = res?.status ? res.data.regions : [];
  plans.value.forEach((p) => regions.value.forEach((r) => (priceInputs[`${p.id}-${r.id}`] = priceOf(p, r.id)?.price_rate ?? "")));
}

async function savePrice(plan, region) {
  const k = `${plan.id}-${region.id}`;
  const v = priceInputs[k];
  if (v === "" || Number(v) < 0 || Number.isNaN(Number(v))) return toast.error(t("adminBilling.priceInvalid"));
  savingPrice.value = k;
  try {
    const res = await auth.fetchProtectedApi(`/api/superadmin/billing/plans/${plan.id}/price`, { region_id: region.id, price_rate: Number(v) }, "PUT");
    if (res?.status) {
      toast.success(t("adminBilling.priceSaved", { plan: plan.name, region: region.name }));
      await load();
    } else toast.error(res?.errors?.message || t("profilePage.saveFailed"));
  } finally {
    savingPrice.value = "";
  }
}

// ---- Edit a plan ----
const editing = ref(null);
const form = reactive({});
const saving = ref(false);
function openEdit(p) {
  Object.keys(form).forEach((k) => delete form[k]);
  Object.assign(form, { name: p.name, description: p.description || "" });
  LIMITS.forEach((f) => (form[f] = p[f] ?? ""));
  [...FEATURES, "is_active"].forEach((f) => (form[f] = on(p[f])));
  editing.value = p;
}
async function savePlan() {
  if (!String(form.name).trim()) return toast.error(t("lookups.required"));
  saving.value = true;
  try {
    const payload = { ...form, name: form.name.trim(), description: form.description.trim() || null };
    LIMITS.forEach((f) => (payload[f] = form[f] === "" ? null : Number(form[f])));
    const res = await auth.fetchProtectedApi(`/api/superadmin/billing/plans/${editing.value.id}`, payload, "PUT");
    if (res?.status) {
      toast.success(t("lookups.saved"));
      editing.value = null;
      await load();
    } else toast.error(res?.errors?.message || t("profilePage.saveFailed"));
  } finally {
    saving.value = false;
  }
}

const featureCount = (p) => FEATURES.filter((f) => on(p[f])).length;
const regionName = computed(() => (id) => regions.value.find((r) => r.id === id)?.name);

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('adminBilling.plansTitle')" :description="t('adminBilling.plansDescription')" />
    <AzSkeleton v-if="loading" :lines="4" height="6rem" />

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <AzCard v-for="p in plans" :key="p.id" :class="on(p.is_active) ? '' : 'opacity-70'">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-ink">{{ p.name }} <AzBadge v-if="!on(p.is_active)" tone="neutral">{{ t('lookups.off') }}</AzBadge></h2>
              <p class="text-sm text-ink-muted">{{ t('adminBilling.planUsage', { n: p.organisations, features: featureCount(p) }) }}</p>
            </div>
            <AzButton variant="quiet" size="sm" @click="openEdit(p)"><template #icon><Pencil class="h-4 w-4" /></template>{{ t('common.edit') }}</AzButton>
          </div>
        </template>

        <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <template v-for="f in LIMITS" :key="f">
            <dt class="text-ink-muted">{{ label(f) }}</dt><dd class="text-right tabular-nums text-ink">{{ p[f] ?? '—' }}</dd>
          </template>
        </dl>

        <div class="mt-4 border-t border-line pt-4">
          <p class="mb-2 text-sm font-semibold text-ink">{{ t('adminBilling.pricePerMemberDay') }}</p>
          <div v-for="r in regions" :key="r.id" class="flex items-end gap-2 py-1">
            <span class="w-16 pb-3 text-sm font-medium text-ink-2">{{ r.name }}</span>
            <div class="flex-1"><AzInput v-model="priceInputs[`${p.id}-${r.id}`]" type="number" min="0" step="0.0001" inputmode="decimal" :label="t('adminBilling.priceIn', { region: r.name })" /></div>
            <AzButton variant="secondary" size="sm" class="mb-1" :loading="savingPrice === `${p.id}-${r.id}`"
              :disabled="String(priceInputs[`${p.id}-${r.id}`]) === String(priceOf(p, r.id)?.price_rate ?? '')" @click="savePrice(p, r)">{{ t('common.save') }}</AzButton>
          </div>
        </div>
      </AzCard>
    </div>

    <AzModal v-if="editing" :open="true" :title="t('adminBilling.editPlan', { name: editing.name })" size="lg" @close="editing = null">
      <form id="plan-form" class="flex flex-col gap-5" novalidate @submit.prevent="savePlan">
        <AzInput v-model="form.name" :label="t('lookups.field_name')" maxlength="100" required />
        <AzTextarea v-model="form.description" :label="t('lookups.field_description')" :rows="2" />
        <fieldset>
          <legend class="mb-2 text-sm font-semibold text-ink">{{ t('adminBilling.limits') }}</legend>
          <div class="grid gap-4 sm:grid-cols-2">
            <AzInput v-for="f in LIMITS" :key="f" v-model="form[f]" type="number" min="0" :label="label(f)" :help="f === 'storage_limit' ? t('adminBilling.storageHelp') : ''" />
          </div>
        </fieldset>
        <fieldset>
          <legend class="mb-2 text-sm font-semibold text-ink">{{ t('adminBilling.features') }}</legend>
          <div class="grid gap-2 sm:grid-cols-2">
            <label v-for="f in [...FEATURES, 'is_active']" :key="f" class="flex cursor-pointer items-center gap-3 rounded-control border border-line px-3 py-2">
              <input v-model="form[f]" type="checkbox" class="h-4 w-4 accent-[rgb(var(--az-primary))]" />
              <span class="text-sm text-ink">{{ f === 'is_active' ? t('adminBilling.planOffered') : label(f) }}</span>
            </label>
          </div>
        </fieldset>
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="editing = null">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="plan-form" :loading="saving">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
