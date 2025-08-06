<script setup>
import { ref } from 'vue'
import Header from './Header.vue'
import Footer from './Footer.vue'
import NotFoundImage from '@/assets/NotFound/not-found.svg'

const searchQuery = ref('')
const recentLinks = [
  { name: 'Home', to: '/' },
  { name: 'Sign Up', to: '/signup' },
  { name: 'Help Center', to: '/help' },
  { name: 'Contact Us', to: '/contact-us' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <main class="flex-grow flex flex-col items-center justify-center text-center px-4 pt-[100px] pb-20">
      <img
        :src="NotFoundImage"
        alt="Page not found"
        class="max-w-xs md:max-w-sm mb-8"
      />

      <h1 class="text-4xl font-bold text-gray-800 mb-4">This page doesn’t exist</h1>
      <p class="text-gray-600 text-sm mb-6">
        Please check your URL or return to home page.
      </p>

      <!-- Search Input -->
      <!-- <div class="w-full max-w-sm mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for pages or features..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div> -->

      <!-- Recently Visited / Suggested Links -->
      <!-- <div class="mb-6">
        <h2 class="text-sm font-medium text-gray-700 mb-2">Quick Links</h2>
        <ul class="flex flex-wrap justify-center gap-3 text-sm text-blue-600">
          <li v-for="link in recentLinks" :key="link.to">
            <router-link :to="link.to" class="hover:underline">{{ link.name }}</router-link>
          </li>
        </ul>
      </div> -->

      <!-- Back Home Button -->
      <router-link
        to="/"
        class="inline-block bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-500 transition"
      >
        Back to Home
      </router-link>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
</style>
