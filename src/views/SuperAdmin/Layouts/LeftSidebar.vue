<!-- Super Admin menu: same look and behaviour as the organisation menu -->
<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Home as HomeIcon,
  LifeBuoy as LifeBuoyIcon,
  Receipt as ReceiptIcon,
  ShoppingBag as ShopIcon,
  KeyRound as KeyIcon,
  SlidersHorizontal as SettingsIcon,
  ChevronDown as ChevronDownIcon,
} from "lucide-vue-next";

const props = defineProps({ isSidebarExpanded: Boolean });
const emit = defineEmits(["close-mobile-menu"]);
const route = useRoute();
const router = useRouter();

// `label` is an i18n key. Items with `children` open and close.
const menu = [
  { label: "adminNav.home", to: { name: "superadmin-dashboard-index" }, icon: HomeIcon },
  { label: "adminNav.support", to: { name: "superadmin-support" }, icon: LifeBuoyIcon },
  {
    id: "billing", label: "adminNav.billing", icon: ReceiptIcon,
    children: [
      { label: "adminNav.monthlyBills", to: { name: "super-admin-management-and-storage-billing-list" } },
      { label: "adminNav.invoices", to: { name: "super-admin-invoice-list" } },
      { label: "adminNav.payments", to: { name: "super-admin-payment-log-list" } },
      { label: "adminNav.dailyUsage", to: { name: "super-admin-every-day-member-count-and-bill-list" } },
      { label: "adminNav.packages", to: { name: "super-admin-packages" } },
      { label: "adminNav.subscriptions", to: { name: "super-admin-subscription-list" } },
    ],
  },
  {
    id: "shop", label: "adminNav.shop", icon: ShopIcon,
    children: [
      { label: "adminNav.products", to: { name: "products-list" } },
      { label: "adminNav.orders", to: { name: "orders-list" } },
      { label: "adminNav.categories", to: { name: "index-category" } },
      { label: "adminNav.subCategories", to: { name: "index-sub-category" } },
      { label: "adminNav.subSubCategories", to: { name: "index-sub-sub-category" } },
      { label: "adminNav.brands", to: { name: "index-brand" } },
      { label: "adminNav.businessTypes", to: { name: "index-business-type" } },
    ],
  },
  {
    id: "access", label: "adminNav.access", icon: KeyIcon,
    children: [
      { label: "adminNav.roles", to: { name: "roles" } },
      { label: "adminNav.permissions", to: { name: "permissions" } },
      { label: "adminNav.assignRoles", to: { name: "superadmin-user-role-assign" } },
    ],
  },
  {
    id: "settings", label: "adminNav.settings", icon: SettingsIcon,
    children: [
      { label: "adminNav.platformLists", to: { name: "superadmin-settings" } },
      { label: "adminNav.userCountries", to: { name: "user-country" } },
    ],
  },
];

const openSections = ref([]);
const pathOf = (to) => {
  try {
    return router.resolve(to).path;
  } catch {
    return "";
  }
};
const isActive = (to) => route.path === pathOf(to)
  || (to.name === "superadmin-settings" && route.name === "superadmin-lookup")
  || (to.name === "super-admin-invoice-list" && route.name === "superadmin-invoice");
const sectionHasActive = (item) => item.children?.some((c) => isActive(c.to));
const toggleSection = (id) => {
  openSections.value = openSections.value.includes(id) ? openSections.value.filter((s) => s !== id) : [...openSections.value, id];
};
const isOpen = (id) => openSections.value.includes(id) && props.isSidebarExpanded;

watch(() => route.path, () => {
  menu.forEach((item) => {
    if (sectionHasActive(item) && !openSections.value.includes(item.id)) openSections.value = [...openSections.value, item.id];
  });
}, { immediate: true });

const handleLinkClick = () => {
  if (window.innerWidth < 1024) emit("close-mobile-menu");
};
const itemClass = (active) => [
  "flex min-h-[44px] w-full items-center gap-3 rounded-control px-3 text-[15px] transition-colors whitespace-nowrap",
  active ? "bg-primary-soft font-semibold text-primary-soft-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
];
</script>

<template>
  <nav class="h-full overflow-y-auto overscroll-y-contain p-3" :aria-label="$t('common.menu')">
    <ul class="flex flex-col gap-1">
      <li v-for="item in menu" :key="item.label">
        <router-link v-if="!item.children" :to="item.to" :class="itemClass(isActive(item.to))"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :title="!props.isSidebarExpanded ? $t(item.label) : undefined" @click="handleLinkClick">
          <component :is="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
          <span v-if="props.isSidebarExpanded" class="truncate">{{ $t(item.label) }}</span>
        </router-link>
        <template v-else>
          <button type="button" :class="itemClass(sectionHasActive(item) && !isOpen(item.id))"
            :aria-expanded="isOpen(item.id)" :title="!props.isSidebarExpanded ? $t(item.label) : undefined" @click="toggleSection(item.id)">
            <component :is="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
            <span v-if="props.isSidebarExpanded" class="truncate">{{ $t(item.label) }}</span>
            <ChevronDownIcon v-if="props.isSidebarExpanded" class="ml-auto h-4 w-4 shrink-0 transition-transform" :class="{ 'rotate-180': isOpen(item.id) }" aria-hidden="true" />
          </button>
          <ul v-show="isOpen(item.id)" class="ml-5 mt-1 flex flex-col gap-0.5 border-l border-line pl-3">
            <li v-for="child in item.children" :key="child.label">
              <router-link :to="child.to" @click="handleLinkClick" :aria-current="isActive(child.to) ? 'page' : undefined"
                class="flex min-h-[40px] items-center rounded-control px-3 text-[14px] transition-colors"
                :class="isActive(child.to) ? 'bg-primary-soft font-semibold text-primary-soft-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'">
                {{ $t(child.label) }}
              </router-link>
            </li>
          </ul>
        </template>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
nav {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--az-line-strong)) transparent;
}
</style>
