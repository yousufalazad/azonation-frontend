<template>
  <div class="flex">
    <!-- Sidebar -->
    <aside
      :class="['bg-light-blue-100 text-gray-800 w-64', collapsed ? 'w-20' : 'w-64']"
      class="h-screen flex flex-col border-r transition-all duration-300"
    >
      <div class="flex justify-between items-center p-4">
        <h2 v-if="!collapsed" class="text-xl font-semibold">Menu</h2>
        <button @click="toggleCollapse" class="p-2">
          <span v-if="collapsed" class="text-xl">☰</span>
          <span v-if="!collapsed" class="text-xl">←</span>
        </button>
      </div>
      
      <ul class="flex-1">
        <li v-for="(item, index) in menuItems" :key="index">
          <!-- Menu Item -->
          <div class="p-3 flex justify-between items-center cursor-pointer hover:bg-light-blue-200 transition-colors"
               @click="toggleMenu(index)">
            <div class="flex items-center">
              <div v-if="!collapsed && item.subMenu" class="text-sm">
              <span v-if="!item.isOpen"><span class="mr-2">←</span></span>
              <span v-if="item.isOpen"><span class="mr-2">-</span></span>
            </div>
              <!-- <span class="mr-2">←</span> -->
              <span v-if="!collapsed">{{ item.label }}</span>
            </div>
            <div v-if="!collapsed && item.subMenu" class="text-sm">
              <!-- <span v-if="!item.isOpen">▼</span>
              <span v-if="item.isOpen">▲</span> -->
            </div>
          </div>
          
          <!-- Dropdown for sub-menu -->
          <ul v-if="item.isOpen && item.subMenu && !collapsed" class="pl-6">
            <li v-for="(subItem, subIndex) in item.subMenu" :key="subIndex"
                class="p-2 cursor-pointer hover:bg-light-blue-300 transition-colors">
              {{ subItem }}
            </li>
          </ul>
        </li>
      </ul>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-4">
      <h1 class="text-2xl font-bold">Main Content</h1>
      <p>This is where the content of your page will go.</p>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      collapsed: false,
      menuItems: [
        { label: 'Dashboard', isOpen: false },
        { label: 'Members', isOpen: false, subMenu: ['Sub-menu 1', 'Sub-menu 2'] },
        { label: 'Committees', isOpen: false, subMenu: ['Sub-menu 1', 'Sub-menu 2'] },
        { label: 'Meetings', isOpen: false, subMenu: ['Sub-menu 1', 'Sub-menu 2'] },
        { label: 'Events', isOpen: false, subMenu: ['Sub-menu 1', 'Sub-menu 2'] },
        { label: 'Projects', isOpen: false, subMenu: ['Sub-menu 1', 'Sub-menu 2'] },
        { label: 'Records', isOpen: false },
        { label: 'Reports', isOpen: false, subMenu: ['Sub-menu 1', 'Sub-menu 2'] },
        { label: 'Accounts', isOpen: false },
        { label: 'Profile', isOpen: false, subMenu: ['Sub-menu 1', 'Sub-menu 2'] },
      ],
    };
  },
  methods: {
    toggleMenu(index) {
      this.menuItems[index].isOpen = !this.menuItems[index].isOpen;
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },
  },
};
</script>

<!-- Tailwind Styles for Light Blue Theme -->
<style scoped>
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
