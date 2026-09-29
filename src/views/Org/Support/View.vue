<!-- One help request: the conversation with the Azonation team, reply, or mark it solved -->
<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { CheckCircle2, Send } from "lucide-vue-next";
import { statusTone, dateTime } from "./support";

const auth = authStore;
const route = useRoute();
const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const request = ref(null);
const reply = ref("");
const sending = ref(false);
const closing = ref(false);
const bottom = ref(null);

async function load() {
  const res = await auth.fetchProtectedApi(`/api/support-requests/${route.params.id}`, {}, "GET");
  request.value = res?.status ? res.data : null;
}

async function send() {
  const body = reply.value.trim();
  if (!body || sending.value) return;
  sending.value = true;
  try {
    const res = await auth.fetchProtectedApi(`/api/support-requests/${route.params.id}/messages`, { body }, "POST");
    if (res?.status) {
      request.value = res.data;
      reply.value = "";
      await nextTick();
      bottom.value?.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      toast.error(t("support.sendFailed"));
    }
  } finally {
    sending.value = false;
  }
}

async function markSolved() {
  const ok = await confirm({ title: t("support.solvedTitle"), message: t("support.solvedText"), confirmText: t("support.markSolved") });
  if (!ok) return;
  closing.value = true;
  try {
    const res = await auth.fetchProtectedApi(`/api/support-requests/${route.params.id}/close`, {}, "POST");
    if (res?.status) {
      request.value.status = "closed";
      toast.success(t("support.closed"));
    } else {
      toast.error(t("profilePage.saveFailed"));
    }
  } finally {
    closing.value = false;
  }
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="request?.subject || t('support.request')" :back="{ name: 'support' }" :back-label="t('support.title')">
      <AzButton v-if="request && request.status !== 'closed'" variant="secondary" :loading="closing" @click="markSolved">
        <template #icon><CheckCircle2 class="h-[18px] w-[18px]" /></template>
        {{ t('support.markSolved') }}
      </AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="4" height="4rem" />

    <AzCard v-else-if="!request">
      <AzEmptyState :title="t('support.notFoundTitle')" :description="t('support.notFoundText')">
        <AzButton variant="secondary" :to="{ name: 'support' }">{{ t('support.title') }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else>
      <div class="-mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <AzBadge :tone="statusTone(request.status)">{{ t(`support.status_${request.status}`) }}</AzBadge>
        <span>{{ t(`support.category_${request.category}`) }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ t('support.opened', { date: dateTime(request.created_at, locale) }) }}</span>
      </div>

      <!-- Conversation -->
      <ol class="flex flex-col gap-4" :aria-label="t('support.conversation')">
        <li v-for="m in request.messages" :key="m.id" class="flex" :class="m.is_staff ? 'justify-start' : 'justify-end'">
          <div class="max-w-[85%] rounded-card px-4 py-3" :class="m.is_staff ? 'border border-line bg-surface' : 'bg-primary-soft'">
            <p class="mb-1 text-xs font-semibold" :class="m.is_staff ? 'text-primary' : 'text-primary-soft-ink'">
              {{ m.is_staff ? t('support.team') : t('support.you') }} · <span class="font-normal">{{ dateTime(m.created_at, locale) }}</span>
            </p>
            <p class="whitespace-pre-line break-words text-[15px] text-ink">{{ m.body }}</p>
          </div>
        </li>
      </ol>
      <p v-if="request.status === 'open'" class="text-sm text-ink-muted">{{ t('support.waiting') }}</p>

      <!-- Reply -->
      <AzCard>
        <form ref="bottom" class="flex flex-col gap-3" novalidate @submit.prevent="send">
          <AzTextarea v-model="reply" :label="request.status === 'closed' ? t('support.reopenLabel') : t('support.replyLabel')" :rows="4" maxlength="5000" />
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm text-ink-muted">{{ request.status === 'closed' ? t('support.reopenHelp') : '' }}</p>
            <AzButton type="submit" :loading="sending" :disabled="!reply.trim()">
              <template #icon><Send class="h-[18px] w-[18px]" /></template>
              {{ t('support.send') }}
            </AzButton>
          </div>
        </form>
      </AzCard>
    </template>
  </div>
</template>
