<!-- Renewal settings: the renewal periods the organisation offers (and when they fall due),
     and the fee for each membership type and period -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { CurrencyService } from "@/helpers/currency";
import { money, shortDate } from "@/helpers/billing";
import { CalendarClock, Coins, Plus, MoreVertical, Pencil, Trash2 } from "lucide-vue-next";
import CycleFormModal from "./components/CycleFormModal.vue";
import FeeFormModal from "./components/FeeFormModal.vue";

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const cycles = ref([]);
const fees = ref([]);
const types = ref([]);
const platformCycles = ref([]);
const editingCycle = ref(undefined); // undefined = closed, null = new
const editingFee = ref(undefined);

const isOrg = computed(() => auth.user?.type === "organisation");
const can = (p) => isOrg.value || auth.hasPermission(p);

const monthName = (m) => new Date(2026, m - 1, 1).toLocaleDateString(locale.value === "bn" ? "bn-BD" : "en-GB", { month: "long" });
const whenText = (c) => (c.alignment === "member_anniversary" || !c.anchor_month
  ? t("renewals.align_member_anniversary")
  : t("renewals.everyYearOn", { day: c.anchor_day, month: monthName(c.anchor_month) }));
const typeName = (f) => f.org_membership_type?.membership_type?.name || "—";
const cycleName = (f) => f.org_membership_renewal_cycle?.member_renewal_cycle?.name || "—";
const validText = (f) => {
  if (!f.valid_from && !f.valid_to) return t("renewals.alwaysValid");
  return `${shortDate(f.valid_from, locale.value) || "…"} – ${shortDate(f.valid_to, locale.value) || "…"}`;
};
const expired = (f) => f.valid_to && String(f.valid_to).slice(0, 10) < new Date().toISOString().slice(0, 10);

async function load() {
  const [c, f, ty, pc] = await Promise.all([
    auth.fetchProtectedApi("/api/org-membership-renewal-cycles", {}, "GET"),
    auth.fetchProtectedApi("/api/org-membership-renewal-prices", {}, "GET"),
    auth.fetchProtectedApi("/api/org-membership-types", {}, "GET"),
    auth.fetchProtectedApi("/api/membership-renewal-cycles", {}, "GET"),
  ]);
  cycles.value = c?.status ? c.data || [] : [];
  fees.value = f?.status ? f.data || [] : [];
  types.value = ty?.status ? (ty.data || []).filter((x) => x.is_active !== false && x.is_active !== 0) : [];
  platformCycles.value = pc?.status ? (pc.data || []).filter((x) => Number(x.is_active) === 1) : [];
}

async function removeCycle(c) {
  const ok = await confirm({ title: t("renewals.removePeriodTitle"), message: t("renewals.removePeriodText", { name: c.member_renewal_cycle?.name }), confirmText: t("common.delete"), danger: true });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/org-membership-renewal-cycles/${c.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("renewals.removed"));
    await load();
  } else {
    toast.error(res?.errors?.message || t("profilePage.saveFailed"));
  }
}

async function removeFee(f) {
  const ok = await confirm({ title: t("renewals.removeFeeTitle"), message: t("renewals.removeFeeText", { type: typeName(f), period: cycleName(f) }), confirmText: t("common.delete"), danger: true });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/org-membership-renewal-prices/${f.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("renewals.removed"));
    await load();
  } else {
    toast.error(t("profilePage.saveFailed"));
  }
}

const cycleActions = (c) => [
  ...(can("org-membership-renewal-cycle.update") ? [{ label: t("common.edit"), icon: Pencil, onSelect: () => (editingCycle.value = c) }] : []),
  ...(can("org-membership-renewal-cycle.delete") ? [{ label: t("common.delete"), icon: Trash2, separatorBefore: true, onSelect: () => removeCycle(c) }] : []),
];
const feeActions = (f) => [
  ...(can("org-membership-renewal-price.update") ? [{ label: t("common.edit"), icon: Pencil, onSelect: () => (editingFee.value = f) }] : []),
  ...(can("org-membership-renewal-price.delete") ? [{ label: t("common.delete"), icon: Trash2, separatorBefore: true, onSelect: () => removeFee(f) }] : []),
];

async function saved() {
  editingCycle.value = undefined;
  editingFee.value = undefined;
  await load();
}

