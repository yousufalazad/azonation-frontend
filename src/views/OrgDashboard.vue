<!-- App.vue -->
<script setup>
import { computed } from 'vue';
import { loginAuthStore } from "../store/loginLogoutStore";


const auth = loginAuthStore;
const UserType = computed(() => auth.user?.type);
const OrgName = computed(() => auth.org?.org_name);
const OrgID = computed(() => auth.org?.id);
const UserID = computed(() => auth.org?.user_id);
const ShortDescription = computed(() => auth.org?.short_description);
const AzonID = computed(() => auth.org?.azon_id);



</script>

<template>
  <h1>Org Dasboard Data:</h1>
  <p>
    User type for Organization: <span>{{ UserType }}</span><br>
    Organization Name: <span>{{ OrgName }}</span><br>
    Organization OrgID: <span>{{ OrgID }}</span><br>
    Organization UserID: <span>{{ UserID }}</span><br>
    Organization ShortDescription: <span>{{ ShortDescription }}</span><br>
    Organization AzonID: <span>{{ AzonID }}</span><br>
  </p>
</template>

<style></style>
