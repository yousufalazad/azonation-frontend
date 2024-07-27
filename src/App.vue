<!-- App.vue -->
<script setup>
import { computed } from 'vue';
import { authStore } from "./store/authStore";

const auth = authStore;
const UserType = computed(() => auth.user?.type);

const individualUserName = computed(() => auth.individual?.full_name);
const orgUserName = computed(() => auth.org?.org_name);
const superAdminName = computed(() => auth.superadmin?.admin_name);

</script>

<template>
    <div class="container-fluid mt-5">
      <div class="row">
        <div class="col-12">
          <main>
            <router-view />
          </main>
        </div>
      </div>
    </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
