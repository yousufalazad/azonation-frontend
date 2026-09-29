<!-- One event as a member sees it -->
<script setup>
import { useI18n } from "vue-i18n";
import ActivityView from "../components/ActivityView.vue";

const { t } = useI18n();
</script>

<template>
  <ActivityView kind="events" back-route="individual-events" :back-label="t('memberActivity.events_title')" />
</template>
