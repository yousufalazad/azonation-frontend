<!-- Membership types: choose which of the platform's membership types this organisation offers,
     with how many members have each and whether a renewal fee is set -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { IdCard } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const platformTypes = ref([]);
const offered = ref([]); // this organisation's types
const busy = ref(null);

const isOrg = computed(() => auth.user?.type === "organisation");
const canAdd = computed(() => isOrg.value || auth.hasPermission("org-membership-type.create"));
const canRemove = computed(() => isOrg.value || auth.hasPermission("org-membership-type.delete"));
const canFees = computed(() => isOrg.value || auth.hasPermission("org-membership-renewal-price.read"));

const offeredFor = (typeId) => offered.value.find((o) => String(o.membership_type_id) === String(typeId));
const rows = computed(() => platformTypes.value
  .filter((p) => Number(p.is_active) === 1 || offeredFor(p.id))
  .map((p) => ({ ...p, offer: offeredFor(p.id) })));
const offeredCount = computed(() => rows.value.filter((r) => r.offer).length);

async function load() {
  const [p, o] = await Promise.all([
    auth.fetchProtectedApi("/api/membership-types", {}, "GET"),
    auth.fetchProtectedApi("/api/org-membership-types", {}, "GET"),
  ]);
  platformTypes.value = p?.status ? p.data : [];
  offered.value = o?.status ? o.data : [];
}

async function toggle(row) {
  if (busy.value) return;
  if (row.offer) {
    if (!canRemove.value) return;
    const ok = await confirm({
      title: t("memberTypes.stopTitle", { name: row.name }),
      message: row.offer.members_count ? t("memberTypes.stopTextMembers", { n: row.offer.members_count }) : t("memberTypes.stopText"),
      confirmText: t("memberTypes.stop"),
      danger: true,
    });
    if (!ok) return;
  } else if (!canAdd.value) return;

  busy.value = row.id;
  try {
    const res = row.offer
      ? await auth.fetchProtectedApi(`/api/org-membership-types/${row.offer.id}`, {}, "DELETE")
      : await auth.fetchProtectedApi("/api/org-membership-types", { membership_type_id: row.id, is_active: true }, "POST");
    if (res?.status) {
      toast.success(row.offer ? t("memberTypes.stopped", { name: row.name }) : t("memberTypes.started", { name: row.name }));
      await load();
    } else {
      toast.error(res?.errors?.message || t("profilePage.saveFailed"));
    }
  } finally {
    busy.value = null;
  }
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="t('memberTypes.title')" :description="t('memberTypes.description')" :back="{ name: 'index-member' }" :back-label="t('nav.members')" />

    <AzSkeleton v-if="loading" :lines="3" height="4rem" />

    <AzCard v-else-if="!rows.length">
      <AzEmptyState :title="t('memberTypes.noneTitle')" :description="t('memberTypes.noneText')">
        <template #icon><IdCard class="h-7 w-7" /></template>
      </AzEmptyState>
    </AzCard>

    <template v-else>
      <p class="-mt-3 text-sm text-ink-muted">{{ t('memberTypes.offeredCount', { n: offeredCount, total: rows.length }) }}</p>
      <AzCard :padded="false">
        <ul class="divide-y divide-line">
          <li v-for="r in rows" :key="r.id" class="flex items-center gap-4 px-5 py-4">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" :class="r.offer ? 'bg-primary-soft text-primary-soft-ink' : 'bg-surface-2 text-ink-muted'">
              <IdCard class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span :id="`type-${r.id}`" class="block font-medium text-ink">{{ r.name }}</span>
              <span class="block text-sm text-ink-muted">
                <template v-if="r.offer">
                  {{ t('memberTypes.members', { n: r.offer.members_count }, r.offer.members_count) }} ·
                  <RouterLink v-if="canFees" :to="{ name: 'org-membership-renewal-cycle' }" class="text-primary hover:underline">
                    {{ r.offer.fees_count ? t('memberTypes.fees', { n: r.offer.fees_count }, r.offer.fees_count) : t('memberTypes.noFee') }}
                  </RouterLink>
                  <span v-else>{{ r.offer.fees_count ? t('memberTypes.fees', { n: r.offer.fees_count }, r.offer.fees_count) : t('memberTypes.noFee') }}</span>
                </template>
                <template v-else>{{ t('memberTypes.notOffered') }}</template>
              </span>
            </span>
            <button type="button" role="switch" :aria-checked="!!r.offer" :aria-labelledby="`type-${r.id}`"
              :disabled="busy === r.id || (r.offer ? !canRemove : !canAdd)"
              class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
              :class="r.offer ? 'bg-primary' : 'bg-line-strong'" @click="toggle(r)">
              <span class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" :class="r.offer ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </li>
        </ul>
      </AzCard>
      <p class="text-sm text-ink-muted">{{ t('memberTypes.help') }}</p>
    </template>
  </div>
</template>
