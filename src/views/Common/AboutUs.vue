<script setup>
// Static content – can be dynamic or fetched from API later
import Header from './Header.vue';
import Footer from './Footer.vue';
const aboutContent = {
  heading: 'About Azonation',
  intro: `Azonation is a modern SaaS solution that empowers organisations to efficiently manage their members, meetings, events, projects, assets, finances, attendance, official documents and more. Our goal is to make organisational management paperless, accessible, and truly global.`,
  mission: `To simplify and modernise organisational management through digital solutions that are secure, scalable, and user-friendly.`,
  vision: `To be the global leader in transforming how organisations operate, collaborate, and grow in the digital era.`,
  values: [
    'Transparency',
    'Innovation',
    'Simplicity',
    'Global Accessibility',
    'Security & Privacy',
  ],
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <Header />

    <!-- Main Content -->
    <main class="flex-grow">
      <div class="max-w-4xl mx-auto px-4 pt-[100px] pb-10 space-y-10">
        <section class="text-center">
          <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ aboutContent.heading }}</h1>
          <p class="text-gray-600 text-lg">{{ aboutContent.intro }}</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Our Mission</h2>
          <p class="text-gray-700">{{ aboutContent.mission }}</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Our Vision</h2>
          <p class="text-gray-700">{{ aboutContent.vision }}</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Our Values</h2>
          <ul class="list-disc list-inside text-gray-700 space-y-1">
            <li v-for="(value, index) in aboutContent.values" :key="index">{{ value }}</li>
          </ul>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>


<style scoped>
</style>