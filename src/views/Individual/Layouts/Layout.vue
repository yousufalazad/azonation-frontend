<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Header from './Header.vue';
import MainContent from './MainContent.vue';
import { useResponsiveSidebar } from '@/composables/useResponsiveSidebar';

const SIDEBAR_KEY = 'azonation_individual_sidebar';

const isSidebarExpanded = ref(true);
const { isMobileMenuOpen } = useResponsiveSidebar();

const route = useRoute();

onMounted(() => {
  const saved = localStorage.getItem(SIDEBAR_KEY);
  if (saved !== null) {
    isSidebarExpanded.value = saved === 'true';
  }
});

// persist desktop sidebar state
watch(isSidebarExpanded, (newVal) => {
  localStorage.setItem(SIDEBAR_KEY, newVal.toString());
});

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value;
};

const toggleMobileMenu = () => { isMobileMenuOpen.value = !isMobileMenuOpen.value; };

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// automatically close the mobile menu on navigation
watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
  }
);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <Header
      @toggle-sidebar="toggleSidebar"
      @toggle-mobile-sidebar="toggleMobileMenu"
      @close-mobile-sidebar="closeMobileMenu"
    />
    <MainContent
      :isSidebarExpanded="isSidebarExpanded"
      :isMobileMenuOpen="isMobileMenuOpen"
      @close-mobile-menu="closeMobileMenu"
    />
  </div>
</template>