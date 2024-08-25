<!-- Top Header -->

<script setup>
import { computed, ref, onMounted } from 'vue';
import { authStore } from "../../../../store/authStore"
import axios from 'axios';

const auth = authStore;
const UserType = computed(() => auth.user?.type);
const orgUserName = computed(() => auth.org?.org_name);
const notifications = ref('');

const logoPath = ref('');
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user
const baseURL = 'http://localhost:8000';

const fetchLogo = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/organisation/logo/${orgId}`, {}, 'GET');
        if (response.status && response.data.image) {
            logoPath.value = response.data.image;
        }
    } catch (error) {
        console.error("Error fetching logo:", error);
    }
};

const fetchUnreadNotifications = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/notifications/unread/${orgId}`, {}, 'GET');
        notifications.value = response.data.notifications;
        console.log(notifications.value);
        console.log(response.data.notifications);
        console.log(response.notifications);
        console.log(response);
        console.log('response');

    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
};

const markNotificationsAsRead = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/notifications/mark-as-read/${orgId}`, {}, 'POST');
        notifications = [];
    } catch (error) {
        console.error('Error marking notifications as read:', error);
    }
};


onMounted(fetchUnreadNotifications);
onMounted(markNotificationsAsRead);
onMounted(fetchLogo);

</script>

<template>
    <div class="fixed-top">
        <header class="navbar navbar-expand-md navbar-light bg-light">
            <div class="container-fluid">

                <a class="navbar-brand d-flex align-items-center" href="#">
                    <img v-if="logoPath" :src="`${baseURL}${logoPath}`" alt="Organization Logo"
                        class="img-thumbnail logo-height">
                    <h4 class="p-0 m-0">{{ orgUserName }}</h4>
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse mx-4" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item dropdown">
                            <a id="navbarDropdown" class="nav-link " href="#" role="button" data-bs-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false" v-pre>
                                <i class="fa fa-bell"></i>
                                <!-- <span
                                    class="badge badge-light bg-success badge-xs">{{auth()->user()->unreadNotifications->count()}}</span> -->


                            </a>

                            <ul v-if="notifications.length">
                                <li v-for="notification in notifications" :key="notification.id">
                                    <span>{{ notification.data }}</span>
                                    <small>{{ formatDate(notification.created_at) }}</small>
                                </li>
                            </ul>
                            <p v-else>No unread notifications.</p>
                            <button @click="markNotificationsAsRead" v-if="notifications.length">
                                Mark All as Read
                            </button>

                            <!-- <ul class="dropdown-menu">
                                @if (auth()->user()->unreadNotifications)
                                <li class="d-flex justify-content-end mx-1 my-2">
                                    <a href="{{route('mark-as-read')}}" class="btn btn-success btn-sm">Mark All as
                                        Read</a>
                                </li>
                                @endif

                                @foreach (auth()->user()->unreadNotifications as $notification)
                                <a href="#" class="text-success">
                                    <li class="p-1 text-success"> {{ $notification -> data['data'] }}</li>
                                </a>
                                @endforeach
                                @foreach (auth()->user()->readNotifications as $notification)
                                <a href="#" class="text-secondary">
                                    <li class="p-1 text-secondary"> {{ $notification -> data['data'] }}</li>
                                </a>
                                @endforeach
                            </ul> -->
                        </li>

                        <li class="nav-item" v-if="auth.isAuthenticated && UserType == 2">
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
