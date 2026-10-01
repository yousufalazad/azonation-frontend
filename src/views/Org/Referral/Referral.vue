<!-- Refer and earn: your referral code and invite link, and the organisations that joined with it -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { shortDate } from "@/helpers/billing";
import { Copy, Share2, Gift, UserPlus, CheckCircle2 } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();

const loading = ref(true);
const stats = ref({});
const code = computed(() => stats.value.referral_code || "");
const link = computed(() => (code.value ? `${window.location.origin}/signup?ref=${encodeURIComponent(code.value)}` : ""));
const joined = computed(() => stats.value.successful_referrals || []);
const canShare = typeof navigator !== "undefined" && !!navigator.share;
// Organisations by their organisation name, people by first and last name
const joinedName = (u) => (u ? u.org_name || [u.first_name, u.last_name].filter(Boolean).join(" ") : "") || t("referralPage.someone");

async function copy(text, what) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(t("referralPage.copied", { what }));
  } catch {
    toast.error(t("referralPage.copyFailed"));
  }
}

async function share() {
  try {
    await navigator.share({ title: "Azonation", text: t("referralPage.shareText", { code: code.value }), url: link.value });
  } catch {
    // closed the share sheet
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/referrals/stats", {}, "GET");
  stats.value = res && !res.error ? res : {};
  loading.value = false;
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('accountNav.referral')" :description="t('referralPage.description')" />

    <AzSkeleton v-if="loading" :lines="5" height="3.5rem" />

    <template v-else>
      <AzCard v-if="code">
        <div class="flex flex-col gap-5">
          <div>
            <p class="text-sm text-ink-muted">{{ t('referralPage.yourCode') }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-3">
              <span class="rounded-control border border-dashed border-line-strong bg-surface-2 px-4 py-2 font-mono text-2xl font-semibold tracking-wider text-ink">{{ code }}</span>
              <AzButton variant="secondary" size="sm" @click="copy(code, t('referralPage.code'))">
                <template #icon><Copy class="h-4 w-4" /></template>
                {{ t('referralPage.copyCode') }}
              </AzButton>
            </div>
          </div>
          <div>
            <p class="text-sm text-ink-muted">{{ t('referralPage.inviteLink') }}</p>
            <div class="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input :value="link" readonly :aria-label="t('referralPage.inviteLink')"
                class="min-h-[48px] w-full min-w-0 flex-1 rounded-control border border-line bg-surface-2 px-3 text-sm text-ink-2" @focus="$event.target.select()" />
              <div class="flex gap-2">
                <AzButton @click="copy(link, t('referralPage.link'))">
                  <template #icon><Copy class="h-[18px] w-[18px]" /></template>
                  {{ t('referralPage.copyLink') }}
                </AzButton>
                <AzButton v-if="canShare" variant="secondary" @click="share">
                  <template #icon><Share2 class="h-[18px] w-[18px]" /></template>
                  {{ t('referralPage.share') }}
                </AzButton>
              </div>
            </div>
            <p class="mt-2 text-sm text-ink-muted">{{ t('referralPage.linkHelp') }}</p>
          </div>
        </div>
      </AzCard>
      <AzCard v-else>
        <AzEmptyState :title="t('referralPage.noCodeTitle')" :description="t('referralPage.noCodeText')">
          <AzButton variant="secondary" :to="{ name: 'support', query: { new: 'account' } }">{{ t('orgSettings.contactSupport') }}</AzButton>
        </AzEmptyState>
      </AzCard>

      <div class="grid gap-4 sm:grid-cols-3">
        <AzCard v-for="s in [
          { icon: UserPlus, label: t('referralPage.invited'), value: stats.total_referrals ?? 0 },
          { icon: CheckCircle2, label: t('referralPage.joined'), value: stats.completed_referrals ?? 0 },
          { icon: Gift, label: t('referralPage.rewards'), value: Number(stats.total_rewards || 0).toLocaleString('en-US') },
        ]" :key="s.label">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-soft-ink"><component :is="s.icon" class="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <p class="text-sm text-ink-muted">{{ s.label }}</p>
              <p class="text-2xl font-semibold tabular-nums text-ink">{{ s.value }}</p>
            </div>
          </div>
        </AzCard>
      </div>

      <AzCard :padded="false">
        <template #header>
          <h2 class="text-lg font-semibold text-ink">{{ t('referralPage.whoJoined') }}</h2>
        </template>
        <AzEmptyState v-if="!joined.length" :title="t('referralPage.noneTitle')" :description="t('referralPage.noneText')" />
        <ul v-else class="divide-y divide-line">
          <li v-for="r in joined" :key="r.id" class="flex items-center gap-3 px-5 py-3">
            <AzAvatar :name="joinedName(r.referred_user)" size="sm" />
            <span class="min-w-0 flex-1 truncate font-medium text-ink">{{ joinedName(r.referred_user) }}</span>
            <span class="text-sm text-ink-muted">{{ shortDate(r.created_at, locale) }}</span>
          </li>
        </ul>
      </AzCard>

      <AzCard>
        <h2 class="text-lg font-semibold text-ink">{{ t('referralPage.howTitle') }}</h2>
        <ol class="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-ink-2">
          <li>{{ t('referralPage.how1') }}</li>
          <li>{{ t('referralPage.how2') }}</li>
          <li>{{ t('referralPage.how3') }}</li>
        </ol>
      </AzCard>
    </template>
  </div>
</template>
