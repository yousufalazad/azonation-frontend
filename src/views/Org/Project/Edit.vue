<!-- Change a project -->
<script setup>
import { useRoute } from "vue-router";
import ProjectForm from "./components/ProjectForm.vue";

const route = useRoute();
</script>

<template>
  <ProjectForm :key="route.params.id" :project-id="route.params.id" />
</template>
