<script setup>
// Add or change a document entry: a title, a date and one or more files.
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import AttachmentPicker from "@/views/Org/Meeting/components/AttachmentPicker.vue";

const props = defineProps({
  documentId: { type: [String, Number], default: null }, // null = new document
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const isEdit = computed(() => !!props.documentId);
const form = reactive({ title: "", date: "", description: "", privacy_setup_id: "", is_active: true });
const privacySetups = ref([]);
const existingImages = ref([]);
const existingDocuments = ref([]);
const newImages = ref([]);
const newDocuments = ref([]);
const loading = ref(true);
const saving = ref(false);
const errors = reactive({});

const privacyOptions = computed(() => privacySetups.value.map((p) => ({ value: p.id, label: p.name })));
const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));
const DOCUMENT_TYPES = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

async function load() {
  const [privacy, doc] = await Promise.all([
    auth.fetchProtectedApi("/api/privacy-setups", {}, "GET"),
    isEdit.value ? auth.fetchProtectedApi(`/api/office-documents/${props.documentId}`, {}, "GET") : null,
  ]);
  privacySetups.value = privacy?.status ? privacy.data : [];
  const preferred = privacySetups.value.find((p) => /private/i.test(p.name)) ?? privacySetups.value[0];
  form.privacy_setup_id = preferred?.id ?? "";
  if (isEdit.value) {
    if (!doc?.status) {
      toast.error(t("documents.notFound"));
      router.replace({ name: "index-document" });
      return;
    }
    const d = doc.data;
    Object.assign(form, {
      title: clean(d.title),
      date: d.date ? String(d.date).slice(0, 10) : "",
      description: clean(d.description),
      privacy_setup_id: d.privacy_setup_id ?? form.privacy_setup_id,
      is_active: !(d.is_active === 0 || d.is_active === "0"),
    });
    existingImages.value = d.images || [];
    existingDocuments.value = d.documents || [];
  }
}

// Remove a file that is already saved (right away, after asking)
async function removeExisting(kind, file) {
  const ok = await confirm({
    title: t("documents.removeFileTitle", { name: file.file_name || "" }),
    message: t("documents.removeFileText"),
    confirmText: t("documents.removeFile"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/office-documents/${props.documentId}/files/${file.id}?kind=${kind}`, {}, "DELETE");
  if (res?.status) {
    if (kind === "image") existingImages.value = existingImages.value.filter((f) => f.id !== file.id);
    else existingDocuments.value = existingDocuments.value.filter((f) => f.id !== file.id);
    toast.success(t("documents.fileRemoved"));
  } else {
    toast.error(t("documents.saveFailed"));
  }
}

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.title.trim()) errors.title = t("documents.needTitle");
  if (!isEdit.value && !newImages.value.length && !newDocuments.value.length) errors.files = t("documents.needFile");
  if (Object.keys(errors).length) {
    if (errors.files) toast.error(errors.files);
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  const fd = new FormData();
  fd.append("title", form.title.trim());
  fd.append("date", form.date);
  fd.append("description", form.description.trim());
  fd.append("privacy_setup_id", form.privacy_setup_id ?? "");
  fd.append("is_active", form.is_active ? "1" : "0");
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/office-documents/${props.documentId}` : "/api/office-documents";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      toast.success(isEdit.value ? t("documents.updated") : t("documents.created"));
      router.push({ name: "view-document", params: { id: isEdit.value ? props.documentId : res.data.id } });
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("documents.saveFailed"));
    }
  } catch {
    toast.error(t("documents.saveFailed"));
  } finally {
    saving.value = false;
  }
}

const cancelTo = computed(() => (isEdit.value ? { name: "view-document", params: { id: props.documentId } } : { name: "index-document" }));

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? t('documents.edit') : t('documents.add')" :description="isEdit ? '' : t('documents.intro')"
      :back="cancelTo" :back-label="t('documents.title')" />

    <AzSkeleton v-if="loading" :lines="6" height="2.75rem" />

    <form v-else id="document-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <div class="grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <AzInput v-model="form.title" :label="t('documents.name')" :placeholder="t('documents.namePlaceholder')" :error="errors.title"
              required maxlength="255" autocomplete="off" />
          </div>
          <AzInput v-model="form.date" type="date" :label="t('documents.date')" :help="t('documents.dateHelp')" />
          <AzSelect v-model="form.privacy_setup_id" :label="t('documents.privacy')" :options="privacyOptions" />
          <div class="sm:col-span-2">
            <AzTextarea v-model="form.description" :label="t('assets.description')" :help="t('events.maxChars', { n: 255 })" rows="2" maxlength="255" />
          </div>
        </div>
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments" :existing-images="existingImages"
        :existing-documents="existingDocuments" :removable="isEdit" :document-accept="DOCUMENT_TYPES"
        :documents-help="t('documents.typesHelp')" @remove-existing="removeExisting" />

      <AzCard>
        <AzCheckbox v-model="form.is_active" :label="t('documents.active')" :help="t('documents.activeHelp')" />
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="cancelTo">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" :loading="saving">{{ isEdit ? t('common.save') : t('documents.add') }}</AzButton>
      </div>
    </form>
  </div>
</template>
