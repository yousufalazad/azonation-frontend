<!-- What a individual account is and what it can do -->
<script setup>
import { useI18n } from "vue-i18n";
import PublicPage from "@/components/public/PublicPage.vue";
import FaqGroups from "@/components/public/FaqGroups.vue";

const { t } = useI18n();
</script>

<template>
  <PublicPage narrow :title="t('overview.individual.title')" :description="t('overview.individual.intro')">
    <FaqGroups source="overview.individual" />
    <div class="mt-12 flex flex-col items-start gap-4 rounded-card bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <h2 class="text-xl font-semibold text-primary-soft-ink">{{ t('overview.individual.ctaTitle') }}</h2>
        <p class="mt-1 text-primary-soft-ink/80">{{ t('overview.individual.ctaText') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <AzButton :to="{ name: 'signup' }">{{ t('publicSite.ctaButton') }}</AzButton>
        <AzButton variant="secondary" :to="{ name: 'help' }">{{ t('publicSite.help') }}</AzButton>
      </div>
    </div>
  </PublicPage>
</template>
