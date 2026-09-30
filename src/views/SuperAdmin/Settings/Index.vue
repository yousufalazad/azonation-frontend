<!-- Platform settings: every list the Super Admin looks after, grouped -->
<script setup>
import { useI18n } from "vue-i18n";
import { ChevronRight, Globe, Coins, IdCard, CalendarCheck, Languages } from "lucide-vue-next";
import { GROUPS } from "./lookups";

const { t } = useI18n();
const ICONS = { places: Globe, money: Coins, membership: IdCard, activities: CalendarCheck, app: Languages };
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-8">
    <AzPageHeader :title="t('lookups.title')" :description="t('lookups.description')" />

    <section v-for="g in GROUPS" :key="g.key">
      <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold text-ink">
        <component :is="ICONS[g.key]" class="h-5 w-5 text-primary" aria-hidden="true" />{{ t(`lookups.group_${g.key}`) }}
      </h2>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="k in g.items" :key="k">
          <RouterLink :to="{ name: 'superadmin-lookup', params: { key: k } }"
            class="flex h-full items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-ink">{{ t(`lookups.title_${k}`) }}</span>
              <span class="block text-sm text-ink-muted">{{ t(`lookups.desc_${k}`) }}</span>
            </span>
            <ChevronRight class="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
