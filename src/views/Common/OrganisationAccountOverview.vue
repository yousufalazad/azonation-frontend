<!-- What a organisation account is and what it can do -->
<script setup>
import { useI18n } from "vue-i18n";
import PublicPage from "@/components/public/PublicPage.vue";
import FaqGroups from "@/components/public/FaqGroups.vue";

const { t } = useI18n();
</script>

<template>
  <PublicPage narrow :title="t('overview.organisation.title')" :description="t('overview.organisation.intro')">
    <FaqGroups source="overview.organisation" />
    <div class="mt-12 flex flex-col items-start gap-4 rounded-card bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <h2 class="text-xl font-semibold text-primary-soft-ink">{{ t('overview.organisation.ctaTitle') }}</h2>
        <p class="mt-1 text-primary-soft-ink/80">{{ t('overview.organisation.ctaText') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <AzButton :to="{ name: 'signup' }">{{ t('publicSite.ctaButton') }}</AzButton>
        <AzButton variant="secondary" :to="{ name: 'pricing' }">{{ t('publicSite.pricing') }}</AzButton>
      </div>
    </div>
  </PublicPage>
</template>
