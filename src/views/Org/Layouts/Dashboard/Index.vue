<!-- Org dashboard initial content -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStore } from '../../../../store/authStore';
import router from "../../../../router/router";
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const userType = computed(() => auth.user?.type);
const auth = authStore;

const totalOrgMember = ref('');
const memberList = ref([]);
const selectedMember = ref(null);
const membershipTypes = ref([]);
const membership_start_date = ref("");
const sponsored_user_id = ref("");
//const is_active = ref(""); // we will never delete member, so no need to update this field when member is not active
const membership_type_id = ref("");
const viewModal = ref(false);
const editModal = ref(false);
const transactionList = ref([]);
const nextMeetingDate = ref('');
const thisYearNewMemberCount = ref(0);
const thisMonthNewMemberCount = ref(0);



const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi('/api/org-members/', {}, 'GET');
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

//Fetch membership types for update member details
const fetchMembershipType = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/membership-types', {}, 'GET');
    membershipTypes.value = response.status ? response.data : [];
    // console.log("Membership types:", membershipTypes.value);
  } catch (error) {
    console.error('Error fetching membership types:', error);
    membershipTypes.value = [];
  }
};

const updateMember = async () => {
  try {
    const memberId = selectedMember.value?.id;

    // if (!selectedMember.value?.membership_start_date) {
    //   return Swal.fire({
    //     icon: 'warning',
    //     title: 'Missing Date',
    //     text: 'Please provide a membership start date before updating.',
    //   });
    // }

    const payload = {
      existing_membership_id: selectedMember.value?.existing_membership_id,
      membership_start_date: selectedMember.value?.membership_start_date,
      membership_type_id: membership_type_id.value,
      sponsored_user_id: sponsored_user_id.value,
      // is_active: is_active.value,  // we will never delete member, so no need to update this field when member is not active
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
      router.push({ name: "org-index" });

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

const calculateMembershipAge = (startDate) => {
  if (!startDate) return '';

  const start = dayjs(startDate);
  const now = dayjs();

  const diffYears = now.diff(start, 'year');
  const diffMonths = now.diff(start.add(diffYears, 'year'), 'month');
  const diffDays = now.diff(start.add(diffYears, 'year').add(diffMonths, 'month'), 'day');

  return `${diffYears}y ${diffMonths}m ${diffDays}d`;
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

const viewMemberDetail = (member) => {
  selectedMember.value = member;
  viewModal.value = true;
};

const editMember = () => {
  if (selectedMember.value) {
    membership_type_id.value = selectedMember.value.membership_type_id;
    membership_start_date.value = selectedMember.value.membership_start_date;
    sponsored_user_id.value = selectedMember.value.sponsored_user_id;
    // is_active.value = selectedMember.value.is_active; // we will never delete member, so no need to update this field when member is not active
    editModal.value = true;
  }
};

const closeViewModal = () => {
  selectedMember.value = null;
  viewModal.value = false;
};

const closeEditModal = () => {
  selectedMember.value = null;
  membership_type_id.value = null;
  membership_start_date.value = null;
  sponsored_user_id.value = null;
  editModal.value = false;
  closeViewModal();
};

const getTransactions = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/transactions', {}, 'GET');
    if (response.status) {
      const transactions = response.data;
      transactionList.value = transactions;
    } else {
      transactionList.value = [];
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

const balance = computed(() => {
  return transactionList.value.reduce((acc, trx) => {
    return trx.type === 'income'
      ? acc + Number(trx.amount)
      : acc - Number(trx.amount);
  }, 0);
});

const orgNextMeeting = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-next-meeting`, {}, 'GET');
    // console.log('Raw response:', response);

    if (response.status && response.data.date) {
      const rawDate = response.data.date;
      const parsedDate = new Date(rawDate);
      // console.log('Parsed date object:', parsedDate);

      const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(parsedDate);

      // console.log('Formatted date:', formattedDate);
      nextMeetingDate.value = formattedDate;
    }

  } catch (error) {
    console.error('Error fetching meetings:', error);
    nextMeetingDate.value = 'Error loading meeting';
  }
};

const getThisYearNewMemberCount = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/org-members/this-year-new-member-count', {}, 'GET');
    if (response.status && response.data) {
      thisYearNewMemberCount.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching this year new member count:", error);
  }
};
// const getThisMonthNewMemberCount = async () => {
//   try {
//     const response = await auth.fetchProtectedApi('/api/this-month-new-member-count', {}, 'GET');
//     if (response.status && response.data) {
//       thisMonthNewMemberCount.value = response.data;
//     }
//   } catch (error) {
//     console.error("Error fetching this month new member count:", error);
//   }
// };

onMounted(() => {
  fetchMemberList();
  fetchMembershipType();
  totalOrgMemberCount();
  getTransactions();
  orgNextMeeting();
  getThisYearNewMemberCount();
  // getThisMonthNewMemberCount();
});

</script>

<template>
  <div class="h-screen overflow-y-auto py-2">
    <div v-if="auth.isAuthenticated && userType === 'organisation'">
      <!-- Dashboard Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
          <h5 class="text-sm text-gray-500 font-medium mb-1">Total member</h5>
          <p class="text-3xl font-bold text-gray-500">{{ totalOrgMember }}</p>
          <router-link to="/org-dashboard/index-member">
            <button class="text-blue-500 text-sm hover:underline mt-2 inline-block">
              See all
            </button>
          </router-link>
        </div>

        <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
          <h5 class="text-sm text-gray-500 font-medium mb-1">Next meeting</h5>
          <p class="text-3xl font-bold text-gray-500" v-if="nextMeetingDate">{{ nextMeetingDate }}</p>
          <p class="text-gray-400 text-sm" v-else>No upcoming meeting found</p>
          <router-link to="/org-dashboard/meetings">
            <button class="text-blue-500 text-sm hover:underline mt-2 inline-block">
              See all
            </button>
          </router-link>
        </div>

        <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
          <h5 class="text-sm text-gray-500 font-medium mb-1">Balance</h5>
          <p class="text-3xl font-bold text-gray-500">{{ balance }}</p>
          <router-link to="/org-dashboard/accounts">
            <button class="text-blue-500 text-sm hover:underline mt-2 inline-block">
              See all transactions
            </button>
          </router-link>
        </div>

        <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
          <h5 class="text-sm text-gray-500 font-medium mb-1">This year new members</h5>
          <p class="text-3xl font-bold text-gray-500">{{ thisYearNewMemberCount }}</p>
          <router-link to="/org-dashboard/index-member">
            <button class="text-blue-500 text-sm hover:underline mt-2 inline-block">
              See all
            </button>
          </router-link>        </div>
      </div>

      <!-- Top Controls -->
      <div class="flex justify-between items-center py-2 mt-8 border-gray-200">
        <!-- Section Title -->
        <h2 class="text-lg font-semibold text-gray-600">Members</h2>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2">

          <router-link :to="{ name: 'index-member' }">
            <button class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
              Full List
            </button>
          </router-link>

          <button class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            Print
          </button>

          <button class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            PDF
          </button>

          <button class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            Excel
          </button>

          <a href="/org-dashboard/past-members">
            <button class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
              Past Members
            </button>
          </a>

          <a href="/org-dashboard/create-member">
            <button class="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
              + Add Member
            </button>
          </a>
        </div>
      </div>

      <!-- Member List Table -->
      <div class="mt-2">
        <div v-if="memberList.length" class="bg-white shadow-md rounded-2xl overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-20">Image</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">Name</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/5">Membership ID</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/5">Membership Type</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/5">Joining Date</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/5">Membership Age</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">Details</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="member in memberList.slice(0, 5)" :key="member.id" class="hover:bg-gray-50 transition">

                <td class="px-4 py-4 text-sm text-gray-800">
                  <img :src="member.image_url ? member.image_url : placeholderImage" alt="Member Image"
                    class="h-12 w-12 rounded-full object-cover">
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">{{ member.individual.first_name }} {{ member.individual.last_name }} </td>
                <td class="px-6 py-4 text-sm text-gray-800">{{ member.existing_membership_id || '--' }}</td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ member.membership_type?.name || '--' }}
                </td>

                <td class="px-4 py-4 text-sm text-gray-800">
                  {{
                    member.membership_start_date
                      ? new Date(member.membership_start_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                      : '--'
                  }}
                </td>

                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ calculateMembershipAge(member.membership_start_date) || '--' }}
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
          </table>
          <div class="px-6 py-4 text-right">
            <router-link to="/org-dashboard/index-member">
              <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                See all members →
              </button>
            </router-link>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm mt-4">No members found.</div>
      </div>

      <!-- View Member Modal -->
      <div v-if="viewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8 relative">

          <div class="flex justify-between items-start border-b pb-4 mb-6">
            <div>
              <h2 class="text-2xl font-semibold text-gray-800">{{ selectedMember?.individual?.name ?? '--' }}</h2>
              <p class="text-sm text-gray-500">ID: {{ selectedMember?.existing_membership_id }}</p>
            </div>
            <div class="text-right">
              <span class="text-sm px-3 py-1 rounded-full"
                :class="selectedMember?.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
                {{ selectedMember?.is_active === 1 ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-y-4 gap-x-8 text-sm text-gray-700">
            <div class="flex justify-between">
              <span class="font-medium text-gray-600">Membership type:</span>
              <span class="text-right">{{ selectedMember?.membership_type?.name ?? '--' }}</span>
            </div>

            <div class="flex justify-between">
              <span class="font-medium text-gray-600">Start date:</span>
              <span class="text-right">
                {{
                  new Date(selectedMember?.membership_start_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) || 'Not provided'
                }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-gray-600">Membership age:</span>
              <span class="text-right">{{ calculateMembershipAge(selectedMember?.membership_start_date ?? '--')
                }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-gray-600">Reference/sponsored by:</span>
              <!-- <span class="text-right">{{ selectedMember?.sponsored_user_id ?? 'Not provided' }}</span> -->
              <span class="text-right">{{
                viewModal && selectedMember?.sponsored_user_id ? memberList.find(member => member.individual.id ===
                  selectedMember.sponsored_user_id)?.individual.name : 'Not provided'
              }}</span>
            </div>
          </div>

          <div class="mt-8 flex justify-end gap-3">
            <button @click="editMember" class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">
              Edit
            </button>
            <button @click="deleteMember(selectedMember.id)"
              class="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-lg">
              Delete
            </button>
            <button @click="closeViewModal" class="bg-gray-200 hover:bg-gray-300 text-sm px-5 py-2 rounded-lg">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Member Modal -->
      <div v-if="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
          <h2 class="text-lg font-semibold mb-4">{{ selectedMember?.individual?.name }}</h2>
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
                <label for="membership_type_id" class="block text-sm font-medium text-gray-700">Membership
                  type</label>
                <select v-model="membership_type_id" id="membership_type_id"
                  class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="" disabled>Select membership type</option>
                  <option v-for="membershipType in membershipTypes" :key="membershipType.id" :value="membershipType.id">
                    {{ membershipType.name }}
                  </option>
                </select>
              </div>


              <div>
                <label class="block text-sm font-medium text-gray-700">Membership Start Date</label>
                <input v-model="selectedMember.membership_start_date" type="date"
                  class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>

              <!-- Reference/Sponsored User ID, must me individual user ID and associated org member -->
              <div>
                <label for="sponsored_user_id" class="block text-sm font-medium text-gray-700">Reference/Sponsored
                  Member</label>
                <select v-model="sponsored_user_id" id="sponsored_user_id"
                  class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="" disabled>Select Reference/Sponsored Member</option>
                  <option v-for="orgMember in memberList" :key="orgMember.individual.id"
                    :value="orgMember.individual.id">{{ orgMember.individual.name }}
                  </option>
                </select>
              </div>


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
    </div>
    <div v-else class="flex items-center justify-center h-screen">
      <p class="text-gray-500 text-lg">You are not authorized to view this page.</p>
    </div>
  </div>
</template>
