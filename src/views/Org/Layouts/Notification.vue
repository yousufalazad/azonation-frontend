<!-- --- Notification.vue --- -->
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
    const response = await auth.fetchPublicApi(`/api/notifications/get-all/${userId}`, {}, 'GET');
    notifications.value = response.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

const markAllAsRead = async () => {
  try {
    const response = await auth.fetchPublicApi(`/api/notifications/mark-all-as-read/${userId}`, {}, 'GET');
    if (response.status) {
      notifications.value.forEach(n => n.read_at = new Date().toISOString());
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const markAsRead = async (notificationId) => {
  try {
    const response = await auth.fetchPublicApi(`/api/notifications/mark-as-read/${userId}/${notificationId}`, {}, 'GET');
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
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="relative">
    <button @click="toggleDropdown" ref="buttonRef" class="relative text-gray-600">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
        {{ unreadCount }}
      </span>
    </button>

    <div
      v-if="isDropdownOpen"
      ref="dropdownRef"
      class="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg z-50"
    >
      <div class="flex justify-between items-center px-4 py-2 border-b">
        <span class="font-medium text-sm">Notifications</span>
        <button v-if="unreadCount > 0" @click="markAllAsRead" class="text-xs text-blue-600 hover:underline">
          Mark all as read
        </button>
      </div>

      <div v-if="notifications.length === 0" class="p-4 text-sm text-gray-500 italic">
        No notifications
      </div>

      <ul class="p-2 space-y-2">
        <li v-for="notification in notifications" :key="notification.id">
          <a href="#" @click.prevent="markAsRead(notification.id)"
             :class="[
               'block text-sm px-3 py-2 rounded hover:bg-gray-100',
               notification.read_at ? 'text-gray-500' : 'text-blue-700 font-medium'
             ]">
            {{ notification.data?.data || notification.message || 'Notification' }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
