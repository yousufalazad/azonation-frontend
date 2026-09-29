<!-- Change a recognition (shared form: Content/ContentForm) -->
<script setup>
import { useRoute } from "vue-router";
import ContentForm from "../Content/ContentForm.vue";

const route = useRoute();
</script>

<template>
  <ContentForm :key="route.params.id" type="recognition" :record-id="route.params.id" />
</template>
