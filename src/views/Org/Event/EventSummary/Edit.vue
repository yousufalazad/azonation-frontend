<!-- Edit the report of an event -->
<script setup>
import { useRoute } from "vue-router";
import EventReportForm from "../components/EventReportForm.vue";

const route = useRoute();
</script>

<template>
  <EventReportForm :key="route.params.id" :report-id="route.params.id" />
</template>
