<!-- Top Header -->

<script setup>
import { computed, ref, onMounted } from 'vue';
import { authStore } from "../../../../store/authStore";
const auth = authStore;
const userId = auth.user.id; // Assuming the org ID is stored in the logged-in user
const userName = computed(() => auth.user?.name);
const userType = computed(() => auth.user?.type);
const logoPath = ref('');
const baseURL = 'http://localhost:8000'; // Update with your actual base URL
const notifications = ref([]);
// Fetch the organization logo
// const fetchLogo = async () => {
//   try {
//     const response = await auth.fetchProtectedApi(`/api/organisation/logo/${userId}`, {}, 'GET');
//     if (response.status && response.data.image) {
//       logoPath.value = response.data.image;
//     }
//   } catch (error) {
//     console.error("Error fetching logo:", error);
//   }
// };

// Fetch the user's notifications
const getNotifications = async () => {
    try {
        const response = await auth.fetchPublicApi(`/api/notifications/get-all/${userId}`, {}, 'GET');
        notifications.value = response.data;
        //console.log(notifications.value);
    } catch (error) {
        console.error("There was an error fetching the notifications:", error);
    }
};

// Mark all notifications as read
const markAllAsRead = async () => {
    try {
        const response = await auth.fetchPublicApi(`/api/notifications/mark-all-as-read/${userId}`, {}, 'GET');
        if (response.status) {
            notifications.value.forEach(notification => {
                notification.read_at = new Date().toISOString(); // Mark them as read locally
            });
            console.log('Notifications marked as read');
        }
    } catch (error) {
        console.error("There was an error marking the notifications as read:", error);
    }
};


// Mark a single notification as read
const markAsRead = async (notificationId) => {
    try {
        const response = await auth.fetchPublicApi(`/api/notifications/mark-as-read/${userId}/${notificationId}`, {}, 'GET');
        if (response.status) {
            notifications.value = notifications.value.map(notification => {
                if (notification.id === notificationId) {
                    return {
                        ...notification,
                        read_at: new Date().toISOString() // Mark this notification as read locally
                    };
                }
                return notification;
            });
            console.log('Notification marked as read');
        }
    } catch (error) {
        console.error('There was an error marking the notification as read:', error);
    }
};

onMounted(() => {
    getNotifications();
    //   fetchLogo();
});

const unreadCount = computed(() => {
    const unreadNotifications = notifications.value.filter(notification => {
        return notification.read_at === null;
    });
    //console.log('Unread First:', unreadNotifications.length);
    return unreadNotifications.length;
});

</script>

<template>
    <div class="fixed-top">
        <header class="navbar navbar-expand-md navbar-light" v-if="auth.isAuthenticated && userType == 'organisation'">
            <div class="container-fluid">

                <a class="navbar-brand d-flex align-items-center" href="#">
                    <!-- <img v-if="logoPath" :src="`${baseURL}${logoPath}`" alt="Organization Logo"
                        class="img-thumbnail logo-height"> -->
                    <h4 class="p-0 m-0">{{ userName }}</h4>
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse mx-4" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item dropdown">
                            <a id="navbarDropdown" class="nav-link" href="#" role="button" data-bs-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                    class="bi bi-bell" viewBox="0 0 16 16">
                                    <path
                                        d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                                </svg>
                                <span class="badge badge-light bg-success badge-xs">{{ unreadCount }}</span>
                            </a>
                            <ul class="dropdown-menu">
                                <li v-if="unreadCount > 0" class="d-flex justify-content-end mx-1 my-2">
                                    <button @click="markAllAsRead" class="btn btn-primary btn-sm">
                                        Mark all as read
                                    </button>
                                </li>
                                <template v-for="notification in notifications" :key="notification.id">
                                    
                                    <a href="#" @click.prevent="markAsRead(notification.id)"
                                        :class="notification.read_at ? 'text-secondary' : 'text-primary'">
                                        <li :class="notification.read_at ? 'p-1 text-secondary' : 'p-1 text-primary'">
                                            {{ notification.data.data }}
                                        </li>
                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                    </a>

                                </template>
                            </ul>
                        </li>
                        <li class="nav-item" v-if="auth.isAuthenticated && userType == 'organisation'">
                            <router-link class="nav-link" to="/org-dashboard">Azonation</router-link>
                        </li>
                        <li class="nav-item" v-if="auth.isAuthenticated">
                            <button @click="auth.logout()" class="btn btn-primary ms-md-2">
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    </div>
</template>

<style>
.navbar-brand {
    margin-left: 22px;
    padding-top: 0px;
    padding-bottom: 0px;
    margin-top: 0px;
    margin-bottom: 0px;
}

.logo-height {
    height: 50px;
    padding-top: 0px;
    padding-bottom: 0px;
    margin-top: 0px;
    margin-bottom: 0px;
    margin-right: 10px;
}
</style>
