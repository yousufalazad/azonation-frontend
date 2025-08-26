<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { authStore } from '../../../store/authStore';
import { MoreVertical, Bell, CheckCircle } from 'lucide-vue-next';

const auth = authStore;

const loading = ref(false);
const notifications = ref([]);
const activeTab = ref('all'); // 'all' | 'unread'
const actionMenuOpen = ref(false);
const actionMenuRef = ref(null);
const actionBtnRef = ref(null);

const unreadCount = computed(() => notifications.value.filter(n => n.read_at === null).length);

/**
 * Heuristic category mapping (adjust to your payload).
 * If your backend sends a `type` or `category` field, prefer that directly.
 */
const getCategory = (n) => {
  const t =
    (n.category || n.type || n.data?.type || n.data?.category || n.title || n.message || '')
      .toString()
      .toLowerCase();

  if (t.includes('friend') && (t.includes('request') || t.includes('invite'))) return 'friend_request';
  if (t.includes('comment') || t.includes('react') || t.includes('like')) return 'engagement';
  if (t.includes('post') || t.includes('shared')) return 'posts';
  if (t.includes('event') || t.includes('meeting')) return 'events';
  if (t.includes('birthday')) return 'birthdays';
  return 'general';
};

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
      notifications.value.forEach(n => (n.read_at = new Date().toISOString()));
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

const toggleActionMenu = () => (actionMenuOpen.value = !actionMenuOpen.value);

const onOutsideClick = (e) => {
  if (
    actionMenuRef.value &&
    !actionMenuRef.value.contains(e.target) &&
    actionBtnRef.value &&
    !actionBtnRef.value.contains(e.target)
  ) {
    actionMenuOpen.value = false;
  }
};

onMounted(() => {
  fetchNotifications();
  document.addEventListener('mousedown', onOutsideClick);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onOutsideClick);
});

