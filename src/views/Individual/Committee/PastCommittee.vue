<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

const auth = authStore;
const router = useRouter();
const isLoading = ref(true);
const allCommittees = ref([]);

const fetchCommitteesData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/past_committees', {}, 'GET');
    if (response.status) {
      const orgCommittees = response.data || [];

      // Flatten committees with org name added to each
      allCommittees.value = orgCommittees.flatMap(org =>
        (org.committees || []).map(committee => ({
          ...committee,
          org_name: org.org_name || 'Unknown Organisation',
        }))
      );
    }
  } catch (error) {
    console.error('Failed to load committee data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCommitteesData();
});
</script>
<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Past Committees</h1>
      <div>
        <button @click="$router.push({ name: 'individual-committees' })"
          class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
          Present Committees List
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <div v-else-if="!allCommittees.length" class="text-gray-500 italic">No committees found.</div>

    <div v-else class="bg-white p-6 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">All Past Committees</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow rounded-md">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Organisation</th>
              <th class="px-4 py-3 text-left">Committee Name</th>
              <th class="px-4 py-3 text-left">Start Date</th>
              <th class="px-4 py-3 text-left">End Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(committee, index) in allCommittees" :key="committee.id"
              class="border-t text-sm text-gray-800 hover:bg-gray-50">
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ committee.org_name }}</td>
              <td class="px-4 py-3">{{ committee.committee.name || '—' }}</td>
              <td class="px-4 py-3">{{ committee.start_date || '—' }}</td>
              <td class="px-4 py-3">{{ committee.end_date || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- View Modal -->
  <div v-if="isViewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-6">View Committee Member</h2>

      <div class="space-y-4 text-sm text-gray-700">
        <div class="flex justify-between pb-2">
          <span class="font-medium text-gray-600 w-40">Name:</span>
          <span class="text-gray-800">{{ viewData.first_name }} {{ viewData.last_name }}</span>
        </div>

        <div class="flex justify-between pb-2">
          <span class="font-medium text-gray-600 w-40">Designation:</span>
          <span class="text-gray-800">{{ viewData.designation_name }}</span>
        </div>

        <div class="flex justify-between pb-2">
          <span class="font-medium text-gray-600 w-40">Start Date:</span>
          <span class="text-gray-800">{{ viewData.start_date }}</span>
        </div>

        <div class="flex justify-between pb-2">
          <span class="font-medium text-gray-600 w-40">End Date:</span>
          <span class="text-gray-800">{{ viewData.end_date }}</span>
        </div>

        <div class="flex justify-between pb-2">
          <span class="font-medium text-gray-600 w-40">Note:</span>
          <span class="text-gray-800">{{ viewData.note }}</span>
        </div>

        <div class="flex justify-between">
          <span class="font-medium text-gray-600 w-40">Status:</span>
          <span :class="viewData.is_active == 1 ? 'text-green-600' : 'text-red-600'">
            {{ viewData.is_active == 1 ? 'Active' : 'Disabled' }}
          </span>
        </div>
      </div>

      <div class="text-right pt-6">
        <button @click="isViewModalOpen = false"
          class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-md transition">
          Close
        </button>
      </div>
    </div>
  </div>

  <!-- Add/Edit Modal -->
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
      <h2 class="text-xl font-semibold text-gray-800">
        {{ isEditMode ? 'Edit' : 'Add' }} Committee Member
      </h2>

      <form @submit.prevent="submitForm" class="space-y-5">
        <!-- Committee member name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Committee Member Name</label>
          <select v-model="user_id" required
            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
            <option value="">Select User</option>
            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.first_name }} {{ user.last_name }}
            </option>
          </select>
        </div>

        <!-- Designation -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Designation</label>
          <select v-model="designation_id" required
            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
            <option value="">Select Designation</option>
            <option v-for="d in designationList" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input v-model="start_date" type="date"
            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input v-model="end_date" type="date"
            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
        </div>

        <!-- Note -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <input v-model="note" type="text"
            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="is_active"
            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
            <option value="1">Active</option>
            <option value="0">Disabled</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button type="submit"
            class="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-5 rounded-md transition">
            {{ isEditMode ? 'Update' : 'Add' }}
          </button>
          <button @click="isModalOpen = false" type="button"
            class="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-5 rounded-md transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
