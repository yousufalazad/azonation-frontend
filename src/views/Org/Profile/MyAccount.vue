<!-- My account: one place for the organisation's profile, sign-in, notifications and billing.
     Side menu on large screens, scrollable tabs on phones; the chosen page shows beside it. -->
<script setup>
import { computed } from "vue";
import { RouterView } from "vue-router";
import { useI18n } from "vue-i18n";
import { UserRound, Info, ShieldCheck, Bell, Settings2, Package, Calculator, FileText, Receipt, Gift } from "lucide-vue-next";

const { t } = useI18n();

const groups = computed(() => [
  {
    label: t("accountNav.groupAccount"),
    items: [
      { to: { name: "profile" }, label: t("accountNav.profile"), icon: UserRound },
      { to: { name: "fundamental-info" }, label: t("accountNav.orgInfo"), icon: Info },
      { to: { name: "security" }, label: t("accountNav.security"), icon: ShieldCheck },
      { to: { name: "user-notifications" }, label: t("accountNav.notifications"), icon: Bell },
      { to: { name: "settings" }, label: t("accountNav.settings"), icon: Settings2 },
    ],
  },
  {
    label: t("accountNav.groupBilling"),
    items: [
      { to: { name: "subscription" }, label: t("accountNav.subscription"), icon: Package },
      { to: { name: "bill-calculation" }, label: t("accountNav.billCalculation"), icon: Calculator },
      { to: { name: "invoices" }, label: t("accountNav.invoices"), icon: FileText },
      { to: { name: "org-receipt-index" }, label: t("accountNav.receipts"), icon: Receipt },
      { to: { name: "referral" }, label: t("accountNav.referral"), icon: Gift },
    ],
  },
]);
const flat = computed(() => groups.value.flatMap((g) => g.items));
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
    <!-- Phones and tablets: tabs you can scroll sideways -->
    <nav class="-mx-4 overflow-x-auto border-b border-line px-4 lg:hidden print:hidden" :aria-label="t('accountNav.title')">
      <ul class="flex gap-1 pb-2">
        <li v-for="item in flat" :key="item.label">
          <RouterLink :to="item.to" class="inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold text-ink-2 hover:bg-surface-2"
            active-class="!bg-primary-soft !text-primary-soft-ink">
            <component :is="item.icon" class="h-4 w-4" aria-hidden="true" />{{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Large screens: side menu -->
    <aside class="hidden w-60 shrink-0 lg:block print:!hidden">
      <h1 class="mb-4 text-xl font-semibold text-ink">{{ t('accountNav.title') }}</h1>
      <nav class="flex flex-col gap-5" :aria-label="t('accountNav.title')">
        <div v-for="g in groups" :key="g.label">
          <p class="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{{ g.label }}</p>
          <ul class="flex flex-col gap-0.5">
            <li v-for="item in g.items" :key="item.label">
              <RouterLink :to="item.to" class="flex min-h-[40px] items-center gap-3 rounded-control px-3 text-[15px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                active-class="!bg-primary-soft !text-primary-soft-ink">
                <component :is="item.icon" class="h-[18px] w-[18px]" aria-hidden="true" />{{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <div class="min-w-0 flex-1">
      <RouterView />
    </div>
  </div>
</template>
