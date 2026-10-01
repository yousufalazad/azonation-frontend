<!-- Add or change a renewal period the organisation offers, and when it falls due -->
<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  cycle: { type: Object, default: null }, // null = new
  platformCycles: { type: Array, required: true },
  usedCycleIds: { type: Array, default: () => [] },
});
const emit = defineEmits(["close", "saved"]);

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();

const form = reactive({
  member_renewal_cycle_id: props.cycle?.member_renewal_cycle_id ?? "",
  alignment: props.cycle?.alignment === "member_anniversary" || !props.cycle ? "member_anniversary" : "calendar",
  anchor_month: props.cycle?.anchor_month ?? 1,
  anchor_day: props.cycle?.anchor_day ?? 1,
  grace_days: props.cycle?.grace_days ?? 0,
});
const saving = ref(false);
const tried = ref(false);
const serverError = ref("");

const periodOptions = computed(() => props.platformCycles
  .filter((c) => String(c.id) === String(props.cycle?.member_renewal_cycle_id) || !props.usedCycleIds.includes(c.id))
  .map((c) => ({ value: c.id, label: t("renewals.cycleLabel", { name: c.name, months: Number(c.duration_in_months) }) })));
const monthOptions = computed(() => Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2026, i, 1).toLocaleDateString(locale.value === "bn" ? "bn-BD" : "en-GB", { month: "long" }),
})));
const dayOptions = computed(() => {
  const last = new Date(2024, Number(form.anchor_month), 0).getDate(); // leap year, so 29 February is allowed
  return Array.from({ length: last }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
});
const errors = computed(() => ({
  period: tried.value && !form.member_renewal_cycle_id ? t("renewals.chooseCycle") : "",
  grace: tried.value && (Number(form.grace_days) < 0 || Number(form.grace_days) > 365) ? t("renewals.graceRange") : "",
}));

async function save() {
  tried.value = true;
  serverError.value = "";
  if (Object.values(errors.value).some(Boolean) || saving.value) return;
  saving.value = true;
  try {
    const payload = {
      member_renewal_cycle_id: Number(form.member_renewal_cycle_id),
      alignment: form.alignment,
      anchor_month: form.alignment === "calendar" ? Number(form.anchor_month) : null,
      anchor_day: form.alignment === "calendar" ? Math.min(Number(form.anchor_day), dayOptions.value.length) : null,
      grace_days: Number(form.grace_days) || 0,
      is_active: true,
    };
    const res = props.cycle
      ? await auth.fetchProtectedApi(`/api/org-membership-renewal-cycles/${props.cycle.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/org-membership-renewal-cycles", payload, "POST");
    if (res?.status) {
      toast.success(t("renewals.periodSaved"));
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
  <AzModal :open="true" :title="cycle ? t('renewals.editPeriod') : t('renewals.addPeriod')" @close="emit('close')">
    <form id="cycle-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <AzSelect v-model="form.member_renewal_cycle_id" :label="t('renewals.period')" :options="periodOptions" :placeholder="t('meetingForm.choose')" :error="errors.period" required />

      <fieldset class="flex flex-col gap-2">
        <legend class="mb-1 text-sm font-semibold text-ink">{{ t('renewals.whenLabel') }}</legend>
        <label v-for="opt in ['member_anniversary', 'calendar']" :key="opt"
          class="flex cursor-pointer items-start gap-3 rounded-control border p-3"
          :class="form.alignment === opt ? 'border-primary bg-primary-soft/40' : 'border-line'">
          <input v-model="form.alignment" type="radio" name="alignment" :value="opt" class="mt-1 h-4 w-4 accent-[rgb(var(--az-primary))]" />
          <span>
            <span class="block font-medium text-ink">{{ t(`renewals.align_${opt}`) }}</span>
            <span class="block text-sm text-ink-muted">{{ t(`renewals.align_${opt}_help`) }}</span>
          </span>
        </label>
      </fieldset>

      <div v-if="form.alignment === 'calendar'" class="grid gap-5 sm:grid-cols-2">
        <AzSelect v-model="form.anchor_month" :label="t('renewals.month')" :options="monthOptions" />
        <AzSelect v-model="form.anchor_day" :label="t('renewals.day')" :options="dayOptions" />
      </div>

      <AzInput v-model="form.grace_days" type="number" min="0" max="365" inputmode="numeric" :label="t('renewals.graceDays')" :help="t('renewals.graceHelp')" :error="errors.grace" />
      <p v-if="serverError" class="text-sm text-danger" role="alert">{{ serverError }}</p>
    </form>
    <template #footer>
      <AzButton variant="quiet" @click="emit('close')">{{ t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="cycle-form" :loading="saving">{{ t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
