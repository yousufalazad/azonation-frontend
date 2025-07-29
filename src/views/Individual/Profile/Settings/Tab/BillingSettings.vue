<!-- // BillingSettings.vue -->
<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">Billing</h2>

    <div>
      <label class="block text-sm font-medium">Current Plan</label>
      <input type="text" disabled value="Free Plan" class="mt-1 w-full border rounded p-2 bg-gray-100" />
    </div>
    <div>
      <label class="block text-sm font-medium">Billing History</label>
      <ul class="list-disc pl-6 text-sm">
        <li>July 2025 – £0.00</li>
        <li>June 2025 – £0.00</li>
      </ul>
    </div>
  </div>
</template>