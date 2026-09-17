import { ref, onMounted, onUnmounted } from 'vue';

export function useResponsiveSidebar(breakpoint = 1024) {
  const isMobileMenuOpen = ref(false);
  const onResize = () => {
    if (window.innerWidth >= breakpoint) isMobileMenuOpen.value = false;
  };
  onMounted(() => window.addEventListener('resize', onResize));
  onUnmounted(() => window.removeEventListener('resize', onResize));
  return { isMobileMenuOpen };
}