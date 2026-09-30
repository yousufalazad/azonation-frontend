<!-- One platform list (countries, currencies, statuses...), driven by its entry in lookups.js:
     search, add, edit, switch on or off, remove -->
<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Plus, MoreVertical, Pencil, Trash2, Search } from "lucide-vue-next";
import { LOOKUPS } from "./lookups";

const auth = authStore;
const route = useRoute();
const { t, te } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const key = computed(() => String(route.params.key || ""));
const cfg = computed(() => LOOKUPS[key.value] || null);
const loading = ref(true);
const rows = ref([]);
const options = reactive({}); // field key -> [{ value, label }]
const search = ref("");

const label = (field) => (te(`lookups.field_${field}`) ? t(`lookups.field_${field}`) : field.replace(/_/g, " "));
const on = (v) => v === 1 || v === "1" || v === true;
const optionLabel = (field, value) => options[field]?.find((o) => String(o.value) === String(value))?.label;

const shown = computed(() => {
  const q = search.value.trim().toLowerCase();
  const list = q ? rows.value.filter((r) => cfg.value.columns.some((c) => String(display(r, c)).toLowerCase().includes(q))) : rows.value.slice();
  const by = cfg.value.sortBy;
  if (by) list.sort((a, b) => (typeof a[by] === "number" ? a[by] - b[by] : String(a[by] ?? "").localeCompare(String(b[by] ?? ""))));
  return list;
});
const columns = computed(() => [
  ...cfg.value.columns.map((c, i) => ({ key: c, label: label(c), class: i === 0 ? "font-semibold text-ink" : "", value: (r) => display(r, c) })),
  { key: "is_active", label: t("lookups.status") },
]);

// What a cell shows: yes/no for switches, the option name for a select, else the value
function display(row, col) {
  const field = cfg.value.fields.find((f) => f.key === col);
  if (field?.type === "switch") return on(row[col]) ? t("lookups.yes") : t("lookups.no");
  if (field?.type === "select") return optionLabel(col, row[col]) ?? row[col] ?? "";
  return row[col] ?? "";
}

async function load() {
  loading.value = true;
  const c = cfg.value;
  if (!c) return;
  const selects = c.fields.filter((f) => f.type === "select" && f.options?.endpoint);
  const [res, ...opts] = await Promise.all([
    auth.fetchProtectedApi(c.listEndpoint || c.endpoint, {}, "GET"),
    ...selects.map((f) => auth.fetchProtectedApi(f.options.endpoint, {}, "GET")),
  ]);
  rows.value = res?.status !== false ? (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []) : [];
  selects.forEach((f, i) => {
    const list = opts[i]?.data || [];
    options[f.key] = list.map((o) => ({ value: o[f.options.value], label: o[f.options.label] })).sort((a, b) => String(a.label).localeCompare(String(b.label)));
  });
  loading.value = false;
}

// ---- Add / edit ----
const editing = ref(undefined); // undefined closed, null new, row edit
const form = reactive({});
const errors = reactive({});
const saving = ref(false);

