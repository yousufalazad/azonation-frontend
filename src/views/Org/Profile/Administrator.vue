<!-- The organisation's administrator: the person in charge of the account (named on invoices),
     changing it, and the people who held it before -->
<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { shortDate } from "@/helpers/billing";
import { UserCog, Search, MoreVertical, Pencil, Trash2, History } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const records = ref([]);
const current = computed(() => records.value.find((r) => Number(r.is_primary) === 1) || null);
const past = computed(() => records.value.filter((r) => Number(r.is_primary) !== 1));
// Only the organisation account itself changes its administrator
const canChange = computed(() => auth.user?.type === "organisation" && String(auth.currentOrgId || auth.user?.id) === String(auth.user?.id));

const fullName = (r) => [r?.individual_user?.first_name ?? r?.first_name, r?.individual_user?.last_name ?? r?.last_name].filter(Boolean).join(" ") || t("adminPage.unknown");
const personName = (p) => [p.first_name, p.last_name].filter(Boolean).join(" ") || p.username || p.azon_id;

async function load() {
  const res = await auth.fetchProtectedApi("/api/org-administrators", {}, "GET");
  records.value = Array.isArray(res) ? res : [];
}

// ---- Choose a new administrator ----
const showPicker = ref(false);
const query = ref("");
const results = ref([]);
const searching = ref(false);
const searched = ref(false);
const saving = ref(false);
let timer = null;

function openPicker() {
  query.value = "";
  results.value = [];
  searched.value = false;
  showPicker.value = true;
}

watch(query, (q) => {
  clearTimeout(timer);
  const text = q.trim();
  if (text.length < 3) {
    results.value = [];
    searched.value = false;
    return;
  }
  timer = setTimeout(async () => {
    searching.value = true;
    const res = await auth.fetchProtectedApi("/api/org-members/search", { query: text }, "POST");
    if (query.value.trim() === text) {
      results.value = res?.status ? res.data || [] : [];
      searched.value = true;
    }
    searching.value = false;
  }, 300);
});

