<template>
    <div class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      <!-- Heading -->
      <h1 class="text-4xl font-bold mb-4">Welcome to Azonation</h1>
  
      <!-- Subheading -->
      <p class="text-lg font-light mb-8 text-center max-w-xl">
        <!-- Azonation is an organisation management solution, designed to make organisations paperless. -->
      </p>
  
      <!-- Buttons --> 
      <div class="space-y-4">
        <a
          href="/login"
          class="block w-64 text-center bg-white text-blue-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-50 transition"
        >
          Login
        </a>
        <a
          href="/individual-register"
          class="block w-64 text-center bg-white text-blue-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-50 transition"
        >
          Register as Individual
        </a>

        <a
          href="/org-register"
          class="block w-64 text-center bg-white text-blue-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-50 transition"
        >
          Register as Organisation
        </a>

        <a
          href="https://azonation.com"
          target="_blank"
          class="block w-64 text-center bg-white text-blue-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-50 transition"
        >
          Home
        </a>
      </div>
    </div>
  </template>
  
  <script setup>
  // No specific script logic required
  </script>
  
  <style scoped>
  /* Custom styles (if needed) */
  </style>
  