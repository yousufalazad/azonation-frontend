<!-- Change an existing meeting -->
<script setup>
import { useRoute } from "vue-router";
import MeetingForm from "./components/MeetingForm.vue";

const route = useRoute();
</script>

<template>
  <MeetingForm :key="route.params.id" :meeting-id="route.params.id" />
</template>
