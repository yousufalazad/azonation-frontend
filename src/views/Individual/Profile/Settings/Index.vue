<template>
  <div class="mx-auto py-10 px-4">
    <h1 class="text-2xl font-semibold mb-6">Settings</h1>

    <!-- Tab Navigation -->
    <div class="flex flex-wrap gap-3 mb-8 border-b pb-2">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="currentTab = tab"
        :class="[
          'px-4 py-2 rounded-t text-sm font-medium',
          currentTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="bg-white shadow rounded-lg p-6 space-y-6">
      <component :is="tabComponents[currentTab]" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Tabs
const tabs = [
  'Privacy',
  'Referrals & Rewards',
  'Organisation Preferences',
  'Billing',
  'Appearance',
  'Advanced'
]
const currentTab = ref(tabs[0])

// Components
import PrivacySettings from './Tab/PrivacySettings.vue'
import ReferralRewards from './Tab/ReferralRewards.vue'
import OrgPreferences from './Tab/OrgPreferences.vue'
import Billing from './Tab/BillingSettings.vue'
import AppearanceSettings from './Tab/AppearanceSettings.vue'
import AdvancedSettings from './Tab/AdvancedSettings.vue'

const tabComponents = {
  'Privacy': PrivacySettings,
  'Referrals & Rewards': ReferralRewards,
  'Organisation Preferences': OrgPreferences,
  'Billing': Billing,
  'Appearance': AppearanceSettings,
  'Advanced': AdvancedSettings,
}
</script>
