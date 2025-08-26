<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter, useRoute } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();

const title = ref('');
const history = ref('');
// const image = ref(null);
// const document = ref(null);
const is_active = ref(1);
const privacy_setup_id = ref(1); // Default to 1 if not set
// File Management
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);


// // Handle Image File Input
// const handleImage = (event) => {
//   image.value = event.target.files[0];
// };

// // Handle Document File Input
// const handleDocument = (event) => {
//   document.value = event.target.files[0];
// };

// Handle File Change
const handleFileChange = (event, fileList, index) => {
  const file = event.target.files[0];
  if (file) {
    fileList[index].file = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    };
  }
};

// Add More Files
const addMoreFiles = (fileList) => {
  fileList.push({ id: Date.now(), file: null });
};

// Remove File
const removeFile = (fileList, index) => {
  if (fileList[index].file && fileList[index].file.preview) {
    URL.revokeObjectURL(fileList[index].file.preview); // Release memory
  }
  fileList.splice(index, 1);
};


// Submit the Form Data
const submitForm = async () => {
  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('history', history.value);
  formData.append('privacy_setup_id', privacy_setup_id.value);
  formData.append('is_active', is_active.value);

  images.value.forEach((fileData, index) => {
    if (fileData.file) {
      formData.append(`images[${index}]`, fileData.file.file);
    }
  });

  documents.value.forEach((fileData, index) => {
    if (fileData.file) {
      formData.append(`documents[${index}]`, fileData.file.file);
    }
  });

  try {
    const response = await auth.uploadProtectedApi('/api/histories', formData, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status) {
      await Swal.fire('Success!', 'History added successfully.', 'success');
      router.push({ name: 'history' });
    } else {
      Swal.fire('Failed!', 'Failed to add History.', 'error');
    }
  } catch (error) {
    console.error('Error adding History:', error);
    Swal.fire('Error!', 'Failed to add History.', 'error');
  }
};

const privacySetupList = ref([]);
const getPrivacySetups = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/privacy-setups', {}, 'GET');
    privacySetupList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching privacy setups:', error);
    privacySetupList.value = [];
  }
};
onMounted(() => {
  getPrivacySetups();
});

</script>

<template>
  <div class="max-w-7xl mx-auto w-10/12">
    <section class="mb-5">
      <div class="flex justify-between items-center mb-6">
        <h5 class="text-xl font-semibold">Create History</h5>
        <button @click="router.push({ name: 'history' })"
          class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
          Back History
        </button>
      </div>

      <!-- Form for Adding New History -->
      <form @submit.prevent="submitForm">
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
          <!-- Title Field -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input v-model="title" type="text" id="title" class="w-full p-2 border border-gray-300 rounded-md"
              required />
          </div>

          <!-- History Field -->
          <div>
            <label for="history" class="block text-sm font-medium text-gray-700">History</label>
            <textarea v-model="history" id="history" rows="4" class="w-full p-2 border border-gray-300 rounded-md"
              required></textarea>
          </div>
        </div>

        <!-- Privacy Field -->
        <div class="mb-5">
          <label for="privacy_setup_id" class="block text-sm font-medium mb-2">Privacy</label>
          <select v-model="privacy_setup_id" id="privacy_setup_id" class="w-full border px-4 py-2 rounded-md">
            <option value="" disabled>Select Privacy Setup</option>
            <option v-for="privacy in privacySetupList" :key="privacy.id" :value="privacy.id">
              {{ privacy.name }}
            </option>
          </select>
        </div>

        <!-- Image Upload Field -->
        <!-- <div class="mb-4">
          <label for="image" class="block text-sm font-medium text-gray-700">Image (Optional)</label>
          <input type="file" id="image" accept="image/*" class="w-full p-2 border border-gray-300 rounded-md"
            @change="handleImage" />
        </div>

        <div class="mb-4">
          <label for="document" class="block text-sm font-medium text-gray-700">Document (Optional)</label>
          <input type="file" id="document" accept="application/pdf,.doc,.docx,.xls,.xlsx,.txt"
            class="w-full p-2 border border-gray-300 rounded-md" @change="handleDocument" />
        </div> -->

        <!-- is_active Field -->
        <div class="mb-4">
          <label for="is_active" class="block text-sm font-medium text-gray-700">Active</label>
          <select v-model="is_active" id="is_active" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>

        <!-- Images Upload -->
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
          <div class="space-y-3">
            <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
              <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept="image/*"
                @change="event => handleFileChange(event, images, index)" />

              <div v-if="file.file && file.file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
                <img :src="file.file.preview" alt="Preview" class="w-full h-full object-cover" />
              </div>

              <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                @click="removeFile(images, index)">X</button>
            </div>
          </div>
          <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
            @click="() => addMoreFiles(images)">
            Add more image
          </button>
        </div>

        <!-- Documents Upload -->
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
          <div class="space-y-3">
            <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
              <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept=".pdf,.doc,.docx"
                @change="event => handleFileChange(event, documents, index)" />

              <span v-if="file.file" class="truncate w-32">{{ file.file.name }}</span>

              <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                @click="removeFile(documents, index)">X</button>
            </div>
          </div>
        </div>
        <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(documents)">
          Add more document
        </button>

        <!-- Submit Button -->
        <div class="flex justify-center mt-6">
          <button type="submit"
            class="w-full md:w-auto bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            Submit
          </button>
        </div>
      </form>
    </section>
  </div>
</template>


<style scoped>
/* Scoped CSS can be added here if needed */
</style>