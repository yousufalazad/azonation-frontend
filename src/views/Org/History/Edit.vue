<!-- Change a history record (shared form: Content/ContentForm) -->
<script setup>
import { useRoute } from "vue-router";
import ContentForm from "../Content/ContentForm.vue";

const route = useRoute();
</script>

<template>
  <ContentForm :key="route.params.id" type="history" :record-id="route.params.id" />
</template>
