<template>
    <div class="flex min-h-screen bg-gray-100">
        <!-- Sidebar -->
        <aside
            ref="sidebar"
            :class="isSidebarExpanded ? 'w-64' : 'w-20'"
            class="bg-white shadow-md transition-all duration-200 ease-in-out h-screen overflow-hidden"
            @wheel="showScrollbar"
        >
            <left-sidebar />
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-y-auto h-screen">
            <div class="py-6 flex-1 overflow-y-auto">
                <div class="mx-auto px-4 sm:px-6 lg:px-8 mx-5 h-full">
                    <router-view />
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import LeftSidebar from './LeftSidebar.vue';

const isSidebarExpanded = ref(true);
const openSections = ref([]);
const sidebar = ref(null); // Reference for the sidebar

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

// Function to show the scrollbar when user starts scrolling
const showScrollbar = () => {
    const sidebarElement = sidebar.value;
    if (sidebarElement) {
        sidebarElement.style.overflowY = 'auto'; // Show the scrollbar
        // Optionally, hide the scrollbar after 2 seconds if no scroll activity
        setTimeout(() => {
            sidebarElement.style.overflowY = 'hidden'; // Hide the scrollbar after delay
        }, 2000);
    }
};
</script>

<style scoped>
/* Smooth transition for sidebar */
aside {
    transition: width 0.2s ease-in-out;
}

/* Initially hide the scrollbar */
aside::-webkit-scrollbar {
    display: none;
}

/* Ensure content is scrollable when the scrollbar is shown */
aside {
    overflow-y: hidden;
}

/* Style for the thinner scrollbar */
aside::-webkit-scrollbar {
    width: 4px; /* Makes the scrollbar width thinner */
}

/* Scrollbar thumb styling */
aside::-webkit-scrollbar-thumb {
    background-color: darkgray;
    border-radius: 10px;
}

/* Scrollbar track styling */
aside::-webkit-scrollbar-track {
    background: lightgray;
}
</style>
