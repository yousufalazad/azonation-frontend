<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';

const isSidebarOpen = ref(false);

const handleMenuClick = () => {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false;
  }
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <!-- NOTE: flex-col on mobile, flex-row only on lg+ -->
  <div class="flex flex-col lg:flex-row min-h-screen w-full">
    <!-- Mobile Toggle Button -->
    <div class="lg:hidden p-4 border-b flex justify-between items-center bg-white shadow z-10 w-full">
      <h2 class="text-lg font-bold text-gray-700">My Account</h2>
      <button @click="toggleSidebar" class="text-gray-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
             viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white lg:w-1/6 p-4 lg:pl-7 z-20 border-r shadow-sm lg:shadow-none',
        // mobile: show/hide, desktop: always block
        isSidebarOpen ? 'block' : 'hidden',
        'lg:block'
      ]"
    >
      <h2 class="text-md text-gray-600 font-bold mb-4 hidden lg:block">My Account</h2>
      <ul class="space-y-2">
        <li>
          <router-link
            to="/org-dashboard/my-account/profile"
            @click="handleMenuClick"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Profile
          </router-link>
        </li>
        <li>
          <router-link
            to="/org-dashboard/my-account/administrator"
            @click="handleMenuClick"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Administrator
          </router-link>
        </li>
        <li>
          <router-link
            to="/org-dashboard/my-account/security"
            @click="handleMenuClick"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Security
          </router-link>
        </li>
        <li>
          <router-link
            to="/org-dashboard/my-account/subscription"
            @click="handleMenuClick"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Subscription
          </router-link>
        </li>
        <li>
          <router-link
            to="/org-dashboard/my-account/bill-calculation"
            @click="handleMenuClick"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Bill Calculation
          </router-link>
        </li>
        <li>
          <router-link
            to="/org-dashboard/my-account/invoices"
            @click="handleMenuClick"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Invoice
          </router-link>
        </li>
        <li>
          <router-link
            to="/org-dashboard/my-account/org-receipt-index"
            @click="handleMenuClick"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Receipt
          </router-link>
        </li>
        <li>
          <router-link
            to="/org-dashboard/my-account/referral"
            @click="handleMenuClick"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Referral
          </router-link>
        </li>
      </ul>
    </aside>

    <!-- Main Content: force full width -->
    <main class="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-50">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
@media (max-width: 1023px) {
  aside {
    transition: all 0.3s ease;
  }
}
</style>
