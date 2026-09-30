<!-- Roles and permissions (Super Admin): what each role lets someone do, as a grid of
     modules (meetings, events...) and actions (see, add, change, delete). Plus the list of permissions. -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { ACTIONS, groupPermissions, humanModule } from "@/helpers/permissions";
import { Plus, Pencil, Trash2, Lock } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t, te } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const tab = ref(route.query.tab === "permissions" ? "permissions" : "roles");
const loading = ref(true);
const roles = ref([]);
const permissions = ref([]);

const tabOptions = computed(() => [{ value: "roles", label: t("rolesPage.tabRoles") }, { value: "permissions", label: t("rolesPage.tabPermissions") }]);
const groups = computed(() => groupPermissions(permissions.value.map((p) => p.name)));
const moduleName = (m) => (te(`permissionModules.${m}`) ? t(`permissionModules.${m}`) : humanModule(m));

async function load() {
  const res = await auth.fetchProtectedApi("/api/superadmin/access", {}, "GET");
  roles.value = res?.status ? res.data.roles : [];
  permissions.value = res?.status ? res.data.permissions : [];
}

// ---- Role editor ----
const editing = ref(undefined); // undefined closed, null new
const form = reactive({ name: "", permissions: new Set() });
const saving = ref(false);
function openRole(r = null) {
  form.name = r?.name || "";
  form.permissions = new Set(r?.permissions || []);
  editing.value = r;
}
const has = (p) => p && form.permissions.has(p);
function toggle(p) {
  if (!p) return;
  const s = new Set(form.permissions);
  s.has(p) ? s.delete(p) : s.add(p);
  form.permissions = s;
}
function toggleModule(g) {
  const all = [...Object.values(g.actions), ...g.other];
  const allOn = all.every((p) => form.permissions.has(p));
  const s = new Set(form.permissions);
  all.forEach((p) => (allOn ? s.delete(p) : s.add(p)));
  form.permissions = s;
}
async function saveRole() {
  if (!form.name.trim()) return toast.error(t("lookups.required"));
  saving.value = true;
  try {
    const payload = { name: form.name.trim(), permissions: [...form.permissions] };
    const res = editing.value
      ? await auth.fetchProtectedApi(`/api/superadmin/access/roles/${editing.value.id}`, payload, "PUT")
      : await auth.fetchProtectedApi("/api/superadmin/access/roles", payload, "POST");
    if (res?.status) {
      toast.success(t("lookups.saved"));
      editing.value = undefined;
      await load();
    } else {
      const e = res?.errors?.errors;
      toast.error((e && Object.values(e)[0]?.[0]) || res?.errors?.message || t("profilePage.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
async function removeRole(r) {
  const ok = await confirm({ title: t("rolesPage.removeTitle", { name: r.name }), message: t("rolesPage.removeText", { n: r.people }), confirmText: t("common.delete"), danger: true });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/superadmin/access/roles/${r.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("lookups.removed"));
    await load();
  } else toast.error(res?.errors?.message || t("profilePage.saveFailed"));
}

// ---- Permissions ----
const newPermission = ref("");
async function addPermission() {
  const name = newPermission.value.trim().toLowerCase();
  if (!/^[a-z0-9_-]+(\.[a-z0-9_-]+)+$/.test(name)) return toast.error(t("rolesPage.permissionFormat"));
  const res = await auth.fetchProtectedApi("/api/superadmin/access/permissions", { name }, "POST");
  if (res?.status) {
    newPermission.value = "";
    toast.success(t("lookups.saved"));
    await load();
  } else toast.error(res?.errors?.errors?.name?.[0] || t("profilePage.saveFailed"));
}
async function removePermission(p) {
  const ok = await confirm({ title: t("rolesPage.removePermissionTitle", { name: p.name }), message: t("rolesPage.removePermissionText", { n: p.roles }), confirmText: t("common.delete"), danger: true });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/superadmin/access/permissions/${p.id}`, {}, "DELETE");
  if (res?.status) await load();
  else toast.error(t("profilePage.saveFailed"));
}
const permissionById = (name) => permissions.value.find((p) => p.name === name);

function setTab(v) {
  tab.value = v;
  router.replace({ query: v === "permissions" ? { tab: v } : {} });
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzPageHeader :title="t('rolesPage.title')" :description="t('rolesPage.description')">
      <AzButton v-if="tab === 'roles'" @click="openRole()"><template #icon><Plus class="h-[18px] w-[18px]" /></template>{{ t('rolesPage.addRole') }}</AzButton>
    </AzPageHeader>
    <div class="max-w-sm"><AzSegmented :model-value="tab" :label="t('rolesPage.title')" :options="tabOptions" @update:model-value="setTab" /></div>

    <AzSkeleton v-if="loading" :lines="5" height="3rem" />

    <!-- Roles -->
    <AzCard v-else-if="tab === 'roles'" :padded="false">
      <ul class="divide-y divide-line">
        <li v-for="r in roles" :key="r.id" class="flex items-center gap-3 px-5 py-3">
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-2 font-semibold text-ink">
              {{ r.name }}
              <AzBadge v-if="r.is_plan" tone="warning" :dot="false"><Lock class="mr-1 inline h-3 w-3" aria-hidden="true" />{{ t('rolesPage.planRole') }}</AzBadge>
            </span>
            <span class="block text-sm text-ink-muted">{{ t('rolesPage.roleStats', { p: r.permissions.length, n: r.people }) }}</span>
          </span>
          <AzButton variant="quiet" size="sm" @click="openRole(r)"><template #icon><Pencil class="h-4 w-4" /></template>{{ t('common.edit') }}</AzButton>
          <AzButton v-if="!r.is_plan" variant="quiet" size="sm" :aria-label="t('common.delete')" @click="removeRole(r)"><template #icon><Trash2 class="h-4 w-4" /></template></AzButton>
        </li>
      </ul>
    </AzCard>

    <!-- Permissions -->
    <template v-else>
      <AzCard>
        <form class="flex flex-col gap-2 sm:flex-row sm:items-end" novalidate @submit.prevent="addPermission">
          <div class="flex-1"><AzInput v-model="newPermission" :label="t('rolesPage.newPermission')" :help="t('rolesPage.permissionHelp')" maxlength="100" autocomplete="off" /></div>
          <AzButton type="submit" variant="secondary" class="sm:mb-6">{{ t('lookups.add') }}</AzButton>
        </form>
      </AzCard>
      <AzCard :padded="false">
        <ul class="divide-y divide-line">
          <li v-for="g in groups" :key="g.module" class="px-5 py-3">
            <p class="font-semibold text-ink">{{ moduleName(g.module) }}</p>
            <div class="mt-1 flex flex-wrap gap-2">
              <span v-for="name in [...Object.values(g.actions), ...g.other]" :key="name" class="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-ink-2">
                {{ name }} <span class="text-ink-muted">({{ permissionById(name)?.roles ?? 0 }})</span>
                <button type="button" class="text-ink-muted hover:text-danger" :aria-label="t('common.delete')" @click="removePermission(permissionById(name))">×</button>
              </span>
            </div>
          </li>
        </ul>
      </AzCard>
    </template>

    <!-- Role editor -->
    <AzModal v-if="editing !== undefined" :open="true" :title="editing ? t('rolesPage.editRole', { name: editing.name }) : t('rolesPage.addRole')" size="lg" @close="editing = undefined">
      <form id="role-edit" class="flex flex-col gap-5" novalidate @submit.prevent="saveRole">
        <p v-if="editing?.is_plan" class="rounded-control border border-warning/40 bg-warning-soft px-3 py-2 text-sm text-ink-2">{{ t('rolesPage.planWarning') }}</p>
        <AzInput v-model="form.name" :label="t('rolesPage.roleName')" :help="t('rolesPage.roleNameHelp')" maxlength="100" required :disabled="editing?.is_plan" />
        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px] text-sm">
            <thead>
              <tr class="border-b border-line text-left text-ink-muted">
                <th class="py-2 font-medium">{{ t('rolesPage.module') }}</th>
                <th v-for="a in ACTIONS" :key="a" class="py-2 text-center font-medium">{{ t(`rolesPage.action_${a}`) }}</th>
                <th class="py-2 text-center font-medium">{{ t('rolesPage.all') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="g in groups" :key="g.module">
                <td class="py-2 pr-3 text-ink">{{ moduleName(g.module) }}<span v-if="g.other.length" class="block text-xs text-ink-muted">{{ g.other.map((o) => o.split('.').pop()).join(', ') }}</span></td>
                <td v-for="a in ACTIONS" :key="a" class="py-2 text-center">
                  <input v-if="g.actions[a]" type="checkbox" :checked="has(g.actions[a])" :aria-label="`${moduleName(g.module)}: ${t(`rolesPage.action_${a}`)}`"
                    class="h-4 w-4 accent-[rgb(var(--az-primary))]" @change="toggle(g.actions[a])" />
                </td>
                <td class="py-2 text-center">
                  <input type="checkbox" :checked="[...Object.values(g.actions), ...g.other].every((p) => has(p))" :aria-label="`${moduleName(g.module)}: ${t('rolesPage.all')}`"
                    class="h-4 w-4 accent-[rgb(var(--az-primary))]" @change="toggleModule(g)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm text-ink-muted">{{ t('rolesPage.selected', { n: form.permissions.size }) }}</p>
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="editing = undefined">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="role-edit" :loading="saving">{{ t('common.save') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
