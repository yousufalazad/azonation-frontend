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

const props = defineProps({
  isSidebarExpanded: Boolean,
});

const openSections = ref([]);
const route = useRoute();

const emit = defineEmits(['close-mobile-menu']);
const handleLinkClick = () => {
  if (window.innerWidth < 1024) {
    emit('close-mobile-menu');
  }
};

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
  <nav class="h-full overflow-y-auto p-4 space-y-2">
    <!-- Static Links -->
    <template v-for="link in [
      { name: 'Home', path: '/org-dashboard/index', icon: HomeIcon },
    ]" :key="link.path">
      <router-link :to="link.path" @click="handleLinkClick" :class="[
        'flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap',
        isActive(link.path) ? 'bg-gray-200 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
      ]" :title="!props.isSidebarExpanded ? link.name : ''">
        <component :is="link.icon" class="h-5 w-5" />
        <span v-if="props.isSidebarExpanded">{{ link.name }}</span>
      </router-link>
    </template>

    <div>
      <button @click="toggleSection('membership')"
        class="w-full text-left px-4 py-2 flex items-center gap-3 rounded-md text-gray-700 hover:bg-gray-100 transition"
        :title="!props.isSidebarExpanded ? 'Profile' : ''">
        <UserCircleIcon class="h-5 w-5" />
        <span v-if="props.isSidebarExpanded">Membership</span>
        <svg class="ml-auto h-4 w-4 transition-transform" :class="{ 'rotate-180': isSectionOpen('profile') }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <transition name="fade-slide">
        <div v-if="isSectionOpen('membership') && props.isSidebarExpanded" class="ml-7 space-y-1">
          <!-- { name: 'Members', path: '/org-dashboard/index-member', icon: UsersIcon },
          { name: 'Unlink Member', path: '/org-dashboard/unlink-member', icon: UserIcon }, -->

          <router-link to="/org-dashboard/index-member" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Members</router-link>
          <router-link to="/org-dashboard/unlink-member" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Unlink Member</router-link>
          
          
          <router-link :to="{ name: 'terminated-member' }" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
            Terminated Member
          </router-link>

          <router-link :to="{ name: 'org-membership-renewal' }" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
            Membership Renewal
          </router-link>
          <!-- <router-link to="/org-dashboard/index-member" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Member Renewal Status</router-link> -->
          <router-link to="/org-dashboard/org-membership-renewal-cycle" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Membership Renewal Cycle</router-link>
          <router-link to="/org-dashboard/org-membership-renewal-price" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Membership Renewal Price</router-link>
                   
          <router-link :to="{ name: 'org-membership-type' }" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
           Membership Type
          </router-link>

          <router-link :to="{ name: 'administrator' }" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
            Org Administrator
          </router-link>
        </div>
      </transition>
    </div>

    <template v-for="link in [
      { name: 'Committees', path: '/org-dashboard/committees', icon: BriefcaseIcon },
      { name: 'Meetings', path: '/org-dashboard/meetings', icon: CalendarIcon },
      { name: 'Events', path: '/org-dashboard/events', icon: ClipboardListIcon },
      { name: 'Projects', path: '/org-dashboard/projects', icon: FolderIcon },
      { name: 'Assets', path: '/org-dashboard/asset-management', icon: FileTextIcon },
      { name: 'Documents', path: '/org-dashboard/office-document', icon: FileTextIcon },
      { name: 'Accounts', path: '/org-dashboard/accounts', icon: DollarSignIcon },

    ]" :key="link.path">
      <router-link :to="link.path" @click="handleLinkClick" :class="[
        'flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap',
        isActive(link.path) ? 'bg-gray-200 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
      ]" :title="!props.isSidebarExpanded ? link.name : ''">
        <component :is="link.icon" class="h-5 w-5" />
        <span v-if="props.isSidebarExpanded">{{ link.name }}</span>
      </router-link>
    </template>
    <!-- Expandable: Profile -->
    <div>
      <button @click="toggleSection('profile')"
        class="w-full text-left px-4 py-2 flex items-center gap-3 rounded-md text-gray-700 hover:bg-gray-100 transition"
        :title="!props.isSidebarExpanded ? 'Profile' : ''">
        <UserCircleIcon class="h-5 w-5" />
        <span v-if="props.isSidebarExpanded">Profile</span>
        <svg class="ml-auto h-4 w-4 transition-transform" :class="{ 'rotate-180': isSectionOpen('profile') }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <transition name="fade-slide">
        <div v-if="isSectionOpen('profile') && props.isSidebarExpanded" class="ml-7 space-y-1">
          <router-link to="/org-dashboard/my-account/profile" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Profile</router-link>
          <router-link to="/org-dashboard/founders" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Founders</router-link>
          <router-link to="/org-dashboard/strategic-plan" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Strategic Plan</router-link>
          <router-link to="/org-dashboard/recognition" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Recognition</router-link>
          <router-link to="/org-dashboard/success-story" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Success Story</router-link>
          <router-link to="/org-dashboard/history" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">History</router-link>
          <router-link to="/org-dashboard/year-plan" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Year Plan</router-link>
        </div>
      </transition>
    </div>

    <!-- Expandable: Reports -->
    <div>
      <button @click="toggleSection('reports')"
        class="w-full text-left px-4 py-2 flex items-center gap-3 rounded-md text-gray-700 hover:bg-gray-100 transition"
        :title="!props.isSidebarExpanded ? 'Reports' : ''">
        <BarChartIcon class="h-5 w-5" />
        <span v-if="props.isSidebarExpanded">Reports</span>
        <svg class="ml-auto h-4 w-4 transition-transform" :class="{ 'rotate-180': isSectionOpen('reports') }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <transition name="fade-slide">
        <div v-if="isSectionOpen('reports') && props.isSidebarExpanded" class="ml-7 space-y-1">
          <router-link to="/org-dashboard/org-report" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Income</router-link>
          <router-link to="/org-dashboard/org-expense-report" @click="handleLinkClick"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Expense</router-link>
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
