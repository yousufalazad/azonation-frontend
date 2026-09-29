<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';
import {
  MoreVertical, Bell, CheckCircle, ArrowLeft, ExternalLink, Clock, Inbox,
} from 'lucide-vue-next';

const auth = authStore;
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const notifications = ref([]);
const activeTab = ref('all'); // 'all' | 'unread'
const actionMenuOpen = ref(false);
const actionMenuRef = ref(null);
const actionBtnRef = ref(null);

/* ---------- Selected notification (right side) ---------- */
const selectedId = ref(route.query.id ?? null);
const selected = computed(() =>
  notifications.value.find(n => String(n.id) === String(selectedId.value)) || null
);

const unreadCount = computed(() => notifications.value.filter(n => n.read_at === null).length);

/* ---------- Helpers ---------- */
const getCategory = (n) => {
  const t = (n.category || n.type || n.data?.type || n.data?.category || n.title || n.message || '')
    .toString()
    .toLowerCase();

  if (t.includes('friend') && (t.includes('request') || t.includes('invite'))) return 'friend_request';
  if (t.includes('comment') || t.includes('react') || t.includes('like')) return 'engagement';
  if (t.includes('post') || t.includes('shared')) return 'posts';
  if (t.includes('event') || t.includes('meeting')) return 'events';
  if (t.includes('birthday')) return 'birthdays';
  return 'general';
};

const titleOf = (n) => n?.data?.title || n?.title || n?.data?.data || n?.message || 'Notification';
const messageOf = (n) => n?.data?.data || n?.data?.message || n?.message || '';
const linkOf = (n) => n?.data?.url || n?.data?.link || n?.url || null;
const labelOf = (c) => c.replaceAll('_', ' ');

