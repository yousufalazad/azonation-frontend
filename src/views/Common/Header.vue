<!-- Header of the public pages: logo, main links, language, and log in / sign up (or back to the dashboard) -->
<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useLocale } from "@/i18n";
import { Languages, Menu, X } from "lucide-vue-next";

const auth = authStore;
const route = useRoute();
const { t } = useI18n();
const { locale, languages, setLocale } = useLocale();

const open = ref(false);
watch(() => route.fullPath, () => (open.value = false));

const LINKS = [
  { label: "publicSite.forMembers", to: { name: "individual" } },
  { label: "publicSite.forOrgs", to: { name: "organisation" } },
  { label: "publicSite.pricing", to: { name: "pricing" } },
  { label: "publicSite.help", to: { name: "help" } },
];
const DASHBOARDS = { individual: "individual-dashboard-index", organisation: "org-dashboard-index", superadmin: "superadmin-dashboard-index" };
const dashboard = computed(() => (auth.isAuthenticated ? DASHBOARDS[auth.user?.type] : null));

// The language not in use, so one tap switches
const otherLanguage = computed(() => languages.find((l) => l.code !== locale.value) || languages[0]);
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
      <RouterLink to="/" class="shrink-0" :aria-label="t('authPages.home')">
        <img src="@/assets/Logo/Azonation.png" alt="Azonation" class="w-32 dark:brightness-[1.8] dark:saturate-[.8]" />
      </RouterLink>

      <nav class="hidden flex-1 items-center gap-1 md:flex" :aria-label="t('publicSite.nav')">
        <RouterLink v-for="link in LINKS" :key="link.label" :to="link.to" active-class="!text-primary"
          class="rounded-control px-3 py-2 text-[15px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">{{ t(link.label) }}</RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <button type="button" class="flex h-10 items-center gap-1.5 rounded-control px-2.5 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
          :lang="otherLanguage.code" :aria-label="t('appearance.language') + ': ' + otherLanguage.label" @click="setLocale(otherLanguage.code)">
          <Languages class="h-4 w-4" aria-hidden="true" />{{ otherLanguage.label }}
        </button>
        <template v-if="dashboard">
          <AzButton size="sm" class="hidden sm:inline-flex" :to="{ name: dashboard }">{{ t('publicSite.dashboard') }}</AzButton>
        </template>
        <template v-else>
          <AzButton size="sm" variant="quiet" class="hidden sm:inline-flex" :to="{ name: 'login' }">{{ t('auth.login') }}</AzButton>
          <AzButton size="sm" class="hidden sm:inline-flex" :to="{ name: 'signup' }">{{ t('auth.signUp') }}</AzButton>
        </template>
        <button type="button" class="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2 md:hidden"
          :aria-label="open ? t('publicSite.closeMenu') : t('publicSite.openMenu')" :aria-expanded="open" aria-controls="public-menu" @click="open = !open">
          <X v-if="open" class="h-5 w-5" aria-hidden="true" /><Menu v-else class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <nav v-if="open" id="public-menu" class="border-t border-line bg-surface px-4 pb-4 pt-2 md:hidden" :aria-label="t('publicSite.nav')">
      <RouterLink v-for="link in LINKS" :key="link.label" :to="link.to" active-class="!text-primary"
        class="flex min-h-touch items-center rounded-control px-3 text-[15px] font-medium text-ink-2 hover:bg-surface-2">{{ t(link.label) }}</RouterLink>
      <div class="mt-3 flex flex-col gap-2 sm:hidden">
        <AzButton v-if="dashboard" block :to="{ name: dashboard }">{{ t('publicSite.dashboard') }}</AzButton>
        <template v-else>
          <AzButton block :to="{ name: 'signup' }">{{ t('auth.signUp') }}</AzButton>
          <AzButton block variant="secondary" :to="{ name: 'login' }">{{ t('auth.login') }}</AzButton>
        </template>
      </div>
    </nav>
  </header>
</template>
