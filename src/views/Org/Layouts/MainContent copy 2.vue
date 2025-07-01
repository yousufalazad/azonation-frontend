<script setup>
import { onMounted, onUnmounted } from 'vue';
import LeftSidebar from './LeftSidebar.vue';
const props = defineProps({ isMobileMenuOpen: Boolean, isSidebarExpanded: Boolean });
const emit = defineEmits(['close-mobile-menu']);

const closeOnEscape = (e) => {
  if (e.key === 'Escape') emit('close-mobile-menu');
};

onMounted(() => document.addEventListener('keydown', closeOnEscape));
onUnmounted(() => document.removeEventListener('keydown', closeOnEscape));
</script>

<template>
  <div class="flex bg-gray-100 relative">
    <!-- Backdrop -->
    <div v-if="props.isMobileMenuOpen" @click="emit('close-mobile-menu')"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"></div>

    <!-- Sidebar -->
    <aside :class="[
      'bg-white shadow-md z-40 transition-all duration-300 ease-in-out',
      props.isMobileMenuOpen ? 'fixed top-0 left-0 h-screen w-64' : 'hidden',
      'lg:fixed lg:top-0 lg:left-0 lg:h-screen', props.isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'
    ]">
      <LeftSidebar :isSidebarExpanded="props.isSidebarExpanded" />
    </aside>

    <!-- Main content area -->
    <main :class="[
      'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
      props.isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
    ]">
      <div class="flex-1 py-6 px-4 sm:px-6 lg:px-8 pb-28 overflow-y-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
aside::-webkit-scrollbar {
  width: 4px;
}

aside::-webkit-scrollbar-thumb {
  background-color: darkgray;
  border-radius: 10px;
}

aside::-webkit-scrollbar-track {
  background: lightgray;
}
</style>
