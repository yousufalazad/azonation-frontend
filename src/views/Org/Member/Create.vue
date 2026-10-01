<!-- Add member: find a person on Azonation (name, Azon ID, username, email or phone) and add them.
     Shows who is already a member, who left before, and what to do for people without an account. -->
<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { Search, UserPlus, Link2, Copy } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const query = ref("");
const results = ref([]);
const searching = ref(false);
const searched = ref(false);
const adding = ref(null);
let timer = null;

const nameOf = (p) => [p.first_name, p.last_name].filter(Boolean).join(" ") || p.username || p.azon_id;
const STATE_TONE = { member: "success", inactive: "warning", former: "neutral", not_eligible: "danger" };
const canAdd = (p) => !["member", "not_eligible"].includes(p.member_state);
const signupLink = computed(() => `${window.location.origin}/signup`);

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

async function add(p) {
  const ok = await confirm({
    title: t("addMember.confirmTitle", { name: nameOf(p) }),
    message: p.member_state === "former" ? t("addMember.confirmFormer") : t("addMember.confirmText"),
    confirmText: t("addMember.add"),
  });
  if (!ok) return;
  adding.value = p.id;
  try {
    const res = await auth.fetchProtectedApi("/api/org-members/create", { individual_type_user_id: p.id }, "POST");
    if (res?.status) {
      toast.success(t("addMember.added", { name: nameOf(p) }));
      // Open the new member so the membership type and number can be filled in
      router.push({ name: "index-member", query: { edit: res.data?.id } });
    } else {
      toast.error(res?.errors?.message || t("profilePage.saveFailed"));
    }
  } finally {
    adding.value = null;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(signupLink.value);
    toast.success(t("addMember.linkCopied"));
  } catch {
    toast.error(t("referralPage.copyFailed"));
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="t('addMember.title')" :description="t('addMember.description')" :back="{ name: 'index-member' }" :back-label="t('nav.members')" />

    <AzCard>
      <div class="relative">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input v-model="query" type="search" autofocus :placeholder="t('addMember.searchPlaceholder')" :aria-label="t('addMember.searchPlaceholder')" autocomplete="off"
          class="min-h-[52px] w-full rounded-control border border-line-strong bg-surface pl-11 pr-3 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <p class="mt-2 text-sm text-ink-muted">{{ t('addMember.searchHelp') }}</p>

      <div class="mt-4">
        <p v-if="query.trim().length > 0 && query.trim().length < 3" class="text-sm text-ink-muted">{{ t('adminPage.typeMore') }}</p>
        <AzSkeleton v-else-if="searching" :lines="3" height="3.5rem" />
        <AzEmptyState v-else-if="searched && !results.length" :title="t('addMember.noResultsTitle')" :description="t('addMember.noResultsText')" />
        <ul v-else-if="results.length" class="divide-y divide-line rounded-card border border-line">
          <li v-for="p in results" :key="p.id" class="flex items-center gap-3 px-4 py-3">
            <AzAvatar :name="nameOf(p)" :src="p.image_url || ''" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-ink">{{ nameOf(p) }}</p>
              <p class="truncate text-sm text-ink-muted">{{ [p.azon_id, p.username ? `@${p.username}` : '', p.city].filter(Boolean).join(' · ') }}</p>
            </div>
            <AzBadge v-if="p.member_state" :tone="STATE_TONE[p.member_state]">{{ t(`addMember.state_${p.member_state}`) }}</AzBadge>
            <AzButton v-if="canAdd(p)" variant="secondary" size="sm" :loading="adding === p.id" @click="add(p)">
              <template #icon><UserPlus class="h-4 w-4" /></template>{{ p.member_state === 'former' ? t('addMember.rejoin') : t('addMember.add') }}
            </AzButton>
          </li>
        </ul>
      </div>
    </AzCard>

    <!-- People who are not on Azonation -->
    <AzCard :title="t('addMember.noAccountTitle')">
      <div class="flex flex-col gap-4 text-sm text-ink-2">
        <div class="flex items-start gap-3">
          <Link2 class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <p>{{ t('addMember.inviteText') }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <code class="rounded-control bg-surface-2 px-2 py-1 text-ink">{{ signupLink }}</code>
              <AzButton variant="quiet" size="sm" @click="copyLink"><template #icon><Copy class="h-4 w-4" /></template>{{ t('referralPage.copyLink') }}</AzButton>
            </div>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <UserPlus class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p class="flex-1">{{ t('addMember.unlinkedText') }}
            <RouterLink :to="{ name: 'unlink-member' }" class="font-medium text-primary hover:underline">{{ t('nav.unlinkedMembers') }}</RouterLink>
          </p>
        </div>
      </div>
    </AzCard>
  </div>
</template>
