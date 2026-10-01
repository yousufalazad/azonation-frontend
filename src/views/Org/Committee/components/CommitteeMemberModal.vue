<script setup>
// Add someone to a committee, or change their role or dates.
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";

const open = defineModel("open", { type: Boolean, default: false });
const props = defineProps({
  committee: { type: Object, required: true },
  record: { type: Object, default: null }, // null = add
  members: { type: Array, default: () => [] }, // org members: [{ id, name, membership }]
  designations: { type: Array, default: () => [] },
  takenUserIds: { type: Array, default: () => [] }, // already serving (hidden when adding)
});
const emit = defineEmits(["saved"]);

const { t } = useI18n();
const toast = useToast();

const blank = () => ({ user_id: "", designation_id: "", start_date: "", end_date: "", note: "", is_active: true });
const form = reactive(blank());
const errors = reactive({});
const saving = ref(false);
const isEdit = computed(() => !!props.record?.id);

const memberOptions = computed(() => props.members
  .filter((m) => isEdit.value || !props.takenUserIds.map(String).includes(String(m.id)))
  .map((m) => ({ value: m.id, label: m.membership ? `${m.name} (${m.membership})` : m.name })));
const designationOptions = computed(() => props.designations.map((d) => ({ value: d.id, label: d.name })));

watch(open, (isOpen) => {
  if (!isOpen) return;
  const r = props.record;
  Object.keys(errors).forEach((k) => delete errors[k]);
  Object.assign(form, blank(), r ? {
    user_id: r.user_id,
    designation_id: r.designation_id,
    start_date: r.start_date ? String(r.start_date).slice(0, 10) : "",
    end_date: r.end_date ? String(r.end_date).slice(0, 10) : "",
    note: r.note ?? "",
    is_active: !(r.is_active === 0 || r.is_active === "0" || r.is_active === false),
  } : {
    // New people usually serve for the committee's whole term
    start_date: props.committee.start_date ? String(props.committee.start_date).slice(0, 10) : "",
    end_date: props.committee.end_date ? String(props.committee.end_date).slice(0, 10) : "",
  });
});

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.user_id) errors.user_id = t("committees.needMember");
  if (!form.designation_id) errors.designation_id = t("committees.needRole");
  if (form.start_date && form.end_date && form.end_date < form.start_date) errors.end_date = t("committees.endBeforeStart");
  if (Object.keys(errors).length || saving.value) return;

  saving.value = true;
  try {
    const payload = {
      committee_id: props.committee.id,
      user_id: form.user_id,
      designation_id: form.designation_id,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      note: form.note.trim() || null,
      is_active: form.is_active,
    };
    const res = isEdit.value
      ? await authStore.fetchProtectedApi(`/api/committee-members/${props.record.id}`, payload, "PUT")
      : await authStore.fetchProtectedApi("/api/committee-members", payload, "POST");
    if (res?.status) {
      toast.success(isEdit.value ? t("committees.memberUpdated") : t("committees.memberAdded"));
      open.value = false;
      emit("saved");
    } else {
      toast.error(res?.message && res.message.length < 160 ? res.message : t("committees.memberSaveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal v-model:open="open" :title="isEdit ? t('committees.editMember') : t('committees.addMember')">
    <form id="committee-member-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <AzSelect v-model="form.user_id" :label="t('committees.member')" :options="memberOptions" :placeholder="t('meetingForm.choose')"
        :error="errors.user_id" :help="!isEdit && !memberOptions.length ? t('committees.everyoneServing') : ''" required />
      <AzSelect v-model="form.designation_id" :label="t('committees.role')" :options="designationOptions" :placeholder="t('meetingForm.choose')"
        :error="errors.designation_id" required />
      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.start_date" type="date" :label="t('committees.from')" />
        <AzInput v-model="form.end_date" type="date" :label="t('committees.to')" :error="errors.end_date" />
      </div>
      <AzInput v-model="form.note" :label="t('meetingView.note')" maxlength="255" autocomplete="off" />
      <AzCheckbox v-model="form.is_active" :label="t('committees.memberActive')" :help="t('committees.memberActiveHelp')" />
    </form>
    <template #footer>
      <AzButton variant="quiet" @click="open = false">{{ t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="committee-member-form" :loading="saving">{{ t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
