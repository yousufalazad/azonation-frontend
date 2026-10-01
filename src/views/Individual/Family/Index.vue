<!-- My family: the member's own family list, and which organisations may see it.
     Private unless the member shares; sharing starts at "numbers only". -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { GENDERS, RELATIONSHIPS, ageKey } from "@/components/family/family";
import { EyeOff, Hash, Pencil, Plus, Trash2, UsersRound } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const people = ref([]);
const organisations = ref([]);
const loading = ref(true);
const failed = ref(false);

const dialogOpen = ref(false);
const editing = ref(null);
const saving = ref(false);
const errors = reactive({});
const form = reactive({ name: "", relationship: "child", birth_year: "", gender: "", note: "" });

const thisYear = new Date().getFullYear();
const relationshipOptions = computed(() => RELATIONSHIPS.map((r) => ({ value: r, label: t(`family.rel_${r}`) })));
const genderOptions = computed(() => [{ value: "", label: t("family.genderNotSaid") }, ...GENDERS.map((g) => ({ value: g, label: t(`family.gender_${g}`) }))]);
const levelOptions = computed(() => [
  { value: "none", label: t("family.level_none") },
  { value: "numbers", label: t("family.level_numbers") },
  { value: "details", label: t("family.level_details") },
]);

// What an organisation sees at "numbers only", e.g. "2 adults, 1 child (5–12)"
const numbersPreview = computed(() => {
  const adults = people.value.filter((p) => p.birth_year && thisYear - p.birth_year >= 18).length;
  const children = people.value.filter((p) => p.birth_year && thisYear - p.birth_year < 18);
  const unknown = people.value.filter((p) => !p.birth_year).length;
  const parts = [];
  if (adults) parts.push(t("family.nAdults", { n: adults }, adults));
  if (children.length) {
    const groups = [...new Set(children.map((c) => t(ageKey(c.age_group))))].join(", ");
    parts.push(`${t("family.nChildren", { n: children.length }, children.length)} (${groups})`);
  }
  if (unknown) parts.push(t("family.nUnknown", { n: unknown }, unknown));
  return parts.join(", ") || t("family.nobodyYet");
});

async function load() {
  loading.value = true;
  const res = await auth.fetchProtectedApi("/api/individual/family", {}, "GET");
  loading.value = false;
  if (res?.status !== true) {
    failed.value = true;
    return;
  }
  failed.value = false;
  people.value = res.data.people;
  organisations.value = res.data.organisations;
}

function openDialog(person = null) {
  editing.value = person;
  Object.keys(errors).forEach((k) => delete errors[k]);
  Object.assign(form, person
    ? { name: person.name, relationship: person.relationship, birth_year: person.birth_year || "", gender: person.gender || "", note: person.note || "" }
    : { name: "", relationship: "child", birth_year: "", gender: "", note: "" });
  dialogOpen.value = true;
}

async function save() {
  if (saving.value) return;
  Object.keys(errors).forEach((k) => delete errors[k]);
  const year = form.birth_year === "" ? null : Number(form.birth_year);
  if (!form.name.trim()) errors.name = t("family.needName");
  if (year !== null && (!Number.isInteger(year) || year < thisYear - 120 || year > thisYear)) errors.birth_year = t("family.badYear", { from: thisYear - 120, to: thisYear });
  if (Object.keys(errors).length) return;

  saving.value = true;
  const payload = { name: form.name.trim(), relationship: form.relationship, birth_year: year, gender: form.gender || null, note: form.note.trim() || null };
  const res = editing.value
    ? await auth.fetchProtectedApi(`/api/individual/family/${editing.value.id}`, payload, "PUT")
    : await auth.fetchProtectedApi("/api/individual/family", payload, "POST");
  saving.value = false;
  if (res?.status === true) {
    toast.success(editing.value ? t("family.saved") : t("family.added", { name: payload.name }));
    dialogOpen.value = false;
    load();
  } else {
    toast.error(res?.errors?.message || t("family.saveFailed"));
  }
}

