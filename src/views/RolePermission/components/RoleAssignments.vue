<!-- Who has which role in one organisation: each active member with their roles and title,
     and changing them. Used by the organisation (Admin roles) and the Super Admin (Give roles). -->
<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { roleSummary, humanModule } from "@/helpers/permissions";
import { Search, ShieldCheck } from "lucide-vue-next";

const props = defineProps({ orgId: { type: [Number, String], required: true } });

const auth = authStore;
const { t, te } = useI18n();
const toast = useToast();

const loading = ref(true);
const members = ref([]);
const roles = ref([]);
const titles = ref([]);
const search = ref("");

const moduleName = (m) => (te(`permissionModules.${m}`) ? t(`permissionModules.${m}`) : humanModule(m));
const nameOf = (u) => [u.first_name, u.last_name].filter(Boolean).join(" ") || u.azon_id || `#${u.id}`;
const titleName = (id) => titles.value.find((x) => String(x.id) === String(id))?.name;
const shown = computed(() => {
  const q = search.value.trim().toLowerCase();
  return q ? members.value.filter((m) => nameOf(m).toLowerCase().includes(q) || m.roles.some((r) => r.name.toLowerCase().includes(q))) : members.value;
});
const withRoles = computed(() => members.value.filter((m) => m.roles.length).length);

async function load() {
  loading.value = true;
  const [m, r, ti] = await Promise.all([
    auth.fetchProtectedApi(`/api/org-members-users/${props.orgId}`, {}, "GET"),
    auth.fetchProtectedApi("/api/roles", {}, "GET"),
    auth.fetchProtectedApi("/api/org-role-titles", { org_type_user_id: props.orgId }, "GET"),
  ]);
  members.value = Array.isArray(m) ? m : [];
  roles.value = (Array.isArray(r) ? r : []).map((x) => ({ id: x.id, name: x.name, permissions: (x.permissions || []).map((p) => p.name) }));
  titles.value = Array.isArray(ti) ? ti : ti?.data || [];
  loading.value = false;
}

// ---- Change one member's roles ----
const editing = ref(null);
const form = reactive({ roles: [], title: "", newTitle: "" });
const saving = ref(false);
function openEdit(m) {
  editing.value = m;
  Object.assign(form, { roles: m.roles.map((r) => r.name), title: m.org_role_title_id || "", newTitle: "" });
}
const summaryText = (role) => {
  const s = roleSummary(role.permissions);
  if (!s.modules) return t("roleAssign.noPermissions");
  const change = s.canChange.map(moduleName);
  const read = s.readOnly.map(moduleName);
  return [change.length ? t("roleAssign.canChange", { list: change.join(", ") }) : "", read.length ? t("roleAssign.canSee", { list: read.join(", ") }) : ""].filter(Boolean).join(" ");
};

async function save() {
  if (saving.value) return;
  saving.value = true;
  try {
    let titleId = form.title || null;
    if (form.newTitle.trim()) {
      const res = await auth.fetchProtectedApi("/api/org-role-titles", { name: form.newTitle.trim(), org_type_user_id: props.orgId }, "POST");
      titleId = res?.id || res?.data?.id || null;
    }
    const res = await auth.fetchProtectedApi(`/api/users/${editing.value.id}/roles`, {
      roles: form.roles, org_type_user_id: Number(props.orgId), org_role_title_id: titleId,
    }, "PUT");
    if (res?.status) {
      toast.success(t("roleAssign.saved", { name: nameOf(editing.value) }));
      editing.value = null;
      await load();
    } else toast.error(res?.errors?.message || t("profilePage.saveFailed"));
  } finally {
    saving.value = false;
  }
}

watch(() => props.orgId, (id) => id && load(), { immediate: true });
</script>

<template>
  <div class="flex flex-col gap-4">
    <AzCard :padded="false">
      <div class="flex flex-col gap-2 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative max-w-sm flex-1">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input v-model="search" type="search" :placeholder="t('roleAssign.search')" :aria-label="t('roleAssign.search')"
            class="min-h-[44px] w-full rounded-control border border-line-strong bg-surface pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <p v-if="!loading" class="text-sm text-ink-muted">{{ t('roleAssign.count', { n: withRoles, total: members.length }) }}</p>
      </div>
      <div v-if="loading" class="p-5"><AzSkeleton :lines="4" height="3rem" /></div>
      <AzEmptyState v-else-if="!members.length" :title="t('roleAssign.noMembersTitle')" :description="t('roleAssign.noMembersText')" />
      <ul v-else class="divide-y divide-line">
        <li v-for="m in shown" :key="m.id">
          <button type="button" class="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none" @click="openEdit(m)">
            <AzAvatar :name="nameOf(m)" size="sm" />
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-ink">{{ nameOf(m) }}<span v-if="titleName(m.org_role_title_id)" class="font-normal text-ink-muted"> · {{ titleName(m.org_role_title_id) }}</span></span>
              <span class="mt-1 flex flex-wrap gap-1">
                <AzBadge v-for="r in m.roles" :key="r.id" tone="info" :dot="false">{{ r.name }}</AzBadge>
                <span v-if="!m.roles.length" class="text-sm text-ink-muted">{{ t('roleAssign.noRoles') }}</span>
              </span>
            </span>
            <span class="text-sm font-medium text-primary">{{ t('common.edit') }}</span>
          </button>
        </li>
      </ul>
    </AzCard>

    <AzModal v-if="editing" :open="true" :title="t('roleAssign.editTitle', { name: nameOf(editing) })" :description="t('roleAssign.editHelp')" size="lg" @close="editing = null">
      <form id="role-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
        <fieldset>
          <legend class="mb-2 text-sm font-semibold text-ink">{{ t('roleAssign.roles') }}</legend>
          <p v-if="!roles.length" class="text-sm text-ink-muted">{{ t('roleAssign.noRolesExist') }}</p>
          <div class="flex flex-col gap-2">
            <label v-for="r in roles" :key="r.id" class="flex cursor-pointer items-start gap-3 rounded-control border p-3"
              :class="form.roles.includes(r.name) ? 'border-primary bg-primary-soft/40' : 'border-line'">
              <input v-model="form.roles" type="checkbox" :value="r.name" class="mt-1 h-4 w-4 accent-[rgb(var(--az-primary))]" />
              <span class="min-w-0">
                <span class="flex items-center gap-2 font-medium text-ink"><ShieldCheck class="h-4 w-4 text-primary" aria-hidden="true" />{{ r.name }}</span>
                <span class="block text-sm text-ink-muted">{{ summaryText(r) }}</span>
              </span>
            </label>
          </div>
        </fieldset>
        <div class="grid gap-4 sm:grid-cols-2">
          <AzSelect v-model="form.title" :label="t('roleAssign.title')" :options="[{ value: '', label: t('roleAssign.noTitle') }, ...titles.map((x) => ({ value: x.id, label: x.name }))]" />
          <AzInput v-model="form.newTitle" :label="t('roleAssign.newTitle')" :help="t('roleAssign.newTitleHelp')" maxlength="100" autocomplete="off" />
        </div>
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="editing = null">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="role-form" :loading="saving">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
