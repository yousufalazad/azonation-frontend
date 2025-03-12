<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';
// const baseURL = 'http://localhost:8000';

const auth = authStore;
const form = ref({});
const isModalOpen = ref(false);
const editMode = ref(false);
const errorMessage = ref(null);
const previewImage = ref(null);
const isViewModalOpen = ref(false);
const selectedMember = ref(null);

const members = ref([]);
const fetchMembers = async () => {
  try {
    const response = await auth.uploadProtectedApi('/api/independent-members', {}, 'GET');
    members.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading members. Please try again later.';
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.image_path = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

// const handleFileUpload = (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     form.value.image_path = file; // Set only if a new file is selected
//     previewImage.value = URL.createObjectURL(file); // Show preview for the new file
//   } else if (editMode.value) {
//     // Keep the existing image in edit mode if no new file is uploaded
//     previewImage.value = form.value.image_url || null;
//   }
// };

const openModal = (member = null) => {
  form.value = member ? {  ...member, is_active: member.is_active ===1 } : { is_active: true };

  previewImage.value = null;
  if (member && member.image_path) {
    previewImage.value = `${member.image_url}`; // Adjust based on your API
  }
  editMode.value = !!member;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  form.value = {};
  editMode.value = false;
  previewImage.value = null;
};

const openViewModal = (member) => {
  selectedMember.value = member;
  isViewModalOpen.value = true;
};

const closeViewModal = () => {
  isViewModalOpen.value = false;
  selectedMember.value = null;
};

const saveMember = async () => {
  try {
    const endpoint = editMode.value
      ? `/api/independent-members/${form.value.id}`
      : '/api/independent-members';
    const method = editMode.value ? 'POST' : 'POST'; // Always POST for FormData

    const formData = new FormData();
    for (const key in form.value) {
      if (key === 'image_path' && !form.value.image_path) {
        continue; // Skip image_path if no new file is selected
      }
      if (key === 'is_active') {
        formData.append(key, form.value[key] ? 1 : 0); // Convert to 1 or 0
      } else {
        formData.append(key, form.value[key]);
      }
    }

    if (editMode.value) {
      formData.append('_method', 'PUT'); // Simulate PUT
    }

    const response = await auth.uploadProtectedApi(endpoint, formData, method);

    if (response.status) {
      await fetchMembers();
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Member ${editMode.value ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not save the member. Please try again.',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while saving the member.',
    });
  }
};

const deleteMember = async (id) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the member permanently.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await auth.uploadProtectedApi(
          `/api/independent-members/${id}`,
          {},
          'DELETE'
        );
        if (response.status) {
          await fetchMembers();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Member has been deleted.',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not delete the member. Please try again.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting the member.',
        });
      }
    }
  });
};

onMounted(() => {
  fetchMembers();
});
</script>

<template>
  <div class="container mx-auto p-6 bg-gray-100 min-h-screen">
    <div class="flex justify-between left-color-shade py-2 my-3">
      <h5 class="text-md font-semibold mt-2">Independent Members Management</h5>
      <div>
        <button @click="openModal()"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          Add Independent Member
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="text-red-500 text-center py-4 font-medium">
      {{ errorMessage }}
    </div>

    <!-- Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Active</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-700">{{ member.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ member.email }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ member.mobile }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">
              <span :class="member.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                class="px-2 py-1 rounded-full text-xs font-medium">
                {{ member.is_active ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <button @click="openViewModal(member)"
                  class="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600 transition">
                  View
              </button>

              <button @click="openModal(member)"
                class="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600 transition">
                Edit
              </button>
              <button @click="deleteMember(member.id)"
                class="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh] relative top-0">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ editMode ? 'Edit' : 'Add' }} Member</h2>

        <form @submit.prevent="saveMember" class="grid grid-cols-2 gap-6">
          <!-- Name -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
              required />
          </div>
          <!-- Email -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
               />
          </div>
          <!-- Mobile -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input v-model="form.mobile" type="text"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
               />
          </div>
          <!-- Address -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea v-model="form.address"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
              ></textarea>
          </div>
          
          <!-- Admin Note -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
            <textarea v-model="form.note"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"></textarea>
          </div>
          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
            <input type="file" @change="handleFileUpload" accept="image/*"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2" />
            <img v-if="previewImage" :src="previewImage" alt="Preview" class="mt-4 max-h-48 rounded-lg" />
          </div>
          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <select v-model="form.is_active"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="col-span-2 mt-4 flex justify-between">
            <button type="button" @click="closeModal"
              class="bg-gray-500 text-white px-6 py-2 rounded-lg">Cancel</button>
            <button type="submit"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="isViewModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh]">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Member Details</h2>

        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="selectedMember.name" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="selectedMember.email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input v-model="selectedMember.mobile" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea v-model="selectedMember.address" class="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
            <img v-if="selectedMember.image_url" :src="`${selectedMember.image_url}`" alt="Preview"
              class="mt-4 max-h-48 rounded-lg" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
            <textarea v-model="selectedMember.note"
              class="w-full border border-gray-300 rounded-lg px-4 py-2" disabled></textarea>
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <select v-model="selectedMember.is_active"
              class="w-full border border-gray-300 rounded-lg px-4 py-2" disabled>
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>

          <div class="col-span-2 mt-4 flex justify-between">
            <button @click="closeViewModal" class="bg-gray-500 text-white px-6 py-2 rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>