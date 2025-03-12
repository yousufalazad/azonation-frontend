<!-- Org dashboard initial content -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const userId = auth.user.id;
const totalOrgMember = ref('');
const memberList = ref([]);
const userType = computed(() => auth.user?.type);


const totalOrgMemberCount = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/total-org-member-count/${userId}`, {}, 'GET');
    if (response.status && response.totalOrgMemberCount) {
      totalOrgMember.value = response.totalOrgMemberCount;
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
  }
};

const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi(`/api/org-members/list/${userId}`, {}, 'GET');
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

onMounted(totalOrgMemberCount);
onMounted(fetchMemberList);
</script>

<template>
  <div class="mt-4 p-4">
    <div v-if="auth.isAuthenticated && userType == 'organisation'">
      <!-- First Row for Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white shadow rounded-lg p-6">
          <h5 class="text-lg font-semibold">Members</h5>
          <p class="text-2xl font-bold">{{ totalOrgMember }}</p>
          <a href="#" class="text-blue-500 hover:underline">See all</a>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h5 class="text-lg font-semibold">Meetings</h5>
          <p class="text-2xl font-bold">{{ totalOrgMember }}</p>
          <a href="#" class="text-blue-500 hover:underline">See all</a>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h5 class="text-lg font-semibold">Balance</h5>
          <p class="text-2xl font-bold">{{ totalOrgMember }}</p>
          <a href="#" class="text-blue-500 hover:underline">See all</a>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h5 class="text-lg font-semibold">New Member</h5>
          <p class="text-2xl font-bold">{{ totalOrgMember }}</p>
          <a href="#" class="text-blue-500 hover:underline">This month</a>
        </div>
      </div>

      <!-- Spacing -->
      <div class="my-8"></div>

      <!-- Member List Table -->
      <div>
        <div class="flex justify-between mb-4 left-color-shade py-2">
          <div>
            <h5 class="text-md font-semibold mt-1">Member list</h5>
          </div>
          <a href="/org-dashboard/add-member">
            <button class="text-md text-white font-semibold bg-blue-600 p-1 mr-2 rounded">
              + Add member
            </button>
          </a>
        </div>
        <div v-if="memberList.length">
          <table class="min-w-full table-auto border-collapse border border-gray-200 bg-white">
            <thead>
              <tr>
                <th class="border px-4 py-2">Sl</th>
                <th class="border px-4 py-2">Photo</th>
                <th class="border px-4 py-2">Name</th>
                <th class="border px-4 py-2">Email</th>
                <th class="border px-4 py-2">ID Number</th>
                <th class="border px-4 py-2">Membership Type</th>
                <th class="border px-4 py-2">Joining Date</th>
                <th class="border px-4 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in memberList" :key="member.id" class="hover:bg-gray-50">
                <td class="border px-4 py-2">{{ member.id }}</td>
                <td class="border px-4 py-2">{{ member.existing_org_membership_id }}</td>
                <td class="border px-4 py-2">{{ member.individual.name }}</td>
                <td class="border px-4 py-2">{{ member.individual.email }}</td>
                <td class="border px-4 py-2">{{ member.existing_org_membership_id }}</td>
                <td class="border px-4 py-2">{{ member.membership_type }}</td>
                <td class="border px-4 py-2">{{ member.joining_date }}</td>
                <td class="border px-4 py-2">{{ member.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No members found</p>
        </div>
      </div>
    </div>
  </div>
</template>
