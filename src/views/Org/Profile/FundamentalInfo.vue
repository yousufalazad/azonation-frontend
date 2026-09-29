<!-- About the organisation: who you are, what you do, mission, vision, focus and key dates.
     Shown to members and on the organisation's page. One form, saved together. -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Info, Users, Target, Compass, CalendarDays } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const orgId = computed(() => auth.currentOrgId || auth.user?.id);
const FIELDS = [
  "short_description", "detail_description", "who_we_are", "what_we_do", "how_we_do", "mission", "vision", "value",
  "areas_of_focus", "causes", "scope_of_work", "impact", "why_join_us", "foundation_date", "organising_date",
];
const form = reactive(Object.fromEntries(FIELDS.map((f) => [f, ""])));
const loading = ref(true);
const saving = ref(false);
const initial = ref("");
const dirty = computed(() => !!initial.value && JSON.stringify(form) !== initial.value);

const sections = computed(() => [
  { key: "about", icon: Info, fields: [
    { f: "short_description", input: true, max: 255 },
    { f: "detail_description", rows: 5 },
  ] },
  { key: "people", icon: Users, fields: [{ f: "who_we_are" }, { f: "what_we_do" }, { f: "how_we_do" }] },
  { key: "direction", icon: Compass, fields: [{ f: "mission" }, { f: "vision" }, { f: "value" }] },
  { key: "focus", icon: Target, fields: [{ f: "areas_of_focus" }, { f: "causes" }, { f: "scope_of_work" }, { f: "impact" }, { f: "why_join_us" }] },
]);

const clean = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));

async function load() {
  const res = await auth.fetchProtectedApi(`/api/org-profile-data/${orgId.value}`, {}, "GET");
  const d = res?.status ? res.data : {};
  FIELDS.forEach((f) => (form[f] = f.endsWith("_date") ? (d?.[f] ? String(d[f]).slice(0, 10) : "") : clean(d?.[f])));
  initial.value = JSON.stringify(form);
}

async function save() {
  if (saving.value) return;
  saving.value = true;
  try {
    const payload = Object.fromEntries(FIELDS.map((f) => [f, String(form[f] || "").trim() || null]));
    const res = await auth.fetchProtectedApi(`/api/org-profile-update/${orgId.value}`, payload, "PUT");
    if (res?.status) {
      toast.success(t("orgInfo.saved"));
      initial.value = JSON.stringify(form);
    } else {
      toast.error(t("profilePage.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true;
  return confirm({ title: t("attendance.leaveTitle"), message: t("content.leaveText"), confirmText: t("attendance.leave"), danger: true });
});

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="flex flex-col gap-6 pb-20">
    <AzPageHeader :title="t('accountNav.orgInfo')" :description="t('orgInfo.description')" />

    <AzSkeleton v-if="loading" :lines="8" height="4rem" />

    <form v-else id="org-info-form" class="flex flex-col gap-6" novalidate @submit.prevent="save">
      <AzCard v-for="s in sections" :key="s.key">
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><component :is="s.icon" class="h-5 w-5 text-primary" aria-hidden="true" />{{ t(`orgInfo.section_${s.key}`) }}</h2>
        </template>
        <div class="flex flex-col gap-5">
          <template v-for="fld in s.fields" :key="fld.f">
            <AzInput v-if="fld.input" v-model="form[fld.f]" :label="t(`orgInfo.${fld.f}`)" :help="t(`orgInfo.${fld.f}_help`)" :maxlength="fld.max" autocomplete="off" />
            <AzTextarea v-else v-model="form[fld.f]" :label="t(`orgInfo.${fld.f}`)" :help="t(`orgInfo.${fld.f}_help`)" :rows="fld.rows || 3" />
          </template>
        </div>
      </AzCard>

      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><CalendarDays class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('orgInfo.section_dates') }}</h2>
        </template>
        <div class="grid gap-5 sm:grid-cols-2">
          <AzInput v-model="form.foundation_date" type="date" :label="t('orgInfo.foundation_date')" :help="t('orgInfo.foundation_date_help')" />
          <AzInput v-model="form.organising_date" type="date" :label="t('orgInfo.organising_date')" :help="t('orgInfo.organising_date_help')" />
        </div>
      </AzCard>

      <div class="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-card sm:border">
        <span v-if="dirty" class="mr-auto text-sm text-ink-muted">{{ t('orgInfo.unsaved') }}</span>
        <AzButton type="submit" :loading="saving" :disabled="!dirty">{{ t('common.save') }}</AzButton>
      </div>
    </form>
  </div>
</template>