onMounted(async () => {
  await Promise.all([load(), CurrencyService.code ? null : CurrencyService.load()]);
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('renewals.settingsTitle')" :description="t('renewals.settingsDescription')" :back="{ name: 'org-membership-renewal' }" :back-label="t('renewals.title')" />

    <AzSkeleton v-if="loading" :lines="6" height="3rem" />

    <template v-else>
      <!-- Renewal periods -->
      <AzCard :padded="false">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><CalendarClock class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('renewals.periods') }}</h2>
            <AzButton v-if="can('org-membership-renewal-cycle.create') && cycles.length < platformCycles.length" variant="secondary" size="sm" @click="editingCycle = null">
              <template #icon><Plus class="h-4 w-4" /></template>
              {{ t('renewals.addPeriod') }}
            </AzButton>
          </div>
        </template>
        <AzEmptyState v-if="!cycles.length" :title="t('renewals.noPeriodsTitle')" :description="t('renewals.noPeriodsText')">
          <AzButton v-if="can('org-membership-renewal-cycle.create')" @click="editingCycle = null">{{ t('renewals.addPeriod') }}</AzButton>
        </AzEmptyState>
        <ul v-else class="divide-y divide-line">
          <li v-for="c in cycles" :key="c.id" class="flex items-center gap-3 px-5 py-4">
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-ink">{{ t('renewals.cycleLabel', { name: c.member_renewal_cycle?.name, months: Number(c.member_renewal_cycle?.duration_in_months) }) }}</p>
              <p class="text-sm text-ink-muted">
                {{ whenText(c) }}<template v-if="c.grace_days"> · {{ t('renewals.graceText', { n: c.grace_days }, c.grace_days) }}</template>
              </p>
            </div>
            <AzMenu v-if="cycleActions(c).length" :items="cycleActions(c)" variant="quiet" :aria-label="t('meetings.more', { name: c.member_renewal_cycle?.name })">
              <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
            </AzMenu>
          </li>
        </ul>
      </AzCard>

      <!-- Fees -->
      <AzCard :padded="false">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><Coins class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('renewals.fees') }}</h2>
            <AzButton v-if="can('org-membership-renewal-price.create') && cycles.length && types.length" variant="secondary" size="sm" @click="editingFee = null">
              <template #icon><Plus class="h-4 w-4" /></template>
              {{ t('renewals.addFee') }}
            </AzButton>
          </div>
        </template>
        <AzEmptyState v-if="!types.length" :title="t('renewals.noTypesTitle')" :description="t('renewals.noTypesText')">
          <AzButton variant="secondary" :to="{ name: 'org-membership-type' }">{{ t('renewals.goToTypes') }}</AzButton>
        </AzEmptyState>
        <AzEmptyState v-else-if="!fees.length" :title="t('renewals.noFeesTitle')" :description="cycles.length ? t('renewals.noFeesText') : t('renewals.addPeriodFirst')" />
        <ul v-else class="divide-y divide-line">
          <li v-for="f in fees" :key="f.id" class="flex items-center gap-3 px-5 py-4" :class="expired(f) ? 'opacity-60' : ''">
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-ink">{{ typeName(f) }} · {{ cycleName(f) }}</p>
              <p class="text-sm text-ink-muted">
                {{ validText(f) }}<template v-if="expired(f)"> · {{ t('renewals.expired') }}</template><template v-if="f.org_notes"> · {{ f.org_notes }}</template>
              </p>
            </div>
            <p class="font-semibold tabular-nums text-ink">{{ money(f.unit_amount_minor / 100, { code: f.currency }) }}</p>
            <AzMenu v-if="feeActions(f).length" :items="feeActions(f)" variant="quiet" :aria-label="t('meetings.more', { name: typeName(f) })">
              <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
            </AzMenu>
          </li>
        </ul>
      </AzCard>
    </template>

    <CycleFormModal v-if="editingCycle !== undefined" :cycle="editingCycle" :platform-cycles="platformCycles"
      :used-cycle-ids="cycles.map((c) => c.member_renewal_cycle_id)" @close="editingCycle = undefined" @saved="saved" />
    <FeeFormModal v-if="editingFee !== undefined" :fee="editingFee" :types="types" :cycles="cycles" :currency="CurrencyService.code"
      @close="editingFee = undefined" @saved="saved" />
  </div>
</template>
