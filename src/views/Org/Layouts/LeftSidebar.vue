<script setup>
import { canOpenOrgRoute, isActingForOrg } from '@/router/orgAccess';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  HomeIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClipboardListIcon,
  FolderIcon,
  FileTextIcon,
  PackageIcon,
  WalletIcon,
  BarChartIcon,
  UserCircleIcon,
  Building2Icon,
  SettingsIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  LifeBuoyIcon,
} from 'lucide-vue-next';

const props = defineProps({
  isSidebarExpanded: Boolean,
});

const emit = defineEmits(['close-mobile-menu']);

const route = useRoute();
const router = useRouter();

// Menu structure: `label` is an i18n key. Items with `children` open and close.
const menu = [
  { label: 'nav.home', to: '/org-dashboard/index', icon: HomeIcon },
  {
    id: 'membership', label: 'nav.membership', icon: UserCircleIcon,
    children: [
      { label: 'nav.members', to: { name: 'index-member' } },
      { label: 'nav.unlinkedMembers', to: { name: 'unlink-member' } },
      { label: 'nav.terminatedMembers', to: { name: 'terminated-member' } },
      { label: 'nav.membershipRenewal', to: { name: 'org-membership-renewal' } },
      { label: 'nav.renewalCycle', to: { name: 'org-membership-renewal-cycle' } },
      { label: 'nav.membershipType', to: { name: 'org-membership-type' } },
      { label: 'nav.memberFamilies', to: { name: 'member-families' } },
    ],
  },
  { label: 'nav.committees', to: '/org-dashboard/committees', icon: BriefcaseIcon },
  { label: 'nav.meetings', to: '/org-dashboard/meetings', icon: CalendarIcon },
  { label: 'nav.events', to: '/org-dashboard/events', icon: ClipboardListIcon },
  { label: 'nav.projects', to: '/org-dashboard/projects', icon: FolderIcon },
  { label: 'nav.assets', to: '/org-dashboard/asset-management', icon: PackageIcon },
  { label: 'nav.documents', to: '/org-dashboard/office-document', icon: FileTextIcon },
  { label: 'nav.fundManagement', to: '/org-dashboard/fund-management', icon: WalletIcon },
  {
    id: 'organisation', label: 'nav.aboutOrg', icon: Building2Icon,
    children: [
      { label: 'nav.founders', to: { name: 'founders' } },
      { label: 'nav.strategicPlan', to: { name: 'strategic-plan' } },
      { label: 'nav.recognition', to: { name: 'recognition' } },
      { label: 'nav.successStory', to: { name: 'success-story' } },
      { label: 'nav.history', to: { name: 'history' } },
      { label: 'nav.yearPlan', to: { name: 'year-plan' } },
    ],
  },
  {
    id: 'reports', label: 'nav.reports', icon: BarChartIcon,
    children: [
      { label: 'nav.reportOverview', to: { name: 'org-report' } },
      { label: 'nav.eventReports', to: { name: 'index-event-summary' } },
      { label: 'nav.meetingMinutes', to: { name: 'index-meeting-minutes' } },
    ],
  },
  {
    id: 'settings', label: 'nav.settings', icon: SettingsIcon,
    children: [
      { label: 'nav.administrator', to: '/org-dashboard/administrator' },
      { label: 'nav.adminRole', to: '/org-dashboard/user-role-assign' },
      { label: 'nav.orgSettings', to: { name: 'settings' } },
    ],
  },
  { label: 'nav.support', to: { name: 'support' }, icon: LifeBuoyIcon },
];

// A member with a role sees only what their role lets them open, plus a way back to their own area
const resolved = (to) => {
  try {
    return router.resolve(to);
  } catch {
    return null;
  }
};
const visibleMenu = computed(() => {
  const items = menu
    .map((item) => (item.children ? { ...item, children: item.children.filter((c) => canOpenOrgRoute(resolved(c.to))) } : item))
    .filter((item) => (item.children ? item.children.length > 0 : canOpenOrgRoute(resolved(item.to))));
  return isActingForOrg()
    ? [{ label: 'nav.backToMemberArea', to: { name: 'individual-dashboard-index' }, icon: ArrowLeftIcon }, ...items]
    : items;
});

const openSections = ref([]);

const pathOf = (to) => {
  try {
    return router.resolve(to).path;
  } catch {
    return '';
  }
};
const isActive = (to) => route.path === pathOf(to);
const sectionHasActive = (item) => item.children?.some((c) => isActive(c.to));

const toggleSection = (id) => {
  openSections.value = openSections.value.includes(id)
    ? openSections.value.filter((s) => s !== id)
    : [...openSections.value, id];
};
const isOpen = (id) => openSections.value.includes(id) && props.isSidebarExpanded;

// Open the section that contains the current page, so people can see where they are
watch(
  () => route.path,
  () => {
    menu.forEach((item) => {
      if (sectionHasActive(item) && !openSections.value.includes(item.id)) {
        openSections.value = [...openSections.value, item.id];
      }
    });
  },
  { immediate: true },
);

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
      <li v-for="item in visibleMenu" :key="item.label">
        <!-- Single link -->
        <router-link v-if="!item.children" :to="item.to" :class="itemClass(isActive(item.to))"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :title="!props.isSidebarExpanded ? $t(item.label) : undefined" @click="handleLinkClick">
          <component :is="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
          <span v-if="props.isSidebarExpanded" class="truncate">{{ $t(item.label) }}</span>
        </router-link>

        <!-- Section with sub-pages -->
        <template v-else>
          <button type="button" :class="itemClass(sectionHasActive(item) && !isOpen(item.id))"
            :aria-expanded="isOpen(item.id)" :title="!props.isSidebarExpanded ? $t(item.label) : undefined"
            @click="toggleSection(item.id)">
            <component :is="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
            <span v-if="props.isSidebarExpanded" class="truncate">{{ $t(item.label) }}</span>
            <ChevronDownIcon v-if="props.isSidebarExpanded" class="ml-auto h-4 w-4 shrink-0 transition-transform"
              :class="{ 'rotate-180': isOpen(item.id) }" aria-hidden="true" />
          </button>
          <ul v-show="isOpen(item.id)" class="ml-5 mt-1 flex flex-col gap-0.5 border-l border-line pl-3">
            <li v-for="child in item.children" :key="child.label">
              <router-link :to="child.to" @click="handleLinkClick"
                :aria-current="isActive(child.to) ? 'page' : undefined"
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
