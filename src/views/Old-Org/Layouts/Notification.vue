<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { authStore } from '@/store/authStore';

const auth = authStore;
const userId = auth.user.id;

const notifications = ref([]);
const isDropdownOpen = ref(false);

const dropdownRef = ref(null);
const buttonRef = ref(null);

const unreadCount = computed(() => notifications.value.filter(n => n.read_at === null).length);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

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
    const response = await auth.fetchProtectedApi(`/api/notifications/get-all/${userId}`, {}, 'GET');
    notifications.value = response.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

const markAllAsRead = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/notifications/mark-all-as-read/${userId}`, {}, 'GET');
    if (response.status) {
      notifications.value.forEach(n => n.read_at = new Date().toISOString());
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const markAsRead = async (notificationId) => {
  try {
    const response = await auth.fetchProtectedApi(`/api/notifications/mark-as-read/${userId}/${notificationId}`, {}, 'GET');
    if (response.status) {
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
    <button
      ref="buttonRef"
      @click="toggleDropdown"
      class="relative text-gray-600 hover:text-blue-700 focus:outline-none"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 17h5l-1.405-1.405M19 13a8 8 0 10-8 8 8 8 0 008-8z" />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium"
      >
        {{ unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <transition name="fade">
      <div
        v-if="isDropdownOpen"
        ref="dropdownRef"
        class="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg z-50"
      >
        <!-- Header -->
        <div class="flex justify-between items-center px-4 py-2 border-b">
          <span class="font-semibold text-sm">Notifications</span>
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-xs text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        </div>

        <!-- No Notifications -->
        <div v-if="notifications.length === 0" class="p-4 text-sm text-gray-500 italic">
          No notifications
        </div>

        <!-- Notification List -->
        <ul class="p-2 space-y-2">
          <li
            v-for="notification in notifications"
            :key="notification.id"
          >
            <a
              href="#"
              @click.prevent="markAsRead(notification.id)"
              :class="[
                'block px-3 py-2 rounded text-sm hover:bg-gray-100',
                notification.read_at ? 'text-gray-500' : 'text-blue-700 font-medium'
              ]"
            >
              {{ notification.data?.data || notification.message || 'Notification' }}
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
