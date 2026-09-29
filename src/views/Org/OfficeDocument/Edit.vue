<!-- Change a document -->
<script setup>
import { useRoute } from "vue-router";
import DocumentForm from "./components/DocumentForm.vue";

const route = useRoute();
</script>

<template>
  <DocumentForm :key="route.params.id" :document-id="route.params.id" />
</template>
