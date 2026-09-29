<script setup>
// Write or change a strategic plan (long-term goals and how to reach them).
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import AttachmentPicker from "@/views/Org/Meeting/components/AttachmentPicker.vue";

const props = defineProps({
  planId: { type: [String, Number], default: null }, // null = new plan
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const isEdit = computed(() => !!props.planId);
const form = reactive({ title: "", start_date: "", end_date: "", plan: "", privacy_setup_id: "", active: true });
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

async function load() {
  const [privacy, plan] = await Promise.all([
    auth.fetchProtectedApi("/api/privacy-setups", {}, "GET"),
    isEdit.value ? auth.fetchProtectedApi(`/api/strategic-plans/${props.planId}`, {}, "GET") : null,
  ]);
  privacySetups.value = privacy?.status ? privacy.data : [];
  const preferred = privacySetups.value.find((p) => /private/i.test(p.name)) ?? privacySetups.value[0];
  form.privacy_setup_id = preferred?.id ?? "";
  if (isEdit.value) {
    if (!plan?.status) {
      toast.error(t("plans.notFound"));
      router.replace({ name: "strategic-plan" });
      return;
    }
    const p = plan.data;
    Object.assign(form, {
      title: p.title ?? "",
      start_date: p.start_date ? String(p.start_date).slice(0, 10) : "",
      end_date: p.end_date ? String(p.end_date).slice(0, 10) : "",
      plan: p.plan ?? "",
      privacy_setup_id: p.privacy_setup_id ?? form.privacy_setup_id,
      active: !(p.status === 0 || p.status === "0" || p.status === false),
    });
    existingImages.value = p.images || [];
    existingDocuments.value = p.documents || [];
  }
  initial.value = JSON.stringify(form);
}

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.title.trim()) errors.title = t("plans.needTitle");
  if (form.start_date && form.end_date && form.end_date < form.start_date) errors.end_date = t("committees.endBeforeStart");
  if (Object.keys(errors).length) {
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  const fd = new FormData();
  fd.append("title", form.title.trim());
  fd.append("start_date", form.start_date);
  fd.append("end_date", form.end_date);
  fd.append("plan", form.plan || "");
  fd.append("privacy_setup_id", form.privacy_setup_id ?? "");
  fd.append("status", form.active ? "1" : "0");
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/strategic-plans/${props.planId}` : "/api/strategic-plans";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      saved.value = true;
      toast.success(isEdit.value ? t("plans.updated") : t("plans.created"));
      router.push({ name: "view-strategic-plan", params: { id: isEdit.value ? props.planId : res.data.id } });
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("plans.saveFailed"));
    }
  } catch {
    toast.error(t("plans.saveFailed"));
  } finally {
    saving.value = false;
  }
}

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true;
  return confirm({ title: t("attendance.leaveTitle"), message: t("plans.leaveText"), confirmText: t("attendance.leave"), danger: true });
});

const cancelTo = computed(() => (isEdit.value ? { name: "view-strategic-plan", params: { id: props.planId } } : { name: "strategic-plan" }));

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? t('plans.editStrategic') : t('plans.addStrategic')" :description="isEdit ? '' : t('plans.strategicIntro')"
      :back="cancelTo" :back-label="t('plans.strategicTitle')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else id="strategic-plan-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <div class="flex flex-col gap-5">
          <AzInput v-model="form.title" :label="t('plans.title')" :placeholder="t('plans.strategicTitlePlaceholder')" :error="errors.title"
            required maxlength="255" autocomplete="off" />
          <div class="grid gap-5 sm:grid-cols-2">
            <AzInput v-model="form.start_date" type="date" :label="t('plans.from')" />
            <AzInput v-model="form.end_date" type="date" :label="t('plans.to')" :error="errors.end_date" />
          </div>
          <AzRichText v-model="form.plan" :label="t('plans.thePlan')" :help="t('plans.thePlanHelp')" min-height="16rem" />
        </div>
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments"
        :existing-images="existingImages" :existing-documents="existingDocuments" />

      <AzCard :title="t('eventReport.sharing')">
        <div class="flex flex-col gap-5">
          <AzSelect v-model="form.privacy_setup_id" :label="t('plans.privacy')" :options="privacyOptions" />
          <AzCheckbox v-model="form.active" :label="t('plans.active')" :help="t('plans.activeHelp')" />
        </div>
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="cancelTo">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" :loading="saving">{{ t('plans.save') }}</AzButton>
      </div>
    </form>
  </div>
</template>
