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

// Example method for action button
const viewMemberDetails = (member) => {
  console.log("Viewing member details:", member);
  // Example: Navigate or open modal
  // router.push(`/org-dashboard/member/${member.id}`);
};

onMounted(fetchMemberList);
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between mb-4 left-color-shade py-2">
      <div>
        <h5 class="text-md font-semibold mt-2">Member list</h5>
      </div>
      <div class="flex flex-wrap gap-2 items-center justify-end">
        <a href="/org-dashboard/member-list">
          <button
            class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">
            Full List
          </button>
        </a>
        <button class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">
          Print
        </button>
        <button class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">
          PDF
        </button>
        <button class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">
          Excel
        </button>
        <a href="/org-dashboard/past-members">
          <button
            class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-medium px-4 py-2 rounded-lg shadow-sm">
            Past Members
          </button>
        </a>
        <a href="/org-dashboard/add-member">
          <button class="bg-blue-600 hover:bg-blue-700 text-sm text-white font-medium px-4 py-2 rounded-lg shadow-sm">
            + Add Member
          </button>
        </a>
      </div>
    </div>

    <div v-if="memberList.length" class="bg-white shadow-md rounded-2xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-200">
          <tr>
            <!-- <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sl</th> -->
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Membership ID</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Membership Type</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joining Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="(member, index) in memberList" :key="member.id" class="hover:bg-gray-50 transition-colors">
            <!-- <td class="px-6 py-4 text-sm text-gray-800">{{ index + 1 }}</td> -->
            <td class="px-6 py-4 text-sm text-gray-800">{{ member.individual.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-800">{{ member.existing_membership_id }}</td>
            <td class="px-6 py-4 text-sm text-gray-800">{{ member.membership_type.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-800">{{ member.membership_start_date }}</td>
            <td class="px-6 py-4 text-sm">
              <button @click="viewMemberDetails(member)"
                class="text-green-600 hover:text-green-800 font-medium transition">
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped></style>
