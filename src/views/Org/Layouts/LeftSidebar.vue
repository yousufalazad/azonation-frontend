<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  HomeIcon,
  UsersIcon,
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClipboardListIcon,
  FolderIcon,
  DollarSignIcon,
  FileTextIcon,
  BarChartIcon,
  UserCircleIcon,
} from 'lucide-vue-next';

const props = defineProps({ isSidebarExpanded: Boolean });
const openSections = ref([]);
const route = useRoute();

const toggleSection = (section) => {
  if (openSections.value.includes(section)) {
    openSections.value = openSections.value.filter(s => s !== section);
  } else {
    openSections.value.push(section);
  }
};

const isSectionOpen = (section) => openSections.value.includes(section);
const isActive = (path) => route.path === path;
</script>

<template>
  <nav class="h-full p-4 space-y-2">
    <template v-for="link in [
      { name: 'Home', path: '/org-dashboard/index', icon: HomeIcon },
      { name: 'Members', path: '/org-dashboard/index-member', icon: UsersIcon },
      { name: 'Independent Member', path: '/org-dashboard/independent-member', icon: UserIcon },
      { name: 'Committees', path: '/org-dashboard/committee-list', icon: BriefcaseIcon },
      { name: 'Meetings', path: '/org-dashboard/meetings', icon: CalendarIcon },
      { name: 'Events', path: '/org-dashboard/events', icon: ClipboardListIcon },
      { name: 'Projects', path: '/org-dashboard/projects', icon: FolderIcon },
      { name: 'Accounts', path: '/org-dashboard/accounts', icon: DollarSignIcon },
      { name: 'Assets', path: '/org-dashboard/asset-management', icon: FileTextIcon },
      { name: 'Documents', path: '/org-dashboard/office-document', icon: FileTextIcon }
    ]" :key="link.path">
      <router-link
        :to="link.path"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap transition-all duration-300',
          isActive(link.path) ? 'bg-gray-200 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
        ]"
        :title="!props.isSidebarExpanded ? link.name : ''"
      >
        <component :is="link.icon" class="h-5 w-5" />
        <span v-if="props.isSidebarExpanded">{{ link.name }}</span>
      </router-link>
    </template>

    <!-- Expandable: Reports -->
    <div>
      <button @click="toggleSection('reports')"
        class="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-300"
        :title="!props.isSidebarExpanded ? 'Reports' : ''">
        <BarChartIcon class="h-5 w-5" />
        <span v-if="props.isSidebarExpanded">Reports</span>
        <svg class="ml-auto h-4 w-4 transition-transform duration-300"
             :class="{ 'rotate-180': isSectionOpen('reports') }"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <transition name="fade-slide">
        <div v-if="isSectionOpen('reports') && props.isSidebarExpanded" class="ml-7 space-y-1">
          <router-link to="/org-dashboard/org-report" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Income</router-link>
          <router-link to="/org-dashboard/org-expense-report" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Expense</router-link>
        </div>
      </transition>
    </div>

    <!-- Expandable: Profile -->
    <div>
      <button @click="toggleSection('profile')"
        class="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-300"
        :title="!props.isSidebarExpanded ? 'Profile' : ''">
        <UserCircleIcon class="h-5 w-5" />
        <span v-if="props.isSidebarExpanded">Profile</span>
        <svg class="ml-auto h-4 w-4 transition-transform duration-300"
             :class="{ 'rotate-180': isSectionOpen('profile') }"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <transition name="fade-slide">
        <div v-if="isSectionOpen('profile') && props.isSidebarExpanded" class="ml-7 space-y-1">
          <router-link to="/org-dashboard/my-account/profile" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Profile</router-link>
          <router-link to="/org-dashboard/founders" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Founders</router-link>
          <router-link to="/org-dashboard/strategic-plan" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Strategic Plan</router-link>
          <router-link to="/org-dashboard/recognition" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Recognition</router-link>
          <router-link to="/org-dashboard/success-story" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Success Story</router-link>
          <router-link to="/org-dashboard/history" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">History</router-link>
          <router-link to="/org-dashboard/year-plan" class="block px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Year Plan</router-link>
        </div>
      </transition>
    </div>
  </nav>
</template>

<style scoped>
nav::-webkit-scrollbar {
  width: 4px;
}
nav::-webkit-scrollbar-thumb {
  background-color: darkgray;
  border-radius: 10px;
}
nav::-webkit-scrollbar-track {
  background: lightgray;
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
