<script setup>
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

const auth = authStore;
const userId = auth.user.id;

// Form Fields
const name = ref('');
const description = ref('');
const is_long_term = ref(''); //true/false
const quantity = ref(1);
const value_amount = ref('');
const inkind_value = ref('');
const is_tangible = ref(''); //true/false
const responsible_user_id = ref('');
const assignment_start_date = ref('');
const assignment_end_date = ref('');
const start_date = ref('');
const end_date = ref('');
const note = ref('');
const asset_lifecycle_statuses_id = ref('');
const privacy_setup_id = ref('');
const is_active = ref(1); // Default to 1 (true)
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

// Dropdown Data
const responsibleUsers = ref([]);
const assetLifecycleSetups = ref([]);
const privacySetups = ref([]);
const getOrgAllMemberName = ref([]);

// Fetch Data from API
const fetchDropdownData = async (url, stateRef) => {
    try {
        const response = await auth.fetchProtectedApi(url, {}, 'GET');
        if (response.status) stateRef.value = response.data;
    } catch (error) {
        console.error(`Error fetching ${url.split('/').pop()}:`, error);
    }
};

// Reset form fields
const resetForm = () => {
    name.value = '';
    description.value = '';
    is_long_term.value = '';
    quantity.value = 1;
    value_amount.value = '';
    inkind_value.value = '';
    is_tangible.value = '';
    responsible_user_id.value = null;
    start_date.value = '';
    end_date.value = '';
    assignment_start_date.value = '';
    assignment_end_date.value = '';
    note.value = '';
    asset_lifecycle_statuses_id.value = null;
    privacy_setup_id.value = null;
    is_active.value = 1;
    selectedRecordId.value = null;
    images.value = [{ id: Date.now(), file: null }];
    documents.value = [{ id: Date.now(), file: null }];
};

const validateForm = () => {
    if (quantity.value < 0 || value_amount.value < 0 || inkind_value.value < 0) {
        Swal.fire('Error!', 'Ensure no numerical values are negative.', 'error');
        return false;
    }
    return true;
};

const handleFileChange = (event, fileList, index) => {
    const file = event.target.files[0];
    if (file) {
        fileList[index].file = {
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        };
    }
};

const addMoreFiles = (fileList) => {
    fileList.push({ id: Date.now(), file: null });
};

const removeFile = (fileList, index) => {
    if (fileList[index].file && fileList[index].file.preview) {
        URL.revokeObjectURL(fileList[index].file.preview); // Release memory
    }
    fileList.splice(index, 1);
};


// Submit form (create event)
const submitForm = async () => {
    if (!validateForm()) return;

    // Prepare the payload
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('name', name.value);
    formData.append('description', description.value);
    formData.append('quantity', quantity.value);
    formData.append('value_amount', value_amount.value);
    formData.append('inkind_value', inkind_value.value);
    formData.append('responsible_user_id', responsible_user_id.value);
    formData.append('start_date', start_date.value);
    formData.append('end_date', end_date.value);
    formData.append('assignment_start_date', assignment_start_date.value);
    formData.append('assignment_end_date', assignment_end_date.value);
    formData.append('note', note.value);
    formData.append('asset_lifecycle_statuses_id', asset_lifecycle_statuses_id.value);
    formData.append('privacy_setup_id', privacy_setup_id.value);
    formData.append('is_long_term', is_long_term.value ? 1 : 0);
    formData.append('is_tangible', is_tangible.value ? 1 : 0);
    formData.append('is_active', is_active.value ? 1 : 0);

    // Append images
    images.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`images[${index}]`, fileData.file.file);
        }
    });

    // Append documents
    documents.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`documents[${index}]`, fileData.file.file);
        }
    });

    try {
        // Display confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to save this asset?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        // If user confirms
        if (result.isConfirmed) {
            const response = await auth.uploadProtectedApi('/api/assets', formData, 'POST', {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status) {
                Swal.fire('Success!', 'Asset saved successfully.', 'success').then(() => {
                    // Redirect to asset list

                    router.push({ name: 'index-asset' });
                });
            } else {
                Swal.fire('Failed!', 'Failed to save asset.', 'error');
            }
        }
    } catch (error) {
        console.error('Error saving asset:', error);
        Swal.fire('Error!', 'Failed to save asset.', 'error');
    }
};


onMounted(() => {
    fetchDropdownData(`/api/org-members/${userId}`, responsibleUsers);
    fetchDropdownData('/api/asset-lifecycle-setups', assetLifecycleSetups);
    fetchDropdownData('/api/privacy-setups', privacySetups);
    fetchDropdownData('/api/org-all-member-name', getOrgAllMemberName);
});
</script>

