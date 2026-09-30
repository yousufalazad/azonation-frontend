<!-- Terms, Privacy and Cookies: numbered sections read from the language file (legal.<page>.sections) -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import PublicPage from "./PublicPage.vue";

const props = defineProps({ page: { type: String, required: true } });
const { t, tm, rt } = useI18n();

const sections = computed(() =>
  (tm(`legal.${props.page}.sections`) || []).map((s) => ({
    title: rt(s.title),
    paragraphs: (Array.isArray(s.text) ? s.text : [s.text]).map((p) => rt(p)),
    list: (s.list || []).map((p) => rt(p)),
  })),
);
</script>

<template>
  <PublicPage narrow :title="t(`legal.${page}.title`)" :description="t(`legal.${page}.intro`)">
    <template #meta>
      <p class="mt-3 text-sm text-ink-muted">{{ t('legal.updated', { date: t(`legal.${page}.updated`) }) }}</p>
    </template>
    <div class="flex flex-col gap-8 rounded-card border border-line bg-surface p-6 shadow-card sm:p-10">
      <section v-for="(s, i) in sections" :key="i" :aria-labelledby="`legal-${i}`">
        <h2 :id="`legal-${i}`" class="text-lg font-semibold text-ink">{{ i + 1 }}. {{ s.title }}</h2>
        <p v-for="(p, j) in s.paragraphs" :key="j" class="mt-2 text-[15px] leading-relaxed text-ink-2">{{ p }}</p>
        <ul v-if="s.list.length" class="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-ink-2">
          <li v-for="(item, j) in s.list" :key="j">{{ item }}</li>
        </ul>
      </section>
      <slot />
    </div>
  </PublicPage>
</template>
