<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

const auth = authStore;
const router = useRouter();
const isLoading = ref(true);
const allAssets = ref([]); // Flattened list with org info

const fetchAssetsData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/past_assets', {}, 'GET');
    if (response.status) {
      const orgAssets = response.data || [];

      // Flatten assets and include organisation name in each
      allAssets.value = orgAssets.flatMap(org =>
        (org.assets || []).map(asset => ({
          ...asset,
          org_name: org.org_name || 'Unknown Organisation',
        }))
      );
    }
  } catch (error) {
    console.error('Failed to load assets data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAssetsData();
});
</script>
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Past Responsible Assets</h1>
      <button @click="$router.push({ name: 'individual-assets' })"
        class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
        Present Responsible Assets
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <!-- Empty -->
    <div v-else-if="!allAssets.length" class="text-gray-500 italic">No assigned assets found.</div>

    <!-- Data -->
    <div v-else>
      <h2 class="text-lg font-semibold text-gray-800 mb-4">All Past Responsible Assets</h2>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div v-for="(asset, index) in allAssets" :key="`${asset.asset_id}-${index}`"
          class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div class="text-xs text-gray-500 mb-2 font-semibold"># {{ index + 1 }}</div>
          <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
            <tbody>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Organisation</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ asset.org_name || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Asset Name</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ asset.name || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Quantity</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ asset.quantity || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Assigned From</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ asset.assignment_start_date || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Assigned To</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ asset.assignment_end_date || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Lifecycle Status</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ asset.asset_lifecycle_status_id || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full bg-white shadow rounded-md">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Organisation</th>
              <th class="px-4 py-3 text-left">Asset Name</th>
              <th class="px-4 py-3 text-left">Quantity</th>
              <th class="px-4 py-3 text-left">Assigned From</th>
              <th class="px-4 py-3 text-left">Assigned To</th>
              <th class="px-4 py-3 text-left">Lifecycle Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(asset, index) in allAssets" :key="`${asset.asset_id}-${index}`"
              class="border-t text-sm text-gray-800 hover:bg-gray-50">
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ asset.org_name }}</td>
              <td class="px-4 py-3">{{ asset.name || '—' }}</td>
              <td class="px-4 py-3">{{ asset.quantity || '—' }}</td>
              <td class="px-4 py-3">{{ asset.assignment_start_date || '—' }}</td>
              <td class="px-4 py-3">{{ asset.assignment_end_date || '—' }}</td>
              <td class="px-4 py-3">{{ asset.asset_lifecycle_status_id || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>