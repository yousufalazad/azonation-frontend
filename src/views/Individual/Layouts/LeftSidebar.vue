<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <aside :class="{ 'w-64': isSidebarExpanded, 'w-20': !isSidebarExpanded }"
      class="transition-width duration-200 bg-white shadow h-screen overflow-y-auto">
      <div class="h-full flex flex-col">

        <!-- Sidebar Menu -->
        <nav class="flex-1 px-2 py-4 space-y-2">

          <!-- Static Links -->
          <router-link :to="{ name: 'individual-dashboard-index' }"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Dashboard</span>
            <span v-else class="hidden">Dashboard</span>
          </router-link>

          <router-link to="/org-dashboard/member-list"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Organisations</span>
            <span v-else class="hidden">Organisations</span>
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
            <span v-if="isSidebarExpanded">Recognitions</span>
            <span v-else class="hidden">Recognitions</span>
          </router-link>

          <router-link to="/org-dashboard/profile" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Attendance</span>
            <span v-else class="hidden">Attendance</span>
          </router-link>

          <router-link to="/org-dashboard/profile" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Reports</span>
            <span v-else class="hidden">Reports</span>
          </router-link>

          
          <router-link to="/individual-dashboard/individual-profile-update" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Profile</span>
            <span v-else class="hidden">Profile</span>
          </router-link>

          <router-link to="/org-dashboard/profile" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Settings</span>
            <span v-else class="hidden">Settings</span>
          </router-link>



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
