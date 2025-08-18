<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  Home as HomeIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  ClipboardList as ClipboardListIcon,
  Folder as FolderIcon,
  FileText as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  UserCircle as UserCircleIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
} from 'lucide-vue-next'

const openSections = ref([]);
const route = useRoute();
const isActiveRoute = (name) => route.name === name;

const props = defineProps({
  isSidebarExpanded: Boolean,
});



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
  <nav class="h-full overflow-y-auto p-4 space-y-2 bg-white shadow">
    <!-- Static Links -->
    <template v-for="link in [
      { name: 'Home', routeName: 'individual-dashboard-index', icon: HomeIcon },
      { name: 'Organisations', routeName: 'connected-organisations', icon: UsersIcon },
      { name: 'Committees', routeName: 'individual-committees', icon: BriefcaseIcon },
      { name: 'Meetings', routeName: 'individual-meetings', icon: CalendarIcon },
      { name: 'Events', routeName: 'individual-events', icon: ClipboardListIcon },
      { name: 'Projects', routeName: 'individual-projects', icon: FolderIcon },
      { name: 'Assets', routeName: 'individual-assets', icon: FileTextIcon },
      { name: 'Attendances', routeName: 'individual-attendances', icon: CheckCircleIcon },
      // { name: 'Settings', routeName: 'individual-settings', icon: SettingsIcon }
    ]" :key="link.routeName">
      <router-link :to="{ name: link.routeName }" :class="[
        'flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap',
        isActiveRoute(link.routeName) ? 'bg-gray-200 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
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

          <router-link :to="{ name: 'individual-profile' }" class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
            My Profile
          </router-link>

          <router-link :to="{ name: 'individual-security' }" class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">
            Security
          </router-link>

        </div>
      </transition>
    </div>

    <!-- Expandable: Reports -->
    <!-- <div>
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
          <router-link to="/org-dashboard/org-report"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Income</router-link>
          <router-link to="/org-dashboard/org-expense-report"
            class="block px-2 py-1 hover:bg-gray-100 rounded text-gray-600">Expense</router-link>
        </div>
      </transition>
    </div> -->
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
