<script setup>
</script>

<template>
    <div>
        <footer class="bg-gray-900 text-gray-300 py-8">
            <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Brand & Description -->
                    <div>
                        <h2 class="text-xl font-semibold text-white">Azonation</h2>
                        <p class="mt-2 text-sm">
                            A complete organization management solution to streamline your workflow.
                        </p>
                    </div>

                    <!-- Quick Links -->
                    <div class="flex flex-col space-y-2">
                        <h3 class="text-lg font-medium text-white">Quick Links</h3>
                        <a href="#" class="hover:text-green-400 transition">About</a>
                        <a href="#" class="hover:text-green-400 transition">Pricing</a>
                        <a href="#" class="hover:text-green-400 transition">Support</a>
                        <a href="#" class="hover:text-green-400 transition">Privacy Policy</a>
                    </div>

                    <!-- Social Media -->
                    <div>
                        <h3 class="text-lg font-medium text-white">Follow Us</h3>
                        <div class="mt-3 flex space-x-4">
                            <a href="#" class="hover:text-green-400 transition">
                                <i class="fab fa-facebook text-xl"></i>
                            </a>
                            <a href="#" class="hover:text-green-400 transition">
                                <i class="fab fa-twitter text-xl"></i>
                            </a>
                            <a href="#" class="hover:text-green-400 transition">
                                <i class="fab fa-linkedin text-xl"></i>
                            </a>
                            <a href="#" class="hover:text-green-400 transition">
                                <i class="fab fa-github text-xl"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Copyright -->
                <div class="mt-6 border-t border-gray-700 pt-4 text-center text-sm">
                    &copy; {{ new Date().getFullYear() }} Azonation. All rights reserved.
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* Add FontAwesome or any custom styling if needed */
</style>