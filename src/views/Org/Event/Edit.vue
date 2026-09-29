<!-- Change an existing event -->
<script setup>
import { useRoute } from "vue-router";
import EventForm from "./components/EventForm.vue";

const route = useRoute();
</script>

<template>
  <EventForm :key="route.params.id" :event-id="route.params.id" />
</template>
