<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { authStore } from "../../../store/authStore";
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import Notification from './HeaderNotification.vue';

const auth = authStore;

const orgName = computed(() => auth.user?.org_name || 'Your Org Name');
const baseURL = auth.apiBase;
const userId = auth.user.id;

const logoPath = ref('');
const emit = defineEmits(['toggle-mobile-sidebar', 'toggle-sidebar']);
const isProfileDropdownOpen = ref(false);
const profileButton = ref(null);
const profileMenu = ref(null);
const handleDropdownLinkClick = () => {
  isProfileDropdownOpen.value = false;
};

const fetchLogo = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-profile/logo`, {}, 'GET');
    if (response.status && response.data.image) {
      logoPath.value = response.data.image;
    }
  } catch (error) {
    console.error('Error fetching logo:', error);
  }
};

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
};

const handleClickOutsideProfile = (event) => {
  if (
    profileMenu.value &&
    !profileMenu.value.contains(event.target) &&
    profileButton.value &&
    !profileButton.value.contains(event.target)
  ) {
    isProfileDropdownOpen.value = false;
  }
};

onMounted(() => {
  fetchLogo();
  document.addEventListener('mousedown', handleClickOutsideProfile);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutsideProfile);
});
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-line bg-surface px-4 py-3">
    <!-- Left Section: Logo & Sidebar Buttons -->
    <div class="flex items-center gap-2 sm:gap-4 max-w-[70%]">
      <!-- Mobile Sidebar Toggle -->
      <button @click="emit('toggle-mobile-sidebar')" class="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2" :aria-label="$t('common.menu')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Desktop Sidebar Toggle -->
      <button @click="emit('toggle-sidebar')" class="hidden lg:flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2" :aria-label="$t('common.menu')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <!-- Org Name -->
      <a href="/org-dashboard/index"
        class="text-base sm:text-lg font-semibold text-ink hover:text-primary max-w-[200px] sm:max-w-none truncate">
        <span class="block truncate">{{ orgName }}</span>
      </a>
    </div>

    <!-- Right Section: Notification & Profile -->
    <div class="flex items-center gap-2 sm:gap-4">
      <Notification />

      <!-- Profile Dropdown -->
      <div class="relative">
        <button ref="profileButton" @click="toggleProfileDropdown" class="flex items-center rounded-full"
          :aria-label="$t('account.openMenu')" :aria-expanded="isProfileDropdownOpen">
          <img :src="logoPath ? `${logoPath}` : placeholderImage" alt="Org Logo"
            class="w-10 h-10 rounded-full object-cover border border-line-strong" />
        </button>

        <!-- Dropdown Menu -->
        <transition name="fade">
          <div v-if="isProfileDropdownOpen" ref="profileMenu"
            class="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-card border border-line bg-surface shadow-pop z-50">

            <!-- Logo -->
            <div class="flex justify-center p-4 border-b border-line">
              <img :src="logoPath ? `${logoPath}` : placeholderImage" alt="Org Logo"
                class="rounded-lg max-h-[90px] max-w-[200px] w-auto h-auto" />
            </div>

            <!-- User Info -->
            <div class="p-4 border-b border-line">
              <p class="font-semibold text-ink break-all">{{ auth.user.email }}</p>
              <p class="text-xs text-ink-muted mt-1">{{ $t('account.username') }}: {{ auth.user.username }}</p>
              <p class="text-xs text-ink-muted">{{ $t('account.azonId') }}: {{ auth.user.azon_id }}</p>
            </div>

            <!-- Language and theme -->
            <div class="p-4 border-b border-line">
              <AzAppearanceSettings />
            </div>

            <!-- Links -->
            <ul class="py-2 text-[15px] text-ink-2">
              <li>
                <router-link :to="{ name: 'profile' }" class="flex min-h-[44px] items-center px-4 hover:bg-surface-2"
                  @click="handleDropdownLinkClick">
                  {{ $t('account.myAccount') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'security' }" class="flex min-h-[44px] items-center px-4 hover:bg-surface-2"
                  @click="handleDropdownLinkClick">
                  {{ $t('account.security') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'subscription' }" class="flex min-h-[44px] items-center px-4 hover:bg-surface-2"
                  @click="handleDropdownLinkClick">
                  {{ $t('account.subscription') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'invoices' }" class="flex min-h-[44px] items-center px-4 hover:bg-surface-2"
                  @click="handleDropdownLinkClick">
                  {{ $t('account.billing') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'referral' }" class="flex min-h-[44px] items-center px-4 hover:bg-surface-2"
                  @click="handleDropdownLinkClick">
                  {{ $t('account.inviteFriend') }}
                </router-link>
              </li>
              <li class="border-t border-line mt-2 pt-2">
                <button @click="auth.logout()"
                  class="flex min-h-[44px] w-full items-center px-4 text-left font-semibold text-primary hover:bg-surface-2">
                  {{ $t('account.logout') }}
                </button>
              </li>
            </ul>
          </div>
        </transition>

      </div>

    </div>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
