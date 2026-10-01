<!-- Edit the minutes of a meeting -->
<script setup>
import { useRoute } from "vue-router";
import MinutesForm from "../components/MinutesForm.vue";

const route = useRoute();
</script>

<template>
  <MinutesForm :key="route.params.id" :minutes-id="route.params.id" />
</template>
