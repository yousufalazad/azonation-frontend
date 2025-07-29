<!-- // ContactCommunication.vue -->
<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">Contact & Communication</h2>

    <div>
      <label class="block text-sm font-medium">Email</label>
      <input type="email" class="mt-1 w-full border rounded p-2" />
    </div>
    <div>
      <label class="block text-sm font-medium">Phone Number</label>
      <input type="tel" class="mt-1 w-full border rounded p-2" />
    </div>
    <div>
      <input type="checkbox" id="emailNoti" v-model="emailNotifications" />
      <label for="emailNoti" class="ml-2 text-sm">Receive email updates</label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emailNotifications = ref(true)
</script>