<script setup>
const policies = [
  {
    title: '1. Introduction',
    content:
      'Azonation is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.',
  },
  {
    title: '2. Information We Collect',
    content:
      'We may collect personal information such as your name, email, phone number, organization details, IP address, and usage activity to enhance your experience and for service delivery.',
  },
  {
    title: '3. How We Use Your Information',
    content:
      'Your data is used to provide, improve, and personalize our services, communicate with you, and ensure the security of our platform.',
  },
  {
    title: '4. Sharing of Information',
    content:
      'We do not sell your information. We may share data with trusted third-party service providers only when necessary for service delivery or compliance with legal obligations.',
  },
  {
    title: '5. Data Security',
    content:
      'We implement industry-standard measures to protect your information. However, no digital transmission or storage is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: '6. Your Rights',
    content:
      'You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing activities by contacting us.',
  },
  {
    title: '7. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. Significant changes will be communicated through the platform or via email.',
  },
  {
    title: '8. Contact Us',
    content:
      'If you have any questions about this Privacy Policy or your data, please contact our support team at support@azonation.com.',
  },
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10 space-y-10">
    <h1 class="text-3xl font-bold text-gray-800 text-center">Privacy Policy</h1>

    <div v-for="(section, index) in policies" :key="index" class="space-y-2">
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