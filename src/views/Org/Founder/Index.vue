<!-- Founders: the people who started the organisation -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import FounderModal from "./components/FounderModal.vue";
import { Plus, Mail, Phone, MapPin, Pencil, Trash2, MoreVertical, Sprout } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const founders = ref([]);
const members = ref([]);
const loading = ref(true);
const modalOpen = ref(false);
const editing = ref(null);


async function loadFounders() {
  const res = await auth.fetchProtectedApi("/api/founders", {}, "GET");
  founders.value = res?.status ? res.data : [];
}

function openModal(f = null) {
  editing.value = f;
  modalOpen.value = true;
}

const actions = (f) => [
  { label: t("common.edit"), icon: Pencil, onSelect: () => openModal(f) },
  { label: t("common.delete"), icon: Trash2, onSelect: () => remove(f) },
];

async function remove(f) {
  const ok = await confirm({
    title: t("founders.removeTitle", { name: f.name }),
    message: t("founders.removeText"),
    confirmText: t("common.delete"),
    danger: true,
  });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/founders/${f.id}`, {}, "DELETE");
  if (res?.status) {
    founders.value = founders.value.filter((x) => x.id !== f.id);
    toast.success(t("founders.removed"));
  } else {
    toast.error(t("founders.saveFailed"));
  }
}

onMounted(async () => {
  const [, orgMembers] = await Promise.all([loadFounders(), auth.fetchProtectedApi("/api/org-all-member-name", {}, "GET")]);
  members.value = (orgMembers?.status ? orgMembers.data : [])
    .filter((m) => m.individual)
    .map((m) => ({ value: m.individual.id, label: [m.individual.first_name, m.individual.last_name].filter(Boolean).join(" ") }))
    .sort((a, b) => a.label.localeCompare(b.label));
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="t('founders.title')" :description="t('founders.description')">
      <AzButton @click="openModal()">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('founders.add') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="3" height="8rem" />

    <AzCard v-else-if="!founders.length">
      <AzEmptyState :title="t('founders.emptyTitle')" :description="t('founders.emptyText')">
        <template #icon><Sprout class="h-7 w-7" /></template>
        <AzButton @click="openModal()">{{ t('founders.add') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="f in founders" :key="f.id" class="relative flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-6 text-center shadow-card"
        :class="Number(f.is_active) === 1 ? '' : 'opacity-75'">
        <AzAvatar :src="f.image_url" :name="f.name" size="xl" />
        <div class="min-w-0">
          <p class="text-lg font-semibold text-ink">{{ f.name || '—' }}</p>
          <p v-if="f.designation" class="text-[15px] text-ink-2">{{ f.designation }}</p>
          <div class="mt-1 flex flex-wrap justify-center gap-1.5">
            <AzBadge v-if="f.is_member" tone="info">{{ t('founders.isMember') }}</AzBadge>
            <AzBadge v-if="Number(f.is_active) !== 1" tone="neutral">{{ t('content.hidden') }}</AzBadge>
          </div>
        </div>
        <ul v-if="f.email || f.mobile || f.address" class="flex w-full flex-col gap-1 text-sm text-ink-muted">
          <li v-if="f.email" class="flex items-center justify-center gap-1.5 truncate"><Mail class="h-4 w-4 shrink-0" aria-hidden="true" /><a :href="`mailto:${f.email}`" class="truncate hover:text-primary">{{ f.email }}</a></li>
          <li v-if="f.mobile" class="flex items-center justify-center gap-1.5"><Phone class="h-4 w-4 shrink-0" aria-hidden="true" /><a :href="`tel:${f.mobile}`" class="hover:text-primary">{{ f.mobile }}</a></li>
          <li v-if="f.address" class="flex items-center justify-center gap-1.5 truncate"><MapPin class="h-4 w-4 shrink-0" aria-hidden="true" />{{ f.address }}</li>
        </ul>
        <p v-if="f.note" class="text-sm text-ink-2">{{ f.note }}</p>
        <AzMenu class="absolute right-3 top-3" :items="actions(f)" variant="quiet" :aria-label="t('meetings.more', { name: f.name })">
          <template #icon><MoreVertical class="h-[18px] w-[18px]" /></template>
        </AzMenu>
      </li>
    </ul>

    <FounderModal v-model:open="modalOpen" :founder="editing" :members="members" @saved="loadFounders" />
  </div>
</template>
