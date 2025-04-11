<!-- OrgMemberList.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const memberList = ref([]);

const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi('/api/org-members/all', {}, 'GET');
    console.log(response.data);

    if (response.status) {
      memberList.value = response.data;
    } else {
      memberList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    memberList.value = [];
  }
};

const calculateMembershipAge = (startDate) => {
  if (!startDate) return '';
  const start = new Date(startDate);
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  const totalMonths = years * 12 + months;
  return `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`;
};

// Example method for action button
const viewMemberDetails = (member) => {
  console.log("Viewing member details:", member);
  // Example: Navigate or open modal
  // router.push(`/org-dashboard/member/${member.id}`);
};

onMounted(fetchMemberList);
</script>

<template>
  <div class="min-h-screen overflow-y-auto">
    <div class="h-screen overflow-auto p-4">
      <!-- Top Controls -->
      <div class="flex justify-between mb-4 left-color-shade py-2">
        <div>
          <h5 class="text-md font-semibold mt-2">Member list</h5>
        </div>
        <div class="flex flex-wrap gap-2 items-center justify-end">
          <!-- Buttons -->
          <a href="/org-dashboard/member-list">
            <button
              class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">Full
              List</button>
          </a>
          <button
            class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">Print</button>
          <button
            class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">PDF</button>
          <button
            class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">Excel</button>
          <a href="/org-dashboard/past-members">
            <button
              class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">Past
              Members</button>
          </a>
          <a href="/org-dashboard/add-member">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-sm text-white font-medium px-4 py-2 rounded-lg shadow-sm">+ Add
              Member</button>
          </a>
        </div>
      </div>

      <!-- Table -->
      <div v-if="memberList.length" class="bg-white shadow-md rounded-2xl overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-200">
            <tr>
              <th class="px-10 py-3 text-left text-sm font-semibold text-gray-700 w-1/3">Name</th>
              <th class="px-2 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Membership Id</th>
              <th class="px-5 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">Membership type</th>
              <th class="px-2 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Membership age</th>
              <!-- Less padding -->
              <th class="px-2 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Details</th>
              <!-- Less padding -->
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="member in memberList" :key="member.id" class="hover:bg-gray-50 transition">
              <td class="px-10 py-4 text-sm text-gray-800">{{ member.individual.name }}</td>
              <!-- More padding for Name -->
              <td class="px-2 py-4 text-sm text-gray-800">{{ member.existing_membership_id }}</td>
              <td class="px-5 py-4 text-sm text-gray-800">{{ member.membership_type?.name || '' }}</td>
              <td class="px-2 py-4 text-sm text-gray-800">{{ calculateMembershipAge(member.membership_start_date) }}
              </td> <!-- Less padding for Membership Age -->
              <td class="px-2 py-4 text-sm">
                <button @click="viewMemberDetails(member)"
                  class="text-blue-600 hover:underline hover:text-blue-800 transition font-medium">
                  Details
                </button>
              </td> <!-- Less padding for Details -->
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-gray-500 text-sm mt-4">No members found.</div>
      <div class="py-9">
      </div>
      <div class="py-9">
      </div>
    </div>
  </div>
</template>

<style scoped></style>
