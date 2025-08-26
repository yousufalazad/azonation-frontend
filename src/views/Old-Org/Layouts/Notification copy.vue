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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
            class="bi bi-bell mr-4 mt-2" viewBox="0 0 16 16">
            <path
              d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
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
