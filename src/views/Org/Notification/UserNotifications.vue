<!-- How you want to be told about things: switch each channel (app, SMS, email, WhatsApp) on or off -->
<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { Smartphone, MessageSquare, Mail, MessageCircle, Bell } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

const channels = ref([]); // notification names
const mine = ref([]); // the channels switched on for this account
const busy = ref(null);
const loading = ref(true);

// A friendly icon and explanation for the channels we know by name
const iconFor = (name) => {
  const n = String(name || "").toLowerCase();
  if (n.includes("app")) return Smartphone;
  if (n.includes("sms")) return MessageSquare;
  if (n.includes("mail")) return Mail;
  if (n.includes("whatsapp")) return MessageCircle;
  return Bell;
};
const helpKey = (name) => {
  const n = String(name || "").toLowerCase();
  if (n.includes("app")) return "notifySettings.help_app";
  if (n.includes("sms")) return "notifySettings.help_sms";
  if (n.includes("mail")) return "notifySettings.help_email";
  if (n.includes("whatsapp")) return "notifySettings.help_whatsapp";
  return "";
};

const recordFor = (channelId) => mine.value.find((m) => String(m.notification_name_id) === String(channelId));

async function load() {
  const [names, subs] = await Promise.all([
    auth.fetchProtectedApi("/api/notification-names", {}, "GET"),
    auth.fetchProtectedApi("/api/user-notifications", {}, "GET"),
  ]);
  channels.value = names?.status ? names.data : [];
  mine.value = subs?.status ? subs.data : [];
}

// Switching changes straight away (no Save button)
async function toggle(channel) {
  if (busy.value) return;
  busy.value = channel.id;
  const rec = recordFor(channel.id);
  try {
    const res = rec
      ? await auth.fetchProtectedApi(`/api/user-notifications/${rec.id}`, {}, "DELETE")
      : await auth.fetchProtectedApi("/api/user-notifications", { notification_name_id: channel.id, is_active: 1 }, "POST");
    if (res?.status) {
      await load();
      toast.success(rec ? t("notifySettings.turnedOff", { name: channel.name }) : t("notifySettings.turnedOn", { name: channel.name }));
    } else {
      toast.error(t("profilePage.saveFailed"));
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
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('accountNav.notifications')" :description="t('notifySettings.description')">
      <AzButton variant="quiet" :to="{ name: 'notifications' }">{{ t('notifySettings.seeAll') }}</AzButton>
    </AzPageHeader>

    <AzSkeleton v-if="loading" :lines="4" height="4rem" />

    <AzCard v-else-if="!channels.length">
      <AzEmptyState :title="t('notifySettings.noneTitle')" :description="t('notifySettings.noneText')" />
    </AzCard>

    <AzCard v-else :padded="false">
      <ul class="divide-y divide-line">
        <li v-for="c in channels" :key="c.id" class="flex items-center gap-4 px-5 py-4">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-ink">
            <component :is="iconFor(c.name)" class="h-5 w-5" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1">
            <span :id="`channel-${c.id}`" class="block font-medium text-ink">{{ c.name }}</span>
            <span v-if="helpKey(c.name)" class="block text-sm text-ink-muted">{{ t(helpKey(c.name)) }}</span>
          </span>
          <!-- Switch -->
          <button type="button" role="switch" :aria-checked="!!recordFor(c.id)" :aria-labelledby="`channel-${c.id}`" :disabled="busy === c.id"
            class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
            :class="recordFor(c.id) ? 'bg-primary' : 'bg-line-strong'" @click="toggle(c)">
            <span class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" :class="recordFor(c.id) ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </li>
      </ul>
    </AzCard>
  </div>
</template>
