<script setup>
// Add or change an asset. When adding, you can also say who has it and its condition.
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { CurrencyService } from "@/helpers/currency";
import { useToast } from "@/composables/useToast";
import { Package, UserRound } from "lucide-vue-next";
import AttachmentPicker from "@/views/Org/Meeting/components/AttachmentPicker.vue";

const props = defineProps({
  assetId: { type: [String, Number], default: null }, // null = new asset
});

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const isEdit = computed(() => !!props.assetId);
const form = reactive({
  name: "",
  description: "",
  quantity: "1",
  value_amount: "",
  inkind_value: "",
  start_date: "",
  end_date: "",
  is_tangible: true,
  is_long_term: false,
  privacy_setup_id: "",
  is_active: true,
  // first holder (new assets only)
  responsible_user_id: "",
  asset_lifecycle_statuses_id: "",
  assignment_start_date: dayjs().format("YYYY-MM-DD"),
});
const members = ref([]);
const conditions = ref([]);
const privacySetups = ref([]);
const existingImages = ref([]);
const existingDocuments = ref([]);
const newImages = ref([]);
const newDocuments = ref([]);
const loading = ref(true);
const saving = ref(false);
const errors = reactive({});

const memberOptions = computed(() => [{ value: "", label: t("assets.withOrg") }, ...members.value]);
const conditionOptions = computed(() => conditions.value.map((c) => ({ value: c.id, label: c.name })));
const privacyOptions = computed(() => privacySetups.value.map((p) => ({ value: p.id, label: p.name })));
const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));
const num = (v) => (v === null || v === undefined || v === "" ? "" : String(Number(v)));

