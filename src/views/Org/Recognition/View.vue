<!-- Read a recognition (shared page: Content/ContentView) -->
<script setup>
import { useRoute } from "vue-router";
import ContentView from "../Content/ContentView.vue";

const route = useRoute();
</script>

<template>
  <ContentView :key="route.params.id" type="recognition" />
</template>
