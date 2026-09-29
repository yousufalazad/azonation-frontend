<!-- Help and support: ask the Azonation team for help and follow your requests -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { shortDate } from "@/helpers/billing";
import { LifeBuoy, Plus, MessageSquare } from "lucide-vue-next";
import { CATEGORIES, statusTone } from "./support";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const toast = useToast();

const loading = ref(true);
const requests = ref([]);
const showForm = ref(false);
const saving = ref(false);
const tried = ref(false);
const form = reactive({ category: "", subject: "", message: "" });

const categoryOptions = computed(() => CATEGORIES.map((c) => ({ value: c, label: t(`support.category_${c}`) })));
const errors = computed(() => ({
  category: tried.value && !form.category ? t("support.chooseCategory") : "",
  subject: tried.value && !form.subject.trim() ? t("support.subjectRequired") : "",
  message: tried.value && !form.message.trim() ? t("support.messageRequired") : "",
}));

const open = (r) => router.push({ name: "support-request", params: { id: r.id } });

function newRequest(category = "") {
  Object.assign(form, { category, subject: "", message: "" });
  tried.value = false;
  showForm.value = true;
}

async function submit() {
  tried.value = true;
  if (errors.value.category || errors.value.subject || errors.value.message || saving.value) return;
  saving.value = true;
  try {
    const res = await auth.fetchProtectedApi("/api/support-requests", { ...form, subject: form.subject.trim(), message: form.message.trim() }, "POST");
    if (res?.status) {
      showForm.value = false;
      toast.success(t("support.sent"));
      router.push({ name: "support-request", params: { id: res.data.id } });
    } else {
      toast.error(t("support.sendFailed"));
    }
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/support-requests", {}, "GET");
  requests.value = res?.status ? res.data || [] : [];
  loading.value = false;
  // Other pages link here with ?new=billing to start a request of that kind
  if (CATEGORIES.includes(route.query.new)) {
    newRequest(route.query.new);
    router.replace({ name: "support" });
  }
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('support.title')" :description="t('support.description')">
      <AzButton @click="newRequest()">
        <template #icon><Plus class="h-[18px] w-[18px]" /></template>
        {{ t('support.new') }}
      </AzButton>
    </AzPageHeader>

    <!-- Common reasons, one tap to start -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <button v-for="c in ['billing', 'account', 'problem', 'idea']" :key="c" type="button"
        class="flex flex-col items-start gap-1 rounded-card border border-line bg-surface p-4 text-left hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        @click="newRequest(c)">
        <span class="font-semibold text-ink">{{ t(`support.category_${c}`) }}</span>
        <span class="text-sm text-ink-muted">{{ t(`support.hint_${c}`) }}</span>
      </button>
    </div>

    <AzCard :padded="false">
      <template #header>
        <h2 class="text-lg font-semibold text-ink">{{ t('support.yourRequests') }}</h2>
      </template>
      <div v-if="loading" class="p-5"><AzSkeleton :lines="3" height="3rem" /></div>
      <AzEmptyState v-else-if="!requests.length" :title="t('support.emptyTitle')" :description="t('support.emptyText')">
        <template #icon><LifeBuoy class="h-7 w-7" /></template>
      </AzEmptyState>
      <ul v-else class="divide-y divide-line">
        <li v-for="r in requests" :key="r.id">
          <button type="button" class="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none" @click="open(r)">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-ink">
              <MessageSquare class="h-5 w-5" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-ink">{{ r.subject }}</span>
              <span class="block truncate text-sm text-ink-muted">
                {{ t(`support.category_${r.category}`) }} · {{ t('support.updated', { date: shortDate(r.last_activity_at || r.created_at, locale) }) }}
              </span>
            </span>
            <AzBadge :tone="statusTone(r.status)">{{ t(`support.status_${r.status}`) }}</AzBadge>
          </button>
        </li>
      </ul>
    </AzCard>

    <AzModal v-model:open="showForm" :title="t('support.new')" :description="t('support.newHelp')" size="lg">
      <form id="support-form" class="flex flex-col gap-5" novalidate @submit.prevent="submit">
        <AzSelect v-model="form.category" :label="t('support.category')" :options="categoryOptions" :placeholder="t('meetingForm.choose')" :error="errors.category" required />
        <AzInput v-model="form.subject" :label="t('support.subject')" :placeholder="t('support.subjectPlaceholder')" maxlength="150" :error="errors.subject" required autocomplete="off" />
        <AzTextarea v-model="form.message" :label="t('support.message')" :help="t('support.messageHelp')" :rows="6" maxlength="5000" :error="errors.message" required />
      </form>
      <template #footer>
        <AzButton variant="quiet" @click="showForm = false">{{ t('common.cancel') }}</AzButton>
        <AzButton type="submit" form="support-form" :loading="saving">{{ t('support.send') }}</AzButton>
      </template>
    </AzModal>
  </div>
</template>
