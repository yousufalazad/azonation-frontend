<!-- A member's renewal payments, newest first; a wrongly recorded one can be removed -->
<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { shortDate, money } from "@/helpers/billing";
import { Trash2 } from "lucide-vue-next";

const props = defineProps({
  member: { type: Object, required: true },
  currency: { type: String, default: "" },
  canDelete: { type: Boolean, default: false },
  canRecord: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "changed", "record"]);

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const rows = ref([]);

async function load() {
  const res = await auth.fetchProtectedApi("/api/org-membership-renewals", { individual_type_user_id: props.member.user_id }, "GET");
  rows.value = res?.status ? res.data || [] : [];
}

async function remove(r) {
  const ok = await confirm({ title: t("renewals.removeTitle"), message: t("renewals.removeText"), confirmText: t("common.delete"), danger: true });
  if (!ok) return;
  const res = await auth.fetchProtectedApi(`/api/org-membership-renewals/${r.id}`, {}, "DELETE");
  if (res?.status) {
    toast.success(t("renewals.removed"));
    await load();
    emit("changed");
  } else {
    toast.error(t("profilePage.saveFailed"));
  }
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <AzModal :open="true" :title="t('renewals.historyTitle', { name: member.name })" size="lg" @close="emit('close')">
    <AzSkeleton v-if="loading" :lines="3" height="3rem" />
    <AzEmptyState v-else-if="!rows.length" :title="t('renewals.noHistoryTitle')" :description="t('renewals.noHistoryText')" />
    <ul v-else class="divide-y divide-line">
      <li v-for="r in rows" :key="r.id" class="flex items-start gap-3 py-3">
        <div class="min-w-0 flex-1">
          <p class="font-medium text-ink">{{ shortDate(r.period_start, locale) }} – {{ shortDate(r.period_end, locale) }}</p>
          <p class="text-sm text-ink-muted">
            {{ [r.cycle_name, r.renewed_at ? t('renewals.paidOnDate', { date: shortDate(r.renewed_at, locale) }) : '', r.org_notes].filter(Boolean).join(' · ') }}
          </p>
          <AzBadge v-if="r.status !== 'completed'" class="mt-1" tone="warning">{{ r.status }}</AzBadge>
        </div>
        <p class="font-semibold tabular-nums text-ink">{{ money(r.amount_paid, { code: currency }) }}</p>
        <button v-if="canDelete" type="button" class="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-danger-soft hover:text-danger"
          :aria-label="t('renewals.removeTitle')" @click="remove(r)">
          <Trash2 class="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </li>
    </ul>
    <template #footer>
      <AzButton variant="quiet" @click="emit('close')">{{ t('common.close') }}</AzButton>
      <AzButton v-if="canRecord" @click="emit('record')">{{ t('renewals.record') }}</AzButton>
    </template>
  </AzModal>
</template>