async function remove(person) {
  const ok = await confirm({ title: t("family.removeTitle", { name: person.name }), message: t("family.removeText"), confirmText: t("common.delete"), danger: true });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/individual/family/${person.id}`, {}, "DELETE");
  if (res?.status === true) {
    people.value = people.value.filter((p) => p.id !== person.id);
    toast.success(t("family.removed"));
  } else {
    toast.error(t("family.saveFailed"));
  }
}

async function setLevel(org, level) {
  if (level === org.level) return;
  if (level === "details") {
    const ok = await confirm({ title: t("family.detailsTitle", { org: org.org_name }), message: t("family.detailsText"), confirmText: t("family.detailsConfirm") });
    if (!ok) return;
  }
  const previous = org.level;
  org.level = level;
  const res = await auth.fetchProtectedApi(`/api/individual/family/sharing/${org.org_id}`, { level }, "PUT");
  if (res?.status === true) toast.success(t(`family.shared_${level}`, { org: org.org_name }));
  else {
    org.level = previous;
    toast.error(t("family.saveFailed"));
  }
}

const personLine = (p) => [t(`family.rel_${p.relationship}`), p.age_group ? t(ageKey(p.age_group)) : t("family.ageNotGiven"), p.gender ? t(`family.gender_${p.gender}`) : ""].filter(Boolean).join(" · ");

onMounted(load);
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="t('family.title')" :description="t('family.intro')">
      <AzButton @click="openDialog()">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('family.add') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="5" height="3rem" />
    <AzCard v-else-if="failed">
      <AzEmptyState :title="t('family.loadFailed')" :description="t('authPages.genericError')">
        <AzButton variant="secondary" @click="load">{{ t('pricingPage.retry') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else>
      <AzCard :title="t('family.peopleTitle')">
        <AzEmptyState v-if="!people.length" :title="t('family.emptyTitle')" :description="t('family.emptyText')">
          <AzButton @click="openDialog()">{{ t('family.add') }}</AzButton>
        </AzEmptyState>
        <ul v-else class="-my-2 divide-y divide-line">
          <li v-for="p in people" :key="p.id" class="flex items-center gap-3 py-3">
            <AzAvatar :name="p.name" size="md" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-ink">{{ p.name }}</p>
              <p class="truncate text-sm text-ink-2">{{ personLine(p) }}</p>
              <p v-if="p.note" class="truncate text-sm text-ink-muted">{{ p.note }}</p>
            </div>
            <button type="button" class="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink" :aria-label="t('family.editPerson', { name: p.name })" @click="openDialog(p)">
              <Pencil class="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" class="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-danger-soft hover:text-danger" :aria-label="t('family.removePerson', { name: p.name })" @click="remove(p)">
              <Trash2 class="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </AzCard>

      <AzCard :title="t('family.sharingTitle')">
        <p class="mb-4 text-[15px] text-ink-2">{{ t('family.sharingIntro') }}</p>
        <ul class="mb-5 grid gap-3 text-sm sm:grid-cols-3">
          <li class="flex gap-2 rounded-control bg-surface-2 p-3"><EyeOff class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" /><span><strong class="text-ink">{{ t('family.level_none') }}</strong><br><span class="text-ink-2">{{ t('family.level_none_text') }}</span></span></li>
          <li class="flex gap-2 rounded-control bg-surface-2 p-3"><Hash class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" /><span><strong class="text-ink">{{ t('family.level_numbers') }}</strong><br><span class="text-ink-2">{{ t('family.level_numbers_text') }}</span></span></li>
          <li class="flex gap-2 rounded-control bg-surface-2 p-3"><UsersRound class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" /><span><strong class="text-ink">{{ t('family.level_details') }}</strong><br><span class="text-ink-2">{{ t('family.level_details_text') }}</span></span></li>
        </ul>

        <p v-if="!organisations.length" class="text-[15px] text-ink-2">{{ t('family.noOrgs') }}</p>
        <ul v-else class="-my-2 divide-y divide-line">
          <li v-for="org in organisations" :key="org.org_id" class="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <p class="font-medium text-ink">{{ org.org_name }}</p>
              <p class="text-sm text-ink-muted">
                {{ org.level === 'none' ? t('family.seesNothing') : org.level === 'numbers' ? t('family.seesNumbers', { summary: numbersPreview }) : t('family.seesDetails') }}
              </p>
            </div>
            <div class="sm:w-80 sm:shrink-0">
              <AzSegmented :model-value="org.level" :label="t('family.shareWith', { org: org.org_name })" :options="levelOptions" @update:model-value="(v) => setLevel(org, v)" />
            </div>
          </li>
        </ul>
      </AzCard>
    </template>

    <AzModal v-model:open="dialogOpen" :title="editing ? t('family.editTitle') : t('family.add')">
      <form id="family-person" class="flex flex-col gap-5" novalidate @submit.prevent="save">
        <AzInput v-model="form.name" :label="t('family.name')" maxlength="100" autocomplete="off" :error="errors.name" required autofocus />
        <AzSelect v-model="form.relationship" :label="t('family.relationship')" :options="relationshipOptions" required />
        <div class="grid gap-5 sm:grid-cols-2">
          <AzInput v-model="form.birth_year" type="number" inputmode="numeric" :min="thisYear - 120" :max="thisYear" :label="t('family.birthYear')"
            :help="t('family.birthYearHelp')" :error="errors.birth_year" />
          <AzSelect v-model="form.gender" :label="t('family.gender')" :options="genderOptions" />
        </div>
        <AzInput v-model="form.note" :label="t('family.note')" :help="t('family.noteHelp')" maxlength="255" autocomplete="off" />
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="dialogOpen = false">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="family-person" :loading="saving">{{ editing ? t('common.save') : t('family.add') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
