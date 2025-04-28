<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const committeeList = ref([]);
const modalVisible = ref(false);
const viewModalVisible = ref(false);
const isEditMode = ref(false);
const selectedCommittee = ref(null);
const newName = ref('');
const short_description = ref('');
const start_date = ref('');
const end_date = ref('');
const note = ref('');
const status = ref("1");
const userId = authStore.user.id;

// Fetch committee list
const fetchCommitteeList = async () => {
  try {
    const response = await auth.fetchProtectedApi("/api/committees", {}, 'GET');
    if (response.status) {
      committeeList.value = response.data;
    } else {
      committeeList.value = [];
    }
  } catch (error) {
    console.error("Error fetching committee list:", error);
    committeeList.value = [];
  }
};

// Open modal for create/edit
const openModal = (committee = null) => {
  if (committee) {
    isEditMode.value = true;
    selectedCommittee.value = committee;
    newName.value = committee.name;
    short_description.value = committee.short_description;
    start_date.value = committee.start_date;
    end_date.value = committee.end_date;
    note.value = committee.note;
    status.value = committee.status;
  } else {
    isEditMode.value = false;
    selectedCommittee.value = null;
    newName.value = '';
    short_description.value = '';
    start_date.value = '';
    end_date.value = '';
    note.value = '';
    status.value = "1";
  }
  modalVisible.value = true;
};

// Open view modal
const openViewModal = (committee) => {
  selectedCommittee.value = committee;
  viewModalVisible.value = true;
};

// Close modals
const closeModal = () => {
  modalVisible.value = false;
};
const closeViewModal = () => {
  viewModalVisible.value = false;
};

// Create committee
const createCommittee = async () => {
  try {
    const response = await auth.fetchProtectedApi(
      "/api/committees",
      {
        user_id: userId,
        name: newName.value,
        short_description: short_description.value,
        start_date: start_date.value,
        end_date: end_date.value,
        note: note.value,
        status: status.value,
      },
      "POST"
    );

    Swal.fire({
      icon: 'success',
      title: 'Committee created successfully',
      showConfirmButton: false,
      timer: 1500
    });
    closeModal();
    fetchCommitteeList();
  } catch (error) {
    console.error("Error creating committee:", error);
  }
};

// Update committee
const updateCommittee = async () => {
  try {
    const response = await auth.fetchProtectedApi(
      `/api/committees/${selectedCommittee.value.id}`,
      {
        user_id: userId,
        name: newName.value,
        short_description: short_description.value,
        start_date: start_date.value,
        end_date: end_date.value,
        note: note.value,
        status: status.value,
      },
      "PUT"
    );

    Swal.fire({
      icon: 'success',
      title: 'Committee created successfully',
      showConfirmButton: false,
      timer: 1500
    });
    closeModal();
    fetchCommitteeList();
  } catch (error) {
    console.error("Error creating committee:", error);
  }
};

// Delete committee
const deleteCommittee = async (id) => {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this committee?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/committees/${id}`, {}, 'DELETE');

      if (response.status) {
        await Swal.fire('Deleted!', 'Committee has been deleted.', 'success');
        fetchCommitteeList();
      } else {
        Swal.fire('Failed!', 'Failed to delete committee.', 'error');
      }
    }
  } catch (error) {
    console.error('Error deleting committee:', error);
    Swal.fire('Error!', 'Failed to delete committee.', 'error');
  }
};

onMounted(fetchCommitteeList);
</script>


<template>
 <div>
   <!-- Heading and Create Button -->
   <div class="my-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">Committees</h2>
      <button @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition duration-200">
        + Create Committee
      </button>
    </div>
  </div>

  <!-- Committee Table -->
  <div>
    <div v-if="committeeList.length">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="pl-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">#</th>
              <th class="pl-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Committee Name</th>
              <th class="pl-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Start Date</th>
              <th class="pl-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">End Date</th>
              <th class="pr-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(committee, index) in committeeList" :key="committee.id"
              class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 text-sm text-gray-700">{{ index + 1 }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ committee.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ committee.start_date }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ committee.end_date }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button
                  @click="$router.push({ name: 'index-committee-member', params: { committeeId: committee.id, committeeName: committee.name } })"
                  class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-lg text-xs">
                  Members
                </button>
                <button @click="openViewModal(committee)"
                  class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs">
                  View
                </button>
                <button @click="openModal(committee)"
                  class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs">
                  Edit
                </button>
                <button @click="deleteCommittee(committee.id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
    </div>
    <div v-else class="text-center py-6 text-gray-500 text-sm">
      No committee entries found.
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <div v-if="modalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-auto p-6 md:p-8">
      <!-- Modal Header -->
      <h2 class="text-lg md:text-2xl font-semibold text-center text-gray-800 mb-6">
        {{ isEditMode ? 'Edit Committee' : 'Create Committee' }}
      </h2>

      <!-- Scrollable Form -->
      <div class="max-h-[28rem] overflow-y-auto space-y-4">
        <!-- Committee Name -->
        <div>
          <label for="newName" class="block text-sm font-medium text-gray-700 mb-1">Committee Name</label>
          <input v-model="newName" id="newName" type="text"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Short Description -->
        <div>
          <label for="short_description" class="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <input v-model="short_description" id="short_description" type="text"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input v-model="start_date" id="start_date" type="date"
              class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input v-model="end_date" id="end_date" type="date"
              class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <!-- Note -->
        <div>
          <label for="note" class="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea v-model="note" id="note" rows="3"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <!-- Status -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="status" id="status"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="1">Active</option>
            <option value="0">Disable</option>
          </select>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end mt-6 space-x-3">
        <button @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button @click="isEditMode ? updateCommittee() : createCommittee()"
          class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          {{ isEditMode ? 'Update' : 'Submit' }}
        </button>
      </div>
    </div>
  </div>

  <!-- View Modal -->
  <div v-if="viewModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-auto p-6 md:p-8">
      <!-- Header -->
      <h2 class="text-lg md:text-2xl font-semibold text-center text-gray-800 mb-6">
        View Committee
      </h2>

      <!-- Committee Info Table -->
      <div class="max-h-[28rem] overflow-y-auto">
        <table class="w-full table-auto border-separate border-spacing-y-3">
          <tbody class="text-gray-700 text-sm md:text-base">
            <tr v-for="(value, label) in {
              'Name': selectedCommittee.name,
              'Short Description': selectedCommittee.short_description,
              'Start Date': selectedCommittee.start_date,
              'End Date': selectedCommittee.end_date,
              'Note': selectedCommittee.note,
              'Status': selectedCommittee.status == '1' ? 'Active' : 'Disabled'
            }" :key="label">
              <td class="font-medium text-gray-600 w-40 align-top">{{ label }}</td>
              <td class="text-gray-500">:</td>
              <td class="text-gray-800">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="text-right mt-6">
        <button @click="closeViewModal"
          class="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          Close
        </button>
      </div>
    </div>
  </div>
 </div>
</template>
