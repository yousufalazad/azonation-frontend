<!-- One project as a member sees it -->
<script setup>
import { useI18n } from "vue-i18n";
import ActivityView from "../components/ActivityView.vue";

const { t } = useI18n();
</script>

<template>
  <ActivityView kind="projects" back-route="individual-projects" :back-label="t('memberActivity.projects_title')" />
</template>
