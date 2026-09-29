<!-- One committee: its term, description and the people serving on it (by role) -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { richTextHtml } from "@/helpers/sanitizeHtml";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { servingState, periodText } from "@/helpers/committee";
import CommitteeFormModal from "./components/CommitteeFormModal.vue";
import CommitteeMemberModal from "./components/CommitteeMemberModal.vue";
import { CalendarRange, Pencil, Trash2, UserPlus, MoreVertical } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const committeeId = computed(() => route.params.committeeId);
const committee = ref(null);
const people = ref([]); // committee members
const members = ref([]); // organisation members to choose from
const designations = ref([]);
const loading = ref(true);
const notFound = ref(false);

const committeeFormOpen = ref(false);
const memberFormOpen = ref(false);
const editingMember = ref(null);

async function loadPeople() {
  const res = await auth.fetchProtectedApi(`/api/committee-members/${committeeId.value}`, {}, "GET");
  people.value = (res?.status ? res.data : []).map((p) => ({
    ...p,
    name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "—",
    state: servingState(p),
  }));
}

async function load() {
  const [c, orgMembers, roles] = await Promise.all([
    auth.fetchProtectedApi(`/api/committees/${committeeId.value}`, {}, "GET"),
    auth.fetchProtectedApi("/api/org-all-member-name", {}, "GET"),
    auth.fetchProtectedApi("/api/designations", {}, "GET"),
    loadPeople(),
  ]);
  if (!c?.status) {
    notFound.value = true;
    return;
  }
  committee.value = { ...c.data, state: servingState(c.data) };
  members.value = (orgMembers?.status ? orgMembers.data : [])
    .filter((m) => m.individual)
    .map((m) => ({
      id: m.individual.id,
      name: [m.individual.first_name, m.individual.last_name].filter(Boolean).join(" "),
      membership: m.membership_type?.name || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  designations.value = (roles?.status ? roles.data : []).filter((d) => !(d.is_active === 0 || d.is_active === "0"));
}

// Serving now, in role order (President first...); then people who served before
const byRole = (a, b) => (a.designation_id ?? 0) - (b.designation_id ?? 0) || a.name.localeCompare(b.name);
const serving = computed(() => people.value.filter((p) => p.state === "current").sort(byRole));
const past = computed(() => people.value.filter((p) => p.state === "former").sort(byRole));
const takenUserIds = computed(() => serving.value.map((p) => p.user_id));

const description = computed(() => richTextHtml(committee.value?.short_description));

function openMember(record = null) {
  editingMember.value = record;
  memberFormOpen.value = true;
}

const personActions = (p) => [
  { label: t("committees.editMember"), icon: Pencil, onSelect: () => openMember(p) },
  { label: t("committees.removeMember"), icon: Trash2, onSelect: () => removePerson(p) },
];

async function removePerson(p) {
  const ok = await confirm({
    title: t("committees.removeTitle", { name: p.name }),
    message: t("committees.removeText"),
    confirmText: t("committees.removeMember"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/committee-members/${p.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("committees.memberRemoved"));
    await loadPeople();
  } else {
    toast.error(t("committees.memberSaveFailed"));
  }
}

async function removeCommittee() {
  const ok = await confirm({
    title: t("meetings.deleteTitle", { name: committee.value.name }),
    message: t("committees.deleteText", { n: people.value.length }),
    confirmText: t("committees.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/committees/${committeeId.value}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("committees.deleted"));
    router.push({ name: "committees" });
  } else {
    toast.error(t("committees.deleteFailed"));
  }
}

async function onCommitteeSaved() {
  const c = await auth.fetchProtectedApi(`/api/committees/${committeeId.value}`, {}, "GET");
  if (c?.status) committee.value = { ...c.data, state: servingState(c.data) };
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzSkeleton v-if="loading" :lines="6" height="3rem" />

    <AzCard v-else-if="notFound">
      <AzEmptyState :title="t('committees.notFound')" :description="t('meetingView.notFoundText')">
        <AzButton :to="{ name: 'committees' }">{{ t('committees.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else-if="committee">
      <AzPageHeader :title="committee.name" :back="{ name: 'committees' }" :back-label="t('committees.title')">
        <AzButton variant="danger" @click="removeCommittee">
          <template #icon><Trash2 class="h-[18px] w-[18px]" /></template>
          {{ t('common.delete') }}
        </AzButton>
        <AzButton variant="secondary" @click="committeeFormOpen = true">
          <template #icon><Pencil class="h-[18px] w-[18px]" /></template>
          {{ t('committees.edit') }}
        </AzButton>
      </AzPageHeader>

      <div class="-mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <AzBadge :tone="committee.state === 'current' ? 'success' : 'neutral'">{{ t(`committees.${committee.state}`) }}</AzBadge>
        <span v-if="periodText(committee, t)" class="inline-flex items-center gap-1.5">
          <CalendarRange class="h-4 w-4" aria-hidden="true" />{{ periodText(committee, t) }}
        </span>
      </div>

      <AzCard v-if="description" :title="t('committees.about')">
        <div class="prose prose-sm max-w-none" v-safe-html="description" />
      </AzCard>

      <!-- Serving now -->
      <AzCard :title="t('committees.servingNow', { n: serving.length })" :padded="false">
        <template #actions>
          <AzButton size="sm" @click="openMember()">
            <template #icon><UserPlus class="h-4 w-4" /></template>
            {{ t('committees.addMember') }}
          </AzButton>
        </template>
        <AzEmptyState v-if="!serving.length" :title="t('committees.noMembersTitle')" :description="t('committees.noMembersText')">
          <AzButton @click="openMember()">{{ t('committees.addMember') }}</AzButton>
        </AzEmptyState>
        <ul v-else class="divide-y divide-line">
          <li v-for="p in serving" :key="p.id" class="flex items-center gap-3 px-5 py-3">
            <AzAvatar :name="p.name" size="md" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-ink">{{ p.name }}</p>
              <p class="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
                <AzBadge tone="info">{{ p.designation_name || '—' }}</AzBadge>
                <span v-if="periodText(p, t)">{{ periodText(p, t) }}</span>
                <span v-if="p.note" class="truncate">· {{ p.note }}</span>
              </p>
            </div>
            <AzMenu :items="personActions(p)" variant="quiet" :aria-label="t('meetings.more', { name: p.name })">
              <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
            </AzMenu>
          </li>
        </ul>
      </AzCard>

      <!-- Served before -->
      <AzCard v-if="past.length" :title="t('committees.servedBefore', { n: past.length })" :padded="false">
        <ul class="divide-y divide-line">
          <li v-for="p in past" :key="p.id" class="flex items-center gap-3 px-5 py-3">
            <AzAvatar :name="p.name" size="md" muted />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-ink-2">{{ p.name }}</p>
              <p class="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
                <span>{{ p.designation_name || '—' }}</span>
                <span v-if="periodText(p, t)">· {{ periodText(p, t) }}</span>
              </p>
            </div>
            <AzMenu :items="personActions(p)" variant="quiet" :aria-label="t('meetings.more', { name: p.name })">
              <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
            </AzMenu>
          </li>
        </ul>
      </AzCard>

      <AzCard v-if="committee.note" :title="t('meetingView.note')">
        <p class="whitespace-pre-line text-[15px] text-ink-2">{{ committee.note }}</p>
      </AzCard>

      <CommitteeFormModal v-model:open="committeeFormOpen" :committee="committee" @saved="onCommitteeSaved" />
      <CommitteeMemberModal v-model:open="memberFormOpen" :committee="committee" :record="editingMember" :members="members"
        :designations="designations" :taken-user-ids="takenUserIds" @saved="loadPeople" />
    </template>
  </div>
</template>
