<template>
  <div>
    <!-- Committee List -->
    <div class="card shadow-sm my-4">
      <div class="card-body">
        <h2 class="text-2xl font-bold mb-4">Committees</h2>
        <button
          @click="openModal()"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          Create Committee
        </button>
        <div v-if="committeeList.length">
          <table class="min-w-full bg-white border">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b">Sl</th>
                <th class="py-2 px-4 border-b">User ID</th>
                <th class="py-2 px-4 border-b">Committee Name</th>
                <th class="py-2 px-4 border-b">Starting Date</th>
                <th class="py-2 px-4 border-b">Ending Date</th>
                <th class="py-2 px-4 border-b">Status</th>
                <th class="py-2 px-4 border-b">Description</th>
                <th class="py-2 px-4 border-b">Note</th>
                <th class="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(committee, index) in committeeList" :key="committee.id">
                <td class="py-2 px-4 border-b">{{ index + 1 }}</td>
                <td class="py-2 px-4 border-b">{{ committee.user_id }}</td>
                <td class="py-2 px-4 border-b">{{ committee.name }}</td>
                <td class="py-2 px-4 border-b">{{ committee.start_date }}</td>
                <td class="py-2 px-4 border-b">{{ committee.end_date }}</td>
                <td class="py-2 px-4 border-b">{{ committee.status }}</td>
                <td class="py-2 px-4 border-b">{{ committee.short_description }}</td>
                <td class="py-2 px-4 border-b">{{ committee.note }}</td>
                <td class="py-2 px-4 border-b">
                  <button
                    @click="openModal(committee)"
                    class="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No committee found.</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-center">
          {{ isEditMode ? 'Edit Committee' : 'Create Committee' }}
        </h2>

        <!-- <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700">Committee Id</label>
          <input
            v-model="id"
            type="text"
            id="id"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          <p v-if="auth.errors?.id" class="text-red-500 text-sm mt-1">{{ auth.errors?.id[0] }}</p>
        </div> -->

        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700">Committee Name</label>
          <input
            v-model="name"
            type="text"
            id="name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          <p v-if="auth.errors?.name" class="text-red-500 text-sm mt-1">{{ auth.errors?.name[0] }}</p>
        </div>

        <div class="mb-4">
          <label for="short_description" class="block text-sm font-medium text-gray-700">Short Description</label>
          <input
            v-model="short_description"
            type="text"
            id="short_description"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p v-if="auth.errors?.short_description" class="text-red-500 text-sm mt-1">{{ auth.errors?.short_description[0] }}</p>
        </div>

        <div class="mb-4">
          <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            v-model="start_date"
            type="date"
            id="start_date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p v-if="auth.errors?.start_date" class="text-red-500 text-sm mt-1">{{ auth.errors?.start_date[0] }}</p>
        </div>

        <div class="mb-4">
          <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
          <input
            v-model="end_date"
            type="date"
            id="end_date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p v-if="auth.errors?.end_date" class="text-red-500 text-sm mt-1">{{ auth.errors?.end_date[0] }}</p>
        </div>

        <div class="mb-4">
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <input
            v-model="status"
            type="text"
            id="status"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p v-if="auth.errors?.status" class="text-red-500 text-sm mt-1">{{ auth.errors?.status[0] }}</p>
        </div>

        <div class="mb-4">
          <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            v-model="note"
            id="note"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
          <p v-if="auth.errors?.note" class="text-red-500 text-sm mt-1">{{ auth.errors?.note[0] }}</p>
        </div>

        <div class="flex justify-end">
          <button 
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
            @click="closeModal"
          >
            Close
          </button>
          <button 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            @click="isEditMode ? updateCommittee() : createCommittee()"
          >
            {{ isEditMode ? 'Update' : 'Submit' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const committeeList = ref([]);
const modalVisible = ref(false);
const isEditMode = ref(false);
const selectedCommittee = ref(null);

const name = ref('');
// const id = ref('');
const short_description = ref('');
const start_date = ref('');
const end_date = ref('');
const note = ref('');
const status = ref('');

const userId = authStore.user.id;

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

const openModal = (committee = null) => {
  if (committee) {
    isEditMode.value = true;
    selectedCommittee.value = committee;
    name.value = committee.name;
    short_description.value = committee.short_description;
    start_date.value = committee.start_date;
    end_date.value = committee.end_date;
    note.value = committee.note;
    status.value = committee.status;
  } else {
    isEditMode.value = false;
    selectedCommittee.value = null;
    name.value = '';
    short_description.value = '';
    start_date.value = '';
    end_date.value = '';
    note.value = '';
    status.value = '';
  }
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

const createCommittee = async () => {
  try {
    await auth.createCommittee(userId, name.value, short_description.value, start_date.value, end_date.value, note.value, status.value);
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

const updateCommittee = async () => {
  try {
    await auth.updateCommittee(selectedCommittee.value.id, name.value, short_description.value, start_date.value, end_date.value, note.value, status.value);
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

// const updateCommittee = async () => {
//     try {
//         const response = await auth.fetchProtectedApi(`/api/update_committee/${userId}`, {
//             address_line: orgAddressLine.value,
//             city: city.value,
//             state_or_region: stateOrRegion.value,
//             postal_code: postalCode.value,
//             country_id: country.value

//             user_id: selectedCommittee.value.user_id,
//           name: name,
//           short_description: short_description,
//           start_date: start_date,
//           end_date: end_date,
//           note: note,
//           status: status,

//         }, 'PUT');
//         if (response.status) {
//             Swal.fire('Success', 'Address updated successfully', 'success');
//         } else {
//             Swal.fire('Error', 'Failed to update address', 'error');
//         }
//     } catch (error) {
//         console.error("Error updating address:", error);
//         Swal.fire('Error', 'Failed to update address', 'error');
//     }
// };

onMounted(fetchCommitteeList);
</script>

<style scoped>
</style>