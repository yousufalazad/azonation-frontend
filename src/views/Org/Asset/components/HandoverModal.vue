<script setup>
// Give an asset to someone (or back to the organisation) and/or note its condition.
// The previous holder's record is closed and kept in the history.
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";

const open = defineModel("open", { type: Boolean, default: false });
const props = defineProps({
  asset: { type: Object, required: true },
  members: { type: Array, default: () => [] }, // [{ value, label }]
  conditions: { type: Array, default: () => [] }, // [{ id, name }]
});
const emit = defineEmits(["saved"]);
const { t } = useI18n();
const toast = useToast();

const form = reactive({ responsible_user_id: "", asset_lifecycle_statuses_id: "", assignment_start_date: "", note: "" });
const saving = ref(false);

const memberOptions = computed(() => [{ value: "", label: t("assets.withOrg") }, ...props.members]);
const conditionOptions = computed(() => props.conditions.map((c) => ({ value: c.id, label: c.name })));

watch(open, (isOpen) => {
  if (!isOpen) return;
  const cur = props.asset.current;
  Object.assign(form, {
    responsible_user_id: "",
    // Condition usually stays the same unless something happened
    asset_lifecycle_statuses_id: cur?.asset_lifecycle_statuses_id ?? "",
    assignment_start_date: dayjs().format("YYYY-MM-DD"),
    note: "",
  });
});

async function save() {
  if (saving.value) return;
  saving.value = true;
  try {
    const res = await authStore.fetchProtectedApi(`/api/assets/${props.asset.id}/handover`, {
      responsible_user_id: form.responsible_user_id || null,
      asset_lifecycle_statuses_id: form.asset_lifecycle_statuses_id || null,
      assignment_start_date: form.assignment_start_date || null,
      note: form.note.trim() || null,
    }, "POST");
    if (res?.status) {
      toast.success(t("assets.handoverSaved"));
      open.value = false;
      emit("saved");
    } else {
      toast.error(res?.message && res.message.length < 160 ? res.message : t("assets.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal v-model:open="open" :title="t('assets.handoverTitle', { name: asset.name })" :description="t('assets.handoverHelp')">
    <form id="handover-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <AzSelect v-model="form.responsible_user_id" :label="t('assets.newHolder')" :options="memberOptions" />
      <div class="grid gap-5 sm:grid-cols-2">
        <AzSelect v-model="form.asset_lifecycle_statuses_id" :label="t('assets.condition')" :options="conditionOptions" :placeholder="t('meetingForm.choose')" />
        <AzInput v-model="form.assignment_start_date" type="date" :label="t('assets.handoverDate')" />
      </div>
      <AzInput v-model="form.note" :label="t('meetingView.note')" :placeholder="t('assets.notePlaceholder')" maxlength="255" autocomplete="off" />
    </form>
    <template #footer>
      <AzButton variant="quiet" @click="open = false">{{ t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="handover-form" :loading="saving">{{ t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
