<script setup>
import { ref } from 'vue';
import LeftSidebar from './LeftSidebar.vue';

const isSidebarExpanded = ref(true);
const openSections = ref([]);

const toggleSidebar = () => {
    isSidebarExpanded.value = !isSidebarExpanded.value;
};

const toggleSection = (section) => {
    if (openSections.value.includes(section)) {
        openSections.value = openSections.value.filter(s => s !== section);
    } else {
        openSections.value.push(section);
    }
};
</script>

<template>
    <div class="flex min-h-screen bg-gray-900">
        <!-- Sidebar -->
        <aside
            :class="isSidebarExpanded ? 'w-64' : 'w-20'"
            class="bg-white shadow-md transition-all duration-200 ease-in-out"
        >
            <left-sidebar />
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-y-auto">
            <div class="py-6 flex-1 overflow-y-auto">
                <div class="max-w-7xl mx-auto px-4">
                    <router-view />
                </div>
            </div>
        </main>
    </div>
</template>


<style scoped>
/* Smooth transition for sidebar */
aside {
    transition: width 0.2s ease-in-out;
}
</style>