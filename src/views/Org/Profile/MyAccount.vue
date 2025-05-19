<script setup>
import { RouterView } from 'vue-router';

</script>

<template>
  <div class="flex h-screen">
    <!-- Left Side Menu -->
    <div class="w-1/6 pl-7">
      <h2 class="text-md text-gray-600 font-bold mb-4">My account</h2>
      <ul class="space-y-2">
        <li>
          <router-link to="/org-dashboard/my-account/profile"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Profile
          </router-link>
        </li>
        <li>
          <router-link to="/org-dashboard/my-account/org-security"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Security
          </router-link>
        </li>
        <!-- <li>
            <router-link to="/org-dashboard/my-account/org-settings" class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Settings
            </router-link>
          </li> -->
        <!-- <li>
            <router-link to="/org-dashboard/my-account/package" class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Package
            </router-link>
          </li> -->
        <li>
          <router-link to="/org-dashboard/my-account/subscription"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Subscription
          </router-link>
        </li>
        <li>
          <router-link to="/org-dashboard/my-account/bill-calculation"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Bill calculation
          </router-link>
        </li>
        <!-- <li>
            <router-link to="/org-dashboard/my-account/bill-list" class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Billings
            </router-link>
          </li> -->
        <li>
          <router-link to="/org-dashboard/my-account/invoice-list"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Invoice
          </router-link>
        </li>
        <li>
          <router-link to="/org-dashboard/my-account/org-receipt-index"
            class="block py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Receipt
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Right Side Content -->

    <main class="w-5/6 pb-6 mx-auto px-4 sm:px-6 lg:px-8 mx-5 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>


<style scoped></style>