function openForm(row = null) {
  Object.keys(form).forEach((k) => delete form[k]);
  Object.keys(errors).forEach((k) => delete errors[k]);
  cfg.value.fields.forEach((f) => {
    const v = row ? row[f.key] : f.default;
    form[f.key] = f.type === "switch" ? on(v ?? 0) : v ?? "";
  });
  editing.value = row;
}

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  for (const f of cfg.value.fields) {
    const v = form[f.key];
    if (f.required && (v === "" || v === null || v === undefined)) errors[f.key] = t("lookups.required");
  }
  if (Object.keys(errors).length || saving.value) return;
  const payload = {};
  cfg.value.fields.forEach((f) => {
    const v = form[f.key];
    payload[f.key] = f.type === "switch" ? (v ? 1 : 0) : f.type === "number" ? Number(v) : typeof v === "string" ? v.trim() : v;
  });
  saving.value = true;
  try {
    const row = editing.value;
    const res = row
      ? await auth.fetchProtectedApi(`${cfg.value.endpoint}/${row.id}`, payload, "PUT")
      : await auth.fetchProtectedApi(cfg.value.endpoint, payload, "POST");
    if (res?.status) {
      toast.success(t("lookups.saved"));
      editing.value = undefined;
      await load();
    } else {
      const e = res?.errors?.errors || res?.errors || {};
      Object.entries(e).forEach(([k, v]) => { if (Array.isArray(v)) errors[k] = v[0]; });
      if (!Object.keys(errors).length) toast.error(res?.errors?.message || t("profilePage.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}

async function toggle(row) {
  const payload = {};
  cfg.value.fields.forEach((f) => (payload[f.key] = row[f.key]));
  payload.is_active = on(row.is_active) ? 0 : 1;
  const res = await auth.fetchProtectedApi(`${cfg.value.endpoint}/${row.id}`, payload, "PUT");
  if (res?.status) {
    row.is_active = payload.is_active;
    toast.success(payload.is_active ? t("lookups.switchedOn") : t("lookups.switchedOff"));
  } else {
    toast.error(t("profilePage.saveFailed"));
  }
}

async function remove(row) {
  const ok = await confirm({ title: t("lookups.removeTitle"), message: t("lookups.removeText"), confirmText: t("common.delete"), danger: true });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`${cfg.value.endpoint}/${row.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("lookups.removed"));
    await load();
  } else {
    toast.error(res?.errors?.message || t("lookups.removeFailed"));
  }
}

// From the edit dialog (the only way on a phone)
async function removeFromForm() {
  const row = editing.value;
  editing.value = undefined;
  await remove(row);
}

const rowActions = (row) => [
  { label: t("common.edit"), icon: Pencil, onSelect: () => openForm(row) },
  { label: on(row.is_active) ? t("lookups.switchOff") : t("lookups.switchOn"), onSelect: () => toggle(row) },
  { label: t("common.delete"), icon: Trash2, separatorBefore: true, onSelect: () => remove(row) },
];

watch(key, () => {
  search.value = "";
  load();
}, { immediate: true });
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzCard v-if="!cfg">
      <AzEmptyState :title="t('lookups.unknownTitle')" :description="t('lookups.unknownText')">
        <AzButton variant="secondary" :to="{ name: 'superadmin-settings' }">{{ t('lookups.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else>
      <AzPageHeader :title="t(`lookups.title_${key}`)" :description="t(`lookups.desc_${key}`)" :back="{ name: 'superadmin-settings' }" :back-label="t('lookups.title')">
        <AzButton @click="openForm()">
          <template #icon><Plus class="h-[18px] w-[18px]" /></template>
          {{ t('lookups.add') }}
        </AzButton>
      </AzPageHeader>

      <p v-if="cfg.warning" class="-mt-3 rounded-control border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-ink-2">{{ t(`lookups.${cfg.warning}`) }}</p>

      <AzCard :padded="false">
        <div class="border-b border-line p-4">
          <div class="relative max-w-sm">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input v-model="search" type="search" :placeholder="t('memberActivity.search')" :aria-label="t('memberActivity.search')"
              class="min-h-[44px] w-full rounded-control border border-line-strong bg-surface pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div v-if="loading" class="p-5"><AzSkeleton :lines="5" height="2.75rem" /></div>
        <AzEmptyState v-else-if="!rows.length" :title="t('lookups.emptyTitle')" :description="t('lookups.emptyText')">
          <AzButton @click="openForm()">{{ t('lookups.add') }}</AzButton>
        </AzEmptyState>
        <AzEmptyState v-else-if="!shown.length" :title="t('list.noMatchTitle')" :description="t('list.noMatchText')" />
        <AzDataTable v-else :columns="columns" :rows="shown" @row-click="openForm">
          <template #cell-is_active="{ row }">
            <AzBadge :tone="on(row.is_active) ? 'success' : 'neutral'">{{ on(row.is_active) ? t('lookups.on') : t('lookups.off') }}</AzBadge>
          </template>
          <template #actions="{ row }">
            <AzMenu :items="rowActions(row)" variant="quiet" :aria-label="t('meetings.more', { name: display(row, cfg.columns[0]) })">
              <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
            </AzMenu>
          </template>
          <template #mobile="{ row }">
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ display(row, cfg.columns[0]) }}</span>
              <span class="block truncate text-sm text-ink-muted">{{ cfg.columns.slice(1).map((c) => display(row, c)).filter((v) => v !== '').join(' · ') }}</span>
            </span>
            <AzBadge :tone="on(row.is_active) ? 'success' : 'neutral'">{{ on(row.is_active) ? t('lookups.on') : t('lookups.off') }}</AzBadge>
          </template>
        </AzDataTable>
      </AzCard>

      <AzModal v-if="editing !== undefined" :open="true" :title="editing ? t('lookups.editTitle') : t('lookups.addTitle')" @close="editing = undefined">
        <form id="lookup-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
          <template v-for="f in cfg.fields" :key="f.key">
            <AzSelect v-if="f.type === 'select'" v-model="form[f.key]" :label="label(f.key)" :options="options[f.key] || []"
              :placeholder="t('meetingForm.choose')" :error="errors[f.key]" :required="f.required" />
            <AzTextarea v-else-if="f.type === 'textarea'" v-model="form[f.key]" :label="label(f.key)" :rows="3"
              :help="f.help ? t(`lookups.${f.help}`) : ''" :error="errors[f.key]" :required="f.required" />
            <label v-else-if="f.type === 'switch'" class="flex cursor-pointer items-center justify-between gap-4 rounded-control border border-line px-4 py-3">
              <span>
                <span class="block font-medium text-ink">{{ label(f.key) }}</span>
                <span v-if="f.help" class="block text-sm text-ink-muted">{{ t(`lookups.${f.help}`) }}</span>
              </span>
              <input v-model="form[f.key]" type="checkbox" class="h-5 w-5 accent-[rgb(var(--az-primary))]" />
            </label>
            <AzInput v-else v-model="form[f.key]" :type="f.type === 'number' ? 'number' : 'text'" :label="label(f.key)" :maxlength="f.max"
              :help="f.help ? t(`lookups.${f.help}`) : ''" :error="errors[f.key]" :required="f.required" autocomplete="off" />
          </template>
        </form>
        <template #footer>
          <AzButton v-if="editing" variant="danger" class="sm:mr-auto" @click="removeFromForm">{{ t('common.delete') }}</AzButton>
          <AzButton variant="quiet" @click="editing = undefined">{{ t('common.cancel') }}</AzButton>
          <AzButton type="submit" form="lookup-form" :loading="saving">{{ t('common.save') }}</AzButton>
        </template>
      </AzModal>
    </template>
  </div>
</template>
