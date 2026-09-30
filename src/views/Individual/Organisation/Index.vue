<!-- The organisations a member belongs to (and used to), with their membership details -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { shortDate } from "@/helpers/billing";
import { Building2, Copy } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();

const loading = ref(true);
const rows = ref([]);
const current = computed(() => rows.value.filter((r) => r.is_active));
const former = computed(() => rows.value.filter((r) => !r.is_active));
const azonId = computed(() => auth.user?.azon_id || "");

const statusTone = (s) => ({ Active: "success", "On hold": "warning", Suspended: "danger", Inactive: "neutral" })[s] || "neutral";

async function copyId() {
  try {
    await navigator.clipboard.writeText(azonId.value);
    toast.success(t("memberHome.idCopied"));
  } catch {
    toast.error(t("referralPage.copyFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/connected-org-list", {}, "GET");
  rows.value = res?.status ? res.data || [] : [];
  loading.value = false;
});
// Fee dates are compared as YYYY-MM-DD
const today = new Date().toISOString().slice(0, 10);
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('memberOrgs.title')" :description="t('memberOrgs.description')" />

    <AzCard v-if="azonId">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-semibold text-ink">{{ t('memberOrgs.joinTitle') }}</p>
          <p class="text-sm text-ink-muted">{{ t('memberOrgs.joinText') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-control border border-dashed border-line-strong bg-surface-2 px-3 py-1.5 font-mono font-semibold text-ink">{{ azonId }}</span>
          <AzButton variant="secondary" size="sm" @click="copyId"><template #icon><Copy class="h-4 w-4" /></template>{{ t('memberHome.copyId') }}</AzButton>
        </div>
      </div>
    </AzCard>

    <AzSkeleton v-if="loading" :lines="4" height="4rem" />

    <template v-else>
      <AzCard v-if="!rows.length">
        <AzEmptyState :title="t('memberHome.noOrgTitle')" :description="t('memberHome.noOrgText')">
          <template #icon><Building2 class="h-7 w-7" /></template>
        </AzEmptyState>
      </AzCard>

      <AzCard v-if="current.length" :title="t('memberOrgs.current')" :padded="false">
        <ul class="divide-y divide-line">
          <li v-for="o in current" :key="o.org_id" class="flex items-center gap-4 px-5 py-4">
            <AzAvatar :src="o.logo_url || ''" :name="o.org_name" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-ink">{{ o.org_name }}</p>
              <p class="truncate text-sm text-ink-muted">
                {{ [o.membership_type, o.membership_id ? t('memberHome.memberNo', { id: o.membership_id }) : '', o.member_since ? t('memberHome.since', { date: shortDate(o.member_since, locale) }) : ''].filter(Boolean).join(' · ') }}
              </p>
              <p v-if="o.paid_until" class="truncate text-sm" :class="o.paid_until < today ? 'text-danger' : 'text-success'">
                {{ t(o.paid_until < today ? 'memberOrgs.feeEnded' : 'memberOrgs.paidUntil', { date: shortDate(o.paid_until, locale) }) }}
              </p>
            </div>
            <AzBadge v-if="o.membership_status" :tone="statusTone(o.membership_status)">{{ o.membership_status }}</AzBadge>
          </li>
        </ul>
      </AzCard>

      <AzCard v-if="former.length" :title="t('memberOrgs.former')" :padded="false">
        <ul class="divide-y divide-line">
          <li v-for="o in former" :key="o.org_id" class="flex items-center gap-4 px-5 py-4">
            <AzAvatar :src="o.logo_url || ''" :name="o.org_name" muted />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-ink-2">{{ o.org_name }}</p>
              <p class="truncate text-sm text-ink-muted">{{ o.membership_type || '—' }}</p>
            </div>
          </li>
        </ul>
      </AzCard>
    </template>
  </div>
</template>
