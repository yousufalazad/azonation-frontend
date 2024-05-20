<!-- App.vue -->
<script setup>
import { computed } from 'vue';
import { loginAuthStore } from "../store/loginLogoutStore";

const auth = loginAuthStore;
const UserType = computed(() => auth.user?.type);

</script>

<template>
  <h1>Org Dasboard Data:</h1>
  <p>
    User type for Organization: <span>{{ UserType }}</span>
  </p>
</template>

<style></style>
