<script setup>
import { ref, onMounted, watch } from 'vue';
import Header from './Header.vue';
import MainContent from './MainContent.vue';

const SIDEBAR_KEY = 'azonation_org_sidebar';

const isMobileMenuOpen = ref(false);
const isSidebarExpanded = ref(true);

// Load sidebar state from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem(SIDEBAR_KEY);
  if (saved !== null) {
    isSidebarExpanded.value = saved === 'true';
  }
});

// Watch sidebar state and persist to localStorage
watch(isSidebarExpanded, (val) => {
  localStorage.setItem(SIDEBAR_KEY, val.toString());
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <Header
      @toggle-mobile-sidebar="toggleMobileMenu"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Content -->
    <MainContent
      :isMobileMenuOpen="isMobileMenuOpen"
      :isSidebarExpanded="isSidebarExpanded"
      @close-mobile-menu="closeMobileMenu"
    />
  </div>
</template>
