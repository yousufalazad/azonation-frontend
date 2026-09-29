<!-- Write the report on a project -->
<script setup>
import { useRoute } from "vue-router";
import ProjectReportForm from "../components/ProjectReportForm.vue";

const route = useRoute();
</script>

<template>
  <ProjectReportForm :key="route.params.projectId" :project-id="route.params.projectId" />
</template>
