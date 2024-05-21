<!-- App.vue -->
<script setup>
import { computed } from 'vue';
import { loginAuthStore } from "../store/loginLogoutStore";

const auth = loginAuthStore;
const UserType = computed(() => auth.user?.type);
const OrgName = computed(() => auth.org?.org_name);

</script>

<template>
  <h1>Org Dasboard Data:</h1>
  <p>
    User type for Organization: <span>{{ UserType }} {{OrgName}}</span>
  </p>
</template>

<style></style>
