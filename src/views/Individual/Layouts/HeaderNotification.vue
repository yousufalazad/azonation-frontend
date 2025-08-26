<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { authStore } from '@/store/authStore';
import { Bell } from 'lucide-vue-next';

const auth = authStore;
const notifications = ref([]);
const isDropdownOpen = ref(false);
const activeTab = ref('all'); // 'all' | 'unread'

const dropdownRef = ref(null);
const buttonRef = ref(null);

const unreadCount = computed(() => notifications.value.filter(n => n.read_at === null).length);

// Unread-first ordering for "All", and filter when "Unread" tab is active
const displayedNotifications = computed(() => {
  const list = [...notifications.value];

  // optional: secondary sort by created_at desc if present
  list.sort((a, b) => {
    // unread first
    const aUnread = a.read_at === null ? 0 : 1;
    const bUnread = b.read_at === null ? 0 : 1;
    if (aUnread !== bUnread) return aUnread - bUnread;

    // then newest first (if created_at exists)
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  if (activeTab.value === 'unread') {
    return list.filter(n => n.read_at === null);
  }
  return list;
});

const toggleDropdown = () => { isDropdownOpen.value = !isDropdownOpen.value; };

const handleClickOutside = (event) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target) &&
    buttonRef.value &&
    !buttonRef.value.contains(event.target)
  ) {
    isDropdownOpen.value = false;
  }
};

const fetchNotifications = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/notifications/get-all`, {}, 'GET');
    notifications.value = response.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

const markAllAsRead = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/notifications/mark-all-as-read`, {}, 'POST');
    if (response.status === true) {
      notifications.value.forEach(n => (n.read_at = new Date().toISOString()));
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const markAsRead = async (notificationId) => {
  try {
    const response = await auth.fetchProtectedApi(`/api/notifications/mark-as-read/${notificationId}`, {}, 'POST');
    if (response.status === true) {
      notifications.value = notifications.value.map(n =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      );
    }
  } catch (error) {
    console.error('Error marking as read:', error);
  }
};

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
    <button ref="buttonRef" @click="toggleDropdown"
      class="relative text-gray-600 hover:text-blue-700 focus:outline-none">
      <Bell class="w-6 h-6 mt-1" />
      <!-- Badge: offset so it doesn't cover the bell -->
      <span v-if="unreadCount > 0" class="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-red-500 text-white text-[10px] min-w-[1.1rem] h-[1.1rem] px-[2px]
               rounded-full flex items-center justify-center font-medium ring-2 ring-white pointer-events-none">
        {{ unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <transition name="fade">
      <div v-if="isDropdownOpen" ref="dropdownRef"
        class="absolute right-0 mt-2 w-96 max-h-[28rem] overflow-y-auto bg-white shadow-lg rounded-xl z-50">
        <!-- Header -->
        <div class="px-4 pt-3 pb-2 border-b">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-sm">Notifications</span>

            <div class="flex items-center gap-4">
              <!-- See all -->
              <a href="/individual-dashboard/notifications" class="text-xs text-blue-600 hover:underline">See all</a>
              <!-- Mark all as read -->
              <button v-if="unreadCount > 0" @click="markAllAsRead" class="text-xs text-blue-600 hover:underline">
                Mark all as read
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mt-3 flex gap-2">
            <button class="px-3 py-1.5 rounded-full text-xs" :class="activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'" @click="activeTab = 'all'">
              All
            </button>
            <button class="px-3 py-1.5 rounded-full text-xs" :class="activeTab === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'" @click="activeTab = 'unread'">
              Unread
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="displayedNotifications.length === 0" class="p-4 text-sm text-gray-500 italic">
          No notifications
        </div>

        <!-- Notification List -->
        <ul v-else class="p-2 space-y-1">
          <li v-for="n in displayedNotifications" :key="n.id" class="rounded-lg hover:bg-gray-50">
            <a href="#" @click.prevent="markAsRead(n.id)" class="flex items-start gap-3 px-3 py-2">
              <!-- (Optional) Avatar or icon slot could go here -->

              <div class="flex-1 min-w-0">
                <!-- Title bold; fallbacks: data.title, title, message -->
                <div class="flex items-center">
                  <span
                    :class="['text-sm truncate', n.read_at ? 'font-medium text-gray-700' : 'font-semibold text-gray-900']">
                    {{ n.data?.title || n.title || n.data?.data || n.message || 'Notification' }}
                  </span>

                  <!-- Unread dot on the right -->
                  <span v-if="!n.read_at" class="ml-2 w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"
                    aria-hidden="true" />
                </div>

                <!-- Preview / secondary line -->
                <p class="text-[13px] text-gray-600 mt-0.5 line-clamp-2">
                  {{ n.data?.data || n.message || '' }}
                </p>

                <!-- (Optional) meta/time row if you pass created_at -->
                <p v-if="n.created_at" class="text-[11px] text-gray-400 mt-1">
                  {{ new Date(n.created_at).toLocaleString() }}
                </p>
              </div>
            </a>
          </li>
        </ul>
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
</style>
