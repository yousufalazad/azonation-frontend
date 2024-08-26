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

onMounted(fetchLogo);

</script>

<template>
    <div class="fixed-top">
        <header class="navbar navbar-expand-md navbar-light bg-light">
            <div class="container-fluid">

                <a class="navbar-brand d-flex align-items-center" href="#">
                    <!-- <img v-if="logoPath" :src="`${baseURL}${logoPath}`" alt="Organization Logo"
                        class="img-thumbnail logo-height"> -->
                    <h4 class="p-0 m-0">{{ orgUserName }}</h4>
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse mx-4" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
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
