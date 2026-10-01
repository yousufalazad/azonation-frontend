<!-- Write the report after an event -->
<script setup>
import { useRoute } from "vue-router";
import EventReportForm from "../components/EventReportForm.vue";

const route = useRoute();
</script>

<template>
  <EventReportForm :key="route.params.eventId" :event-id="route.params.eventId" />
</template>
