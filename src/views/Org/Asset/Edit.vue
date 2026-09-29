<!-- Change an asset -->
<script setup>
import { useRoute } from "vue-router";
import AssetForm from "./components/AssetForm.vue";

const route = useRoute();
</script>

<template>
  <AssetForm :key="route.params.id" :asset-id="route.params.id" />
</template>