async function choose(person) {
  const ok = await confirm({
    title: t("adminPage.makeTitle", { name: personName(person) }),
    message: current.value ? t("adminPage.makeTextReplace", { name: fullName(current.value) }) : t("adminPage.makeText"),
    confirmText: t("adminPage.makeConfirm"),
  });
  if (!ok) return;
  saving.value = true;
  try {
    const res = await auth.fetchProtectedApi("/api/org-administrators", { individual_type_user_id: person.id }, "POST");
    if (res && res.status !== false) {
      showPicker.value = false;
      toast.success(t("adminPage.changed", { name: personName(person) }));
      await load();
    } else {
      toast.error(res?.errors?.message || t("profilePage.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}

// ---- Edit dates or note ----
const editing = ref(null);
const editForm = reactive({ start_date: "", end_date: "", admin_note: "" });
const editError = ref("");
const editSaving = ref(false);

function openEdit(r) {
  editing.value = r;
  Object.assign(editForm, { start_date: r.start_date ? String(r.start_date).slice(0, 10) : "", end_date: r.end_date ? String(r.end_date).slice(0, 10) : "", admin_note: r.admin_note || "" });
  editError.value = "";
}

async function saveEdit() {
  if (editSaving.value) return;
  const isCurrent = Number(editing.value.is_primary) === 1;
  if (!isCurrent && editForm.end_date && editForm.start_date && editForm.end_date < editForm.start_date) {
    editError.value = t("adminPage.endBeforeStart");
    return;
  }
  editSaving.value = true;
  try {
    const payload = { start_date: editForm.start_date || null, admin_note: editForm.admin_note.trim() || null };
    if (!isCurrent) payload.end_date = editForm.end_date || null;
    const res = await auth.fetchProtectedApi(`/api/org-administrators/${editing.value.id}`, payload, "PUT");
    if (res?.data) {
      editing.value = null;
      toast.success(t("adminPage.saved"));
      await load();
    } else {
      editError.value = res?.errors?.message || t("profilePage.saveFailed");
    }
  } finally {
    editSaving.value = false;
  }
}

async function removePast(r) {
  const ok = await confirm({ title: t("adminPage.removeTitle"), message: t("adminPage.removeText", { name: fullName(r) }), confirmText: t("common.delete"), danger: true });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/org-administrators/${r.id}`, {}, "DELETE");
  if (res && res.status !== false) {
    toast.success(t("adminPage.removed"));
    await load();
  } else {
    toast.error(res?.errors?.message || t("profilePage.saveFailed"));
  }
}

const rowActions = (r) => [
  { label: t("adminPage.editDates"), icon: Pencil, onSelect: () => openEdit(r) },
  { label: t("adminPage.removeFromHistory"), icon: Trash2, separatorBefore: true, onSelect: () => removePast(r) },
];

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="t('adminPage.title')" :description="t('adminPage.description')" />

    <AzSkeleton v-if="loading" :lines="4" height="4rem" />

    <template v-else>
      <!-- Current administrator -->
      <AzCard>
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><UserCog class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('adminPage.current') }}</h2>
        </template>
        <div v-if="current" class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <AzAvatar :name="fullName(current)" :src="current.image_url || ''" size="lg" />
          <div class="min-w-0 flex-1">
            <p class="text-xl font-semibold text-ink">{{ fullName(current) }}</p>
            <p class="text-sm text-ink-muted">
              <span v-if="current.individual_user?.azon_id">{{ current.individual_user.azon_id }} · </span>{{ t('adminPage.since', { date: shortDate(current.start_date, locale) }) }}
            </p>
            <p v-if="current.admin_note" class="mt-1 text-sm text-ink-2">{{ current.admin_note }}</p>
          </div>
          <div v-if="canChange" class="flex flex-wrap gap-2">
            <AzButton variant="quiet" size="sm" @click="openEdit(current)">{{ t('adminPage.editNote') }}</AzButton>
            <AzButton variant="secondary" size="sm" @click="openPicker">{{ t('adminPage.change') }}</AzButton>
          </div>
        </div>
        <AzEmptyState v-else :title="t('adminPage.noneTitle')" :description="t('adminPage.noneText')">
          <AzButton v-if="canChange" @click="openPicker">{{ t('adminPage.choose') }}</AzButton>
        </AzEmptyState>
        <template #footer>
          <p class="text-sm text-ink-muted">{{ canChange ? t('adminPage.whatItMeans') : t('adminPage.onlyOrg') }}</p>
        </template>
      </AzCard>

      <!-- History -->
      <AzCard v-if="past.length" :padded="false">
        <template #header>
          <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><History class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('adminPage.past') }}</h2>
        </template>
        <ul class="divide-y divide-line">
          <li v-for="r in past" :key="r.id" class="flex items-center gap-3 px-5 py-3">
            <AzAvatar :name="fullName(r)" :src="r.image_url || ''" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-ink">{{ fullName(r) }}</p>
              <p class="truncate text-sm text-ink-muted">
                {{ shortDate(r.start_date, locale) || '—' }} – {{ shortDate(r.end_date, locale) || '—' }}<template v-if="r.admin_note"> · {{ r.admin_note }}</template>
              </p>
            </div>
            <AzMenu v-if="canChange" :items="rowActions(r)" variant="quiet" :aria-label="t('meetings.more', { name: fullName(r) })">
              <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
            </AzMenu>
          </li>
        </ul>
      </AzCard>
    </template>

    <!-- Choose a person -->
    <AzModal v-model:open="showPicker" :title="current ? t('adminPage.change') : t('adminPage.choose')" :description="t('adminPage.searchHelp')" size="lg">
      <div class="flex flex-col gap-4">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input v-model="query" type="search" autofocus :placeholder="t('adminPage.searchPlaceholder')" :aria-label="t('adminPage.searchPlaceholder')" autocomplete="off"
            class="min-h-[48px] w-full rounded-control border border-line-strong bg-surface pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <p v-if="query.trim().length > 0 && query.trim().length < 3" class="text-sm text-ink-muted">{{ t('adminPage.typeMore') }}</p>
        <AzSkeleton v-else-if="searching" :lines="3" height="3rem" />
        <p v-else-if="searched && !results.length" class="text-sm text-ink-muted">{{ t('adminPage.noResults') }}</p>
        <ul v-else-if="results.length" class="divide-y divide-line rounded-card border border-line">
          <li v-for="p in results" :key="p.id" class="flex items-center gap-3 px-4 py-3">
            <AzAvatar :name="personName(p)" :src="p.image_url || ''" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-ink">{{ personName(p) }}</p>
              <p class="truncate text-sm text-ink-muted">{{ [p.azon_id, p.city].filter(Boolean).join(' · ') }}</p>
            </div>
            <AzBadge v-if="current && current.individual_type_user_id === p.id" tone="info" :dot="false">{{ t('subscriptionPage.current') }}</AzBadge>
            <AzButton v-else variant="secondary" size="sm" :loading="saving" @click="choose(p)">{{ t('adminPage.select') }}</AzButton>
          </li>
        </ul>
      </div>
    </AzModal>

    <!-- Edit dates / note -->
    <AzModal v-if="editing" :open="true" :title="t('adminPage.editTitle', { name: fullName(editing) })" @close="editing = null">
      <form id="admin-edit-form" class="flex flex-col gap-5" novalidate @submit.prevent="saveEdit">
        <div class="grid gap-5 sm:grid-cols-2">
          <AzInput v-model="editForm.start_date" type="date" :label="t('adminPage.from')" />
          <AzInput v-if="Number(editing.is_primary) !== 1" v-model="editForm.end_date" type="date" :label="t('adminPage.to')" :error="editError === t('adminPage.endBeforeStart') ? editError : ''" />
        </div>
        <AzInput v-model="editForm.admin_note" :label="t('meetingView.note')" :help="t('adminPage.noteHelp')" maxlength="255" autocomplete="off" />
        <p v-if="editError && editError !== t('adminPage.endBeforeStart')" class="text-sm text-danger" role="alert">{{ editError }}</p>
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="editing = null">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="admin-edit-form" :loading="editSaving">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
