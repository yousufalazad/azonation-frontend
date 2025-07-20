<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')

const handleSubmit = () => {
  // TODO: Add validation and submission logic (e.g. via Axios)
  console.log({ name: name.value, email: email.value, subject: subject.value, message: message.value })
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-semibold text-gray-800 mb-6">Contact Us</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-xl shadow space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-600 focus:border-green-600 px-3 py-2"
          required
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-600 focus:border-green-600 px-3 py-2"
          required
        />
      </div>

      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
        <input
          id="subject"
          v-model="subject"
          type="text"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-600 focus:border-green-600 px-3 py-2"
        />
      </div>

      <div>
        <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="message"
          v-model="message"
          rows="5"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-600 focus:border-green-600 px-3 py-2"
          required
        ></textarea>
      </div>

      <div class="pt-4">
        <button
          type="submit"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Send Message
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
</style>