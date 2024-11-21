<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <aside :class="{ 'w-64': isSidebarExpanded, 'w-20': !isSidebarExpanded }"
      class="transition-width duration-200 bg-white shadow h-full overflow-y-auto">
      <div class="h-full flex flex-col">
        <!-- Sidebar Menu -->
        <nav class="flex-1 px-2 py-4 space-y-2">
          <!-- v-if="auth.isAuthenticated && userType == 'superadmin'" -->
          <!-- Static Links -->
          <router-link to="/superadmin-dashboard/initial-content"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">SuperAdmin Dashboard</span>
            <span v-else class="hidden">SuperAdmin Dashboard</span>
          </router-link>

          <!-- Master Setting section -->
          <div>
            <button @click="toggleSection('masterSetting')"
              class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
              <span v-if="isSidebarExpanded">Master Setting</span>
              <svg v-if="isSectionOpen('masterSetting')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div v-if="isSectionOpen('masterSetting') && isSidebarExpanded" class="space-y-1">
              <router-link to="/superadmin-dashboard/country"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Country
              </router-link>
              <router-link to="/superadmin-dashboard/user-country"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">User Country
              </router-link>
              <router-link to="/superadmin-dashboard/dialing-code"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Dialing Code
              </router-link>
              
              <router-link to="/superadmin-dashboard/conduct-type"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Conduct Type
              </router-link>
              <router-link to="/superadmin-dashboard/attendance-type"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Attendance Type
              </router-link>
              <router-link to="/superadmin-dashboard/membership-type"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Membership Type
              </router-link>
              <router-link to="/superadmin-dashboard/designation"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Designation
              </router-link>
              <router-link to="/superadmin-dashboard/language-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Language List
              </router-link>
              <router-link to="/superadmin-dashboard/time-zone-setup"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Time Zone Setup
              </router-link>
            </div>
          </div>

          <!-- Billing section -->
          <div>
            <button @click="toggleSection('financial')"
              class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
              <span v-if="isSidebarExpanded">Financial</span>
              <svg v-if="isSectionOpen('financial')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div v-if="isSectionOpen('financial') && isSidebarExpanded" class="space-y-1">

              <router-link to="/superadmin-dashboard/super-admin-payment-log"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Payment</router-link>

              <router-link to="/superadmin-dashboard/super-admin-subscription-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Subscription</router-link>
                
              <router-link to="/superadmin-dashboard/user-price-rate"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">User price rate</router-link>

              <router-link to="/superadmin-dashboard/super-admin-billing-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Billing</router-link>

              <router-link to="/superadmin-dashboard/super-admin-invoice-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Invoice</router-link>

              <router-link to="/superadmin-dashboard/super-admin-receipt-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Receipt</router-link>
              
                <router-link to="/superadmin-dashboard/super-admin-packages"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Package</router-link>

                <router-link to="/superadmin-dashboard/index-price"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Price</router-link>

                <router-link to="/superadmin-dashboard/index-currency"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Currency Index</router-link>
                
                <router-link to="/superadmin-dashboard/user-currency"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">User Currency</router-link>
                
              

            </div>
          </div>

          <!-- Email History -->
          <div>
            <button @click="toggleSection('email')"
              class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
              <span v-if="isSidebarExpanded">Email</span>
              <svg v-if="isSectionOpen('email')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div v-if="isSectionOpen('email') && isSidebarExpanded" class="space-y-1">

              <router-link to="/superadmin-dashboard/subscription-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Subscription</router-link>

              <router-link to="/superadmin-dashboard/billing-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Billing</router-link>

              <router-link to="/superadmin-dashboard/superadmin-invoice-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Invoice</router-link>

              <router-link to="/superadmin-dashboard/receipt-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Receipt</router-link>

              <router-link to="/superadmin-dashboard/packages"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Packages</router-link>

            </div>
          </div>

          <!-- <router-link to="/superadmin-dashboard/member-list"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Members</span>
            <span v-else class="hidden">Members</span>
          </router-link>

          <router-link to="/superadmin-dashboard/committee-list"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Committees</span>
            <span v-else class="hidden">Committees</span>
          </router-link>

          <router-link to="/superadmin-dashboard/create-meeting"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Meetings</span>
            <span v-else class="hidden">Meetings</span>
          </router-link>

          <router-link to="/superadmin-dashboard/create-event"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Events</span>
            <span v-else class="hidden">Events</span>
          </router-link>

          <router-link to="/superadmin-dashboard/create-project"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Projects</span>
            <span v-else class="hidden">Projects</span>
          </router-link>

          <router-link to="/superadmin-dashboard/accounts"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Accounts</span>
            <span v-else class="hidden">Accounts</span>
          </router-link>

          <router-link to="/superadmin-dashboard/asset-management"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Assets</span>
            <span v-else class="hidden">Assets</span>
          </router-link>

          <router-link to="/superadmin-dashboard/office-record"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">Records</span>
            <span v-else class="hidden">Records</span>
          </router-link> -->

          <!-- Report section -->
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
              <router-link to="/superadmin-dashboard/org-report"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Income</router-link>
              <router-link to="/superadmin-dashboard/org-expense-report"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Expense</router-link>

            </div>
          </div> -->

          <!-- Profile Section -->
          <!-- <div>
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
              <router-link to="/superadmin-dashboard/my-account/profile"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Profile</router-link>
              <router-link to="/superadmin-dashboard/fundamental-info"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Fundamental Info</router-link>
              <router-link to="/superadmin-dashboard/founders"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Founders</router-link>
              <router-link to="/superadmin-dashboard/strategic-plan"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Strategic plan</router-link>
              <router-link to="/superadmin-dashboard/recognition"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Recognition</router-link>
              <router-link to="/superadmin-dashboard/success-story"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Success story</router-link>
              <router-link to="/superadmin-dashboard/history"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">History</router-link>
              <router-link to="/superadmin-dashboard/year-plan"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Year plan</router-link>
            </div>
          </div> -->
        </nav>
        <!-- Example target section -->
        <div class="py-10"></div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto flex flex-col">
      <div class="py-6 flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4">
          <router-view />
          <!-- Example target section -->
          <div class="py-10"></div>
        </div>
      </div>
      <!-- Footer -->
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
    },
  }
};
</script>

<style scoped>
/* Custom styles */
aside {
  transition: width 0.2s;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>