<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const committeeList = ref([]);
const modalVisible = ref(false);
const isEditMode = ref(false);
const selectedCommittee = ref(null);
const newName = ref('');
const short_description = ref('');
const start_date = ref('');
const end_date = ref('');
const note = ref('');
const status = ref('');
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
    status.value = '';
  }
  modalVisible.value = true;
};

// Close modal
const closeModal = () => {
  modalVisible.value = false;
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

// Handle "Enter" key for form submission
const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    isEditMode.value ? updateCommittee() : createCommittee();
  }
};

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
                await Swal.fire('Deleted!', 'committee has been deleted.', 'success');
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
  <!-- Committee List -->
  <div class="my-4 p-4 bg-white shadow-md rounded-lg">
    <h2 class="text-2xl font-semibold mb-4">Committees</h2>
    <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4">
      Create Committee
    </button>

    <div v-if="committeeList.length">
      <table class="min-w-full bg-white border rounded-lg">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-4 text-left">Sl</th>
            <th class="py-2 px-4 text-left">User ID</th>
            <th class="py-2 px-4 text-left">newName</th>
            <th class="py-2 px-4 text-left">Start Date</th>
            <th class="py-2 px-4 text-left">End Date</th>
            <th class="py-2 px-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(committee, index) in committeeList" :key="committee.id" class="hover:bg-gray-100">
            <td class="py-2 px-4">{{ index + 1 }}</td>
            <td class="py-2 px-4">{{ committee.user_id }}</td>
            <td class="py-2 px-4">{{ committee.name }}</td>
            <td class="py-2 px-4">{{ committee.start_date }}</td>
            <td class="py-2 px-4">{{ committee.end_date }}</td>
            <td class="py-2 px-4">
              <button @click="openModal(committee)" class="bg-yellow-500 text-white px-4 py-1 mx-2 rounded-md hover:bg-yellow-600">
                Committee member
              </button>

             

              <button @click="openModal(committee)" class="bg-yellow-500 text-white px-4 py-1 rounded-md hover:bg-yellow-600">
                Edit
              </button>


              <button @click="deleteCommittee(committee.id)" class="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 ml-2">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p class="text-center text-gray-500">No committee found.</p>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="modalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4 text-center">
        {{ isEditMode ? 'Edit Committee' : 'Create Committee' }}
      </h2>

      <div class="mb-4">
        <label for="newName" class="block text-sm font-medium text-gray-700" required >Committee newName</label>
        <input v-model="newName" @keydown="handleKeyDown" type="text" id="newName" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>

      <div class="mb-4">
        <label for="short_description" class="block text-sm font-medium text-gray-700">Short Description</label>
        <input v-model="short_description" @keydown="handleKeyDown" type="text" id="short_description"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>

      <div class="mb-4">
        <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
        <input v-model="start_date" @keydown="handleKeyDown" type="date" id="start_date"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>

      <div class="mb-4">
        <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
        <input v-model="end_date" @keydown="handleKeyDown" type="date" id="end_date"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>

      <div class="mb-4">
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <input v-model="status" @keydown="handleKeyDown" type="text" id="status"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>

      <div class="mb-4">
        <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
        <textarea v-model="note" @keydown="handleKeyDown" id="note"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
      </div>

      <div class="flex justify-end">
        <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2" @click="closeModal">
          Close
        </button>
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          @click="isEditMode ? updateCommittee() : createCommittee()">
          {{ isEditMode ? 'Update' : 'Submit' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>