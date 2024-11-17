<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();
// Selected Meeting ID
// const meetingId = ref(route.params.id);

const minutes = ref('');
const decisions = ref('');
const note = ref('');
const start_time = ref('');
const end_time = ref('');
const follow_up_tasks = ref('');
const tags = ref('');
const action_items = ref('');
const file_attachments = ref('');
const video_link = ref('');
const meeting_location = ref('');
const confidentiality = ref('');
const approval_status = ref('');
const status = ref('');

// const resetForm = () => {
//   minutes.value = '';
//   decisions.value = '';
//   note.value = '';
//   start_time.value = '';
//   end_time.value = '';
//   follow_up_tasks.value = '';
//   tags.value = '';
//   action_items.value = '';
//   file_attachments.value = '';
//   video_link.value = '';
//   meeting_location.value = '';
//   confidentiality.value = 0;
//   approval_status.value = 0;
//   status.value = 0;
// };

const submitForm = async () => {
  try {
    const payload = {
      meeting_id: 3,
      minutes: minutes.value,
      decisions: decisions.value,
      note: note.value,
      start_time: start_time.value,
      end_time: end_time.value,
      follow_up_tasks: follow_up_tasks.value,
      tags: tags.value,
      action_items: action_items.value,
      file_attachments: file_attachments.value,
      video_link: video_link.value,
      meeting_location: meeting_location.value,
      confidentiality: confidentiality.value,
      approval_status: approval_status.value,
      status: status.value,
    };
    const response = await auth.fetchProtectedApi('/api/create-meeting-minutes', payload, 'POST');
    if (response.status) {
      await Swal.fire('Success!', 'Meeting added successfully.', 'success');
      router.push({ name: 'index-meeting-minutes' });
    } else {
      Swal.fire('Failed!', 'Failed to save meeting.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to add meeting.', 'error');
  }
};

// Fetch transactions on mount
onMounted(() => {
  
});
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
            <label class="block text-sm font-medium text-gray-700">Time</label>
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
        <div>
          <label class="block text-sm font-medium text-gray-700">File Attachments</label>
          <input v-model="file_attachments" type="text" class="input" />
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
          <label class="block text-sm font-medium text-gray-700">Confidentiality</label>
          <select v-model="confidentiality" class="input">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Approval Status</label>
          <select v-model="approval_status" class="input">
            <option value="0">Pending</option>
            <option value="1">Approved</option>
            <option value="2">Rejected</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="status" class="input">
            <option value="0">Active</option>
            <option value="1">Disable</option>
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