<script setup>
import { onMounted, onUnmounted } from 'vue';
import LeftSidebar from './LeftSidebar.vue';

const props = defineProps({
  isMobileMenuOpen: Boolean,
  isSidebarExpanded: Boolean,
});
const emit = defineEmits(['close-mobile-menu']);

const closeOnEscape = (e) => {
  if (e.key === 'Escape') emit('close-mobile-menu');
};

onMounted(() => document.addEventListener('keydown', closeOnEscape));
onUnmounted(() => document.removeEventListener('keydown', closeOnEscape));
</script>

<template>
  <div class="flex bg-canvas min-h-screen">
    <!-- Backdrop for Mobile -->
    <div v-if="props.isMobileMenuOpen" @click="emit('close-mobile-menu')"
      class="fixed inset-0 bg-overlay/50 z-30 lg:hidden"></div>

    <!-- Sidebar -->
    <!-- Sidebar -->
    <aside :class="[
      'bg-surface border-r border-line z-40 transition-all duration-300 ease-in-out print:!hidden',
      props.isMobileMenuOpen ? 'fixed top-16 left-0 h-[calc(100vh-64px)] w-64 block' : 'hidden',
      'lg:fixed lg:top-16 lg:left-0 lg:h-[calc(100vh-64px)]',
      props.isSidebarExpanded ? 'lg:w-64' : 'lg:w-20',
      'lg:block'
    ]">
      <LeftSidebar :isSidebarExpanded="props.isSidebarExpanded || props.isMobileMenuOpen" @close-mobile-menu="emit('close-mobile-menu')" />
    </aside>


    <!-- Main Content -->
    <div :class="[
      'flex-1 flex flex-col transition-all duration-300 ease-in-out pt-16 overflow-x-auto print:!ml-0 print:pt-0',
      props.isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
    ]">
      <div class="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 pb-28">
        <router-view />
      </div>
    </div>

  </div>
</template>


