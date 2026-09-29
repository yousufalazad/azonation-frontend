<!-- Change a year plan -->
<script setup>
import { useRoute } from "vue-router";
import YearPlanForm from "./components/YearPlanForm.vue";

const route = useRoute();
</script>

<template>
  <YearPlanForm :key="route.params.id" :plan-id="route.params.id" />
</template>
