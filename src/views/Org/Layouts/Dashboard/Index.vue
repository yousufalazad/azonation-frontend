<!-- Org dashboard initial content -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const totalOrgMember = ref('');
const memberList = ref([]);
const userType = computed(() => auth.user?.type);


const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi('/api/org-members/all', {}, 'GET');
    if (response.status) {
      memberList.value = response.data;
      console.log("Member List:", memberList.value);
    } else {
      memberList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    memberList.value = [];
  }
};

const calculateMembershipAge = (membership_start_date) => {
  if (!membership_start_date) return '';
  const start = new Date(membership_start_date);
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  const totalMonths = years * 12 + months;
  return `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`;
};

const viewMemberDetails = (member) => {
  console.log("Viewing member:", member);
  // implement navigation or modal logic
};

const totalOrgMemberCount = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/total-org-member-count', {}, 'GET');
    if (response.status && response.data) {
      totalOrgMember.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching total members:", error);
  }
};
onMounted(totalOrgMemberCount);
onMounted(fetchMemberList);
</script>

<template>
  <div class="h-screen overflow-y-auto p-4">
    <div class="p-4">
      <div v-if="auth.isAuthenticated && userType === 'organisation'">
        <!-- Dashboard Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <h5 class="text-sm text-gray-500 font-medium mb-1">Total member</h5>
            <p class="text-3xl font-bold text-gray-800">{{ totalOrgMember }}</p>
            <a href="#" class="text-blue-500 text-sm hover:underline mt-2 inline-block">See all</a>
          </div>
          <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <h5 class="text-sm text-gray-500 font-medium mb-1">Next meeting</h5>
            <p class="text-3xl font-bold text-gray-800">{{ totalOrgMember }}</p>
            <a href="#" class="text-blue-500 text-sm hover:underline mt-2 inline-block">See all</a>
          </div>
          <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <h5 class="text-sm text-gray-500 font-medium mb-1">Balance</h5>
            <p class="text-3xl font-bold text-gray-800">{{ totalOrgMember }}</p>
            <a href="#" class="text-blue-500 text-sm hover:underline mt-2 inline-block">See all</a>
          </div>
          <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <h5 class="text-sm text-gray-500 font-medium mb-1">New members</h5>
            <p class="text-3xl font-bold text-gray-800">{{ totalOrgMember }}</p>
            <a href="#" class="text-blue-500 text-sm hover:underline mt-2 inline-block">This month</a>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap justify-between mt-8 gap-2">
          <h5 class="text-md font-semibold mt-2">Member List</h5>

          <a href="/org-dashboard/add-member">
            <button class="bg-blue-600 hover:bg-blue-700 text-sm text-white font-medium px-4 py-2 rounded-lg shadow">
              + Add member
            </button>
          </a>
        </div>

        <!-- Member List Table -->
        <div class="mt-8">
          <div v-if="memberList.length" class="bg-white shadow-md rounded-2xl overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/3">Name</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Membership Id</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">Membership type</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Membership age</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Details</th>
                </tr>
              </thead>

              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="member in memberList.slice(0, 5)" :key="member.id" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4 text-sm text-gray-800">{{ member.individual.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-800">{{ member.existing_membership_id }}</td>
                  <td class="px-6 py-4 text-sm text-gray-800">
                    {{ member.membership_type?.name || '' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-800">
                    {{ calculateMembershipAge(member.membership_start_date) }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <button @click="viewMemberDetails(member)"
                      class="text-blue-600 hover:underline hover:text-blue-800 transition font-medium">
                      Details
                    </button>
                  </td>
                </tr>
                <tr></tr>
              </tbody>

              <div class="px-6 py-4">
                <router-link to="/org-dashboard/member-list">
                  <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    View all members →
                  </button>
                </router-link>
              </div>

            </table>
          </div>
          <div v-else class="text-gray-500 text-sm mt-4">No members found.</div>
        </div>
      </div>
    </div>
  </div>
</template>
