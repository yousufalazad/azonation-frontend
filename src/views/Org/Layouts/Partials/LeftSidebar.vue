<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <aside :class="{ 'w-64': isSidebarExpanded, 'w-20': !isSidebarExpanded }"
      class="transition-width duration-200 bg-white shadow h-screen overflow-y-auto">
      <div class="h-full flex flex-col">


        <!-- Sidebar Menu -->
        <nav class="flex-1 px-2 py-4 space-y-2">

          <!-- Static Links -->
          <router-link to="/org-dashboard/dashboard-initial-content"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Dashboard</span>
            <span v-else class="hidden">Dashboard</span>
          </router-link>
          <router-link to="/org-dashboard/member-list"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Members</span>
            <span v-else class="hidden">Members</span>
          </router-link>

          <router-link to="/org-dashboard/committee-list"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Committees</span>
            <span v-else class="hidden">Committees</span>
          </router-link>

          <router-link to="/org-dashboard/create-meeting"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Meetings</span>
            <span v-else class="hidden">Meetings</span>
          </router-link>

          <router-link to="/org-dashboard/create-event"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Events</span>
            <span v-else class="hidden">Events</span>
          </router-link>

          <router-link to="/org-dashboard/create-project"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Projects</span>
            <span v-else class="hidden">Projects</span>
          </router-link>
          
          <router-link to="/org-dashboard/profile" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Records</span>
            <span v-else class="hidden">Records</span>
          </router-link>

          <router-link to="/org-dashboard/profile" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Accounts</span>
            <span v-else class="hidden">Accounts</span>
          </router-link>

          <router-link to="/org-dashboard/profile" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Reports</span>
            <span v-else class="hidden">Reports</span>
          </router-link>

          <!-- Reports Section -->
          <!-- <div>
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
              <router-link to="/dashboard/reports/project1"
                class="block px-4 text-gray-500 py-2 hover:text-gray-900">Report 1</router-link>
              <router-link to="/dashboard/reports/project2"
                class="block px-4 text-gray-500 py-2 hover:text-gray-900">Report 2</router-link>
            </div>
          </div> -->

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
              
              <router-link to="/org-dashboard/profile"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Profile</router-link>

              <router-link to="/org-dashboard/fundamental-info"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Fundamental Info</router-link>

              <router-link to="/org-dashboard/founders"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Founders</router-link>

              <router-link to="/org-dashboard/strategic-plan"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Strategic plan</router-link>

              <router-link to="/org-dashboard/profile"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Recognitions</router-link>

              <router-link to="/org-dashboard/success-story"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Success story</router-link>

              <router-link to="/org-dashboard/history"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">History</router-link>

              <router-link to="/org-dashboard/profile"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Year plan</router-link>
            </div>
          </div>

          <!-- <router-link to="/org-dashboard/profile" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Settings</span>
            <span v-else class="hidden">Settings</span>
          </router-link> -->



        </nav>
      </div>
    </aside>


    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <div class="py-6">
        <div class="max-w-7xl mx-auto px-4">
          <router-view />
        </div>
      </div>
    </main>

  </div>
</template>

<script>
export default {
  data() {
    return {
      isSidebarExpanded: true,
      openSections: [],
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    toggleSection(section) {
      if (this.openSections.includes(section)) {
        this.openSections = this.openSections.filter(s => s !== section);
      } else {
        this.openSections.push(section);
      }
    },
    isSectionOpen(section) {
      return this.openSections.includes(section);
    }
  }
};
</script>

<style scoped>
/* You can add custom styles or adjustments here */
</style>
