<template>
    <header class="sticky top-0 z-50 flex items-center justify-between bg-white shadow  py-3 px-6"
        v-if="auth.isAuthenticated && userType == 'individual'">
        <div>
            <!-- Individual Name -->
            <a href="/individual-dashboard/dashboard-initial-content" class="text-xl font-semibold text-gray-600">
                {{ name }}
            </a>
        </div>

        <!-- Right side (Profile + Notifications + Dropdown) -->
        <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <div class="relative">
                <button @click="toggleNotificationDropdown" class="relative text-gray-600" ref="notificationButton">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        class="bi bi-bell mr-4 mt-2" viewBox="0 0 16 16">
                        <path
                            d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                    </svg>
                    <span v-if="unreadCount > 0"
                        class="absolute top-0 right-0 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{{
                        unreadCount }}</span>
                </button>

                <!-- Notifications Dropdown -->
                <div v-if="isNotificationDropdownOpen" class="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg"
                    ref="notificationMenu">
                    <div class="flex justify-between p-2 border-b">
                        <h3 class="text-sm font-medium">Notifications</h3>
                        <button v-if="unreadCount > 0" @click="markAllAsRead" class="text-blue-500 text-xs">
                            Mark all as read
                        </button>
                    </div>
                    <div class="p-2">
                        <template v-for="notification in notifications" :key="notification.id">
                            <a href="#" @click.prevent="markAsRead(notification.id)"
                                :class="notification.read_at ? 'text-gray-500' : 'text-blue-700'"
                                class="block py-1 text-sm">
                                {{ notification.data.data }}
                            </a>
                            <hr class="border-t my-2" />
                        </template>
                    </div>
                </div>
            </div>

            <!-- Profile -->
            <div class="relative">
                <button @click="toggleProfileDropdown" ref="profileButton" class="flex items-center space-x-2">
                    <div v-if="logoPath">
                        <img :src="`${baseURL}${logoPath}`" alt="Photo" class="w-10 h-10 rounded-full object-covers">
                    </div>
                </button>

                <!-- Profile Dropdown -->
                <div v-if="isProfileDropdownOpen" class="absolute right-0 mt-2 w-64 bg-white shadow rounded-lg"
                    ref="dropdownMenu">
                    <div class="p-4 border-b">
                        <!-- Profile info -->
                        <div class="flex items-left space-x-2">
                            <img :src="`${baseURL}${logoPath}`" alt="Photo"
                                class="rounded-lg max-h-[90px] max-w-[200px] w-auto h-auto">
                        </div>
                    </div>

                    <div class="p-4 border-b">
                        <div class="flex items-center space-x-2">
                            <div class="break-words w-full">
                                <h4 class="text-gray-700 break-words">{{ userEmail }}</h4>
                                <p class="text-gray-500 text-xs">Username: {{ username }}</p>
                                <p class="text-gray-500 text-xs">Azon Id: {{ azonId }}</p>
                                <p class="text-gray-500 text-xs">Joined: {{ createdAtDate }}</p>

                            </div>
                        </div>
                    </div>

                    <!-- Menu Links -->
                    <ul class="pt-2">
                        <li><a href="/individual-dashboard/my-account"
                                class="block px-4 py-2 text-gray-700 hover:bg-gray-100">My
                                account</a>
                        </li>
                        <li><a href="/individual-dashboard/settings"
                                class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</a>
                        </li>
                        <li><a href="/individual-dashboard/subscription"
                                class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Subscriptions</a></li>
                        <li><a href="#/individual-dashboard/billing"
                                class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Billing</a>
                        </li>
                        <li><a href="/individual-dashboard/invite-friends"
                                class="block px-4 py-2 mb-3 text-gray-700 hover:bg-gray-100">Invite
                                friends</a></li>
                        <li class="border-t">
                            <button @click="auth.logout()"
                                class="w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100 font-semibold">
                                Logout
                            </button>
                        </li>
                        <li class="border-t"></li>
                        <li class="py-4 px-3.5"><img src="../../../../assets/Logo/Azonation.png" alt=""
                                class="max-h-[50px] max-w-[100px]"></li>

                    </ul>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { authStore } from "../../../../store/authStore";

const auth = authStore;
const userId = auth.user.id;
const baseURL = 'http://localhost:8000';
const name = computed(() => auth.user?.name);
const userType = computed(() => auth.user?.type);
const userEmail = computed(() => auth.user?.email);
const username = computed(() => auth.user?.username);
const azonId = computed(() => auth.user?.azon_id);

import dayjs from 'dayjs';
const createdAtDate = computed(() => {
    const createdAt = auth.user?.created_at;
    return createdAt && dayjs(createdAt).isValid() ? dayjs(createdAt).format('MMMM, YYYY') : 'Invalid date';
});

// Org logo
const logoPath = ref('');

const notifications = ref([]);
const unreadCount = computed(() => notifications.value.filter(notification => notification.read_at === null).length);

const isNotificationDropdownOpen = ref(false);
const toggleNotificationDropdown = () => {
    isNotificationDropdownOpen.value = !isNotificationDropdownOpen.value;
};

const isProfileDropdownOpen = ref(false);
const toggleProfileDropdown = () => {
    isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
};

// Close dropdown when clicked outside
const handleClickOutside = (event) => {
    const dropdown = dropdownMenu.value;
    const button = profileButton.value;

    if (dropdown && !dropdown.contains(event.target) && button && !button.contains(event.target)) {
        isProfileDropdownOpen.value = false;
    }
};

const notificationHandleClickOutside = (event) => {
    const dropdown = notificationMenu.value;
    const button = notificationButton.value;

    if (dropdown && !dropdown.contains(event.target) && button && !button.contains(event.target)) {
        isNotificationDropdownOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousedown', notificationHandleClickOutside);
    getNotifications();
    fetchLogo();
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('mousedown', notificationHandleClickOutside);
});

const dropdownMenu = ref(null);
const profileButton = ref(null);

const notificationMenu = ref(null);
const notificationButton = ref(null);
// Close dropdown when clicked outside end



const getNotifications = async () => {
    try {
        const response = await auth.fetchPublicApi(`/api/notifications/get-all/${userId}`, {}, 'GET');
        notifications.value = response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
};

const markAllAsRead = async () => {
    try {
        const response = await auth.fetchPublicApi(`/api/notifications/mark-all-as-read/${userId}`, {}, 'GET');
        if (response.status) {
            notifications.value.forEach(notification => {
                notification.read_at = new Date().toISOString();
            });
        }
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
};

const markAsRead = async (notificationId) => {
    try {
        const response = await auth.fetchPublicApi(`/api/notifications/mark-as-read/${userId}/${notificationId}`, {}, 'GET');
        if (response.status) {
            notifications.value = notifications.value.map(notification => {
                if (notification.id === notificationId) {
                    return { ...notification, read_at: new Date().toISOString() };
                }
                return notification;
            });
        }
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

const fetchLogo = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile/logo/${userId}`, {}, 'GET');
        if (response.status && response.data.image) {
            logoPath.value = response.data.image;
        }
    } catch (error) {
        console.error("Error fetching logo:", error);
    }
};

</script>

<style scoped></style>