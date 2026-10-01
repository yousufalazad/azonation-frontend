<!-- Change a strategic plan -->
<script setup>
import { useRoute } from "vue-router";
import StrategicPlanForm from "./components/StrategicPlanForm.vue";

const route = useRoute();
</script>

<template>
  <StrategicPlanForm :key="route.params.id" :plan-id="route.params.id" />
</template>
