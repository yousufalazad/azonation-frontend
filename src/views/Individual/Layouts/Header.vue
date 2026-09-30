<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { authStore } from '../../../store/authStore';
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import dayjs from 'dayjs';
import Notification from '@/views/Org/Layouts/HeaderNotification.vue';

const emit = defineEmits(['toggle-mobile-sidebar', 'toggle-sidebar', 'close-mobile-sidebar']); // ⬅️ allow explicit close

const auth = authStore;
const baseURL = auth.apiBase;
const userId = auth.user.id;

const route = useRoute(); // ⬅️ watch for route changes

const individualFirstName = computed(() => auth.user?.first_name || 'First');
const individualLastName = computed(() => auth.user?.last_name || 'Last');
const userEmail = computed(() => auth.user?.email);
const username = computed(() => auth.user?.username);
const azonId = computed(() => auth.user?.azon_id);
const userType = computed(() => auth.user?.type);

const createdAtDate = computed(() => {
  const createdAt = auth.user?.created_at;
  return createdAt && dayjs(createdAt).isValid() ? dayjs(createdAt).format('MMMM, YYYY') : 'Invalid date';
});

const logoPath = ref('');
const isProfileDropdownOpen = ref(false);
const profileButton = ref(null);
const profileMenu = ref(null);

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

// ⬅️ Close dropdown after any route navigation
watch(
  () => route.fullPath,
  () => {
    isProfileDropdownOpen.value = false;
    // Also ensure mobile sidebar isn't accidentally open
    emit('close-mobile-sidebar');
  }
);

// ⬅️ Close dropdown on link click (without touching the sidebar state)
const onDropdownLinkClick = () => {
  isProfileDropdownOpen.value = false;
  // DO NOT toggle/open the sidebar from here
  emit('close-mobile-sidebar'); // safe: just closes if it was open
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
  <header v-if="auth.isAuthenticated && userType === 'individual'"
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-line bg-surface px-4 py-3">
    <!-- Left Section -->
    <div class="flex min-w-0 items-center gap-2 sm:gap-4">
      <button @click="emit('toggle-mobile-sidebar')" class="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2" :aria-label="$t('common.menu')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <button @click="emit('toggle-sidebar')" class="hidden lg:flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2" :aria-label="$t('common.menu')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <a href="/individual-dashboard/index"
        class="text-base sm:text-lg font-semibold text-ink hover:text-primary max-w-[160px] sm:max-w-none truncate">
        {{ individualFirstName }} {{ individualLastName }}
      </a>

    </div>

    <!-- Right Section -->
    <div class="flex items-center gap-2 sm:gap-4">

      <!-- Organisation switcher -->
      <div v-if="auth.orgAccess.length > 0" class="relative">
        <label for="org-switcher" class="sr-only">{{ $t('account.switchOrg') }}</label>
        <select id="org-switcher" v-model="auth.currentOrgId" @change="auth.switchOrg(auth.currentOrgId)" :disabled="auth.isSwitchingOrg"
                  class="az-control max-w-[9rem] appearance-none py-0 pr-9 text-sm sm:max-w-[14rem]">
          <option v-for="org in auth.orgAccess" :key="org.org_type_user_id" :value="org.org_type_user_id">
            {{ org.org_name || `${$t('account.organisation')} ${org.org_type_user_id}` }}
          </option>
        </select>
        <!-- optional loading spinner -->
          <!--<span v-if="auth.isSwitchingOrg">Switching org...</span> -->

        <!-- Custom Dropdown Icon -->
        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-muted">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <Notification />

      <!-- Profile Section (unchanged) -->
      <div class="relative">
        <button ref="profileButton" @click="toggleProfileDropdown" class="flex items-center rounded-full"
          :aria-label="$t('account.openMenu')" :aria-expanded="isProfileDropdownOpen">
          <img :src="logoPath ? `${logoPath}` : placeholderImage" alt="Profile"

            class="w-10 h-10 rounded-full object-cover border border-line-strong" />
        </button>

        <transition name="fade">
          <div v-if="isProfileDropdownOpen" ref="profileMenu"
            class="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-card border border-line bg-surface shadow-pop z-50">

            <div class="flex justify-center p-4 border-b border-line">
              <img :src="logoPath ? `${logoPath}` : placeholderImage" alt="Profile"
                class="rounded-lg max-h-[90px] max-w-[200px] object-contain" />
            </div>

            <div class="p-4 border-b border-line">
              <p class="font-semibold text-ink break-all">{{ userEmail }}</p>
              <p class="text-xs text-ink-muted mt-1">{{ $t('account.username') }}: {{ username }}</p>
              <p class="text-xs text-ink-muted">{{ $t('account.azonId') }}: {{ azonId }}</p>
              <p class="text-xs text-ink-muted">{{ $t('account.joined') }}: {{ createdAtDate }}</p>
            </div>

            <!-- Language and theme -->
            <div class="p-4 border-b border-line">
              <AzAppearanceSettings />
            </div>

            <ul class="py-2 text-[15px] text-ink-2">
              <li>
                <router-link :to="{ name: 'individual-profile' }" class="flex min-h-[44px] items-center px-4 hover:bg-surface-2"
                  @click="onDropdownLinkClick">
                  {{ $t('account.myAccount') }}
                </router-link>
              </li>

              <li>
                <router-link :to="{ name: 'individual-security' }" class="flex min-h-[44px] items-center px-4 hover:bg-surface-2"
                  @click="onDropdownLinkClick">
                  {{ $t('account.security') }}
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
