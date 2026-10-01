<!-- One meeting as a member sees it -->
<script setup>
import { useI18n } from "vue-i18n";
import ActivityView from "../components/ActivityView.vue";

const { t } = useI18n();
</script>

<template>
  <ActivityView kind="meetings" back-route="individual-meetings" :back-label="t('memberActivity.meetings_title')" />
</template>