/** Sort by unread first, then by date desc */
const sortedAll = computed(() => {
  const list = [...notifications.value];
  return list.sort((a, b) => {
    const aUnread = a.read_at === null ? 0 : 1;
    const bUnread = b.read_at === null ? 0 : 1;
    if (aUnread !== bUnread) return aUnread - bUnread;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
});

const displayed = computed(() => {
  if (activeTab.value === 'unread') {
    return sortedAll.value.filter(n => n.read_at === null);
  }
  return sortedAll.value;
});

/** Date helpers for sections */
const isToday = (d) => {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};
const isRecent = (d) => {
  // "New" = last 24h (but not strictly today if it's from last night)
  const diff = Date.now() - d.getTime();
  return diff < 24 * 60 * 60 * 1000;
};

/** Build grouped sections similar to FB:
 * New (unread first anyway),
 * Friend requests (special slab),
 * Today,
 * Earlier
 */
const sections = computed(() => {
  const items = displayed.value;

  // Friend requests (optional slab)
  const friendRequests = items.filter(n => getCategory(n) === 'friend_request');

  // New (last 24h, excluding friend requests to avoid duplication)
  const newItems = items.filter(n => {
    const dt = n.created_at ? new Date(n.created_at) : null;
    if (!dt) return false;
    return isRecent(dt) && getCategory(n) !== 'friend_request';
  });

  // Today (today but not in "new" and not friend requests)
  const todayItems = items.filter(n => {
    const dt = n.created_at ? new Date(n.created_at) : null;
    if (!dt) return false;
    return isToday(dt) && !isRecent(dt) && getCategory(n) !== 'friend_request';
  });

  // Earlier (everything else not in friend requests)
  const earlierItems = items.filter(n => {
    const dt = n.created_at ? new Date(n.created_at) : null;
    if (!dt) return true;
    return !isToday(dt) && !isRecent(dt) && getCategory(n) !== 'friend_request';
  });

  const result = [];
  if (newItems.length) result.push({ key: 'new', title: 'New', list: newItems });
  if (friendRequests.length) result.push({ key: 'friend_requests', title: 'Friend requests', list: friendRequests });
  if (todayItems.length) result.push({ key: 'today', title: 'Today', list: todayItems });
  if (earlierItems.length) result.push({ key: 'earlier', title: 'Earlier', list: earlierItems });
  if (!result.length) result.push({ key: 'empty', title: '', list: [] });
  return result;
});

/** Optional category chips (quick filters) */
const useCategoryChips = ref(true);
const categories = computed(() => {
  const all = displayed.value.map(getCategory);
  const uniq = Array.from(new Set(all));
  return uniq;
});
const activeCategory = ref(''); // '' means all
const filteredByCategory = (list) => {
  if (!activeCategory.value) return list;
  return list.filter(n => getCategory(n) === activeCategory.value);
};

const gotoSettings = () => {
  actionMenuOpen.value = false;
  // Adjust route as needed
  window.location.href = '/settings/notifications';
};

const openItem = (n) => {
  // Replace with deep-link from your payload (n.data?.url, n.url, etc.)
  // For now just mark as read.
  if (!n.read_at) markAsRead(n.id);
};
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 md:p-6">
    <!-- Page header -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="flex items-center justify-between px-4 md:px-6 py-4 border-b">
        <h1 class="text-lg md:text-xl font-semibold">Notifications</h1>

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
             <CheckCircle class="w-4 h-4" />
              Mark all as read
            </button>
            <button
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              @click="gotoSettings"
            >
              <Bell class="w-4 h-4" />
              Notification settings
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="px-4 md:px-6 pt-3 pb-2 flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded-full text-xs md:text-sm"
          :class="activeTab === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="activeTab = 'all'"
        >
          All
        </button>
        <button
          class="px-3 py-1.5 rounded-full text-xs md:text-sm"
          :class="activeTab === 'unread'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="activeTab = 'unread'"
        >
          Unread
          <span v-if="unreadCount" class="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">
            {{ unreadCount }}
          </span>
        </button>

        <!-- Category chips (optional) -->
        <div v-if="useCategoryChips && categories.length" class="ml-auto flex flex-wrap gap-2">
          <button
            class="px-3 py-1.5 rounded-full text-xs"
            :class="!activeCategory
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="activeCategory = ''"
          >
            All categories
          </button>
          <button
            v-for="c in categories"
            :key="c"
            class="px-3 py-1.5 rounded-full text-xs capitalize"
            :class="activeCategory === c
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="activeCategory = c"
          >
            {{ c.replace('_', ' ') }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="px-2 md:px-4 pb-4">
        <!-- Loading -->
        <div v-if="loading" class="p-6 text-sm text-gray-500">Loading notifications…</div>

        <!-- Empty -->
        <div v-else-if="!sections.length || (sections.length === 1 && sections[0].list.length === 0)" class="p-6 text-sm text-gray-500 italic">
          No notifications
        </div>

        <!-- Sections -->
        <div v-else class="space-y-4">
          <section
            v-for="section in sections"
            :key="section.key"
            v-show="filteredByCategory(section.list).length > 0 || section.key === 'empty'"
            class="bg-white"
          >
            <h2 v-if="section.title" class="px-4 md:px-6 pt-4 text-sm font-semibold text-gray-700">
              {{ section.title }}
            </h2>

            <ul class="mt-1">
              <li
                v-for="n in filteredByCategory(section.list)"
                :key="n.id"
                class="px-3 md:px-6"
              >
                <button
                  @click="openItem(n)"
                  class="w-full text-left flex items-start gap-3 md:gap-4 py-3 rounded-lg hover:bg-gray-50"
                >
                  <!-- Avatar / left icon (optional) -->
                  <div class="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    <img
                      v-if="n.data?.avatar"
                      :src="n.data.avatar"
                      class="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center">
                      <span
                        :class="[
                          'text-sm md:text-[15px] truncate',
                          n.read_at ? 'font-medium text-gray-800' : 'font-semibold text-gray-900'
                        ]"
                      >
                        {{ n.data?.title || n.title || n.data?.data || n.message || 'Notification' }}
                      </span>

                      <!-- unread dot -->
                      <span
                        v-if="!n.read_at"
                        class="ml-2 w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"
                        aria-hidden="true"
                      />
                    </div>

                    <p class="text-[13px] text-gray-600 mt-0.5 line-clamp-2">
                      {{ n.data?.data || n.message || '' }}
                    </p>

                    <p v-if="n.created_at" class="text-[11px] text-gray-400 mt-1">
                      {{ new Date(n.created_at).toLocaleString() }}
                    </p>

                    <!-- Friend request actions (optional UI only) -->
                    <div v-if="getCategory(n) === 'friend_request'" class="mt-3 flex gap-3">
                      <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                        Confirm
                      </button>
                      <button class="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300">
                        Remove
                      </button>
                    </div>
                  </div>
                </button>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* line clamp utility if not in Tailwind plugin */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
