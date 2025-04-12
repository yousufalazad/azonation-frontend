<!-- OrgMemberList.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import router from "../../../router/router";
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

const memberList = ref([]);
const membershipTypeId = ref([]);
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

// Fetch membership types
const fetchMembershipType = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/membership-types', {}, 'GET');
        membershipTypeId.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching membership types:', error);
        membershipTypeId.value = [];
    }
};

const updateMember = async () => {
  try {
    const memberId = selectedMember.value?.id;
    const membershipStartDate = selectedMember.value?.membership_start_date;

    if (!membershipStartDate) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Date',
        text: 'Please provide a membership start date before updating.',
      });
    }

    const payload = {
      existing_membership_id: selectedMember.value?.existing_membership_id,
      membership_start_date: membershipStartDate,
    };

    const response = await authStore.fetchProtectedApi(`/api/org-members/${memberId}`, payload, 'PUT');

    if (response.status) {
      await fetchMemberList();
      closeEditModal();
      closeViewModal();

      Swal.fire({
        icon: 'success',
        title: 'Member Updated',
        text: 'The member information has been successfully updated.',
        timer: 3000,
        showConfirmButton: false,
      });
      router.push({ name: "index-member" });

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update member.',
      });
    }
  } catch (error) {
    console.error("Error updating member:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An unexpected error occurred while updating the member.',
    });
  }
};

const deleteMember = async (memberId) => {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

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


dayjs.extend(duration);
dayjs.extend(relativeTime);

const calculateMembershipAge = (startDate) => {
  if (!startDate) return '';

  const start = dayjs(startDate);
  const now = dayjs();

  const diffYears = now.diff(start, 'year');
  const diffMonths = now.diff(start.add(diffYears, 'year'), 'month');
  const diffDays = now.diff(start.add(diffYears, 'year').add(diffMonths, 'month'), 'day');

  return `${diffYears}y ${diffMonths}m ${diffDays}d`;
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


onMounted(() => {
  fetchMemberList();
  fetchMembershipType();
});
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
              </td>
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
                  <label class="block text-sm font-medium text-gray-700">Membership Id</label>
                  <input v-model="selectedMember.existing_membership_id" type="text"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>

                <!-- <div>
                  <label class="block text-sm font-medium text-gray-700">Membership Type</label>
                  <input v-model="selectedMember.membership_type.name" type="text"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div> -->

                <!-- Membership Type -->
                <div>
                    <label for="membershipTypeId" class="block text-sm font-medium text-gray-700">Membership type</label>
                    <select v-model="membershipTypeId" id="membershipTypeId"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                    <option value="">Select membership type</option>
                                    <option v-for="type in membershipTypeId" :key="type.id" :value="type.id">{{ type.name }}
                                    </option>
                    </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Membership Start Date</label>
                  <input v-model="selectedMember.membership_start_date" type="date"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>

                <!-- <div>
                  <label class="block text-sm font-medium text-gray-700">Reference / Sponsored by</label>
                  <input v-model="selectedMember.sponsored_user_id" type="text"
                    class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div> -->

                <!-- <div>
                  <label class="block text-sm font-medium text-gray-700">Membership Status</label>
                  <select v-model="selectedMember.is_active" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div> -->

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
