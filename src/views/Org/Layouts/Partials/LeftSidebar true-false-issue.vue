<script setup>
import { computed } from 'vue';
import { authStore } from "../../../../store/authStore";

const auth = authStore;
const userType = computed(() => auth.user?.type);

// Menu items with sub-menus for Members and Committees
const menuItems = [
  { label: 'Dashboard', to: '/org-dashboard/dashboard-initial-content', isOpen: false, subMenu: [] },
  
  // Members with sub-menu items
  { 
    label: 'Members', 
    to: '#', 
    isOpen: false, 
    subMenu: [
      { label: 'Member List', to: '/org-dashboard/member-list' },
      { label: 'Add Member', to: '/org-dashboard/add-member' }
    ] 
  },
  
  // Committees with sub-menu items
  { 
    label: 'Committees', 
    to: '#', 
    isOpen: false, 
    subMenu: [
      { label: 'Committee List', to: '/org-dashboard/committee-list' },
      { label: 'Add Committee', to: '/org-dashboard/add-committee' }
    ] 
  },
  
  { label: 'Meetings', to: '/org-dashboard/create-meeting', isOpen: false, subMenu: [] },
  { label: 'Events', to: '/org-dashboard/create-event', isOpen: false, subMenu: [] },
  { label: 'Projects', to: '/org-dashboard/create-project', isOpen: false, subMenu: [] },
  { label: 'Records', to: '/org-dashboard/create-project', isOpen: false, subMenu: [] },  // Add subMenu for consistency
  { label: 'Reports', to: '/org-dashboard/create-project', isOpen: false, subMenu: [] },
  { label: 'Accounts', to: '/org-dashboard/create-project', isOpen: false, subMenu: [] },
  { label: 'Profile', to: '/org-dashboard/profile', isOpen: false, subMenu: [] }
];

// Function to toggle sub-menus open/close
const toggleMenu = (index) => {
  menuItems[index].isOpen = !menuItems[index].isOpen;
};
</script>

<template>
  <section v-if="auth.isAuthenticated && userType == 'organisation'">
    <div class="left-sidebar-content mt-4 bg-light-blue-100 h-screen w-64 p-4 border-r">
      <ul>
        <!-- Iterate over the menu items -->
        <li v-for="(item, index) in menuItems" :key="index">
          <div class="menu-item p-2 flex items-center cursor-pointer hover:bg-light-blue-200 transition-colors"
               @click="toggleMenu(index)">
            <span class="mr-2">
              <!-- Use Font Awesome icons for dropdown -->
              <i v-if="item.subMenu && item.subMenu.length > 0" :class="item.isOpen ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="text-gray-600"></i>
            </span>
            <router-link :to="item.to" class="flex-1">{{ item.label }}</router-link>
          </div>

          <!-- Sub-menu -->
          <ul v-if="item.isOpen && item.subMenu && item.subMenu.length > 0" class="pl-6">
            <li v-for="(subItem, subIndex) in item.subMenu" :key="subIndex"
                class="p-2 cursor-pointer hover:bg-light-blue-300 transition-colors">
              <router-link :to="subItem.to">{{ subItem.label }}</router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.left-sidebar-content {
  margin-left: 23px;
}

.bg-light-blue-100 {
  @apply bg-blue-100;
}

.bg-light-blue-200 {
  @apply bg-blue-200;
}

.bg-light-blue-300 {
  @apply bg-blue-300;
}
</style>