const timeAgo = (value) => {
  if (!value) return '';
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} d ago`;
  return new Date(value).toLocaleDateString();
};

/** Extra primitive fields from n.data shown in the detail table */
const HIDDEN_KEYS = ['title', 'data', 'message', 'avatar', 'url', 'link', 'type', 'category'];
const extraFields = computed(() => {
  const d = selected.value?.data;
  if (!d || typeof d !== 'object') return [];
  return Object.entries(d).filter(
    ([k, v]) => !HIDDEN_KEYS.includes(k) && v !== null && v !== '' && typeof v !== 'object'
  );
});

/* ---------- API ---------- */
const fetchNotifications = async () => {
  try {
    loading.value = true;
    const res = await auth.fetchProtectedApi(`/api/notifications/get-all`, {}, 'GET');
    notifications.value = Array.isArray(res?.data) ? res.data : [];
  } catch (e) {
    console.error('fetchNotifications error:', e);
  } finally {
    loading.value = false;
  }
};

const markAllAsRead = async () => {
  try {
    const res = await auth.fetchProtectedApi(`/api/notifications/mark-all-as-read`, {}, 'POST');
    if (res?.status === true) {
      const now = new Date().toISOString();
      notifications.value = notifications.value.map(n => ({ ...n, read_at: n.read_at || now }));
    }
  } catch (e) {
    console.error('markAllAsRead error:', e);
  } finally {
    actionMenuOpen.value = false;
  }
};

const markAsRead = async (id) => {
  try {
    const res = await auth.fetchProtectedApi(`/api/notifications/mark-as-read/${id}`, {}, 'POST');
    if (res?.status === true) {
      notifications.value = notifications.value.map(n =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      );
    }
  } catch (e) {
    console.error('markAsRead error:', e);
  }
};

/* ---------- Action menu ---------- */
const toggleActionMenu = () => (actionMenuOpen.value = !actionMenuOpen.value);

const onOutsideClick = (e) => {
  if (
    actionMenuRef.value && !actionMenuRef.value.contains(e.target) &&
    actionBtnRef.value && !actionBtnRef.value.contains(e.target)
  ) {
    actionMenuOpen.value = false;
  }
};

const gotoSettings = () => {
  actionMenuOpen.value = false;
  window.location.href = '/settings/notifications';
};

/* ---------- Select / open ---------- */
const openItem = (n) => {
  selectedId.value = n.id;
  router.replace({ query: { ...route.query, id: n.id } });
  if (!n.read_at) markAsRead(n.id);
};

const closeDetail = () => {
  selectedId.value = null;
  const { id, ...rest } = route.query;
  router.replace({ query: rest });
};

const openLink = (n) => {
  const url = linkOf(n);
  if (!url) return;
  // In-app paths stay in the app; only http(s) links may open a new tab
  // (blocks javascript: and data: links coming from notification content)
  if (url.startsWith('/') && !url.startsWith('//')) router.push(url);
  else if (/^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener,noreferrer');
};

// Browser back/forward or manual URL change
// watch(() => route.query.id, (id) => { selectedId.value = id ?? null; });
// Browser back/forward, header click, or manual URL change
watch(() => route.query.id, (id) => {
  selectedId.value = id ?? null;
  const n = selected.value;
  if (n && !n.read_at) {
    // local update (header already called the API)
    notifications.value = notifications.value.map(x =>
      x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
    );
  }
});
onMounted(async () => {
  document.addEventListener('mousedown', onOutsideClick);
  await fetchNotifications();
  // If page opened with ?id=, mark that one as read
  if (selected.value && !selected.value.read_at) markAsRead(selected.value.id);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onOutsideClick);
});

/* ---------- List: sort, filter, sections ---------- */
const sortedAll = computed(() =>
  [...notifications.value].sort((a, b) => {
    const aUnread = a.read_at === null ? 0 : 1;
    const bUnread = b.read_at === null ? 0 : 1;
    if (aUnread !== bUnread) return aUnread - bUnread;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  })
);

const displayed = computed(() =>
  activeTab.value === 'unread' ? sortedAll.value.filter(n => n.read_at === null) : sortedAll.value
);

const useCategoryChips = ref(true);
const activeCategory = ref(''); // '' = all
const categories = computed(() => Array.from(new Set(displayed.value.map(getCategory))));

const isToday = (d) => {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};
const isRecent = (d) => Date.now() - d.getTime() < 24 * 60 * 60 * 1000;

const sections = computed(() => {
  const items = activeCategory.value
    ? displayed.value.filter(n => getCategory(n) === activeCategory.value)
    : displayed.value;

  const groups = { new: [], friend_requests: [], today: [], earlier: [] };

  items.forEach(n => {
    if (getCategory(n) === 'friend_request') return groups.friend_requests.push(n);
    const dt = n.created_at ? new Date(n.created_at) : null;
    if (!dt) return groups.earlier.push(n);
    if (isRecent(dt)) return groups.new.push(n);
    if (isToday(dt)) return groups.today.push(n);
    groups.earlier.push(n);
  });

  return [
    { key: 'new', title: 'New', list: groups.new },
    { key: 'friend_requests', title: 'Friend requests', list: groups.friend_requests },
    { key: 'today', title: 'Today', list: groups.today },
    { key: 'earlier', title: 'Earlier', list: groups.earlier },
  ].filter(s => s.list.length);
});
</script>

<template>
  <!-- -mb-[5.5rem]: cancel most of layout's pb-28 so the card fills to the bottom -->
  <div class="w-full -mb-[5.5rem]">
    <div
      class="bg-white rounded-xl shadow-sm border overflow-hidden grid grid-cols-1 md:grid-cols-[360px_1fr] lg:grid-cols-[400px_1fr] h-[calc(100vh-7rem)] min-h-[480px]"
    >
      <!-- ================= LEFT: LIST ================= -->
      <aside
        class="flex-col border-r min-h-0"
        :class="selected ? 'hidden md:flex' : 'flex'"
      >
        <!-- Header -->
        <div class="h-14 shrink-0 flex items-center justify-between px-4 border-b">
          <h1 class="text-base md:text-lg font-semibold text-gray-800">Notifications</h1>

          <div class="relative">
            <button
              ref="actionBtnRef"
              @click="toggleActionMenu"
              class="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Actions"
            >
              <MoreVertical class="w-5 h-5" />
            </button>

            <div
              v-if="actionMenuOpen"
              ref="actionMenuRef"
              class="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-10 overflow-hidden"
            >
              <button
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                @click="markAllAsRead"
              >
                <CheckCircle class="w-4 h-4" /> Mark all as read
              </button>
              <button
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                @click="gotoSettings"
              >
                <Bell class="w-4 h-4" /> Notification settings
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="px-4 pt-3 flex items-center gap-2">
          <button
            class="px-3 py-1.5 rounded-full text-sm"
            :class="activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="activeTab = 'all'"
          >
            All
          </button>
          <button
            class="px-3 py-1.5 rounded-full text-sm inline-flex items-center"
            :class="activeTab === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="activeTab = 'unread'"
          >
            Unread
            <span
              v-if="unreadCount"
              class="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700"
            >
              {{ unreadCount }}
            </span>
          </button>
        </div>

        <!-- Category chips (horizontal scroll) -->
        <div
          v-if="useCategoryChips && categories.length > 1"
          class="px-4 pt-2 pb-2 flex gap-2 overflow-x-auto no-scrollbar"
        >
          <button
            class="px-3 py-1 rounded-full text-xs whitespace-nowrap"
            :class="!activeCategory ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="activeCategory = ''"
          >
            All categories
          </button>
          <button
            v-for="c in categories"
            :key="c"
            class="px-3 py-1 rounded-full text-xs capitalize whitespace-nowrap"
            :class="activeCategory === c ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="activeCategory = c"
          >
            {{ labelOf(c) }}
          </button>
        </div>

        <!-- List (scrollable) -->
        <div class="flex-1 overflow-y-auto pb-4">
          <div v-if="loading" class="p-6 text-sm text-gray-500">Loading notifications…</div>

          <div v-else-if="!sections.length" class="p-6 text-sm text-gray-500 italic">
            No notifications
          </div>

          <section v-else v-for="section in sections" :key="section.key">
            <h2 class="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {{ section.title }}
            </h2>

            <ul>
              <li v-for="n in section.list" :key="n.id" class="px-2">
                <button
                  @click="openItem(n)"
                  class="w-full text-left flex items-start gap-3 px-2 py-3 rounded-lg transition"
                  :class="String(selectedId) === String(n.id) ? 'bg-blue-50' : 'hover:bg-gray-50'"
                >
                  <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                    <img v-if="n.data?.avatar" :src="n.data.avatar" class="w-full h-full object-cover" alt="" />
                    <Bell v-else class="w-4 h-4 text-gray-500" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center">
                      <span
                        class="text-sm truncate"
                        :class="n.read_at ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'"
                      >
                        {{ titleOf(n) }}
                      </span>
                      <span v-if="!n.read_at" class="ml-auto pl-2 shrink-0" aria-hidden="true">
                        <span class="block w-2.5 h-2.5 rounded-full bg-blue-600" />
                      </span>
                    </div>

                    <p class="text-[13px] text-gray-600 mt-0.5 line-clamp-2">{{ messageOf(n) }}</p>

                    <p
                      v-if="n.created_at"
                      class="text-[11px] mt-1"
                      :class="n.read_at ? 'text-gray-400' : 'text-blue-600 font-medium'"
                    >
                      {{ timeAgo(n.created_at) }}
                    </p>
                  </div>
                </button>
              </li>
            </ul>
          </section>
        </div>
      </aside>

      <!-- ================= RIGHT: DETAILS ================= -->
      <main
        class="flex-col min-h-0 bg-gray-50/40"
        :class="selected ? 'flex' : 'hidden md:flex'"
      >
        <!-- Empty state -->
        <div v-if="!selected" class="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
          <Inbox class="w-12 h-12 mb-3 text-gray-300" />
          <p class="font-medium text-gray-700">Select a notification</p>
          <p class="text-sm mt-1">Click any notification on the left to see its details here.</p>
        </div>

        <template v-else>
          <!-- Detail header -->
          <div class="h-14 shrink-0 flex items-center gap-2 px-4 md:px-6 border-b bg-white">
            <button
              class="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Back"
              @click="closeDetail"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <h2 class="text-base md:text-lg font-semibold text-gray-800">Notification details</h2>

            <span
              class="ml-auto text-xs px-2 py-0.5 rounded-full"
              :class="selected.read_at ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'"
            >
              {{ selected.read_at ? 'Read' : 'Unread' }}
            </span>
          </div>

          <!-- Detail body -->
          <div class="flex-1 overflow-y-auto p-4 md:p-8">
            <article class="bg-white border rounded-xl p-5 md:p-6 max-w-3xl">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <img v-if="selected.data?.avatar" :src="selected.data.avatar" class="w-full h-full object-cover" alt="" />
                  <Bell v-else class="w-6 h-6 text-gray-500" />
                </div>

                <div class="min-w-0">
                  <h3 class="text-lg md:text-xl font-semibold text-gray-900 break-words">
                    {{ titleOf(selected) }}
                  </h3>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span class="px-2 py-0.5 rounded-full bg-gray-100 capitalize">
                      {{ labelOf(getCategory(selected)) }}
                    </span>
                    <span v-if="selected.created_at" class="inline-flex items-center gap-1">
                      <Clock class="w-3.5 h-3.5" />
                      {{ new Date(selected.created_at).toLocaleString() }}
                      <template v-if="Date.now() - new Date(selected.created_at).getTime() < 604800000">
                        · {{ timeAgo(selected.created_at) }}
                      </template>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Full message -->
              <p
                v-if="messageOf(selected) && messageOf(selected) !== titleOf(selected)"
                class="mt-5 text-[15px] leading-relaxed text-gray-700 whitespace-pre-line break-words"
              >
                {{ messageOf(selected) }}
              </p>

              <!-- Extra data from payload -->
              <dl v-if="extraFields.length" class="mt-5 border-t pt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                <template v-for="[k, v] in extraFields" :key="k">
                  <dt class="text-gray-500 capitalize">{{ labelOf(k) }}</dt>
                  <dd class="text-gray-800 break-words">{{ v }}</dd>
                </template>
              </dl>

              <!-- Friend request actions -->
              <div v-if="getCategory(selected) === 'friend_request'" class="mt-6 flex gap-3">
                <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">Confirm</button>
                <button class="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300">Remove</button>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex flex-wrap gap-3">
                <button
                  v-if="linkOf(selected)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  @click="openLink(selected)"
                >
                  <ExternalLink class="w-4 h-4" /> Open
                </button>
                <button
                  v-if="!selected.read_at"
                  class="inline-flex items-center gap-2 px-4 py-2 border text-sm rounded-md hover:bg-gray-50"
                  @click="markAsRead(selected.id)"
                >
                  <CheckCircle class="w-4 h-4" /> Mark as read
                </button>
              </div>
            </article>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>