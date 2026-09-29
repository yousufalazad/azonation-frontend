<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  Home as HomeIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  ClipboardList as ClipboardListIcon,
  Folder as FolderIcon,
  Package as PackageIcon,
  CheckCircle as CheckCircleIcon,
  UserCircle as UserCircleIcon,
  ChevronDown as ChevronDownIcon,
  LifeBuoy as LifeBuoyIcon,
} from 'lucide-vue-next';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const route = useRoute();

const props = defineProps({
  isSidebarExpanded: Boolean,
});

const emit = defineEmits(['close-mobile-menu']);

// `label` is an i18n key. These are the member's own pages, open to every member.
const links = [
  { label: 'nav.home', routeName: 'individual-dashboard-index', icon: HomeIcon },
  { label: 'nav.organisations', routeName: 'connected-organisations', icon: UsersIcon },
  { label: 'nav.committees', routeName: 'individual-committees', icon: BriefcaseIcon },
  { label: 'nav.meetings', routeName: 'individual-meetings', icon: CalendarIcon },
  { label: 'nav.events', routeName: 'individual-events', icon: ClipboardListIcon },
  { label: 'nav.projects', routeName: 'individual-projects', icon: FolderIcon },
  { label: 'nav.assets', routeName: 'individual-assets', icon: PackageIcon },
  { label: 'nav.attendances', routeName: 'individual-attendances', icon: CheckCircleIcon },
  { label: 'nav.support', routeName: 'individual-support', icon: LifeBuoyIcon },
];

const profileLinks = [
  { label: 'nav.myProfile', routeName: 'individual-profile' },
  { label: 'nav.security', routeName: 'individual-security' },
  { label: 'nav.notifications', routeName: 'individual-notifications' },
  { label: 'accountNav.settings', routeName: 'individual-settings' },
];

const visibleLinks = computed(() => links.filter((l) => !l.permission || auth.hasPermission(l.permission)));
const isActive = (name) => route.name === name;
const profileActive = computed(() => profileLinks.some((l) => isActive(l.routeName)));

const profileOpen = ref(false);
watch(profileActive, (active) => { if (active) profileOpen.value = true; }, { immediate: true });

const handleLinkClick = () => {
  if (window.innerWidth < 1024) emit('close-mobile-menu');
};

const itemClass = (active) => [
  'flex min-h-[44px] w-full items-center gap-3 rounded-control px-3 text-[15px] transition-colors whitespace-nowrap',
  active ? 'bg-primary-soft font-semibold text-primary-soft-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
];
</script>

<template>
  <nav class="h-full overflow-y-auto overscroll-y-contain p-3" :aria-label="$t('common.menu')">
    <ul class="flex flex-col gap-1">
      <li v-for="link in visibleLinks" :key="link.routeName">
        <router-link :to="{ name: link.routeName }" :class="itemClass(isActive(link.routeName))"
          :aria-current="isActive(link.routeName) ? 'page' : undefined"
          :title="!props.isSidebarExpanded ? $t(link.label) : undefined" @click="handleLinkClick">
          <component :is="link.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
          <span v-if="props.isSidebarExpanded" class="truncate">{{ $t(link.label) }}</span>
        </router-link>
      </li>

      <!-- Profile section -->
      <li>
        <button type="button" :class="itemClass(profileActive && !(profileOpen && props.isSidebarExpanded))"
          :aria-expanded="profileOpen && props.isSidebarExpanded"
          :title="!props.isSidebarExpanded ? $t('nav.profile') : undefined" @click="profileOpen = !profileOpen">
          <UserCircleIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
          <span v-if="props.isSidebarExpanded" class="truncate">{{ $t('nav.profile') }}</span>
          <ChevronDownIcon v-if="props.isSidebarExpanded" class="ml-auto h-4 w-4 shrink-0 transition-transform"
            :class="{ 'rotate-180': profileOpen }" aria-hidden="true" />
        </button>
        <ul v-show="profileOpen && props.isSidebarExpanded" class="ml-5 mt-1 flex flex-col gap-0.5 border-l border-line pl-3">
          <li v-for="link in profileLinks" :key="link.routeName">
            <router-link :to="{ name: link.routeName }" @click="handleLinkClick"
              :aria-current="isActive(link.routeName) ? 'page' : undefined"
              class="flex min-h-[40px] items-center rounded-control px-3 text-[14px] transition-colors"
              :class="isActive(link.routeName) ? 'bg-primary-soft font-semibold text-primary-soft-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'">
              {{ $t(link.label) }}
            </router-link>
          </li>
        </ul>
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
