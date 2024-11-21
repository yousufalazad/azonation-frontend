<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();

// Error Message State
const errorMessage = ref('');

// Selected Meeting ID
const meetingId = ref(route.params.meetingId || null);

// Form Data States
const minutes = ref('');
const decisions = ref('');
const note = ref('');
const start_time = ref('');
const end_time = ref('');
const follow_up_tasks = ref('');
const tags = ref('');
const action_items = ref('');
const file_attachments = ref(null);
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

// Reset Form
const resetForm = () => {
  minutes.value = '';
  decisions.value = '';
  note.value = '';
  start_time.value = '';
  end_time.value = '';
  follow_up_tasks.value = '';
  tags.value = '';
  action_items.value = '';
  file_attachments.value = null;
  video_link.value = '';
  meeting_location.value = '';
  prepared_by.value = '';
  reviewed_by.value = '';
  privacy_setup_id.value = '';
  is_publish.value = '';
  approval_status.value = '';
  is_active.value = '1';
};

// Form Validation
const validateForm = () => {
  if (!minutes.value || !privacy_setup_id.value || !reviewed_by.value || !prepared_by.value) {
    Swal.fire('Error!', 'Please fill out all required fields.', 'error');
    return false;
  }
  return true;
};

// Handle File Attachments
const handleDocument = (event) => {
  file_attachments.value = event.target.files[0];
};

// Submit Form
const submitForm = async () => {
  if (!validateForm()) return;

  const formData = new FormData();
  formData.append('meeting_id', meetingId.value);
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
  formData.append('video_link', video_link.value);
  formData.append('meeting_location', meeting_location.value);
  formData.append('prepared_by', prepared_by.value);
  formData.append('reviewed_by', reviewed_by.value);
  formData.append('privacy_setup_id', privacy_setup_id.value);
  formData.append('is_publish', is_publish.value);
  formData.append('approval_status', approval_status.value);
  formData.append('is_active', is_active.value);

  try {
    // console.log('formData', formData);
    const response = await auth.uploadProtectedApi('/api/create-meeting-minutes', formData, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status) {
      Swal.fire('Success!', 'Meeting Minutes saved successfully.', 'success');
      router.push({ name: 'index-meeting-minutes' });
    } else {
      Swal.fire('Failed!', 'Could not save meeting minutes.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to save meeting minutes.', 'error');
  }
};

// Fetch Data on Mounted
onMounted(fetchData);
</script>

<template>
  <div class="container mx-auto max-w-7xl mx-auto w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Add New Meeting Minutes</h5>
      <button @click="router.push({ name: 'index-meeting-minutes' })" class="btn-primary">
        Back to Meeting Minutes List
      </button>
    </div>

    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Minutes</label>
        <input v-model="minutes" class="textarea" rows="2"></input>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Decisions</label>
        <input v-model="decisions" class="textarea" rows="2"></input>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Note</label>
        <input v-model="note" class="textarea" rows="2"></input>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Start Time</label>
          <input v-model="start_time" type="time" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">End Time</label>
          <input v-model="end_time" type="time" class="input" />
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Follow Up Tasks</label>
        <input v-model="follow_up_tasks" class="textarea" rows="2"></input>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Tags</label>
          <input v-model="tags" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Action Items</label>
          <input v-model="action_items" type="text" class="input" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700">File Attachments</label>
          <input v-model="file_attachments" type="text" class="input" />
        </div> -->
        <!-- file_attachments input  accept=".pdf,.doc,.docx,.xlsx"-->
        <div>
          <label for="file_attachments" class="block text-sm font-medium text-gray-700">File Attachments</label>
          <input @change="handleDocument" type="file" id="file_attachments"
            class="w-full border border-gray-300 rounded-md py-2 px-4" accept=".pdf,.doc,.docx,.xlsx"/>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Video Link</label>
          <input v-model="video_link" type="text" class="input" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Meeting Location</label>
          <input v-model="meeting_location" type="text" class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Privacy Setup</label>
          <select v-model="privacy_setup_id" id="privacy_setup_id"
            class="w-full  border border-gray-300 rounded-md py-2 px-4" required>
            <option value="">Select Privacy Setup</option>
            <option v-for="privacy in privacySetups" :key="privacy.id" :value="privacy.id">{{ privacy.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Reviewed By</label>
          <select v-model="reviewed_by" id="reviewed_by" class="w-full  border border-gray-300 rounded-md py-2 px-4"
            required>
            <option value="">Select Reviewed By</option>
            <option v-for="orgMember in orgMemberList" :key="orgMember.id" :value="orgMember.id">{{ orgMember.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Prepared By</label>
          <select v-model="prepared_by" id="prepared_by" class="w-full  border border-gray-300 rounded-md py-2 px-4"
            required>
            <option value="">Select Prepared By</option>
            <option v-for="orgMember in orgMemberList" :key="orgMember.id" :value="orgMember.id">{{ orgMember.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Publish Status</label>
          <select v-model="is_publish" class="input">
            <option value="">Select Publish Status</option>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Approval Status</label>
          <select v-model="approval_status" class="input">
            <option value="">Select Approval Status</option>
            <option value="0">Pending</option>
            <option value="1">Approved</option>
            <option value="2">Rejected</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="is_active" class="input">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end">
        <button type="submit" class="btn-primary">Add Meeting Minutes</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>