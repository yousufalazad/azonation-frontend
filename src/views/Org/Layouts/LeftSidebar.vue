<script setup>
import { ref } from 'vue';

const isSidebarExpanded = ref(true);
const openSections = ref([]);

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value;
};

const toggleSection = (section) => {
  if (openSections.value.includes(section)) {
    openSections.value = openSections.value.filter(s => s !== section);
  } else {
    openSections.value.push(section);
  }
};

const isSectionOpen = (section) => openSections.value.includes(section);
</script>

<template>
  <nav class="flex-1 px-2 py-4 space-y-2">
    <!-- v-if="auth.isAuthenticated && userType == 'organisation'" -->
    <!-- Static Links -->
    <router-link to="/org-dashboard/index"
      class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Dashboard</span>
      <span v-else class="hidden">Dashboard</span>
    </router-link>

    <router-link to="/org-dashboard/index-member" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Members</span>
      <span v-else class="hidden">Members</span>
    </router-link>


    <router-link to="/org-dashboard/independent-member"
      class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Independent Member</span>
      <span v-else class="hidden">Independent Member</span>
    </router-link>

    <!-- <router-link to="/org-dashboard/family-member"
      class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Family Member</span>
      <span v-else class="hidden">Family Member</span>
    </router-link> -->


    <router-link to="/org-dashboard/committee-list" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Committees</span>
      <span v-else class="hidden">Committees</span>
    </router-link>

    <router-link to="/org-dashboard/meetings" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Meetings</span>
      <span v-else class="hidden">Meetings</span>
    </router-link>

    <router-link to="/org-dashboard/events" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Events</span>
      <span v-else class="hidden">Events</span>
    </router-link>

    <router-link to="/org-dashboard/projects" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Projects</span>
      <span v-else class="hidden">Projects</span>
    </router-link>

    <router-link to="/org-dashboard/accounts" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Accounts</span>
      <span v-else class="hidden">Accounts</span>
    </router-link>

    <router-link to="/org-dashboard/asset-management"
      class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Assets</span>
      <span v-else class="hidden">Assets</span>
    </router-link>

    <router-link to="/org-dashboard/office-document" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
      <span v-if="isSidebarExpanded">Documents</span>
      <span v-else class="hidden">Documents</span>
    </router-link>
    <!-- Report section -->
    <div>
      <button @click="toggleSection('reports')"
        class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
        <span v-if="isSidebarExpanded">Reports</span>
        <svg v-if="isSectionOpen('reports')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <div v-if="isSectionOpen('reports') && isSidebarExpanded" class="space-y-1">
        <router-link to="/org-dashboard/org-report"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Income</router-link>
        <router-link to="/org-dashboard/org-expense-report"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Expense</router-link>

      </div>
    </div>

    <!-- Profile Section -->
    <div>
      <button @click="toggleSection('profile')"
        class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
        <span v-if="isSidebarExpanded">Profile</span>
        <svg v-if="isSectionOpen('profile')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <div v-if="isSectionOpen('profile') && isSidebarExpanded" class="space-y-1">
        <router-link to="/org-dashboard/my-account/profile"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Profile</router-link>
        <router-link to="/org-dashboard/fundamental-info"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Fundamental Info</router-link>
        <router-link to="/org-dashboard/founders"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Founders</router-link>
        <router-link to="/org-dashboard/strategic-plan"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Strategic plan</router-link>
        <router-link to="/org-dashboard/recognition"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Recognition</router-link>
        <router-link to="/org-dashboard/success-story"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Success story</router-link>
        <router-link to="/org-dashboard/history"
          class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">History</router-link>
        <router-link to="/org-dashboard/year-plan" class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Year
          plan</router-link>
      </div>
    </div>
  </nav>
</template>