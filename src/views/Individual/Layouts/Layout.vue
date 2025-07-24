<script setup>
import { ref, watch, onMounted } from 'vue';
import Header from './Header.vue';
import MainContent from './MainContent.vue';

const SIDEBAR_KEY = 'azonation_individual_sidebar';

const isSidebarExpanded = ref(true);
const isMobileMenuOpen = ref(false);

// Load sidebar state from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem(SIDEBAR_KEY);
  if (saved !== null) {
    isSidebarExpanded.value = saved === 'true';
  }
});

// Save sidebar state on change
watch(isSidebarExpanded, (newVal) => {
  localStorage.setItem(SIDEBAR_KEY, newVal.toString());
});

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value;
};

const openMobileMenu = () => {
  isMobileMenuOpen.value = true;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- Header -->
    <Header
      @toggle-sidebar="toggleSidebar"
      @toggle-mobile-sidebar="openMobileMenu"
    />

    <!-- Main Content -->
    <MainContent
      :isSidebarExpanded="isSidebarExpanded"
      :isMobileMenuOpen="isMobileMenuOpen"
      @close-mobile-menu="closeMobileMenu"
    />
  </div>
</template>
