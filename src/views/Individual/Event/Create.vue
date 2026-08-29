<script setup>
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = authStore;
const userId = auth.user.id;
const OrgId = computed(() => auth.currentOrgId);

const activeOrgName = computed(() => {
  const org = auth.orgAccess.find(o => o.org_type_user_id === OrgId.value);
  return org?.org_name || 'Unknown Organisation';
});
// Form Fields
const title = ref('');
const name = ref('');
const short_description = ref('');
const description = ref('');
const date = ref('');
const time = ref('');
const venue_name = ref('');
const venue_address = ref('');
const requirements = ref('');
const note = ref('');
const status = ref(0);
const conduct_type = ref(1);

const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

const resetForm = () => {
  title.value = '';
  name.value = '';
  short_description.value = '';
  description.value = '';
  date.value = '';
  time.value = '';
  venue_name.value = '';
  venue_address.value = '';
  requirements.value = '';
  note.value = '';
  status.value = 0;
  conduct_type.value = 1;
  images.value = [{ id: Date.now(), file: null }];
  documents.value = [{ id: Date.now(), file: null }];
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
    URL.revokeObjectURL(fileList[index].file.preview);
  }
  fileList.splice(index, 1);
};

const conductTypeList = ref([]);
const getConductTypes = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/conduct-types', {}, 'GET');
    conductTypeList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching conduct types:', error);
    conductTypeList.value = [];
  }
};

const submitForm = async () => {
  const payload = new FormData();
  payload.append('user_id', OrgId.value);
  payload.append('title', title.value);
  payload.append('name', name.value);
  payload.append('short_description', short_description.value);
  payload.append('description', description.value);
  payload.append('date', date.value);
  payload.append('time', time.value);
  payload.append('venue_name', venue_name.value);
  payload.append('venue_address', venue_address.value);
  payload.append('requirements', requirements.value);
  payload.append('note', note.value);
  payload.append('status', status.value);
  payload.append('conduct_type', conduct_type.value);

  images.value.forEach((fileData, index) => {
    if (fileData.file) payload.append(`images[${index}]`, fileData.file.file);
  });
  documents.value.forEach((fileData, index) => {
    if (fileData.file) payload.append(`documents[${index}]`, fileData.file.file);
  });

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to add this event for ${activeOrgName.value}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      // X-Org-Id is auto-attached by the axios interceptor from auth.currentOrgId
      const response = await auth.uploadProtectedApi('/api/events', payload, 'POST', {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status) {
        Swal.fire('Success!', 'Event added successfully.', 'success').then(() => {
          router.push({ name: 'individual-events' });
        });
      } else {
        Swal.fire('Failed!', response.errors?.message || 'Failed to add event.', 'error');
      }
    }
  } catch (error) {
    console.error('Error adding event:', error);
    Swal.fire('Error!', 'Failed to add event.', 'error');
  }
};

onMounted(() => {
  getConductTypes();
});
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
      <h5 class="text-xl font-semibold text-center sm:text-left">Add New Event</h5>
      <button @click="$router.push({ name: 'individual-events' })"
        class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md w-full sm:w-auto">
        Back to Event List
      </button>
    </div>
    <p class="text-xs text-gray-500 mb-6">
      Creating for: <span class="font-medium">{{ activeOrgName }}</span>
    </p>

    <form @submit.prevent="submitForm">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
          <input v-model="title" type="text" id="title" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
        <div>
          <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
          <input v-model="name" type="text" id="name" class="w-full border border-gray-300 rounded-md py-2 px-4" required />
        </div>
      </div>

      <div class="mb-4">
        <label for="short_description" class="block text-gray-700 font-semibold mb-2">Short Description</label>
        <input v-model="short_description" type="text" id="short_description" class="w-full border border-gray-300 rounded-md py-2 px-4" />
      </div>

      <div class="mb-4">
        <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
        <input v-model="description" id="description" type="text" class="w-full border border-gray-300 rounded-md py-2 px-4" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
          <input v-model="date" type="date" id="date" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
        <div>
          <label for="time" class="block text-gray-700 font-semibold mb-2">Time</label>
          <input v-model="time" type="time" id="time" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="venue_name" class="block text-gray-700 font-semibold mb-2">Venue Name</label>
          <input v-model="venue_name" type="text" id="venue_name" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
        <div>
          <label for="venue_address" class="block text-gray-700 font-semibold mb-2">Venue Address</label>
          <input v-model="venue_address" type="text" id="venue_address" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="requirements" class="block text-gray-700 font-semibold mb-2">Requirements</label>
          <input v-model="requirements" type="text" id="requirements" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
        <div>
          <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
          <input v-model="note" type="text" id="note" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
          <select v-model="status" id="status" class="w-full border border-gray-300 rounded-md py-2 px-4">
            <option value="0">Active</option>
            <option value="1">Disabled</option>
          </select>
        </div>
        <div>
          <label for="conduct_type" class="block text-gray-700 font-semibold mb-2">Conduct Type</label>
          <select v-model="conduct_type" id="conduct_type" class="w-full border border-gray-300 rounded-md py-2 px-4">
            <option v-for="type in conductTypeList" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
        <div class="space-y-3">
          <div v-for="(file, index) in images" :key="file.id" class="flex flex-col sm:flex-row sm:items-center gap-4">
            <input type="file" class="w-full sm:w-auto border border-gray-300 rounded-md py-2 px-4"
              accept="image/*" @change="event => handleFileChange(event, images, index)" />
            <div v-if="file.file && file.file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
              <img :src="file.file.preview" alt="Preview" class="w-full h-full object-cover" />
            </div>
            <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600 w-fit"
              @click="removeFile(images, index)">X</button>
          </div>
        </div>
        <button type="button" class="mt-3 w-full sm:w-auto bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(images)">Add more image</button>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
        <div class="space-y-3">
          <div v-for="(file, index) in documents" :key="file.id" class="flex flex-col sm:flex-row sm:items-center gap-4">
            <input type="file" class="w-full sm:w-auto border border-gray-300 rounded-md py-2 px-4"
              accept=".pdf,.doc,.docx" @change="event => handleFileChange(event, documents, index)" />
            <span v-if="file.file" class="w-full sm:w-32 truncate">{{ file.file.name }}</span>
            <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600 w-fit"
              @click="removeFile(documents, index)">X</button>
          </div>
        </div>
        <button type="button" class="mt-3 w-full sm:w-auto bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(documents)">Add more document</button>
      </div>

      <div class="flex flex-col sm:flex-row justify-end gap-4">
        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto">Add Event</button>
        <button type="button" @click="resetForm" class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 w-full sm:w-auto">Reset</button>
      </div>
    </form>
  </div>
</template>