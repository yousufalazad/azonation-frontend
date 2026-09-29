<script setup>
// Add or edit a committee: name, period, description, note.
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";

const open = defineModel("open", { type: Boolean, default: false });
const props = defineProps({
  committee: { type: Object, default: null }, // null = add
});
const emit = defineEmits(["saved"]);

const { t } = useI18n();
const toast = useToast();

const blank = () => ({ name: "", start_date: "", end_date: "", short_description: "", note: "", is_active: true });
const form = reactive(blank());
const errors = reactive({});
const saving = ref(false);
const isEdit = computed(() => !!props.committee?.id);

watch(open, (isOpen) => {
  if (!isOpen) return;
  const c = props.committee;
  Object.keys(errors).forEach((k) => delete errors[k]);
  Object.assign(form, blank(), c ? {
    name: c.name ?? "",
    start_date: c.start_date ? String(c.start_date).slice(0, 10) : "",
    end_date: c.end_date ? String(c.end_date).slice(0, 10) : "",
    short_description: c.short_description ?? "",
    note: c.note ?? "",
    is_active: !(c.is_active === 0 || c.is_active === "0" || c.is_active === false),
  } : {});
});

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.name.trim()) errors.name = t("committees.needName");
  if (form.start_date && form.end_date && form.end_date < form.start_date) errors.end_date = t("committees.endBeforeStart");
  if (Object.keys(errors).length || saving.value) return;

  saving.value = true;
  try {
    const payload = {
      ...form,
      name: form.name.trim(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      note: form.note.trim() || null,
      short_description: form.short_description || null,
    };
    const res = isEdit.value
      ? await authStore.fetchProtectedApi(`/api/committees/${props.committee.id}`, payload, "PUT")
      : await authStore.fetchProtectedApi("/api/committees", payload, "POST");
    if (res?.status) {
      toast.success(isEdit.value ? t("committees.updated") : t("committees.created"));
      open.value = false;
      emit("saved", res.data);
    } else {
      toast.error(res?.message && res.message.length < 160 ? res.message : t("committees.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal v-model:open="open" :title="isEdit ? t('committees.edit') : t('committees.add')" size="lg">
    <form id="committee-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <AzInput v-model="form.name" :label="t('committees.name')" :placeholder="t('committees.namePlaceholder')" :error="errors.name"
        required maxlength="255" autocomplete="off" />
      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.start_date" type="date" :label="t('committees.startDate')" />
        <AzInput v-model="form.end_date" type="date" :label="t('committees.endDate')" :help="t('committees.endDateHelp')" :error="errors.end_date" />
      </div>
      <AzRichText v-if="open" v-model="form.short_description" :label="t('committees.about')" :help="t('committees.aboutHelp')" min-height="8rem" />
      <AzTextarea v-model="form.note" :label="t('meetingView.note')" :help="t('meetingForm.noteHelp')" rows="2" />
      <AzCheckbox v-model="form.is_active" :label="t('committees.active')" :help="t('committees.activeHelp')" />
    </form>
    <template #footer>
      <AzButton variant="quiet" @click="open = false">{{ t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="committee-form" :loading="saving">{{ t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
