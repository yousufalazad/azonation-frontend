<!-- App.vue -->

<script setup>
import { computed } from 'vue';
import { authStore } from "../../../../store/authStore"

const auth = authStore;
const UserType = computed(() => auth.user?.type);
const orgUserName = computed(() => auth.org?.org_name);

</script>

<template>
    <div>
        <header class="navbar navbar-expand-md navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand d-flex align-items-center" href="#">
                   <h4 class="p-0 m-0">{{ orgUserName }}</h4>
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
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
.navbar-brand{
    margin-left: 22px;
}
</style>
