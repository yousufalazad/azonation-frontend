<script setup>
// Write or change a history record, recognition or success story (see contentTypes.js).
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import AttachmentPicker from "@/views/Org/Meeting/components/AttachmentPicker.vue";
import { CONTENT_TYPES } from "./contentTypes";

const props = defineProps({
  type: { type: String, required: true },
  recordId: { type: [String, Number], default: null }, // null = new
});
const cfg = computed(() => CONTENT_TYPES[props.type]);

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const tt = (key, args) => t(`content.${cfg.value.t}.${key}`, args);

const isEdit = computed(() => !!props.recordId);
const form = reactive({ title: "", body: "", date: "", privacy_setup_id: "", active: true });
const privacySetups = ref([]);
const existingImages = ref([]);
const existingDocuments = ref([]);
const newImages = ref([]);
const newDocuments = ref([]);
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const errors = reactive({});
const initial = ref("");
const dirty = computed(() => !!initial.value && !saved.value && (JSON.stringify(form) !== initial.value || newImages.value.length || newDocuments.value.length));

const privacyOptions = computed(() => privacySetups.value.map((p) => ({ value: p.id, label: p.name })));
const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));

async function load() {
  const [privacy, rec] = await Promise.all([
    auth.fetchProtectedApi("/api/privacy-setups", {}, "GET"),
    isEdit.value ? auth.fetchProtectedApi(`${cfg.value.api}/${props.recordId}`, {}, "GET") : null,
  ]);
  privacySetups.value = privacy?.status ? privacy.data : [];
  const preferred = privacySetups.value.find((p) => /private/i.test(p.name)) ?? privacySetups.value[0];
  form.privacy_setup_id = preferred?.id ?? "";
  if (isEdit.value) {
    if (!rec?.status) {
      toast.error(t("content.notFound"));
      router.replace({ name: cfg.value.routes.index });
      return;
    }
    const r = rec.data;
    Object.assign(form, {
      title: clean(r.title),
      body: clean(r[cfg.value.body]),
      date: cfg.value.date && r[cfg.value.date] ? String(r[cfg.value.date]).slice(0, 10) : "",
      privacy_setup_id: r.privacy_setup_id ?? form.privacy_setup_id,
      active: !(r[cfg.value.active] === 0 || r[cfg.value.active] === "0"),
    });
    existingImages.value = r.images || [];
    existingDocuments.value = r.documents || [];
  }
  initial.value = JSON.stringify(form);
}

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.title.trim()) errors.title = t("content.needTitle");
  if (cfg.value.date && cfg.value.dateRequired && !form.date) errors.date = t("content.needDate");
  if (Object.keys(errors).length) {
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  const fd = new FormData();
  fd.append("title", form.title.trim());
  fd.append(cfg.value.body, form.body || "");
  if (cfg.value.date) fd.append(cfg.value.date, form.date);
  fd.append("privacy_setup_id", form.privacy_setup_id ?? "");
  fd.append(cfg.value.active, form.active ? "1" : "0");
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `${cfg.value.api}/${props.recordId}` : cfg.value.api;
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      saved.value = true;
      toast.success(isEdit.value ? t("content.updated") : t("content.created"));
      router.push({ name: cfg.value.routes.view, params: { id: isEdit.value ? props.recordId : res.data.id } });
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("content.saveFailed"));
    }
  } catch {
    toast.error(t("content.saveFailed"));
  } finally {
    saving.value = false;
  }
}

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true;
  return confirm({ title: t("attendance.leaveTitle"), message: t("content.leaveText"), confirmText: t("attendance.leave"), danger: true });
});

const cancelTo = computed(() => (isEdit.value ? { name: cfg.value.routes.view, params: { id: props.recordId } } : { name: cfg.value.routes.index }));

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? tt('edit') : tt('add')" :description="isEdit ? '' : tt('intro')" :back="cancelTo" :back-label="tt('title')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else :id="`content-form-${type}`" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <div class="flex flex-col gap-5">
          <AzInput v-model="form.title" :label="t('content.titleLabel')" :placeholder="tt('titlePlaceholder')" :error="errors.title"
            required maxlength="255" autocomplete="off" />
          <AzInput v-if="cfg.date" v-model="form.date" type="date" :label="tt('dateLabel')" :error="errors.date" :required="cfg.dateRequired" />
          <AzRichText v-model="form.body" :label="tt('bodyLabel')" :help="tt('bodyHelp')" min-height="14rem" />
        </div>
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments"
        :existing-images="existingImages" :existing-documents="existingDocuments" />

      <AzCard :title="t('eventReport.sharing')">
        <div class="flex flex-col gap-5">
          <AzSelect v-model="form.privacy_setup_id" :label="t('content.privacy')" :options="privacyOptions" />
          <AzCheckbox v-model="form.active" :label="t('content.show')" :help="t('content.showHelp')" />
        </div>
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="cancelTo">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" :loading="saving">{{ t('common.save') }}</AzButton>
      </div>
    </form>
  </div>
</template>
