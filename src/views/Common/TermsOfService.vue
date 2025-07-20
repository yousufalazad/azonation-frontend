<script setup>
// Static placeholder content – replace with real terms if needed
const terms = [
  {
    title: '1. Introduction',
    content:
      'Welcome to Azonation. By accessing or using our services, you agree to be bound by these Terms of Service. Please read them carefully.',
  },
  {
    title: '2. User Accounts',
    content:
      'Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.',
  },
  {
    title: '3. Use of the Service',
    content:
      'You agree not to misuse the services or assist anyone in doing so. This includes attempting to access data you do not have rights to or interfering with system functionality.',
  },
  {
    title: '4. Payment and Subscriptions',
    content:
      'If you subscribe to a paid plan, you agree to our billing terms. Fees are billed on a monthly, quarterly, half-yearly, or yearly basis depending on your chosen plan.',
  },
  {
    title: '5. Termination',
    content:
      'We reserve the right to suspend or terminate your account if you violate these terms or misuse the platform.',
  },
  {
    title: '6. Changes to Terms',
    content:
      'Azonation may revise these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.',
  },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10 space-y-10">
    <h1 class="text-3xl font-bold text-gray-800 text-center">Terms of Service</h1>

    <div v-for="(section, index) in terms" :key="index" class="space-y-2">
      <h2 class="text-xl font-semibold text-gray-800">{{ section.title }}</h2>
      <p class="text-gray-700 leading-relaxed">{{ section.content }}</p>
    </div>

    <p class="text-sm text-gray-500 mt-8 text-center">
      Last updated: July 2025
    </p>
  </div>
</template>

<style scoped>
</style>