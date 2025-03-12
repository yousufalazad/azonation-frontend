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
const selectedItem = ref(null);

const business_types = ref([]);
const fetchBusinessType = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/get-business-types');
    business_types.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading business_types. Please try again later.';
  }
};

const categories = ref([]);
const fetchItems = async () => {
  try {
    const response = await auth.uploadProtectedApi('/api/get-categories', {}, 'GET');
    categories.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading categories. Please try again later.';
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.category_image_path = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const openModal = (category = null) => {
  form.value = category ? { ...category, is_active: category.is_active === 1 } : { is_active: true };
  previewImage.value = null;
  if (category && category.category_image_path) {
    previewImage.value = `${category.image_url}`; // Adjust based on your API
  }
  editMode.value = !!category;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  form.value = {};
  editMode.value = false;
  previewImage.value = null;
};

const openViewModal = (category) => {
  selectedItem.value = category;
  isViewModalOpen.value = true;
};

const closeViewModal = () => {
  isViewModalOpen.value = false;
  selectedItem.value = null;
};

const saveItem = async () => {
  try {
    const endpoint = editMode.value
      ? `/api/update-category/${form.value.id}`
      : '/api/create-category';
    const method = editMode.value ? 'POST' : 'POST'; // Always POST for FormData

    const formData = new FormData();
    for (const key in form.value) {
      if (key === 'category_image_path' && !form.value.category_image_path) {
        continue; // Skip category_image_path if no new file is selected
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
      await fetchItems();
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `category ${editMode.value ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not save the category. Please try again.',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while saving the category.',
    });
  }
};

const deleteMember = async (id) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the category permanently.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await auth.uploadProtectedApi(
          `/api/delete-category/${id}`,
          {},
          'DELETE'
        );
        if (response.status) {
          await fetchItems();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'category has been deleted.',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not delete the category. Please try again.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting the category.',
        });
      }
    }
  });
};

onMounted(() => {
  fetchBusinessType();
  fetchItems();
});
</script>

<template>
  <div class="container mx-auto p-6 bg-gray-100 min-h-screen">
    <div class="flex justify-between left-color-shade py-2 my-3">
      <h5 class="text-md font-semibold mt-2">Category Management</h5>
      <div>
        <button @click="openModal()"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          Add Category
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
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Active</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Business Type</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-700">{{ category.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">
              <span :class="category.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                class="px-2 py-1 rounded-full text-xs font-medium">
                {{ category.is_active ? 'Yes' : 'No' }}
              </span>
            </td>

            <td class="px-6 py-4 text-sm text-gray-700">
              {{ business_types.find(bt => bt.id === category.business_type_id)?.name || '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ category.description }}</td>
            
            <td class="px-6 py-4 text-center">
              <button @click="openViewModal(category)"
                class="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600 transition">
                View
              </button>

              <button @click="openModal(category)"
                class="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600 transition">
                Edit
              </button>
              <button @click="deleteMember(category.id)"
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
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ editMode ? 'Edit' : 'Add' }} Category</h2>

        <form @submit.prevent="saveItem" class="grid grid-cols-2 gap-6">
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

          <!-- Business Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <select v-model="form.business_type_id"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
              required>
              <option value="">Select Business Type</option>
              <option v-for="business_type in business_types" :key="business_type.id" :value="business_type.id">
                {{ business_type.name }}
              </option>
            </select>
          </div>
          <!-- Order -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input v-model="form.order" type="number"
              class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Image</label>
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
            <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="isViewModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh]">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">Category Details</h2>

        <table class="w-full border border-gray-300 rounded-lg">
          <tbody>
            <tr class="border-b">
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50 w-20">
                Name
              </th>
              <td class="px-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                :
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ selectedItem.name || "N/A" }}
              </td>
            </tr>
            <tr class="border-b">
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50 w-20">
                Slug
              </th>
              <td class="px-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                :
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ selectedItem.slug || "N/A" }}
              </td>
            </tr>
            <tr class="border-b">
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50 w-20">
                Business Type
              </th>
              <td class="px-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                :
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ business_types.find(bt => bt.id === selectedItem.business_type_id)?.name || '-' }}
              </td>
            </tr>
            <tr class="border-b">
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50">
                Description
              </th>
              <td class="px-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                :
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ selectedItem.description || "N/A" }}
              </td>
            </tr>
            <tr class="border-b">
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50">
                Meta Description
              </th>
              <td class="px-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                :
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ selectedItem.meta_description || "N/A" }}
              </td>
            </tr>
            <tr class="border-b">
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50">
                Image
              </th>
              <td class="px-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                :
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                <img v-if="selectedItem.image_url" :src="selectedItem.image_url" alt="Logo"
                  class="max-h-48 rounded-lg" />
                <span v-else class="text-gray-500">No image available</span>
              </td>
            </tr>
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50">
                Order
              </th>
              <td class="px-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                :
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ selectedItem.order }}
              </td>
            </tr>
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50">
                Active
              </th>
              <td class="px-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
                :
              </td>
              <td class="px-6 py-4 text-sm text-gray-800">
                {{ selectedItem.is_active ? "Yes" : "No" }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 flex justify-end">
          <button @click="closeViewModal" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>


  </div>
</template>