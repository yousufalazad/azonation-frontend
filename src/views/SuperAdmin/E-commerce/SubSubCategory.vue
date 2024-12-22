<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const form = ref({});
const isModalOpen = ref(false);
const editMode = ref(false);
const errorMessage = ref(null);
const previewImage = ref(null);

const isViewModalOpen = ref(false);
const selectedSubSubCategory = ref(null);

const subCategories = ref([]);
const fetchSubCategories = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-sub-categories');
        subCategories.value = response.status ? response.data : [];
    } catch (error) {
        errorMessage.value = 'Error loading subCategories. Please try again later.';
    }
};

const subSubCategories = ref([]);
const fetchSubSubCategories = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-sub-sub-categories');
        subSubCategories.value = response.status ? response.data : [];
    } catch (error) {
        errorMessage.value = 'Error loading subSubCategories. Please try again later.';
    }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.value.sub_sub_category_image_path = file;
        previewImage.value = URL.createObjectURL(file);
    }
};

const openModal = (subSubCategory = null) => {
    form.value = subSubCategory ? { ...subSubCategory } : { is_active: true };
    previewImage.value = null;
    if (subSubCategory && subSubCategory.sub_sub_category_image_path) {
        previewImage.value = `/path/to/images/${subSubCategory.sub_sub_category_image_path}`; // Adjust based on your API
    }
    editMode.value = !!subSubCategory;
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    form.value = {};
    editMode.value = false;
    previewImage.value = null;
};

const openViewModal = (subSubCategory) => {
  selectedSubSubCategory.value = subSubCategory;
  isViewModalOpen.value = true;
};

const closeViewModal = () => {
  isViewModalOpen.value = false;
  selectedSubSubCategory.value = null;
};

const saveSubSubCategory = async () => {
    try {
        // const formData = new FormData();
        // for (const key in form.value) {
        //   formData.append(key, form.value[key]);
        // }

        const endpoint = editMode.value ? `/api/update-sub-sub-category/${form.value.id}` : '/api/create-sub-sub-category';
        const method = editMode.value ? 'PUT' : 'POST';
        const response = await auth.fetchProtectedApi(endpoint, form.value, method);

        // const response = await auth.fetchProtectedApi(endpoint, formData, method, {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // });

        if (response.status) {
            await fetchSubSubCategories();
            closeModal();
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Sub Sub Category ${editMode.value ? 'updated' : 'created'} successfully.`,
                timer: 2000,
                showConfirmButton: false,
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not save the Sub Sub Category. Please try again.',
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

const deleteSubSubCategory = async (id) => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This action will delete the Sub Sub Category permanently.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await auth.fetchProtectedApi(`/api/delete-sub-sub-category/${id}`, {}, 'DELETE');
                if (response.status) {
                    await fetchSubSubCategories();
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Sub Sub Category has been deleted.',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Could not delete the Sub Sub Category. Please try again.',
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while deleting the Sub Sub Category.',
                });
            }
        }
    });
};

// Fetch Dialing Codes on mount
onMounted(() => {
    fetchSubCategories();
    fetchSubSubCategories();
});
</script>

<template>
    <div class="container mx-auto p-6 bg-gray-100 min-h-screen">

        <div class="flex justify-between left-color-shade py-2 my-3">
            <h5 class="text-md font-semibold mt-2">Sub Sub Category Management</h5>
            <div>
                <button @click="openModal()"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
                    Add Sub Sub Category
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
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Description</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Sub Category</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status
                        </th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="subSubCategory in subSubCategories" :key="subSubCategory.id" class="hover:bg-gray-50 transition">
                        <td class="px-6 py-4 text-sm text-gray-700">{{ subSubCategory.name }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ subSubCategory.description }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">
                            {{ subCategories.find(sc => sc.id === subSubCategory.sub_category_id)?.name || '-' }}
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ subSubCategory.order }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">
                            <span
                                :class="subSubCategory.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                                class="px-2 py-1 rounded-full text-xs font-medium">
                                {{ subSubCategory.is_active ? 'Yes' : 'No' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">

                            <button @click="openViewModal(subSubCategory)"
                                class="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600 transition">
                                View
                            </button>

                            <button @click="openModal(subSubCategory)"
                                class="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600 transition">
                                Edit
                            </button>
                            <button @click="deleteSubSubCategory(subSubCategory.id)"
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
                <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ editMode ? 'Edit' : 'Add' }} Sub Sub Category</h2>

                <form @submit.prevent="saveSubSubCategory" class="grid grid-cols-2 gap-6">
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

                    <!-- subCategory -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                        <select v-model="form.sub_category_id"
                            class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
                            required>
                            <option value="">Select Sub Category</option>
                            <option v-for="subCategory in subCategories" :key="subCategory.id" :value="subCategory.id">
                                {{ subCategory.name }}
                            </option>
                        </select>
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
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sub Sub Category Image</label>
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
        </div>

        <!-- View Modal -->
        <div v-if="isViewModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh]">
                <h2 class="text-2xl font-semibold mb-6 text-gray-800">View Sub Sub Category </h2>
                <div class="grid grid-cols-1 gap-4">
                <p><strong>Sub Category:</strong>
                    {{ subCategories.find(sc => sc.id === selectedSubSubCategory.sub_category_id)?.name || '-' }}
                </p>
                <p><strong>Name:</strong> {{ selectedSubSubCategory.name }}</p>
                <p><strong>Description:</strong> {{ selectedSubSubCategory.description }}</p>
                <p><strong>Meta Description:</strong> {{ selectedSubSubCategory.meta_description }}</p>
                <p><strong>Order:</strong> {{ selectedSubSubCategory.order }}</p>
                <p><strong>Status:</strong> {{ selectedSubSubCategory.is_active ? 'Active' : 'Inactive' }}</p>
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