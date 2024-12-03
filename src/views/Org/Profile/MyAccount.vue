
<script setup>
import { RouterView } from 'vue-router';

</script>

<template>
    <div class="flex">
      <!-- Left Side Menu -->
      <div class="w-1/5 p-1 space-y-2">
        <h2 class="text-md text-gray-600 font-bold mb-4">My account</h2>
        <ul class="space-y-2">
          <li>
            <router-link to="/org-dashboard/my-account/profile" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Profile
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/org-security" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Security
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/org-settings" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Settings
            </router-link>
          </li>
          
          <li>
            <router-link to="#" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Temporary
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/package" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Package
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/subscription" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Subscription
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/bill-calculation" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Bill-calculation
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/bill-list" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Billings
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/invoice-list" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Invoice list
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/view-invoice" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              View Invoice
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/receipt-list" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Receipt List
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/view-receipt" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              View Receipt
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/my-account/invite-friend" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
             Invite Friend
            </router-link>
          </li>

        </ul>
      </div>
  
      <!-- Right Side Content -->
      
      <main class="w-4/5 p-6">
          <!-- <Profile></Profile>
          <Security></Security> -->
          <router-view />
    </main>
    </div>
  </template>
  

<style scoped>
</style>