async function load() {
  const [privacy, cond, orgMembers, asset] = await Promise.all([
    auth.fetchProtectedApi("/api/privacy-setups", {}, "GET"),
    auth.fetchProtectedApi("/api/asset-lifecycle-setups", {}, "GET"),
    isEdit.value ? null : auth.fetchProtectedApi("/api/org-all-member-name", {}, "GET"),
    isEdit.value ? auth.fetchProtectedApi(`/api/assets/${props.assetId}`, {}, "GET") : null,
    CurrencyService.code ? null : CurrencyService.load(),
  ]);
  privacySetups.value = privacy?.status ? privacy.data : [];
  conditions.value = (cond?.status ? cond.data : []).filter((c) => !(c.is_active === 0 || c.is_active === "0"));
  members.value = (orgMembers?.status ? orgMembers.data : [])
    .filter((m) => m.individual)
    .map((m) => ({ value: m.individual.id, label: [m.individual.first_name, m.individual.last_name].filter(Boolean).join(" ") }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const preferred = privacySetups.value.find((p) => /private/i.test(p.name)) ?? privacySetups.value[0];
  form.privacy_setup_id = preferred?.id ?? "";

  if (isEdit.value) {
    if (!asset?.status) {
      toast.error(t("assets.notFound"));
      router.replace({ name: "index-asset" });
      return;
    }
    const a = asset.data;
    Object.assign(form, {
      name: clean(a.name),
      description: clean(a.description),
      quantity: num(a.quantity) || "1",
      value_amount: num(a.value_amount),
      inkind_value: num(a.inkind_value),
      start_date: a.start_date ? String(a.start_date).slice(0, 10) : "",
      end_date: a.end_date ? String(a.end_date).slice(0, 10) : "",
      is_tangible: Number(a.is_tangible) === 1,
      is_long_term: Number(a.is_long_term) === 1,
      privacy_setup_id: a.privacy_setup_id ?? form.privacy_setup_id,
      is_active: !(a.is_active === 0 || a.is_active === "0"),
    });
    existingImages.value = a.images || [];
    existingDocuments.value = a.documents || [];
  }
}

const isAmount = (v) => v === "" || Number(v) >= 0;

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.name.trim()) errors.name = t("assets.needName");
  if (!(Number(form.quantity) >= 1)) errors.quantity = t("assets.badQuantity");
  if (!isAmount(form.value_amount)) errors.value_amount = t("eventReport.wholeNumber");
  if (!isAmount(form.inkind_value)) errors.inkind_value = t("eventReport.wholeNumber");
  if (form.start_date && form.end_date && form.end_date < form.start_date) errors.end_date = t("committees.endBeforeStart");
  if (Object.keys(errors).length) {
    document.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  const fd = new FormData();
  const skip = isEdit.value ? ["responsible_user_id", "asset_lifecycle_statuses_id", "assignment_start_date"] : [];
  Object.entries(form).forEach(([k, v]) => {
    if (skip.includes(k)) return;
    if (typeof v === "boolean") fd.append(k, v ? "1" : "0");
    else fd.append(k, typeof v === "string" ? v.trim() : v ?? "");
  });
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/assets/${props.assetId}` : "/api/assets";
    const res = await auth.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      toast.success(isEdit.value ? t("assets.updated") : t("assets.created"));
      router.push({ name: "view-asset", params: { id: isEdit.value ? props.assetId : res.data.id } });
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("assets.saveFailed"));
    }
  } catch {
    toast.error(t("assets.saveFailed"));
  } finally {
    saving.value = false;
  }
}

const cancelTo = computed(() => (isEdit.value ? { name: "view-asset", params: { id: props.assetId } } : { name: "index-asset" }));
const moneyLabel = (key) => (CurrencyService.code ? `${t(key)} (${CurrencyService.code})` : t(key));

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="isEdit ? t('assets.edit') : t('assets.add')" :back="cancelTo" :back-label="t('assets.title')" />

    <AzSkeleton v-if="loading" :lines="8" height="2.75rem" />

    <form v-else id="asset-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><Package class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('assets.whatItIs') }}</h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <AzInput v-model="form.name" :label="t('assets.name')" :placeholder="t('assets.namePlaceholder')" :error="errors.name" required maxlength="100" autocomplete="off" />
          </div>
          <div class="sm:col-span-2">
            <AzTextarea v-model="form.description" :label="t('assets.description')" :help="t('assets.descriptionHelp')" rows="2" maxlength="255" />
          </div>
          <AzInput v-model="form.quantity" type="number" min="1" inputmode="numeric" :label="t('assets.quantity')" :error="errors.quantity" />
          <AzInput v-model="form.start_date" type="date" :label="t('assets.acquired')" />
          <AzInput v-model="form.value_amount" type="number" min="0" step="0.01" inputmode="decimal" :label="moneyLabel('assets.valueBought')"
            :help="t('assets.valueBoughtHelp')" :error="errors.value_amount" />
          <AzInput v-model="form.inkind_value" type="number" min="0" step="0.01" inputmode="decimal" :label="moneyLabel('assets.valueDonated')"
            :help="t('assets.valueDonatedHelp')" :error="errors.inkind_value" />
          <AzCheckbox v-model="form.is_tangible" :label="t('assets.physical')" :help="t('assets.physicalHelp')" />
          <AzCheckbox v-model="form.is_long_term" :label="t('assets.longTerm')" :help="t('assets.longTermHelp')" />
        </div>
      </AzCard>

      <AzCard v-if="!isEdit">
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><UserRound class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('assets.whoHasIt') }}</h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <AzSelect v-model="form.responsible_user_id" :label="t('assets.holder')" :options="memberOptions" />
          <AzSelect v-model="form.asset_lifecycle_statuses_id" :label="t('assets.condition')" :options="conditionOptions" :placeholder="t('meetingForm.choose')" />
          <AzInput v-model="form.assignment_start_date" type="date" :label="t('assets.since')" />
        </div>
      </AzCard>

      <AttachmentPicker v-model:images="newImages" v-model:documents="newDocuments"
        :existing-images="existingImages" :existing-documents="existingDocuments" />

      <AzCard :title="t('eventReport.sharing')">
        <div class="grid gap-5 sm:grid-cols-2">
          <AzSelect v-model="form.privacy_setup_id" :label="t('assets.privacy')" :options="privacyOptions" />
          <AzInput v-model="form.end_date" type="date" :label="t('assets.disposed')" :help="t('assets.disposedHelp')" :error="errors.end_date" />
          <div class="sm:col-span-2">
            <AzCheckbox v-model="form.is_active" :label="t('assets.active')" :help="t('assets.activeHelp')" />
          </div>
        </div>
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <AzButton variant="quiet" :to="cancelTo">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" :loading="saving">{{ isEdit ? t('common.save') : t('assets.add') }}</AzButton>
      </div>
    </form>
  </div>
</template>
