<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import Quill from 'quill';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();
const userId = auth.user.id;

// Form Fields
const title = ref('');
const plan = ref('');
const start_date = ref('');
const end_date = ref('');
const status = ref(1);

// Quill Instance
const quillInstance = ref(null);

// File Management
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

// Initialize Quill editor
const initializeQuill = () => {
  quillInstance.value = new Quill('#plan-editor', {
    theme: 'snow',
    placeholder: 'Enter plan...',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
      ],
    },
  });

  quillInstance.value.on('text-change', () => {
    plan.value = quillInstance.value.root.innerHTML;
  });
};

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

// Submit the form
const submitForm = async () => {
  if (!title.value || !plan.value || !start_date.value || !end_date.value) {
    Swal.fire('Error!', 'Please fill out all required fields.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('title', title.value);
  formData.append('plan', plan.value);
  formData.append('start_date', start_date.value);
  formData.append('end_date', end_date.value);
  formData.append('status', status.value);

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
    const response = await auth.uploadProtectedApi('/api/strategic-plans', formData, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status) {
      await Swal.fire('Success!', 'Strategic plan created successfully.', 'success');
      router.push({ name: 'strategic-plan' });
    } else {
      Swal.fire('Error!', 'Failed to create strategic plan.', 'error');
    }
  } catch (error) {
    console.error('Error creating strategic plan:', error);
    Swal.fire('Error!', 'Failed to create strategic plan.', 'error');
  }
};

// Initialize Quill on Mounted
onMounted(() => {
  initializeQuill();
});
</script>


<template>
    <div class="max-w-3xl mx-auto p-5 bg-white rounded shadow">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Create Strategic Plan</h5>
            <button @click="router.push({ name: 'strategic-plan' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
                Back to Strategic Plan List
            </button>
        </div>
        <form @submit.prevent="submitForm">
            <div class="mb-4">
                <label for="title" class="block font-semibold mb-2">Title</label>
                <input v-model="title" type="text" id="title" class="w-full p-2 border rounded"
                    placeholder="Enter title" required />
            </div>
            <div class="mb-4">
                <label for="plan-editor" class="block font-semibold mb-2">Plan</label>
                <div id="plan-editor" class="w-full h-40 border rounded"></div>
            </div>
            <div class="mb-4">
                <label for="start_date" class="block font-semibold mb-2">Start Date</label>
                <input v-model="start_date" type="date" id="start_date" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
                <label for="end_date" class="block font-semibold mb-2">End Date</label>
                <input v-model="end_date" type="date" id="end_date" class="w-full p-2 border rounded" />
            </div>
            <div class="mb-4">
                <label for="status" class="block font-semibold mb-2">Status</label>
                <select v-model="status" id="status" class="w-full p-2 border rounded">
                    <option value="1">Active</option>
                    <option value="0">Disabled</option>
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
                <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    @click="() => addMoreFiles(documents)">
                    Add more document
                </button>
            </div>

            <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded">Submit</button>
        </form>
    </div>
</template>
