<!-- The bell in the header: unread count, the latest notifications, mark all read, and a link to all.
     Shared by organisations, members and the Super Admin. -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useAccountRoutes } from "@/composables/useAccountRoutes";
import { Bell } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const accountRoutes = useAccountRoutes();

const MAX_ITEMS = 10;
const notifications = ref([]);
const open = ref(false);
const tab = ref("all");
const panel = ref(null);
const button = ref(null);

const unreadCount = computed(() => notifications.value.filter((n) => n.read_at === null).length);
const badge = computed(() => (unreadCount.value > 99 ? "99+" : unreadCount.value));
const titleOf = (n) => n?.data?.title || n?.title || n?.data?.message || t("notificationsPage.untitled");
const messageOf = (n) => {
  const m = n?.data?.message || n?.data?.data || n?.message || "";
  return typeof m === "string" && m !== titleOf(n) ? m : "";
};
const tabOptions = computed(() => [{ value: "all", label: t("headerNotify.all") }, { value: "unread", label: t("headerNotify.unread", { n: unreadCount.value }) }]);

const timeAgo = (value) => {
  if (!value) return "";
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (diff < 60) return t("headerNotify.justNow");
  if (diff < 3600) return t("headerNotify.minutes", { n: Math.floor(diff / 60) });
  if (diff < 86400) return t("headerNotify.hours", { n: Math.floor(diff / 3600) });
  if (diff < 604800) return t("headerNotify.days", { n: Math.floor(diff / 86400) });
  return new Date(value).toLocaleDateString(locale.value === "bn" ? "bn-BD" : "en-GB");
};

// Unread first, then newest
const shown = computed(() => {
  const list = [...notifications.value].sort((a, b) => (a.read_at === null ? 0 : 1) - (b.read_at === null ? 0 : 1)
    || new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return (tab.value === "unread" ? list.filter((n) => n.read_at === null) : list).slice(0, MAX_ITEMS);
});

async function load() {
  const res = await auth.fetchProtectedApi("/api/notifications/get-all", {}, "GET");
  notifications.value = Array.isArray(res?.data) ? res.data : [];
}
async function markAll() {
  const res = await auth.fetchProtectedApi("/api/notifications/mark-all-as-read", {}, "POST");
  if (res?.status === true) {
    const now = new Date().toISOString();
    notifications.value = notifications.value.map((n) => ({ ...n, read_at: n.read_at || now }));
  }
}
function markOne(id) {
  notifications.value = notifications.value.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  auth.fetchProtectedApi(`/api/notifications/mark-as-read/${id}`, {}, "POST");
}

// Go to what the notification is about when it has an in-app link, otherwise to the notifications page
function openItem(n) {
  if (!n.read_at) markOne(n.id);
  open.value = false;
  const url = n?.data?.url || n?.data?.link;
  if (typeof url === "string" && url.startsWith("/")) router.push(url);
  else router.push({ name: accountRoutes.value.notifications, query: { id: n.id } });
}

function toggle() {
  open.value = !open.value;
  if (open.value) load();
}
const onOutside = (e) => {
  if (open.value && !panel.value?.contains(e.target) && !button.value?.contains(e.target)) open.value = false;
};
const onKey = (e) => {
  if (e.key === "Escape" && open.value) {
    open.value = false;
    button.value?.focus();
  }
};

// Keep the count fresh when moving between pages
watch(() => route.name, () => {
  open.value = false;
  load();
});
onMounted(() => {
  load();
  document.addEventListener("mousedown", onOutside);
  document.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onOutside);
  document.removeEventListener("keydown", onKey);
});
</script>

<template>
  <div class="relative">
    <button ref="button" type="button" class="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink"
      :aria-label="unreadCount ? t('headerNotify.buttonUnread', { n: unreadCount }) : t('notificationsPage.title')" :aria-expanded="open" @click="toggle">
      <Bell class="h-6 w-6" aria-hidden="true" />
      <span v-if="unreadCount" class="pointer-events-none absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white ring-2 ring-surface">{{ badge }}</span>
    </button>

    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-40 bg-overlay/30 sm:hidden" @click="open = false" />
    </transition>

    <transition name="fade">
      <div v-if="open" ref="panel" role="dialog" :aria-label="t('notificationsPage.title')"
        class="fixed left-4 right-4 top-16 z-50 flex max-h-[75vh] flex-col rounded-card border border-line bg-surface shadow-pop sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 sm:max-h-[28rem]">
        <div class="shrink-0 border-b border-line px-4 pb-3 pt-3">
          <div class="flex items-center justify-between gap-2">
            <span class="font-semibold text-ink">{{ t('notificationsPage.title') }}</span>
            <button v-if="unreadCount" type="button" class="text-sm font-medium text-primary hover:underline" @click="markAll">{{ t('headerNotify.markAll') }}</button>
          </div>
          <div class="mt-3"><AzSegmented v-model="tab" :label="t('notificationsPage.title')" :options="tabOptions" /></div>
        </div>

        <div class="flex-1 overflow-y-auto">
          <p v-if="!shown.length" class="p-5 text-center text-sm text-ink-muted">{{ tab === 'unread' ? t('headerNotify.noneUnread') : t('headerNotify.none') }}</p>
          <ul v-else class="flex flex-col gap-0.5 p-2">
            <li v-for="n in shown" :key="n.id">
              <button type="button" class="flex w-full items-start gap-3 rounded-control px-3 py-2 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none" @click="openItem(n)">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-primary-soft-ink">
                  <img v-if="n.data?.avatar" :src="n.data.avatar" class="h-full w-full object-cover" alt="" />
                  <Bell v-else class="h-4 w-4" aria-hidden="true" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center gap-2">
                    <span class="truncate text-sm" :class="n.read_at ? 'text-ink-2' : 'font-semibold text-ink'">{{ titleOf(n) }}</span>
                    <span v-if="!n.read_at" class="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-primary" :aria-label="t('headerNotify.new')" />
                  </span>
                  <span v-if="messageOf(n)" class="line-clamp-2 block text-[13px] text-ink-muted">{{ messageOf(n) }}</span>
                  <span class="mt-0.5 block text-[11px]" :class="n.read_at ? 'text-ink-muted' : 'font-medium text-primary'">{{ timeAgo(n.created_at) }}</span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <RouterLink :to="{ name: accountRoutes.notifications }" class="block shrink-0 rounded-b-card border-t border-line py-2.5 text-center text-sm font-medium text-primary hover:bg-surface-2" @click="open = false">
          {{ t('headerNotify.seeAll') }}
        </RouterLink>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
