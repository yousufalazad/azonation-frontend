<script setup>
import { ref } from 'vue';
import Header from './Header.vue';
import MainContent from './MainContent.vue';

const isMobileMenuOpen = ref(false);
const isSidebarExpanded = ref(true);
</script>

<template>
  <div>
    <Header @toggle-mobile-sidebar="isMobileMenuOpen = !isMobileMenuOpen" @toggle-sidebar="isSidebarExpanded = !isSidebarExpanded" />
    <MainContent :isMobileMenuOpen="isMobileMenuOpen" :isSidebarExpanded="isSidebarExpanded" @close-mobile-menu="isMobileMenuOpen = false" />
  </div>
</template>