<!-- Notifications: newest first, unread marked; open one to read it (it is marked as read) -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { useToast } from "@/composables/useToast";
import { Bell, BellOff, CheckCheck, Settings2, ChevronDown, ExternalLink } from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const notifications = ref([]);
const loading = ref(true);
const tab = ref("all");
const openId = ref(null);

const titleOf = (n) => n?.data?.title || n?.title || n?.data?.message || t("notificationsPage.untitled");
const messageOf = (n) => {
  const m = n?.data?.message || n?.data?.data || n?.message || "";
  return typeof m === "string" && m !== titleOf(n) ? m : "";
};
// Links inside the app open in the app; other links must be ordinary web links
const linkOf = (n) => {
  const url = n?.data?.url || n?.data?.link || n?.url;
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("/")) return { internal: true, href: url };
  const safe = safeUrl(url);
  return safe ? { internal: false, href: safe } : null;
};

const isUnread = (n) => !n.read_at;
const unreadCount = computed(() => notifications.value.filter(isUnread).length);
const tabOptions = computed(() => [
  { value: "all", label: t("meetings.all") },
  { value: "unread", label: unreadCount.value ? t("notificationsPage.unreadN", { n: unreadCount.value }) : t("notificationsPage.unread") },
]);

const whenText = (v) => {
  if (!v) return "";
  const d = dayjs(v);
  const mins = dayjs().diff(d, "minute");
  if (mins < 1) return t("notificationsPage.justNow");
  if (mins < 60) return t("notificationsPage.minutesAgo", { n: mins });
  if (mins < 60 * 24) return t("notificationsPage.hoursAgo", { n: Math.floor(mins / 60) });
  if (mins < 60 * 24 * 7) return t("notificationsPage.daysAgo", { n: Math.floor(mins / 1440) });
  return d.format("D MMM YYYY");
};

// Grouped: Today / This week / Earlier
const groups = computed(() => {
  const list = [...notifications.value]
    .filter((n) => tab.value === "all" || isUnread(n))
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  const today = dayjs().startOf("day");
  const week = dayjs().subtract(7, "day");
  const out = [
    { key: "today", items: list.filter((n) => dayjs(n.created_at).isAfter(today)) },
    { key: "week", items: list.filter((n) => !dayjs(n.created_at).isAfter(today) && dayjs(n.created_at).isAfter(week)) },
    { key: "earlier", items: list.filter((n) => !dayjs(n.created_at).isAfter(week)) },
  ];
  return out.filter((g) => g.items.length);
});

async function load() {
  const res = await auth.fetchProtectedApi("/api/notifications/get-all", {}, "GET");
  notifications.value = Array.isArray(res?.data) ? res.data : [];
}

async function markRead(n) {
  if (!isUnread(n)) return;
  n.read_at = new Date().toISOString();
  const res = await auth.fetchProtectedApi(`/api/notifications/mark-as-read/${n.id}`, {}, "POST");
  if (!res?.status) n.read_at = null;
}

async function markAllRead() {
  const res = await auth.fetchProtectedApi("/api/notifications/mark-all-as-read", {}, "POST");
  if (res?.status) {
    const now = new Date().toISOString();
    notifications.value.forEach((n) => (n.read_at = n.read_at || now));
    toast.success(t("notificationsPage.allRead"));
  } else {
    toast.error(t("profilePage.saveFailed"));
  }
}

function toggle(n) {
  openId.value = openId.value === n.id ? null : n.id;
  markRead(n);
}

function follow(link) {
  if (link.internal) router.push(link.href);
  else window.open(link.href, "_blank", "noopener,noreferrer");
}

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="t('notificationsPage.title')" :description="t('notificationsPage.description')">
      <AzButton variant="quiet" :to="{ name: 'user-notifications' }">
        <template #icon><Settings2 class="h-[18px] w-[18px]" /></template>
        {{ t('notificationsPage.settings') }}
      </AzButton>
      <AzButton v-if="unreadCount" variant="secondary" @click="markAllRead">
        <template #icon><CheckCheck class="h-[18px] w-[18px]" /></template>
        {{ t('notificationsPage.markAllRead') }}
      </AzButton>
    </AzPageHeader>

    <div v-if="notifications.length" class="-mt-2 w-full max-w-xs">
      <AzSegmented v-model="tab" :label="t('notificationsPage.title')" :options="tabOptions" />
    </div>

    <AzSkeleton v-if="loading" :lines="5" height="4rem" />

    <AzCard v-else-if="!notifications.length">
      <AzEmptyState :title="t('notificationsPage.emptyTitle')" :description="t('notificationsPage.emptyText')">
        <template #icon><BellOff class="h-7 w-7" /></template>
      </AzEmptyState>
    </AzCard>

    <AzCard v-else-if="!groups.length">
      <AzEmptyState :title="t('notificationsPage.noUnreadTitle')" :description="t('notificationsPage.noUnreadText')" />
    </AzCard>

    <section v-for="g in groups" v-else :key="g.key" class="flex flex-col gap-2">
      <h2 class="px-1 text-sm font-semibold uppercase tracking-wide text-ink-muted">{{ t(`notificationsPage.group_${g.key}`) }}</h2>
      <AzCard :padded="false">
        <ul class="divide-y divide-line">
          <li v-for="n in g.items" :key="n.id">
            <button type="button" class="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
              :aria-expanded="openId === n.id" @click="toggle(n)">
              <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                :class="isUnread(n) ? 'bg-primary-soft text-primary-soft-ink' : 'bg-surface-2 text-ink-muted'">
                <Bell class="h-4 w-4" aria-hidden="true" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-[15px]" :class="isUnread(n) ? 'font-semibold text-ink' : 'text-ink-2'">{{ titleOf(n) }}</span>
                <span class="block text-sm text-ink-muted">{{ whenText(n.created_at) }}</span>
              </span>
              <span v-if="isUnread(n)" class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" :aria-label="t('notificationsPage.unread')" />
              <ChevronDown class="mt-1 h-4 w-4 shrink-0 text-ink-muted transition-transform" :class="openId === n.id ? 'rotate-180' : ''" aria-hidden="true" />
            </button>
            <div v-if="openId === n.id" class="flex flex-col gap-3 px-5 pb-4 pl-[4.25rem]">
              <p v-if="messageOf(n)" class="whitespace-pre-line text-[15px] text-ink-2">{{ messageOf(n) }}</p>
              <p class="text-sm text-ink-muted">{{ n.created_at ? dayjs(n.created_at).format('D MMM YYYY, h:mm A') : '' }}</p>
              <div v-if="linkOf(n)">
                <AzButton size="sm" variant="secondary" @click="follow(linkOf(n))">
                  <template #icon><ExternalLink class="h-4 w-4" /></template>
                  {{ t('notificationsPage.open') }}
                </AzButton>
              </div>
            </div>
          </li>
        </ul>
      </AzCard>
    </section>
  </div>
</template>
