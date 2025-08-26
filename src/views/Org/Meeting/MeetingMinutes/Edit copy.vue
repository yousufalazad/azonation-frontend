<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();

// Error Message State
const errorMessage = ref('');

// Selected Meeting ID
const id = ref(route.params.id || null);

// Form Data States
const meeting_id = ref('');
const minutes = ref('');
const decisions = ref('');
const note = ref('');
const start_time = ref('');
const end_time = ref('');
const follow_up_tasks = ref('');
const tags = ref('');
const action_items = ref('');
const file_attachments = ref(null);
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);
const video_link = ref('');
const meeting_location = ref('');
const prepared_by = ref('');
const reviewed_by = ref('');
const privacy_setup_id = ref('');
const is_publish = ref('');
const approval_status = ref('');
const is_active = ref('1');

// Dropdown Data
const orgMemberList = ref([]);
const privacySetups = ref([]);

// Fetch Existing Data for Editing
const fetchMeetingMinutes = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/meeting-minutes/${id.value}`, {}, 'GET');

    if (response.status) {

      const data = response.data;
      // Process images
      images.value = (data.images || []).map((image) => ({
        id: image.id,
        file: {
          preview: image.image_url || '', // Ensure `file_path` contains the correct URL
          name: image.file_name || '',
        },
      }));

      // Process documents
      documents.value = (data.documents || []).map(doc => ({
        id: doc.id,
        file: { preview: doc.document_url, name: doc.file_name },
      }));

      meeting_id.value = data.meeting_id || '';
      minutes.value = data.minutes || '';
      decisions.value = data.decisions || '';
      note.value = data.note || '';
      start_time.value = data.start_time || '';
      end_time.value = data.end_time || '';
      follow_up_tasks.value = data.follow_up_tasks || '';
      tags.value = data.tags || '';
      action_items.value = data.action_items || '';
      video_link.value = data.video_link || '';
      meeting_location.value = data.meeting_location || '';
      prepared_by.value = data.prepared_by || '';
      reviewed_by.value = data.reviewed_by || '';
      privacy_setup_id.value = data.privacy_setup_id || '';
      is_publish.value = data.is_publish || '';
      approval_status.value = data.approval_status || '';
      is_active.value = data.is_active || '1';
    } else {
      errorMessage.value = 'Error loading meeting minutes.';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load meeting minutes. Please try again later.';
  }
};

// Fetch Dropdown Data
const fetchData = async () => {
  try {
    const [orgMemberListResponse, privacySetupResponse] = await Promise.all([
      auth.fetchProtectedApi('/api/individual-users'),
      auth.fetchProtectedApi('/api/privacy-setups'),
    ]);

    if (orgMemberListResponse.status) {
      orgMemberList.value = orgMemberListResponse.data;
    } else {
      errorMessage.value = 'Error loading user data.';
    }

    if (privacySetupResponse.status) {
      privacySetups.value = privacySetupResponse.data;
    } else {
      errorMessage.value = 'Error loading privacy setups.';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load dropdown data. Please try again later.';
  }
};

// Form Validation
const validateForm = () => {
  if (!minutes.value || !privacy_setup_id.value) {
    Swal.fire('Error!', 'Please fill out all fields.', 'error');
    return false;
  }
  return true;
};

// Handle File Attachments
const handleDocument = (event) => {
  file_attachments.value = event.target.files[0];
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

// Submit Form
const submitForm = async () => {
  if (!validateForm()) return;

  const formData = new FormData();
  formData.append('meeting_id', meeting_id.value);
  formData.append('minutes', minutes.value);
  formData.append('decisions', decisions.value);
  formData.append('note', note.value);
  formData.append('start_time', start_time.value);
  formData.append('end_time', end_time.value);
  formData.append('follow_up_tasks', follow_up_tasks.value);
  formData.append('tags', tags.value);
  formData.append('action_items', action_items.value);
  if (file_attachments.value) {
    formData.append('file_attachments', file_attachments.value);
  }
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
  formData.append('video_link', video_link.value);
  formData.append('meeting_location', meeting_location.value);
  formData.append('prepared_by', prepared_by.value);
  formData.append('reviewed_by', reviewed_by.value);
  formData.append('privacy_setup_id', privacy_setup_id.value);
  formData.append('is_publish', is_publish.value);
  formData.append('approval_status', approval_status.value);
  formData.append('is_active', is_active.value);

  try {
    const response = await auth.uploadProtectedApi(`/api/meeting-minutes/${id.value}`, formData, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status) {
      Swal.fire('Success!', 'Meeting Minutes updated successfully.', 'success');
      router.push({ name: 'index-meeting' });
    } else {
      Swal.fire('Failed!', 'Could not update meeting minutes.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to update meeting minutes.', 'error');
  }
};

// Fetch Data on Mounted
onMounted(() => {
  fetchData();
  fetchMeetingMinutes();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Edit Meeting Minutes</h5>
      <div>
          <button @click="$router.push({ name: 'view-meeting-minutes', params: { id: id } })"
                  class="bg-green-500 hover:bg-green-600 text-white p-2 m-2 rounded">Meeting Minutes View</button>
        <button @click="$router.push({ name: 'index-meeting' })"
          class="bg-blue-500 text-white font-semibold py-2 px-2 rounded-md">Back Meeting List
        </button>
      </div>
    </div>

    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <input v-model="meeting_id" type="hidden" class="w-full p-2 border border-gray-300 rounded-md" />

        <label class="block text-sm font-medium text-gray-700">Minutes</label>
        <textarea v-model="minutes" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Decisions</label>
        <textarea v-model="decisions" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Note</label>
        <textarea v-model="note" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Follow Up Tasks</label>
        <textarea v-model="follow_up_tasks" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Action Items</label>
        <textarea v-model="action_items" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Start Time</label>
          <input v-model="start_time" type="time" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">End Time</label>
          <input v-model="end_time" type="time" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700">File Attachments</label>
          <input @change="handleDocument" type="file" class="w-full p-2 border border-gray-300 rounded-md"
            accept=".pdf,.doc,.docx,.xlsx" />
        </div> -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Tags</label>
          <input v-model="tags" type="text" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Video Link</label>
          <input v-model="video_link" type="text" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Meeting Location</label>
          <input v-model="meeting_location" type="text" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Reviewed By</label>
          <select v-model="reviewed_by" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select Reviewed By</option>
            <option v-for="orgMember in orgMemberList" :key="orgMember.id" :value="orgMember.id">{{ orgMember.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Prepared By</label>
          <select v-model="prepared_by" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select Prepared By</option>
            <option v-for="orgMember in orgMemberList" :key="orgMember.id" :value="orgMember.id">{{ orgMember.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Privacy Setup</label>
          <select v-model="privacy_setup_id" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select Privacy Setup</option>
            <option v-for="privacy in privacySetups" :key="privacy.id" :value="privacy.id">{{ privacy.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Publish Status</label>
          <select v-model="is_publish" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select Publish Status</option>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Approval Status</label>
          <select v-model="approval_status" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select Approval Status</option>
            <option value="0">Pending</option>
            <option value="1">Approved</option>
            <option value="2">Rejected</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="is_active" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
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


      <div class="flex justify-end">
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium">
          Update Meeting Minutes
        </button>
      </div>

    </form>
  </div>
</template>