<template>
  <div class="container mx-auto w-11/12 lg:w-10/12 max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
      <h5 class="text-xl font-semibold">Add New Asset</h5>
      <button
        @click="$router.push({ name: 'index-asset' })"
        class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
        Back to Asset List
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Name -->
      <div>
        <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
        <input
          v-model="name"
          type="text"
          id="name"
          class="w-full border border-gray-300 rounded-md py-2 px-4" />
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
        <input
          v-model="description"
          type="text"
          id="description"
          class="w-full border border-gray-300 rounded-md py-2 px-4" />
      </div>

      <!-- Start & End Date -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="start_date" class="block text-gray-700 font-semibold mb-2">Start Date</label>
          <input
            v-model="start_date"
            type="date"
            id="start_date"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <div>
          <label for="end_date" class="block text-gray-700 font-semibold mb-2">End Date</label>
          <input
            v-model="end_date"
            type="date"
            id="end_date"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
      </div>

      <!-- Quantity, Value, In-kind -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="quantity" class="block text-gray-700 font-semibold mb-2">Quantity</label>
          <input
            v-model="quantity"
            type="number"
            id="quantity"
            min="0"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
        <div>
          <label for="value_amount" class="block text-gray-700 font-semibold mb-2">Value Amount</label>
          <input
            v-model="value_amount"
            type="number"
            id="value_amount"
            min="0"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
        <div>
          <label for="inkind_value" class="block text-gray-700 font-semibold mb-2">In-Kind Value</label>
          <input
            v-model="inkind_value"
            type="number"
            id="inkind_value"
            min="0"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
      </div>

      <!-- Is Long Term & Is Tangible -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="is_long_term" class="block text-gray-700 font-semibold mb-2">Is Long Term?</label>
          <select
            v-model="is_long_term"
            id="is_long_term"
            class="w-full border border-gray-300 rounded-md py-2 px-4">
            <option :value="1">Yes</option>
            <option :value="0">No</option>
          </select>
        </div>

        <div>
          <label for="is_tangible" class="block text-gray-700 font-semibold mb-2">Is Tangible?</label>
          <select
            v-model="is_tangible"
            id="is_tangible"
            class="w-full border border-gray-300 rounded-md py-2 px-4">
            <option :value="1">Yes</option>
            <option :value="0">No</option>
          </select>
        </div>
      </div>

      <!-- Responsible Person -->
      <div>
        <label for="responsible_user_id" class="block text-gray-700 font-semibold mb-2">Responsible Person</label>
        <select
          v-model="responsible_user_id"
          id="responsible_user_id"
          class="w-full border border-gray-300 rounded-md py-2 px-4">
          <option value="" disabled>Select Responsible Person</option>
          <option
            v-for="orgMember in getOrgAllMemberName"
            :key="orgMember.individual.id"
            :value="orgMember.individual.id">
            {{ orgMember.individual.first_name }} {{ orgMember.individual.last_name }}
          </option>
        </select>
      </div>

      <!-- Assignment Dates -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="assignment_start_date" class="block text-gray-700 font-semibold mb-2">
            Responsibility Start Date
          </label>
          <input
            v-model="assignment_start_date"
            type="date"
            id="assignment_start_date"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <div>
          <label for="assignment_end_date" class="block text-gray-700 font-semibold mb-2">
            Responsibility End Date
          </label>
          <input
            v-model="assignment_end_date"
            type="date"
            id="assignment_end_date"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
      </div>

      <!-- Note -->
      <div>
        <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
        <input
          v-model="note"
          type="text"
          id="note"
          class="w-full border border-gray-300 rounded-md py-2 px-4"
          placeholder="Optional note" />
      </div>

      <!-- Lifecycle Status & Privacy -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="asset_lifecycle_statuses_id" class="block text-gray-700 font-semibold mb-2">
            Lifecycle Status
          </label>
          <select
            v-model="asset_lifecycle_statuses_id"
            id="asset_lifecycle_statuses_id"
            class="w-full border border-gray-300 rounded-md py-2 px-4">
            <option value="" disabled>Select Lifecycle Status</option>
            <option v-for="status in assetLifecycleSetups" :key="status.id" :value="status.id">
              {{ status.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="privacy_setup_id" class="block text-gray-700 font-semibold mb-2">Privacy Setup</label>
          <select
            v-model="privacy_setup_id"
            id="privacy_setup_id"
            class="w-full border border-gray-300 rounded-md py-2 px-4">
            <option value="" disabled>Select Privacy Setup</option>
            <option v-for="setup in privacySetups" :key="setup.id" :value="setup.id">
              {{ setup.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Active -->
      <div>
        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Is Active?</label>
        <select
          v-model="is_active"
          id="is_active"
          class="w-full border border-gray-300 rounded-md py-2 px-4">
          <option :value="1">Yes</option>
          <option :value="0">No</option>
        </select>
      </div>

      <!-- Images Upload -->
      <div>
        <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
        <div class="space-y-3">
          <div v-for="(file, index) in images" :key="file.id" class="flex flex-wrap items-center gap-4">
            <input
              type="file"
              class="border border-gray-300 rounded-md py-2 px-4"
              accept="image/*"
              @change="event => handleFileChange(event, images, index)" />

            <div
              v-if="file.file && file.file.preview"
              class="w-16 h-16 border rounded-md overflow-hidden">
              <img :src="file.file.preview" alt="Preview" class="w-full h-full object-cover" />
            </div>

            <button
              type="button"
              class="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
              @click="removeFile(images, index)">
              X
            </button>
          </div>
        </div>
        <button
          type="button"
          class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(images)">
          Add more image
        </button>
      </div>

      <!-- Documents Upload -->
      <div>
        <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
        <div class="space-y-3">
          <div v-for="(file, index) in documents" :key="file.id" class="flex flex-wrap items-center gap-4">
            <input
              type="file"
              class="border border-gray-300 rounded-md py-2 px-4"
              accept=".pdf,.doc,.docx"
              @change="event => handleFileChange(event, documents, index)" />

            <span v-if="file.file" class="truncate w-32">{{ file.file.name }}</span>

            <button
              type="button"
              class="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
              @click="removeFile(documents, index)">
              X
            </button>
          </div>
        </div>
        <button
          type="button"
          class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(documents)">
          Add more document
        </button>
      </div>

      <!-- Buttons -->
      <div class="flex flex-col sm:flex-row justify-end gap-4">
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add Asset
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">
          Reset
        </button>
      </div>
    </form>
  </div>
</template>
