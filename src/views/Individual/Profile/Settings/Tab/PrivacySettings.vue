<!-- // PrivacySettings.vue -->
<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">Privacy</h2>

    <div>
      <label class="block text-sm font-medium">Profile Visibility</label>
      <select class="mt-1 w-full border rounded p-2">
        <option>Public</option>
        <option>Only Members</option>
        <option>Private</option>
      </select>
    </div>
    <div>
      <input type="checkbox" id="activityVisibility" v-model="activityVisible" />
      <label for="activityVisibility" class="ml-2 text-sm">Show activity to connected organisations</label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activityVisible = ref(true)
</script>



