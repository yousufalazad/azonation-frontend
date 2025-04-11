<!-- Org dashboard initial content -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const userType = computed(() => auth.user?.type);
const auth = authStore;

const totalOrgMember = ref('');
const memberList = ref([]);
const selectedMember = ref(null);
const viewModal = ref(false);
const editModal = ref(false);


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
    // Show confirmation dialog using SweetAlert2
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    // If the user confirms the delete action
    if (result.isConfirmed) {
      const response = await authStore.fetchProtectedApi(`/api/org-members/${memberId}`, {}, 'DELETE');
      if (response.status) {
        await fetchMemberList();
        closeViewModal();
        Swal.fire(
          'Deleted!',
          'The member has been deleted successfully.',
          'success'
        );
      } else {
        Swal.fire(
          'Error!',
          'Failed to delete member.',
          'error'
        );
      }
    } else {
      // If the user cancels the deletion
      Swal.fire(
        'Cancelled',
        'The member was not deleted.',
        'info'
      );
    }
  } catch (error) {
    console.error("Error deleting member:", error);
    Swal.fire(
      'Error!',
      'An error occurred while trying to delete the member.',
      'error'
    );
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

          <a href="/org-dashboard/create-member">
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
                    <button @click="viewMemberDetail(member)"
                      class="text-blue-600 hover:underline hover:text-blue-800 transition font-medium">
                      Details
                    </button>
                  </td>
                </tr>
                <tr></tr>
              </tbody>

              <div class="px-6 py-4">
                <router-link to="/org-dashboard/index-member">
                  <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    View all members →
                  </button>
                </router-link>
              </div>

            </table>
          </div>
          <div v-else class="text-gray-500 text-sm mt-4">No members found.</div>
        </div>

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
              <p><strong>Reference/Sponsored by: </strong> Member Id: {{ selectedMember?.sponsored_user_id }}</p>
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
                  <select v-model="selectedMember.is_active"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
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


      </div>
    </div>
  </div>
</template>
