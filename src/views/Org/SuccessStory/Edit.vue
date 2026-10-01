<!-- Change a success story (shared form: Content/ContentForm) -->
<script setup>
import { useRoute } from "vue-router";
import ContentForm from "../Content/ContentForm.vue";

const route = useRoute();
</script>

<template>
  <ContentForm :key="route.params.id" type="successStory" :record-id="route.params.id" />
</template>
