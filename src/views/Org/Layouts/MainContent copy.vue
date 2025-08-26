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
  <div class="flex min-h-screen bg-gray-100 relative">
    <!-- Backdrop -->
    <div
      v-if="props.isMobileMenuOpen"
      @click="emit('close-mobile-menu')"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'h-screen bg-white shadow-md overflow-y-auto transition-all duration-300 ease-in-out z-40',
        props.isMobileMenuOpen ? 'fixed top-0 left-0 w-64' : 'hidden',
        'lg:block', props.isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'
      ]"
    >
      <LeftSidebar :isSidebarExpanded="props.isSidebarExpanded" />
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-y-auto h-screen">
      <div class="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 pb-28">
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
