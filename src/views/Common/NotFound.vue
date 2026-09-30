<!-- Any address the app does not know -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import PublicPage from "@/components/public/PublicPage.vue";
import NotFoundImage from "@/assets/NotFound/not-found.svg";

const { t } = useI18n();
const DASHBOARDS = { individual: "individual-dashboard-index", organisation: "org-dashboard-index", superadmin: "superadmin-dashboard-index" };
const home = computed(() => ({ name: (authStore.isAuthenticated && DASHBOARDS[authStore.user?.type]) || "login" }));
</script>

<template>
  <PublicPage narrow>
    <div class="flex flex-col items-center py-6 text-center">
      <img :src="NotFoundImage" alt="" class="mb-8 w-full max-w-xs dark:opacity-80" />
      <h1 class="text-3xl font-bold text-ink">{{ t('notFoundPage.title') }}</h1>
      <p class="mt-2 max-w-md text-lg text-ink-2">{{ t('notFoundPage.text') }}</p>
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <AzButton :to="home">{{ authStore.isAuthenticated ? t('publicSite.dashboard') : t('notFoundPage.home') }}</AzButton>
        <AzButton variant="secondary" :to="{ name: 'help' }">{{ t('publicSite.help') }}</AzButton>
      </div>
    </div>
  </PublicPage>
</template>
