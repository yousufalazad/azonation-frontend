<!-- Shown when an address needs access the account does not have -->
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { ShieldAlert } from "lucide-vue-next";

const router = useRouter();
const { t } = useI18n();
const DASHBOARDS = { individual: "individual-dashboard-index", organisation: "org-dashboard-index", superadmin: "superadmin-dashboard-index" };
const home = computed(() => ({ name: (authStore.isAuthenticated && DASHBOARDS[authStore.user?.type]) || "login" }));
const canGoBack = computed(() => typeof window !== "undefined" && window.history.length > 1);
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-canvas px-4">
    <div class="flex max-w-md flex-col items-center text-center">
      <span class="grid h-16 w-16 place-items-center rounded-full bg-warning-soft text-warning"><ShieldAlert class="h-8 w-8" aria-hidden="true" /></span>
      <h1 class="mt-5 text-2xl font-bold text-ink">{{ t('unauthorizedPage.title') }}</h1>
      <p class="mt-2 text-[15px] text-ink-2">{{ t('unauthorizedPage.text') }}</p>
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <AzButton v-if="canGoBack" variant="secondary" @click="router.back()">{{ t('unauthorizedPage.back') }}</AzButton>
        <AzButton :to="home">{{ authStore.isAuthenticated ? t('publicSite.dashboard') : t('auth.login') }}</AzButton>
      </div>
    </div>
  </div>
</template>
