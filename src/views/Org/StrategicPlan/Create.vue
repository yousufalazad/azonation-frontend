<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import Quill from 'quill';
import { useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const userId = auth.user.id;

// Form fields
const title = ref('');
const plan = ref('');
const start_date = ref('');
const end_date = ref('');
const is_active = ref(1);

// Quill instance
let quill = null;

onMounted(() => {
  quill = new Quill('#plan-editor', {
    theme: 'snow',
    placeholder: 'Enter plan...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
    },
  });

  quill.on('text-change', () => {
    plan.value = quill.root.innerHTML;
  });
});

// File management
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

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

const addMoreFiles = (fileList) => {
  fileList.push({ id: Date.now(), file: null });
};

const removeFile = (fileList, index) => {
  if (fileList[index].file?.preview) {
    URL.revokeObjectURL(fileList[index].file.preview);
  }
  fileList.splice(index, 1);
};

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
    Swal.fire('Error!', 'Something went wrong.', 'error');
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">Create Strategic Plan</h2>
      <button @click="router.push({ name: 'strategic-plan' })"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Back to List
      </button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <div>
        <label class="block font-medium mb-1">Title</label>
        <input v-model="title" type="text" class="w-full border rounded px-3 py-2" placeholder="Enter title" />
      </div>

      <div>
        <label class="block font-medium mb-1">Plan</label>
        <div id="plan-editor" class="min-h-[200px] border rounded p-2 bg-white"></div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium mb-1">Start Date</label>
          <input v-model="start_date" type="date" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block font-medium mb-1">End Date</label>
          <input v-model="end_date" type="date" class="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div>
        <label class="block font-medium mb-1">Status</label>
        <select v-model="is_active" class="w-full border rounded px-3 py-2">
          <option value="1">Active</option>
          <option value="0">Disabled</option>
        </select>
      </div>

      <div>
        <label class="block font-medium mb-2">Upload Images</label>
        <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4 mb-2">
          <input type="file" accept="image/*"
                 @change="event => handleFileChange(event, images, index)"
                 class="border px-3 py-2 rounded" />
          <img v-if="file.file?.preview" :src="file.file.preview" class="w-16 h-16 object-cover rounded border" />
          <button type="button" class="text-red-600 font-bold" @click="removeFile(images, index)">✕</button>
        </div>
        <button type="button" class="text-blue-600 underline text-sm" @click="() => addMoreFiles(images)">
          Add more image
        </button>
      </div>

      <div>
        <label class="block font-medium mb-2">Upload Documents</label>
        <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4 mb-2">
          <input type="file" accept=".pdf,.doc,.docx"
                 @change="event => handleFileChange(event, documents, index)"
                 class="border px-3 py-2 rounded" />
          <span v-if="file.file" class="truncate w-40 text-sm">{{ file.file.name }}</span>
          <button type="button" class="text-red-600 font-bold" @click="removeFile(documents, index)">✕</button>
        </div>
        <button type="button" class="text-blue-600 underline text-sm" @click="() => addMoreFiles(documents)">
          Add more document
        </button>
      </div>

      <div class="text-right">
        <button type="submit"
                class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-medium">
          Submit
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
#plan-editor .ql-container {
  min-height: 150px;
}
</style>