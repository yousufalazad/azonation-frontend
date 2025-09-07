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
          <!-- <router-link to="/superadmin-dashboard/initial-content"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <span v-if="isSidebarExpanded">SuperAdmin Dashboard</span>
            <span v-else class="hidden">SuperAdmin Dashboard</span>
          </router-link> -->
          
          <!-- Financial section -->
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

              <router-link to="/superadmin-dashboard/super-admin-payment-log-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Payment</router-link>

              <router-link to="/superadmin-dashboard/super-admin-subscription-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Subscription</router-link>

              <router-link to="/superadmin-dashboard/user-price-rate"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">User price rate</router-link>

              <router-link to="/superadmin-dashboard/super-admin-billing-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100"> Billing</router-link>
              <router-link to="/superadmin-dashboard/super-admin-every-day-member-count-and-bill-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Every Day Member Count </router-link>
              <router-link to="/superadmin-dashboard/super-admin-everyday-storage-billing-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Everyday Storage Billing </router-link>
              <router-link to="/superadmin-dashboard/super-admin-management-and-storage-billing-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Management and Storage Billing </router-link>

              <router-link to="/superadmin-dashboard/super-admin-invoice-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Invoice</router-link>

              <router-link to="/superadmin-dashboard/super-admin-receipt-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Receipt</router-link>

              <router-link to="/superadmin-dashboard/super-admin-packages"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Package</router-link>

              <router-link to="/superadmin-dashboard/index-price"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Price</router-link>

              <router-link to="/superadmin-dashboard/index-currency"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Currency</router-link>
              <router-link to="/superadmin-dashboard/region-currency"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Region Currency</router-link>
              <router-link to="/superadmin-dashboard/regional-tax-rate"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Region Tax Rate</router-link>

            </div>
          </div>

          <!-- Org Reporting -->
          <div>
            <button @click="toggleSection('org-reporting')"
              class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
              <span v-if="isSidebarExpanded">Org Reporting</span>
              <svg v-if="isSectionOpen('org-reporting')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div v-if="isSectionOpen('org-reporting') && isSidebarExpanded" class="space-y-1">

              <router-link to="/superadmin-dashboard/subscription-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Subscription</router-link>

              
            </div>
          </div>

          <!-- Individual Reporting -->
          <div>
            <button @click="toggleSection('individual-reporting')"
              class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
              <span v-if="isSidebarExpanded">Individual Reporting</span>
              <svg v-if="isSectionOpen('individual-reporting')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div v-if="isSectionOpen('individual-reporting') && isSidebarExpanded" class="space-y-1">

              <router-link to="/superadmin-dashboard/subscription-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Subscription</router-link>

              
            </div>
          </div>

          <!-- Master Settings section -->
          <div>
            <button @click="toggleSection('masterSetting')"
              class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
              <span v-if="isSidebarExpanded">Master Settings</span>
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
              <router-link to="/superadmin-dashboard/membership-renewal-cycle"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Membership Renewal Cycle
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

              <router-link to="/superadmin-dashboard/region"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Region
              </router-link>
              <router-link to="/superadmin-dashboard/country-region"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Country Region
              </router-link>

              <router-link to="/superadmin-dashboard/privacy-setup"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Privacy Setup
              </router-link>
            </div>
          </div>


          <!-- E-commerce Settings section -->
          <div>
            <button @click="toggleSection('e-commerce')"
              class="w-full text-left px-4 py-2 flex items-center justify-between text-gray-600 hover:bg-gray-100 rounded-md">
              <span v-if="isSidebarExpanded">E-commerce</span>
              <svg v-if="isSectionOpen('e-commerce')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div v-if="isSectionOpen('e-commerce') && isSidebarExpanded" class="space-y-1">
              <router-link to="/superadmin-dashboard/index-business-type"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Business Type
              </router-link>
              <router-link to="/superadmin-dashboard/index-category"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Category
              </router-link>
              <router-link to="/superadmin-dashboard/index-sub-category"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Sub Category
              </router-link>
              <router-link to="/superadmin-dashboard/index-sub-sub-category"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Sub Sub Category
              </router-link>
              <router-link to="/superadmin-dashboard/index-brand"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Brand
              </router-link>
              <router-link to="/superadmin-dashboard/products-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Products
              </router-link>
              <router-link to="/superadmin-dashboard/orders-list"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Orders
              </router-link>

            </div>
          </div>

          <!-- Profile section -->
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
              <router-link to="/superadmin-dashboard/super-admin-profile-update"
                class="block px-4 ml-2 text-gray-500 py-2 hover:bg-gray-100">Profile
              </router-link>
            </div>
          </div>
          
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