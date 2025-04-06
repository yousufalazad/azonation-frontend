<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const form = ref({
  name: '',
  mobile: '',
  email: '',
  address: '',
  day_month_of_birth: '',
  gender: '',
  relationship: '',
  life_status: '',
  is_active: true,
});
const familyMembers = ref([]);
const isModalOpen = ref(false);
const editMode = ref(false);
const selectedMember = ref(null);
const errorMessage = ref(null);

const fetchFamilyMembers = async () => {
  try {
    const response = await auth.uploadProtectedApi('/api/family-members', {}, 'GET');
    familyMembers.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading family members. Please try again later.';
  }
};

const openModal = (member = null) => {
  form.value = member ? { ...member, is_active: member.is_active === 1 } : { is_active: true };
  editMode.value = !!member;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  form.value = {};
  editMode.value = false;
};

const openViewModal = (member) => {
  selectedMember.value = member;
};

const closeViewModal = () => {
  selectedMember.value = null;
};

const saveMember = async () => {
  try {
    const endpoint = editMode.value
      ? `/api/family-members/${form.value.member_id}`
      : '/api/family-members';
    const method = editMode.value ? 'PUT' : 'POST';

    const formData = new FormData();
    for (const key in form.value) {
      formData.append(key, form.value[key]);
    }

    const response = await auth.uploadProtectedApi(endpoint, formData, method);
    if (response.status) {
      await fetchFamilyMembers();
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Family member ${editMode.value ? 'updated' : 'added'} successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not save the family member. Please try again.',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while saving the family member.',
    });
  }
};

const deleteMember = async (id) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the family member permanently.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await auth.uploadProtectedApi(
          `/api/family-members/${id}`,
          {},
          'DELETE'
        );
        if (response.status) {
          await fetchFamilyMembers();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Family member has been deleted.',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not delete the family member. Please try again.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting the family member.',
        });
      }
    }
  });
};

onMounted(() => {
  fetchFamilyMembers();
});
</script>

<template>
  <div class="container mx-auto p-6 bg-gray-100 min-h-screen">
    <div class="flex justify-between left-color-shade py-2 my-3">
      <h5 class="text-md font-semibold mt-2">Family Member Management</h5>
      <div>
        <button @click="openModal()"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          Add Family Member
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
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Gender</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="member in familyMembers" :key="member.member_id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-700">{{ member.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ member.mobile }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ member.email }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ member.gender }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">
              <span :class="member.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                class="px-2 py-1 rounded-full text-xs font-medium">
                {{ member.is_active ? 'Active' : 'Inactive' }}
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
              <button @click="deleteMember(member.member_id)"
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
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ editMode ? 'Edit' : 'Add' }} Family Member</h2>

        <form @submit.prevent="saveMember" class="grid grid-cols-2 gap-6">
          <!-- Name -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
              required />
          </div>
          <!-- Mobile -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input v-model="form.mobile" type="text"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
               />
          </div>
          <!-- Email -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
               />
          </div>
          <!-- Address -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input v-model="form.address" type="text"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
               />
          </div>
          <!-- Day/Month of Birth -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Day/Month of Birth</label>
            <input v-model="form.day_month_of_birth" type="date"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
               />
          </div>
          <!-- Gender -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select v-model="form.gender"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <!-- Relationship -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <select v-model="form.relationship"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2">
              <option value="">Select Relationship</option>
              <option value="child">child</option>
              <option value="spouse">spouse</option>
              <option value="dependent">dependent</option>
              <option value="Other">Other</option>
            </select>           
          </div>
          <!-- Life Status -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Life Status</label>
            <select v-model="form.life_status"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2">
              <option value="">Select Life Status</option>
              <option value="active">active</option>
              <option value="deceased">deceased</option>
              <option value="left">left</option>
            </select>
          </div>
          <!-- Status -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <select v-model="form.is_active"
              class="w-full border border-gray-300 rounded-lg px-4 py-2">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>

          <div class="col-span-2 flex justify-end mt-4">
            <button type="submit"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
              Save
            </button>
            <button type="button" @click="closeModal"
              class="ml-4 bg-gray-400 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-500 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="selectedMember" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh] relative top-0">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">View Member</h2>

        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2">
            <strong>Name:</strong> {{ selectedMember.name }}
          </div>
          <div class="col-span-2">
            <strong>Email:</strong> {{ selectedMember.email }}
          </div>
          <div class="col-span-2">
            <strong>Mobile:</strong> {{ selectedMember.mobile }}
          </div>
          <div class="col-span-2">
            <strong>Address:</strong> {{ selectedMember.address }}
          </div>
          <div class="col-span-2">
            <strong>Status:</strong> {{ selectedMember.is_active ? 'Active' : 'Inactive' }}
          </div>
        </div>

        <div class="col-span-2 flex justify-end mt-4">
          <button @click="closeViewModal"
            class="bg-gray-400 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-500 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>