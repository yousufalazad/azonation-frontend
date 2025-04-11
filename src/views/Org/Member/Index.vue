<!-- OrgMemberList.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import router from "../../../router/router";

const memberList = ref([]);
const selectedMember = ref(null);
const viewModal = ref(false);
const editModal = ref(false);

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

const updateMember = async () => {
  try {
    const memberId = selectedMember.value?.id;
    const payload = {
      individual_name: selectedMember.value?.individual?.name,
      existing_membership_id: selectedMember.value?.existing_membership_id,
      membership_type: selectedMember.value?.membership_type?.name,
      membership_start_date: selectedMember.value?.membership_start_date,
      sponsored_user_id: selectedMember.value?.sponsored_user_id,
      is_active: selectedMember.value?.is_active,

    };

    const response = await authStore.fetchProtectedApi(`/api/org-members/${memberId}`, payload, 'PUT');

    if (response.status) {
      // Re-fetch list after update
      await fetchMemberList();
      closeEditModal();
    } else {
      alert('Failed to update member.');
    }
  } catch (error) {
    console.error("Error updating member:", error);
    alert('An error occurred.');
  }
};

const viewMemberDetail = (member) => {
  console.log("Viewing member details:", member);
  selectedMember.value = member;
  viewModal.value = true;
};

const editMember = () => {
  if (selectedMember.value) {
    editModal.value = true;
  }
};

const closeViewModal = () => {
  selectedMember.value = null;
  viewModal.value = false;
};

const closeEditModal = () => {
  selectedMember.value = null;
  editModal.value = false;
};

const deleteMember = async (memberId) => {
  try {
    const result = await authStore.fetchProtectedApi(`/api/org-members/${memberId}`, {}, 'DELETE');
    if (result.status) {
      await fetchMemberList();
      closeViewModal();
    } else {
      alert('Failed to delete member.');
    }
  } catch (error) {
    console.error("Error deleting member:", error);
    alert('An error occurred.');
  }
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
          <a href="/org-dashboard/create-member">
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
                <button @click="viewMemberDetail(member)"
                  class="text-gray-800 hover:underline hover:text-blue-800 transition font-medium">
                  Details
                </button>
              </td> <!-- Less padding for Details -->
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-gray-500 text-sm mt-4">No members found.</div>

     <!-- View Member Modal -->
     <div v-if="viewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
            <h2 class="text-lg font-semibold mb-4">Member Details</h2>
            <div class="space-y-2 text-sm text-gray-700">
              <p><strong>Name:</strong> {{ selectedMember?.individual?.name }}</p>
              <p><strong>Membership ID:</strong> {{ selectedMember?.existing_membership_id }}</p>
              <p><strong>Membership Type:</strong> {{ selectedMember?.membership_type?.name }}</p>
              <p><strong>Membership Start Date:</strong> {{ selectedMember?.membership_start_date }}</p>
              <p><strong>Membership Age:</strong> {{ calculateMembershipAge(selectedMember?.membership_start_date) }}
                <p><strong>Reference/Sponsored by: </strong> Member Id: {{ selectedMember?.sponsored_user_id}}</p>
                <p><strong>Membership Status:</strong>{{ selectedMember?.is_active === 1 ? 'Active' : 'Inactive' }}</p>
              </p> 
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button @click="editMember"
                class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">Edit</button>
              
              <button @click="deleteMember(selectedMember.id)"
                class="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg">Delete</button>

                <button @click="closeViewModal"
                class="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </div>

        <!-- Edit Member Modal -->
        <div v-if="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
            <h2 class="text-lg font-semibold mb-4">Edit Member</h2>
            <form @submit.prevent="updateMember">
              <div class="space-y-4">

                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <input v-model="selectedMember.individual.name" type="text"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Membership Id</label>
                  <input v-model="selectedMember.existing_membership_id" type="text"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Membership Type</label>
                  <input v-model="selectedMember.membership_type.name" type="text"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Membership Start Date</label>
                  <input v-model="selectedMember.membership_start_date" type="date"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Reference / Sponsored by</label>
                  <input v-model="selectedMember.sponsored_user_id" type="text"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Membership Status</label>
                  <select v-model="selectedMember.is_active" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <!-- Add other fields as needed -->
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button type="submit" class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg">
                  Save
                </button>
                <button @click="closeEditModal" type="button"
                  class="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>


      <div class="py-9">
      </div>
      <div class="py-9">
      </div>
    </div>
  </div>
</template>

<style scoped></style>
