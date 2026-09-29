<!-- Write the minutes of a meeting -->
<script setup>
import { useRoute } from "vue-router";
import MinutesForm from "../components/MinutesForm.vue";

const route = useRoute();
</script>

<template>
  <MinutesForm :key="route.params.meetingId" :meeting-id="route.params.meetingId" />
</template>
