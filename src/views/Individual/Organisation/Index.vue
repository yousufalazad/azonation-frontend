<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';

const auth = authStore;
const connectedOrgs = ref([]);

const fetchConnectedOrgs = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/connected-org-list', {}, 'GET');
    if (response.status) {
      connectedOrgs.value = response.data || [];
    }
  } catch (error) {
    console.error('Failed to load connected organisations:', error);
  }
};

const calculateMembershipAge = (startDate) => {
  if (!startDate) return '—';
  const start = new Date(startDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years}y ${months}m`;
};

onMounted(() => {
  fetchConnectedOrgs();
});
</script>

<template>
  <div class="bg-white p-6 rounded shadow">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <h2 class="text-lg font-semibold text-gray-800">Connected Organisations</h2>
      <!-- <router-link to="/individual-dashboard/connected-orgs"
        class="text-sm text-blue-600 hover:underline self-start sm:self-auto">
        See all
      </router-link> -->
    </div>

    <!-- Mobile Cards -->
    <div v-if="connectedOrgs.length" class="sm:hidden space-y-3">
      <div v-for="(org, index) in connectedOrgs" :key="org.id"
        class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <div class="text-xs text-gray-500 mb-2 font-semibold"># {{ index + 1 }}</div>
        <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
          <tbody>
            <tr>
              <td class="text-gray-600 w-[120px] pr-2 font-medium">Organisation</td>
              <td class="w-3 text-center">:</td>
              <td class="text-gray-800 break-words">{{ org.org_name }}</td>
            </tr>
            <tr>
              <td class="text-gray-600 font-medium">Membership ID</td>
              <td class="w-3 text-center">:</td>
              <td class="text-gray-800 break-words">{{ org.existing_membership_id || '—' }}</td>
            </tr>
            <tr>
              <td class="text-gray-600 font-medium">Membership Type</td>
              <td class="w-3 text-center">:</td>
              <td class="text-gray-800 break-words">{{ org.membership_type?.name || '—' }}</td>
            </tr>
            <tr>
              <td class="text-gray-600 font-medium">Start Date</td>
              <td class="w-3 text-center">:</td>
              <td class="text-gray-800">{{ org.membership_start_date || '—' }}</td>
            </tr>
            <tr>
              <td class="text-gray-600 font-medium">Membership Age</td>
              <td class="w-3 text-center">:</td>
              <td class="text-gray-800">{{ calculateMembershipAge(org.membership_start_date) }}</td>
            </tr>
            <tr>
              <td class="text-gray-600 font-medium">Status</td>
              <td class="w-3 text-center">:</td>
              <td :class="org.is_active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                {{ org.is_active ? 'Active' : 'Inactive' }}
              </td>
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
            <th class="px-4 py-3 text-left">Organisation Name</th>
            <th class="px-4 py-3 text-left">Membership ID</th>
            <th class="px-4 py-3 text-left">Membership Type</th>
            <th class="px-4 py-3 text-left">Start Date</th>
            <th class="px-4 py-3 text-left">Membership Age</th>
            <th class="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(org, index) in connectedOrgs" :key="org.id"
            class="border-t text-sm text-gray-800 hover:bg-gray-50 align-top">
            <td class="px-4 py-3">{{ index + 1 }}</td>
            <td class="px-4 py-3 break-words">{{ org.org_name }}</td>
            <td class="px-4 py-3 break-words">{{ org.existing_membership_id || '—' }}</td>
            <td class="px-4 py-3 break-words">{{ org.membership_type?.name || '—' }}</td>
            <td class="px-4 py-3">{{ org.membership_start_date || '—' }}</td>
            <td class="px-4 py-3">{{ calculateMembershipAge(org.membership_start_date) }}</td>
            <td class="px-4 py-3">
              <span :class="org.is_active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                {{ org.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
