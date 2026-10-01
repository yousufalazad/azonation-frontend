<!-- Record that a member has paid for a renewal period. The period, end date and fee are filled in
     from the member's last payment, the renewal period and the fee list, and can be changed. -->
<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { iso, addDays, periodEnd, lastAnchorDate } from "../renewal";
import { shortDate } from "@/helpers/billing";

const props = defineProps({
  member: { type: Object, required: true },
  cycles: { type: Array, required: true },
  fees: { type: Array, required: true },
  currency: { type: String, default: "" },
});
const emit = defineEmits(["close", "saved"]);

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();

const saving = ref(false);
const tried = ref(false);
const serverError = ref("");

const lastCycle = props.cycles.find((c) => String(c.member_renewal_cycle_id) === String(props.member.last_cycle_id));
const form = reactive({
  cycleId: (lastCycle || props.cycles[0])?.id ?? "",
  period_start: "",
  period_end: "",
  amount_paid: "",
  renewed_at: iso(new Date()),
  org_notes: "",
});

const cycle = computed(() => props.cycles.find((c) => String(c.id) === String(form.cycleId)) || null);
const cycleOptions = computed(() => props.cycles.map((c) => ({ value: c.id, label: t("renewals.cycleLabel", { name: c.name, months: c.months }) })));
const fee = computed(() => props.fees.find((f) => String(f.org_cycle_id) === String(form.cycleId) && String(f.membership_type_id) === String(props.member.membership_type_id)) || null);

// Where the new period starts: the day after the last paid period, else the renewal date, else today
function suggestedStart() {
  if (props.member.paid_until) return addDays(props.member.paid_until, 1);
  const c = cycle.value;
  if (c && c.alignment !== "member_anniversary" && c.anchor_month && c.anchor_day) return lastAnchorDate(c.anchor_month, c.anchor_day);
  return iso(new Date());
}

function fillDefaults() {
  form.period_start = suggestedStart();
  form.period_end = cycle.value ? periodEnd(form.period_start, cycle.value.months) : form.period_start;
  form.amount_paid = fee.value ? String(fee.value.amount) : "";
}
fillDefaults();

watch(() => form.cycleId, () => {
  if (cycle.value && form.period_start) form.period_end = periodEnd(form.period_start, cycle.value.months);
  if (fee.value) form.amount_paid = String(fee.value.amount);
});
watch(() => form.period_start, (start) => {
  if (cycle.value && start) form.period_end = periodEnd(start, cycle.value.months);
});

const errors = computed(() => ({
  cycle: tried.value && !cycle.value ? t("renewals.chooseCycle") : "",
  start: tried.value && !form.period_start ? t("renewals.startRequired") : "",
  end: tried.value && (!form.period_end || form.period_end < form.period_start) ? t("renewals.endAfterStart") : "",
  amount: tried.value && (form.amount_paid === "" || Number(form.amount_paid) < 0 || Number.isNaN(Number(form.amount_paid))) ? t("renewals.amountRequired") : "",
}));

async function save() {
  tried.value = true;
  serverError.value = "";
  if (Object.values(errors.value).some(Boolean) || saving.value) return;
  saving.value = true;
  try {
    const res = await auth.fetchProtectedApi("/api/org-membership-renewals", {
      individual_type_user_id: props.member.user_id,
      membership_renewal_cycle_id: cycle.value.member_renewal_cycle_id,
      period_start: form.period_start,
      period_end: form.period_end,
      amount_paid: Number(form.amount_paid),
      renewed_at: form.renewed_at || null,
      org_notes: form.org_notes.trim() || null,
    }, "POST");
    if (res?.status) {
      toast.success(t("renewals.recorded", { name: props.member.name }));
      emit("saved");
    } else {
      serverError.value = res?.errors?.message || t("profilePage.saveFailed");
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal :open="true" :title="t('renewals.recordTitle', { name: member.name })" :description="member.paid_until ? t('renewals.paidUntilText', { date: shortDate(member.paid_until, locale) }) : t('renewals.noPaymentsYet')" @close="emit('close')">
    <form id="renewal-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <AzSelect v-model="form.cycleId" :label="t('renewals.period')" :options="cycleOptions" :error="errors.cycle" required />
      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.period_start" type="date" :label="t('renewals.from')" :error="errors.start" required />
        <AzInput v-model="form.period_end" type="date" :label="t('renewals.to')" :error="errors.end" required />
      </div>
      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.amount_paid" type="number" min="0" step="0.01" inputmode="decimal" :label="t('renewals.amount', { currency: fee?.currency || currency })"
          :help="fee ? t('renewals.feeHelp') : t('renewals.noFeeHelp')" :error="errors.amount" required />
        <AzInput v-model="form.renewed_at" type="date" :label="t('renewals.paidOn')" />
      </div>
      <AzInput v-model="form.org_notes" :label="t('meetingView.note')" :placeholder="t('renewals.notePlaceholder')" maxlength="255" autocomplete="off" />
      <p v-if="serverError" class="text-sm text-danger" role="alert">{{ serverError }}</p>
    </form>
    <template #footer>
      <AzButton variant="quiet" @click="emit('close')">{{ t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="renewal-form" :loading="saving">{{ t('renewals.record') }}</AzButton>
    </template>
  </AzModal>
</template>
