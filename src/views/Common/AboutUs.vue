<!-- About Azonation: what it is, mission, vision and values -->
<script setup>
import { useI18n } from "vue-i18n";
import PublicPage from "@/components/public/PublicPage.vue";
import { Eye, Globe2, Lightbulb, ShieldCheck, Sparkles, Target } from "lucide-vue-next";

const { t } = useI18n();
const VALUES = [
  { key: "transparency", icon: Eye },
  { key: "innovation", icon: Lightbulb },
  { key: "simplicity", icon: Sparkles },
  { key: "global", icon: Globe2 },
  { key: "security", icon: ShieldCheck },
];
</script>

<template>
  <PublicPage :title="t('aboutPage.title')" :description="t('aboutPage.intro')">
    <div class="grid gap-4 md:grid-cols-2">
      <AzCard>
        <Target class="h-6 w-6 text-primary" aria-hidden="true" />
        <h2 class="mt-3 text-lg font-semibold text-ink">{{ t('aboutPage.missionTitle') }}</h2>
        <p class="mt-1 text-[15px] text-ink-2">{{ t('aboutPage.mission') }}</p>
      </AzCard>
      <AzCard>
        <Eye class="h-6 w-6 text-primary" aria-hidden="true" />
        <h2 class="mt-3 text-lg font-semibold text-ink">{{ t('aboutPage.visionTitle') }}</h2>
        <p class="mt-1 text-[15px] text-ink-2">{{ t('aboutPage.vision') }}</p>
      </AzCard>
    </div>

    <h2 class="mb-4 mt-12 text-2xl font-bold text-ink">{{ t('aboutPage.valuesTitle') }}</h2>
    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="v in VALUES" :key="v.key" class="flex gap-3 rounded-card border border-line bg-surface p-5">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-soft-ink"><component :is="v.icon" class="h-5 w-5" aria-hidden="true" /></span>
        <span>
          <span class="block font-semibold text-ink">{{ t(`aboutPage.value_${v.key}`) }}</span>
          <span class="block text-sm text-ink-2">{{ t(`aboutPage.value_${v.key}_text`) }}</span>
        </span>
      </li>
    </ul>

    <div class="mt-12 flex flex-col items-start gap-4 rounded-card bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <h2 class="text-xl font-semibold text-primary-soft-ink">{{ t('publicSite.ctaTitle') }}</h2>
        <p class="mt-1 text-primary-soft-ink/80">{{ t('publicSite.ctaText') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <AzButton :to="{ name: 'signup' }">{{ t('publicSite.ctaButton') }}</AzButton>
        <AzButton variant="secondary" :to="{ name: 'contact-us' }">{{ t('footer.contact') }}</AzButton>
      </div>
    </div>
  </PublicPage>
</template>
