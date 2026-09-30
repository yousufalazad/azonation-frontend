<!-- Super Admin header: menu buttons, product name, notifications and the account menu -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { authStore } from "@/store/authStore";
import Notification from "@/views/Org/Layouts/HeaderNotification.vue";
import { ShieldCheck } from "lucide-vue-next";

const auth = authStore;
const emit = defineEmits(["toggle-mobile-sidebar", "toggle-sidebar"]);

const name = computed(() => [auth.user?.first_name, auth.user?.last_name].filter(Boolean).join(" ") || auth.user?.email || "");
const open = ref(false);
const button = ref(null);
const menu = ref(null);

const onOutside = (e) => {
  if (open.value && !menu.value?.contains(e.target) && !button.value?.contains(e.target)) open.value = false;
};
onMounted(() => document.addEventListener("mousedown", onOutside));
onBeforeUnmount(() => document.removeEventListener("mousedown", onOutside));
</script>

<template>
  <header class="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-line bg-surface px-4 py-3 print:hidden">
    <div class="flex max-w-[70%] items-center gap-2 sm:gap-4">
      <button class="flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 lg:hidden" :aria-label="$t('common.menu')" @click="emit('toggle-mobile-sidebar')">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <button class="hidden h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 lg:flex" :aria-label="$t('common.menu')" @click="emit('toggle-sidebar')">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <RouterLink :to="{ name: 'superadmin-dashboard-index' }" class="flex items-center gap-2 truncate text-base font-semibold text-ink hover:text-primary sm:text-lg">
        <ShieldCheck class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span class="truncate">{{ $t('adminNav.product') }}</span>
      </RouterLink>
    </div>

    <div class="flex items-center gap-2 sm:gap-4">
      <Notification />
      <div class="relative">
        <button ref="button" class="flex items-center rounded-full" :aria-label="$t('account.openMenu')" :aria-expanded="open" @click="open = !open">
          <AzAvatar :name="name" />
        </button>
        <transition name="fade">
          <div v-if="open" ref="menu" class="absolute right-0 z-50 mt-2 max-h-[calc(100vh-5rem)] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-card border border-line bg-surface shadow-pop">
            <div class="border-b border-line p-4">
              <p class="font-semibold text-ink">{{ name }}</p>
              <p class="break-all text-sm text-ink-muted">{{ auth.user?.email }}</p>
              <AzBadge class="mt-2" tone="info" :dot="false">{{ $t('adminNav.role') }}</AzBadge>
            </div>
            <div class="border-b border-line p-4"><AzAppearanceSettings /></div>
            <ul class="py-2 text-[15px] text-ink-2">
              <li>
                <RouterLink :to="{ name: 'super-admin-profile-update' }" class="flex min-h-[44px] items-center px-4 hover:bg-surface-2" @click="open = false">{{ $t('nav.myProfile') }}</RouterLink>
              </li>
              <li class="mt-2 border-t border-line pt-2">
                <button class="flex min-h-[44px] w-full items-center px-4 text-left font-semibold text-primary hover:bg-surface-2" @click="auth.logout()">{{ $t('account.logout') }}</button>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>
