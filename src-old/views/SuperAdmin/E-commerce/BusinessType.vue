<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const form = ref({});
const isModalOpen = ref(false);
const isViewModalOpen = ref(false);
const editMode = ref(false);
const errorMessage = ref(null);
const previewImage = ref(null);

const businessTypes = ref([]);
const selectedBusinessType = ref(null);

const fetchBusinessType = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/get-business-types');
    businessTypes.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading businessTypes. Please try again later.';
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.business_type_image_path = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const openModal = (businessType = null) => {
  form.value = businessType ? { ...businessType } : { is_active: true };
  previewImage.value = null;
  if (businessType && businessType.business_type_image_path) {
    previewImage.value = `/path/to/images/${businessType.business_type_image_path}`; // Adjust based on your API
  }
  editMode.value = !!businessType;
  isModalOpen.value = true;
};

const openViewModal = (businessType) => {
  selectedBusinessType.value = businessType;
  isViewModalOpen.value = true;
};

const closeViewModal = () => {
  isViewModalOpen.value = false;
  selectedBusinessType.value = null;
};

const closeModal = () => {
  isModalOpen.value = false;
  form.value = {};
  editMode.value = false;
  previewImage.value = null;
};

const saveBusinessType = async () => {
  try {
    const formData = new FormData();
    for (const key in form.value) {
      formData.append(key, form.value[key]);
    }

    const endpoint = editMode.value ? `/api/update-business-type/${form.value.id}` : '/api/create-business-type';
    const method = editMode.value ? 'PUT' : 'POST';
    const response = await auth.fetchProtectedApi(endpoint, form.value, method);

    if (response.status) {
      await fetchBusinessType();
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Business Type ${editMode.value ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not save the Business Type. Please try again.',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while saving the Business Type.',
    });
  }
};

const deleteBusinessType = async (id) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the Business Type permanently.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await auth.fetchProtectedApi(`/api/delete-business-type/${id}`, {}, 'DELETE');
        if (response.status) {
          await fetchBusinessType();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Business Type has been deleted.',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not delete the Business Type. Please try again.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting the Business Type.',
        });
      }
    }
  });
};

onMounted(() => {
  fetchBusinessType();
});
</script>

<template>
  <div class="container mx-auto p-6 bg-gray-100 min-h-screen">
    <div class="flex justify-between left-color-shade py-2 my-3">
      <h5 class="text-md font-semibold mt-2">Business Type Management</h5>
      <div>
        <button @click="openModal()"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          Add Business Type
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
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[100px]">Name</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[300px]">Description</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[60px]">Order</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[60px]">Status</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-[250px]">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="businessType in businessTypes" :key="businessType.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-700">{{ businessType.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ businessType.description }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ businessType.order }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">
              <span :class="businessType.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                class="px-2 py-1 rounded-full text-xs font-medium">
                {{ businessType.is_active ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <button @click="openViewModal(businessType)"
                class="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600 transition">
                View
              </button>
              <button @click="openModal(businessType)"
                class="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600 transition">
                Edit
              </button>
              <button @click="deleteBusinessType(businessType.id)"
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
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ editMode ? 'Edit' : 'Add' }} Business Type</h2>

        <form @submit.prevent="saveBusinessType" class="grid grid-cols-2 gap-6">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
              required />
          </div>
          <!-- Slug -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input v-model="form.slug" type="text"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2" />
          </div>
          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
              required></textarea>
          </div>

          <!-- Meta Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea v-model="form.meta_description"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"></textarea>
          </div>
          <!-- Order -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input v-model="form.order" type="number"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2" />
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
          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Business Type Image</label>
            <input type="file" @change="handleFileUpload"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2" />
            <img v-if="previewImage" :src="previewImage" alt="Preview" class="mt-4 max-h-48 rounded-lg" />
          </div>

          <!-- Buttons -->
          <div class="col-span-2 flex justify-end gap-4">
            <button type="button" @click="closeModal"
              class="bg-gray-500 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-600 transition">
              Cancel
            </button>
            <button type="submit"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
              Save
            </button>
          </div>
        </form>
      </div>
    </div

    <!-- View Modal -->
    <div v-if="isViewModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh]">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">View Business Type</h2>
        <div class="grid grid-cols-1 gap-4">
          <p><strong>Name:</strong> {{ selectedBusinessType.name }}</p>
          <p><strong>Description:</strong> {{ selectedBusinessType.description }}</p>
          <p><strong>Order:</strong> {{ selectedBusinessType.order }}</p>
          <p><strong>Status:</strong> {{ selectedBusinessType.is_active ? 'Active' : 'Inactive' }}</p>
        </div>
        <button @click="closeViewModal"
          class="bg-gray-500 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-600 transition mt-4">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>