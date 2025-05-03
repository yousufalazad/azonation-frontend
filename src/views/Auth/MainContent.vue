<template>
    <div class="flex min-h-screen bg-gray-100">
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