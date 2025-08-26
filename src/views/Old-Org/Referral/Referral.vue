<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const user = ref(auth.user);
const referralCode = ref('');
const stats = ref({});
const successfulReferrals = ref([]);

// Copy to clipboard
const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    Swal.fire('Copied!', 'Referral code copied to clipboard.', 'success');
  } catch (err) {
    Swal.fire('Error', 'Failed to copy referral code.', 'error');
  }
};

// Load referral data
const loadReferralData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/referrals/stats', {}, 'GET');
    stats.value = response;

    // Get referral code from stats response
    referralCode.value = response.referral_code ?? 'Not available';

    // Filter successful referrals for current logged-in user (if needed)
    successfulReferrals.value = response.successful_referrals ?? [];
  } catch (error) {
    console.error('Error loading referral data:', error);
  }
};


onMounted(loadReferralData);
</script>

<template>
  <div class="mx-auto p-6 mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Referral Dashboard</h2>

    <!-- Referral Code Section -->
    <div class="mb-6">
      <label class="text-sm font-medium text-gray-700">Your Organisation's Referral Code</label>
      <div class="flex items-center gap-3 mt-2">
        <input type="text" :value="referralCode" readonly
          class="w-full px-3 py-2 border rounded-md bg-gray-100 text-sm" />
        <button @click="copyCode(referralCode)"
          class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500">
          Copy
        </button>
      </div>

      <!-- Share Options -->
      <div class="flex gap-4 mt-4 text-sm text-gray-700">
        <span>Share:</span>
        <a :href="`https://wa.me/?text=Join us using code ${referralCode}`" target="_blank"
          class="text-green-600 hover:underline">WhatsApp</a>
        <a :href="`https://www.facebook.com/sharer/sharer.php?u=https://azonation.com&quote=Use code ${referralCode}`"
          target="_blank" class="text-blue-600 hover:underline">Facebook</a>
        <a :href="`mailto:?subject=Join us&body=Use our referral code ${referralCode}`"
          class="text-gray-600 hover:underline">Email</a>
      </div>
    </div>

    <!-- Referral Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-gray-100 p-4 rounded text-center">
        <p class="text-xl font-bold">{{ stats.total_referrals ?? 0 }}</p>
        <p class="text-sm text-gray-600">Total Referrals</p>
      </div>
      <div class="bg-gray-100 p-4 rounded text-center">
        <p class="text-xl font-bold">{{ stats.completed_referrals ?? 0 }}</p>
        <p class="text-sm text-gray-600">Successful Signups</p>
      </div>
      <div class="bg-gray-100 p-4 rounded text-center">
        <p class="text-xl font-bold">{{ stats.total_rewards ?? 0 }}</p>
        <p class="text-sm text-gray-600">Total Rewards</p>
      </div>
    </div>

    <!-- Successful Referrals List -->
    <div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Your Successful Referrals</h3>
      <div v-if="!successfulReferrals.length" class="text-sm text-gray-500">
        No successful referrals found.
      </div>
      <ul v-else class="divide-y divide-gray-200 text-sm">
        <li v-for="(ref, index) in successfulReferrals" :key="ref.id" class="py-2">
          <div class="flex justify-between">
            <span class="text-gray-700">
              {{ index + 1 }}. {{ ref.referred_user?.org_name || ref.referred_user?.first_name + ' ' +
                ref.referred_user?.last_name }}
            </span>
            <!-- Optionally show date or other info -->
            <!-- <span class="text-gray-600">{{ formatDate(ref.created_at) }}</span> -->
          </div>
        </li>
      </ul>

    </div>
  </div>
</template>
