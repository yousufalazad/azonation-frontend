<!-- Super Admin support inbox: every help request and Contact us message; read, answer, change status -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { statusTone, dateTime } from "@/views/Org/Support/support";
import { Inbox, Send, Mail } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();

const tab = ref("open");
const loading = ref(true);
const requests = ref([]);
const selected = ref(null);
const loadingOne = ref(false);
const reply = ref("");
const sending = ref(false);

const tabOptions = computed(() => ["open", "answered", "closed", "all"].map((s) => ({ value: s, label: s === "all" ? t("supportInbox.all") : t(`support.status_${s}`) })));
const statusOptions = computed(() => ["open", "answered", "closed"].map((s) => ({ value: s, label: t(`support.status_${s}`) })));

async function loadList() {
  loading.value = true;
  const res = await auth.fetchProtectedApi("/api/superadmin/support-requests", tab.value === "all" ? {} : { status: tab.value }, "GET");
  requests.value = res?.status ? res.data || [] : [];
  loading.value = false;
}

async function openRequest(r) {
  loadingOne.value = true;
  reply.value = "";
  const res = await auth.fetchProtectedApi(`/api/superadmin/support-requests/${r.id}`, {}, "GET");
  selected.value = res?.status ? res.data : null;
  loadingOne.value = false;
}

async function send() {
  const body = reply.value.trim();
  if (!body || sending.value || !selected.value) return;
  sending.value = true;
  try {
    const res = await auth.fetchProtectedApi(`/api/superadmin/support-requests/${selected.value.id}/messages`, { body }, "POST");
    if (res?.status) {
      selected.value = { ...selected.value, ...res.data };
      reply.value = "";
      toast.success(t("supportInbox.replied"));
      loadList();
    } else {
      toast.error(t("support.sendFailed"));
    }
  } finally {
    sending.value = false;
  }
}

async function setStatus(status) {
  if (!selected.value || status === selected.value.status) return;
  const res = await auth.fetchProtectedApi(`/api/superadmin/support-requests/${selected.value.id}/status`, { status }, "PUT");
  if (res?.status) {
    selected.value.status = status;
    loadList();
  } else {
    toast.error(t("profilePage.saveFailed"));
  }
}

watch(tab, loadList);
onMounted(loadList);
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <AzPageHeader :title="t('supportInbox.title')" :description="t('supportInbox.description')" />
    <div class="max-w-xl">
      <AzSegmented v-model="tab" :label="t('supportInbox.title')" :options="tabOptions" />
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <!-- List -->
      <AzCard :padded="false">
        <div v-if="loading" class="p-5"><AzSkeleton :lines="4" height="3rem" /></div>
        <AzEmptyState v-else-if="!requests.length" :title="t('supportInbox.emptyTitle')" :description="t('supportInbox.emptyText')">
          <template #icon><Inbox class="h-7 w-7" /></template>
        </AzEmptyState>
        <ul v-else class="divide-y divide-line">
          <li v-for="r in requests" :key="r.id">
            <button type="button" class="flex w-full flex-col gap-1 px-5 py-3 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
              :class="selected?.id === r.id ? 'bg-primary-soft/60' : ''" @click="openRequest(r)">
              <span class="flex items-center justify-between gap-3">
                <span class="truncate font-semibold text-ink">{{ r.subject }}</span>
                <AzBadge :tone="statusTone(r.status)">{{ t(`support.status_${r.status}`) }}</AzBadge>
              </span>
              <span class="truncate text-sm text-ink-muted">
                {{ r.org_name || r.name }} · {{ t(`support.category_${r.category}`) }} · {{ dateTime(r.last_activity_at || r.created_at, locale) }}
              </span>
            </button>
          </li>
        </ul>
      </AzCard>

      <!-- Conversation -->
      <AzCard v-if="loadingOne"><AzSkeleton :lines="4" height="3rem" /></AzCard>
      <AzCard v-else-if="!selected">
        <AzEmptyState :title="t('supportInbox.pickTitle')" :description="t('supportInbox.pickText')" />
      </AzCard>
      <AzCard v-else>
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-lg font-semibold text-ink">{{ selected.subject }}</h2>
              <p class="text-sm text-ink-muted">
                {{ selected.name }}<template v-if="selected.org_name"> · {{ selected.org_name }}</template>
                · {{ t(`support.category_${selected.category}`) }}
                · {{ selected.source === 'contact_form' ? t('supportInbox.fromContactForm') : t('supportInbox.fromApp') }}
              </p>
              <a :href="`mailto:${selected.email}?subject=${encodeURIComponent('Re: ' + selected.subject)}`" class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                <Mail class="h-4 w-4" aria-hidden="true" />{{ selected.email }}
              </a>
            </div>
            <div class="w-40">
              <AzSelect :model-value="selected.status" :label="t('billPage.status')" :options="statusOptions" @update:model-value="setStatus" />
            </div>
          </div>

          <ol class="flex flex-col gap-3 border-t border-line pt-4">
            <li v-for="m in selected.messages" :key="m.id" class="flex" :class="m.is_staff ? 'justify-end' : 'justify-start'">
              <div class="max-w-[85%] rounded-card px-4 py-3" :class="m.is_staff ? 'bg-primary-soft' : 'border border-line bg-surface'">
                <p class="mb-1 text-xs font-semibold" :class="m.is_staff ? 'text-primary-soft-ink' : 'text-primary'">
                  {{ m.is_staff ? t('support.team') : selected.name }} · <span class="font-normal">{{ dateTime(m.created_at, locale) }}</span>
                </p>
                <p class="whitespace-pre-line break-words text-[15px] text-ink">{{ m.body }}</p>
              </div>
            </li>
          </ol>

          <p v-if="selected.source === 'contact_form' && !selected.user_id" class="text-sm text-ink-muted">{{ t('supportInbox.noAccount') }}</p>
          <form class="flex flex-col gap-3 border-t border-line pt-4" novalidate @submit.prevent="send">
            <AzTextarea v-model="reply" :label="t('supportInbox.reply')" :rows="4" maxlength="5000" />
            <div class="flex justify-end">
              <AzButton type="submit" :loading="sending" :disabled="!reply.trim()">
                <template #icon><Send class="h-[18px] w-[18px]" /></template>
                {{ t('supportInbox.sendReply') }}
              </AzButton>
            </div>
          </form>
        </div>
      </AzCard>
    </div>
  </div>
</template>
