<!-- // OrgPreferences.vue -->
<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">Organisation Preferences</h2>

    <div>
      <label class="block text-sm font-medium">Preferred Organisation</label>
      <select class="mt-1 w-full border rounded p-2">
        <option>Org A</option>
        <option>Org B</option>
      </select>
    </div>
    <div>
      <input type="checkbox" id="calendarSync" v-model="calendarSync" />
      <label for="calendarSync" class="ml-2 text-sm">Sync events to my calendar</label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const calendarSync = ref(false)
</script>