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
    const response = await auth.fetchProtectedApi(`/api/org-committee-list/${userId}`, {}, 'GET');
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
    await auth.createCommittee(userId, newName.value, short_description.value, start_date.value, end_date.value, note.value, status.value);
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
    await auth.updateCommittee(selectedCommittee.value.id, newName.value, short_description.value, start_date.value, end_date.value, note.value, status.value);
    Swal.fire({
      icon: 'success',
      title: 'Committee updated successfully',
      showConfirmButton: false,
      timer: 1500
    });
    closeModal();
    fetchCommitteeList();
  } catch (error) {
    console.error("Error updating committee:", error);
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
      const response = await auth.fetchProtectedApi(`/api/org-committee/${id}`, {}, 'DELETE');

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
  <!-- Heading and Create Button -->
  <div class="my-4 p-4 bg-white shadow-md rounded-lg">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Committees</h2>
      <button @click="openModal()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Create Committee
      </button>
    </div>
  </div>

  <!-- Committee Table -->
  <div class="p-4 bg-white shadow-md rounded-lg">
    <div v-if="committeeList.length">
      <table class="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-4 border border-gray-300 text-left">Sl</th>
            <th class="py-2 px-4 border border-gray-300 text-left">Committee Name</th>
            <th class="py-2 px-4 border border-gray-300 text-left">Start Date</th>
            <th class="py-2 px-4 border border-gray-300 text-left">End Date</th>
            <th class="py-2 px-4 border border-gray-300 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(committee, index) in committeeList" :key="committee.id" class="hover:bg-gray-50">
            <td class="py-2 px-4 border border-gray-300">{{ index + 1 }}</td>
            <td class="py-2 px-4 border border-gray-300">{{ committee.name }}</td>
            <td class="py-2 px-4 border border-gray-300">{{ committee.start_date }}</td>
            <td class="py-2 px-4 border border-gray-300">{{ committee.end_date }}</td>
            <td class="py-2 px-4 border border-gray-300 text-right">
              <button @click="$router.push({ name: 'index-committee-member', params: { committeeId: committee.id } })"
                  class="bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 m-2 rounded">Committee Members </button>

              <button @click="openViewModal(committee)"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                View
              </button>
              <button @click="openModal(committee)"
                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 ml-2">
                Edit
              </button>
              <button @click="deleteCommittee(committee.id)"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p class="text-center text-gray-500 mt-4">No committees entry found.</p>
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <div v-if="modalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-auto">
      <h2 class="text-2xl font-bold mb-4 text-center">
        {{ isEditMode ? 'Edit Committee' : 'Create Committee' }}
      </h2>

      <!-- Scrollable content -->
      <div class="max-h-96 overflow-y-auto px-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label for="newName" class="block text-gray-700 font-medium mb-1">Committee Name</label>
            <input v-model="newName" type="text" id="newName"
              class="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="col-span-2">
            <label for="short_description" class="block text-gray-700 font-medium mb-1">Short Description</label>
            <input v-model="short_description" type="text" id="short_description"
              class="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label for="start_date" class="block text-gray-700 font-medium mb-1">Start Date</label>
            <input v-model="start_date" type="date" id="start_date"
              class="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label for="end_date" class="block text-gray-700 font-medium mb-1">End Date</label>
            <input v-model="end_date" type="date" id="end_date"
              class="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="col-span-2">
            <label for="note" class="block text-gray-700 font-medium mb-1">Note</label>
            <textarea v-model="note" id="note"
              class="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div class="col-span-2">
            <label for="status" class="block text-gray-700 font-medium mb-1">Status</label>
            <select v-model="status" id="status"
              class="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="1">Active</option>
              <option value="0">Disable</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end mt-4">
        <button @click="closeModal" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 mr-2">
          Close
        </button>
        <button @click="isEditMode ? updateCommittee() : createCommittee()"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {{ isEditMode ? 'Update' : 'Submit' }}
        </button>
      </div>
    </div>
  </div>

  <!-- View Modal -->
  <div v-if="viewModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-auto">
      <h2 class="text-2xl font-bold mb-4 text-center">View Committee</h2>
      <div class="overflow-x-auto max-h-96 overflow-y-auto">
        <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden py-5">
          <tbody class="text-gray-600 text-md font-medium">
            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">Name</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">{{ selectedCommittee.name }}</td>
            </tr>
            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">Short Description</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">{{ selectedCommittee.short_description }}</td>
            </tr>
            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">Start Date</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">{{ selectedCommittee.start_date }}</td>
            </tr>
            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">End Date</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">{{ selectedCommittee.end_date }}</td>
            </tr>
            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">Note</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">{{ selectedCommittee.note }}</td>
            </tr>
            <tr>
              <td class="px-2 py-2 text-left font-semibold w-36">Status</td>
              <td>:</td>
              <td class="px-2 py-2 text-left">{{ selectedCommittee.status == '1' ? 'Active' : 'Disabled' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-right">
        <button @click="closeViewModal" class="bg-gray-300 text-gray-700 px-4 py-2 rounded mt-4">
          Close
        </button>
      </div>
    </div>
  </div>


</template>
