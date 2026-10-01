<script setup>
// Language and light/dark choice. Used in account menus and on the login page.
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLocale } from "@/i18n";
import { useTheme } from "@/composables/useTheme";

defineProps({
  compact: { type: Boolean, default: false }, // compact: language only (login page)
});

const { t } = useI18n();
const { locale, languages, setLocale } = useLocale();
const { theme, setTheme } = useTheme();

const lang = computed({ get: () => locale.value, set: setLocale });
const mode = computed({ get: () => theme.value, set: setTheme });

const languageOptions = computed(() => languages.map((l) => ({ value: l.code, label: l.label })));
const themeOptions = computed(() => [
  { value: "light", label: t("appearance.light") },
  { value: "dark", label: t("appearance.dark") },
  { value: "system", label: t("appearance.system") },
]);
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1.5">
      <span v-if="!compact" class="text-xs font-semibold uppercase tracking-wider text-ink-muted">{{ $t("appearance.language") }}</span>
      <AzSegmented v-model="lang" :label="$t('appearance.language')" :options="languageOptions" />
    </div>
    <div v-if="!compact" class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold uppercase tracking-wider text-ink-muted">{{ $t("appearance.theme") }}</span>
      <AzSegmented v-model="mode" :label="$t('appearance.theme')" :options="themeOptions" />
    </div>
  </div>
</template>
