<!-- Add or change a renewal fee: how much one membership type pays for one renewal period.
     Amounts are typed normally (150.50) and stored in minor units (15050). -->
<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  fee: { type: Object, default: null }, // null = new
  types: { type: Array, required: true }, // organisation membership types
  cycles: { type: Array, required: true }, // organisation renewal periods
  currency: { type: String, default: "" },
});
const emit = defineEmits(["close", "saved"]);

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

const form = reactive({
  org_membership_type_id: props.fee?.org_membership_type_id ?? (props.types.length === 1 ? props.types[0].id : ""),
  org_mem_renewal_cycle_id: props.fee?.org_mem_renewal_cycle_id ?? (props.cycles.length === 1 ? props.cycles[0].id : ""),
  amount: props.fee ? String(props.fee.unit_amount_minor / 100) : "",
  currency: props.fee?.currency || props.currency || "",
  valid_from: props.fee?.valid_from ? String(props.fee.valid_from).slice(0, 10) : "",
  valid_to: props.fee?.valid_to ? String(props.fee.valid_to).slice(0, 10) : "",
  org_notes: props.fee?.org_notes || "",
});
const saving = ref(false);
const tried = ref(false);
const serverError = ref("");

const typeOptions = computed(() => props.types.map((x) => ({ value: x.id, label: x.membership_type?.name || `#${x.id}` })));
const cycleOptions = computed(() => props.cycles.map((c) => ({ value: c.id, label: c.member_renewal_cycle?.name || `#${c.id}` })));
const errors = computed(() => ({
  type: tried.value && !form.org_membership_type_id ? t("renewals.chooseType") : "",
  cycle: tried.value && !form.org_mem_renewal_cycle_id ? t("renewals.chooseCycle") : "",
  amount: tried.value && (form.amount === "" || Number.isNaN(Number(form.amount)) || Number(form.amount) < 0) ? t("renewals.amountRequired") : "",
  currency: tried.value && !/^[A-Za-z]{3}$/.test(form.currency.trim()) ? t("renewals.currencyInvalid") : "",
  to: tried.value && form.valid_from && form.valid_to && form.valid_to < form.valid_from ? t("renewals.endAfterStart") : "",
}));

async function save() {
  tried.value = true;
  serverError.value = "";
  if (Object.values(errors.value).some(Boolean) || saving.value) return;
  saving.value = true;
  try {
    const payload = {
      org_membership_type_id: Number(form.org_membership_type_id),
      org_mem_renewal_cycle_id: Number(form.org_mem_renewal_cycle_id),
      unit_amount_minor: Math.round(Number(form.amount) * 100),
      currency: form.currency.trim().toUpperCase(),
      valid_from: form.valid_from || null,
      valid_to: form.valid_to || null,
      org_notes: form.org_notes.trim() || null,
      is_active: true,
    };
    const res = props.fee
      ? await auth.fetchProtectedApi(`/api/org-membership-renewal-prices/${props.fee.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/org-membership-renewal-prices", payload, "POST");
    if (res?.status) {
      toast.success(t("renewals.feeSaved"));
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
  <AzModal :open="true" :title="fee ? t('renewals.editFee') : t('renewals.addFee')" @close="emit('close')">
    <form id="fee-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <div class="grid gap-5 sm:grid-cols-2">
        <AzSelect v-model="form.org_membership_type_id" :label="t('renewals.type')" :options="typeOptions" :placeholder="t('meetingForm.choose')" :error="errors.type" required />
        <AzSelect v-model="form.org_mem_renewal_cycle_id" :label="t('renewals.period')" :options="cycleOptions" :placeholder="t('meetingForm.choose')" :error="errors.cycle" required />
      </div>
      <div class="grid gap-5 sm:grid-cols-[2fr_1fr]">
        <AzInput v-model="form.amount" type="number" min="0" step="0.01" inputmode="decimal" :label="t('renewals.fee')" :error="errors.amount" required />
        <AzInput v-model="form.currency" :label="t('renewals.currency')" maxlength="3" autocomplete="off" :error="errors.currency" required />
      </div>
      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.valid_from" type="date" :label="t('renewals.validFrom')" :help="t('renewals.validHelp')" />
        <AzInput v-model="form.valid_to" type="date" :label="t('renewals.validTo')" :error="errors.to" />
      </div>
      <AzInput v-model="form.org_notes" :label="t('meetingView.note')" maxlength="255" autocomplete="off" />
      <p v-if="serverError" class="text-sm text-danger" role="alert">{{ serverError }}</p>
    </form>
    <template #footer>
      <AzButton variant="quiet" @click="emit('close')">{{ t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="fee-form" :loading="saving">{{ t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
