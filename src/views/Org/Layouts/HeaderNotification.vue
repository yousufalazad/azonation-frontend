<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '@/store/authStore';
import { useAccountRoutes } from '@/composables/useAccountRoutes';
import { Bell } from 'lucide-vue-next';

const auth = authStore;
const route = useRoute();
const router = useRouter();

// Organisations, members and the Super Admin each have their own notifications page
const accountRoutes = useAccountRoutes();
const MAX_ITEMS = 10;

const notifications = ref([]);
const isDropdownOpen = ref(false);
const activeTab = ref('all'); // 'all' | 'unread'

const dropdownRef = ref(null);
const buttonRef = ref(null);

const unreadCount = computed(() => notifications.value.filter(n => n.read_at === null).length);
const badgeText = computed(() => (unreadCount.value > 99 ? '99+' : unreadCount.value));

const titleOf = (n) => n?.data?.title || n?.title || n?.data?.data || n?.message || 'Notification';
const messageOf = (n) => n?.data?.data || n?.data?.message || n?.message || '';

const timeAgo = (value) => {
  if (!value) return '';
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} d ago`;
  return new Date(value).toLocaleDateString();
};

// Unread first, then newest first; filter for "Unread" tab; limit to MAX_ITEMS
const displayedNotifications = computed(() => {
  const list = [...notifications.value].sort((a, b) => {
    const aUnread = a.read_at === null ? 0 : 1;
    const bUnread = b.read_at === null ? 0 : 1;
    if (aUnread !== bUnread) return aUnread - bUnread;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  const filtered = activeTab.value === 'unread' ? list.filter(n => n.read_at === null) : list;
  return filtered.slice(0, MAX_ITEMS);
});

const fetchNotifications = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/notifications/get-all`, {}, 'GET');
    notifications.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

const markAllAsRead = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/notifications/mark-all-as-read`, {}, 'POST');
    if (response?.status === true) {
      const now = new Date().toISOString();
      notifications.value = notifications.value.map(n => ({ ...n, read_at: n.read_at || now }));
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const markAsRead = async (notificationId) => {
  try {
    const response = await auth.fetchProtectedApi(`/api/notifications/mark-as-read/${notificationId}`, {}, 'POST');
    if (response?.status === true) {
      notifications.value = notifications.value.map(n =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      );
    }
  } catch (error) {
    console.error('Error marking as read:', error);
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) fetchNotifications(); // খুললেই fresh data
};

const closeDropdown = () => { isDropdownOpen.value = false; };

// Click a notification → mark read + go to details page (right panel)
const openNotification = (n) => {
  if (!n.read_at) markAsRead(n.id);
  closeDropdown();
  router.push({ name: accountRoutes.value.notifications, query: { id: n.id } });
};

const handleClickOutside = (event) => {
  if (
    dropdownRef.value && !dropdownRef.value.contains(event.target) &&
    buttonRef.value && !buttonRef.value.contains(event.target)
  ) {
    closeDropdown();
  }
};

// পেজ বদলালে dropdown বন্ধ + badge sync
watch(() => route.fullPath, () => {
  closeDropdown();
  fetchNotifications();
});

onMounted(() => {
  fetchNotifications();
  document.addEventListener('mousedown', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <div class="relative">
    <!-- Notification Button -->
    <button
      ref="buttonRef"
      @click="toggleDropdown"
      class="relative text-gray-600 hover:text-blue-700 focus:outline-none p-1"
      aria-label="Notifications"
    >
      <Bell class="w-6 h-6 mt-1" />
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-red-500 text-white text-[10px] min-w-[1.1rem] h-[1.1rem] px-[3px]
               rounded-full flex items-center justify-center font-medium ring-2 ring-white pointer-events-none"
      >
        {{ badgeText }}
      </span>
    </button>

    <!-- Mobile backdrop -->
    <transition name="fade">
      <div v-if="isDropdownOpen" class="fixed inset-0 z-40 bg-black/20 sm:hidden" @click="closeDropdown" />
    </transition>

    <!-- Dropdown -->
    <transition name="fade">
      <div
        v-if="isDropdownOpen"
        ref="dropdownRef"
        class="fixed left-4 right-4 top-16 z-50 max-h-[75vh] flex flex-col bg-white shadow-lg rounded-xl
               sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 sm:max-h-[28rem]"
      >
        <!-- Header -->
        <div class="px-4 pt-3 pb-2 border-b shrink-0">
          <div class="flex items-center justify-between gap-2">
            <span class="font-semibold text-sm">Notifications</span>
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-xs text-blue-600 hover:underline whitespace-nowrap"
            >
              Mark all as read
            </button>
          </div>

          <!-- Tabs -->
          <div class="mt-3 flex gap-2">
            <button
              class="px-3 py-1.5 rounded-full text-xs"
              :class="activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="activeTab = 'all'"
            >
              All
            </button>
            <button
              class="px-3 py-1.5 rounded-full text-xs inline-flex items-center"
              :class="activeTab === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="activeTab = 'unread'"
            >
              Unread
              <span
                v-if="unreadCount"
                class="ml-1.5 min-w-[1rem] h-4 px-1 text-[10px] rounded-full inline-flex items-center justify-center"
                :class="activeTab === 'unread' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-700'"
              >
                {{ badgeText }}
              </span>
            </button>
          </div>
        </div>

        <!-- List (scrollable) -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="displayedNotifications.length === 0" class="p-4 text-sm text-gray-500 italic">
            No notifications
          </div>

          <ul v-else class="p-2 space-y-1">
            <li v-for="n in displayedNotifications" :key="n.id">
              <button
                type="button"
                @click="openNotification(n)"
                class="w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <div class="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
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
        </div>

        <!-- Footer: See all -->
        <div class="border-t shrink-0">
          <router-link
            :to="{ name: accountRoutes.notifications }"
            @click="closeDropdown"
            class="block text-center text-sm text-blue-600 hover:bg-gray-50 py-2.5 rounded-b-xl"
          >
            See all notifications
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
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