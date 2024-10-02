
<script setup>
import { RouterView } from 'vue-router';
import Profile from '../Profile/Profile.vue';
import Security from '../Profile/Security.vue';
import Settings from '../Profile/Settings.vue';

</script>

<template>
    <div class="flex">
      <!-- Left Side Menu -->
      <div class="w-1/5 p-1 space-y-2">
        <h2 class="text-lg font-bold mb-4">My Account</h2>
        <ul class="space-y-2">
          <li>
            <router-link to="/org-dashboard/my-account" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Profile
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/org-security" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Security
            </router-link>
          </li>
          <li>
            <router-link to="/org-dashboard/org-settings" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Settings
            </router-link>
          </li>
        </ul>
      </div>
  
      <!-- Right Side Content -->
      
      <main class="w-4/5 p-6">
      
          <router-view />
      
    </main>
    </div>
  </template>
  

<style scoped>
</style>