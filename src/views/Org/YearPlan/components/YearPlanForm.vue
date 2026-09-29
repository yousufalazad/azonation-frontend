<script setup>
// Write or change a year plan: goals, activities, budget and where it stands.
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import AttachmentPicker from "@/views/Org/Meeting/components/AttachmentPicker.vue";
import { Target, ListChecks, Wallet } from "lucide-vue-next";

const props = defineProps({
  planId: { type: [String, Number], default: null }, // null = new plan
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const isEdit = computed(() => !!props.planId);
const thisYear = dayjs().year();
const form = reactive({
  title: "",
  start_year: String(thisYear),
  end_year: String(thisYear),
  start_date: "",
  end_date: "",
  goals: "",
  activities: "",
  budget: "",
  status: "draft",
  privacy_setup_id: "",
  published: false,
});
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
const statusOptions = computed(() => ["draft", "approved", "completed", "archived"].map((s) => ({ value: s, label: t(`plans.status_${s}`) })));

async function load() {
  const [privacy, plan] = await Promise.all([
    auth.fetchProtectedApi("/api/privacy-setups", {}, "GET"),
    isEdit.value ? auth.fetchProtectedApi(`/api/year-plans/${props.planId}`, {}, "GET") : null,
    CurrencyService.code ? null : CurrencyService.load(),
  ]);
  privacySetups.value = privacy?.status ? privacy.data : [];
  const preferred = privacySetups.value.find((p) => /private/i.test(p.name)) ?? privacySetups.value[0];
  form.privacy_setup_id = preferred?.id ?? "";
  if (isEdit.value) {
    if (!plan?.status) {
      toast.error(t("plans.notFound"));
      router.replace({ name: "year-plan" });
      return;
    }
    const p = plan.data;
    Object.assign(form, {
      // Older plans were saved without a title
      title: p.title || t("plans.yearDefaultTitle", { years: [p.start_year, p.end_year].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join("–") }),
      start_year: p.start_year ? String(p.start_year) : "",
      end_year: p.end_year ? String(p.end_year) : "",
      start_date: p.start_date ? String(p.start_date).slice(0, 10) : "",
      end_date: p.end_date ? String(p.end_date).slice(0, 10) : "",
      goals: p.goals ?? "",
      activities: p.activities ?? "",
      budget: p.budget !== null && p.budget !== undefined ? String(Number(p.budget)) : "",
      status: p.status || "draft",
      privacy_setup_id: p.privacy_setup_id ?? form.privacy_setup_id,
      published: Number(p.published) === 1,
    });
    existingImages.value = p.images || [];
    existingDocuments.value = p.documents || [];
  } else {
    form.title = t("plans.yearDefaultTitle", { years: thisYear });
  }
  initial.value = JSON.stringify(form);
}

const isYear = (v) => v === "" || /^\d{4}$/.test(String(v));

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.title.trim()) errors.title = t("plans.needTitle");
  if (!isYear(form.start_year)) errors.start_year = t("plans.badYear");
  if (!isYear(form.end_year)) errors.end_year = t("plans.badYear");
  if (!errors.end_year && form.start_year && form.end_year && Number(form.end_year) < Number(form.start_year)) errors.end_year = t("plans.endYearBefore");
  if (form.start_date && form.end_date && form.end_date < form.start_date) errors.end_date = t("committees.endBeforeStart");
  if (form.budget !== "" && !(Number(form.budget) >= 0)) errors.budget = t("eventReport.wholeNumber");
  if (Object.keys(errors).length) {
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => {
    if (k === "published") fd.append(k, v ? "1" : "0");
    else fd.append(k, typeof v === "string" ? v.trim() : v ?? "");
  });
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/year-plans/${props.planId}` : "/api/year-plans";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      saved.value = true;
      toast.success(isEdit.value ? t("plans.updated") : t("plans.created"));
      router.push({ name: "view-year-plan", params: { id: isEdit.value ? props.planId : res.data.id } });
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

const cancelTo = computed(() => (isEdit.value ? { name: "view-year-plan", params: { id: props.planId } } : { name: "year-plan" }));

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? t('plans.editYear') : t('plans.addYear')" :description="isEdit ? '' : t('plans.yearIntro')"
      :back="cancelTo" :back-label="t('plans.yearTitle')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else id="year-plan-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <div class="grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <AzInput v-model="form.title" :label="t('plans.title')" :error="errors.title" required maxlength="200" autocomplete="off" />
          </div>
          <AzInput v-model="form.start_year" type="number" inputmode="numeric" min="1901" max="2155" :label="t('plans.startYear')" :error="errors.start_year" />
          <AzInput v-model="form.end_year" type="number" inputmode="numeric" min="1901" max="2155" :label="t('plans.endYear')" :error="errors.end_year" />
          <AzInput v-model="form.start_date" type="date" :label="t('plans.exactStart')" :help="t('plans.exactHelp')" />
          <AzInput v-model="form.end_date" type="date" :label="t('plans.exactEnd')" :error="errors.end_date" />
          <div class="sm:col-span-2">
            <AzSelect v-model="form.status" :label="t('plans.status')" :options="statusOptions" :help="t('plans.statusHelp')" />
          </div>
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><Target class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('plans.goals') }}</h2>
        </template>
        <AzRichText v-model="form.goals" :label="t('plans.goals')" :help="t('plans.goalsHelp')" min-height="10rem" />
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><ListChecks class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('plans.activities') }}</h2>
        </template>
        <AzRichText v-model="form.activities" :label="t('plans.activities')" :help="t('plans.activitiesHelp')" min-height="10rem" />
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><Wallet class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('plans.budget') }}</h2>
        </template>
        <AzInput v-model="form.budget" type="number" min="0" step="0.01" inputmode="decimal"
          :label="CurrencyService.code ? `${t('plans.budget')} (${CurrencyService.code})` : t('plans.budget')" :help="t('plans.budgetHelp')" :error="errors.budget" />
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments"
        :existing-images="existingImages" :existing-documents="existingDocuments" />

      <AzCard :title="t('eventReport.sharing')">
        <div class="flex flex-col gap-5">
          <AzSelect v-model="form.privacy_setup_id" :label="t('plans.privacy')" :options="privacyOptions" />
          <AzCheckbox v-model="form.published" :label="t('minutes.publish')" :help="t('plans.publishHelp')" />
        </div>
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="cancelTo">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" :loading="saving">{{ t('plans.save') }}</AzButton>
      </div>
    </form>
  </div>
</template>
