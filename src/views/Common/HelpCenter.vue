<!-- Help centre: common questions, searchable, and a way to reach the team -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import PublicPage from "@/components/public/PublicPage.vue";
import FaqGroups from "@/components/public/FaqGroups.vue";
import { LifeBuoy } from "lucide-vue-next";

const { t } = useI18n();
// Signed-in organisations have their own support page where they can follow the conversation
const supportRoute = computed(() => (authStore.isAuthenticated && authStore.user?.type === "organisation" ? { name: "support" } : { name: "contact-us" }));
</script>

<template>
  <PublicPage narrow :title="t('helpPage.title')" :description="t('helpPage.intro')">
    <FaqGroups source="helpPage" searchable />
    <div class="mt-12 flex flex-col items-start gap-4 rounded-card border border-line bg-surface p-6 sm:flex-row sm:items-center">
      <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-soft-ink"><LifeBuoy class="h-6 w-6" aria-hidden="true" /></span>
      <div class="flex-1">
        <h2 class="text-lg font-semibold text-ink">{{ t('helpPage.stillTitle') }}</h2>
        <p class="text-[15px] text-ink-2">{{ t('helpPage.stillText') }}</p>
      </div>
      <AzButton :to="supportRoute">{{ t('helpPage.contact') }}</AzButton>
    </div>
  </PublicPage>
</template>
