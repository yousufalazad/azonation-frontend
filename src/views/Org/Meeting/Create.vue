<!-- meeting create -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();

// Meeting Details
const name = ref('');
const short_name = ref('');
const subject = ref('');
const date = ref('');
const start_time = ref('');
const end_time = ref('');
const meeting_type = ref('');
const timezone = ref('');
const meeting_mode = ref('');
const duration = ref('');
const priority = ref('');
const address = ref('');
const meeting_location = ref('');

// Online & Video Links
const video_conference_link = ref('');
const access_code = ref('');
const recording_link = ref('');
const video_link = ref('');
const feedback_link = ref('');

// Host & Participants
const meeting_host = ref('');
const max_participants = ref('');
const rsvp_status = ref('');
const participants = ref('');

// Descriptions
const description = ref('');
const agenda = ref('');
const requirements = ref('');
const note = ref('');
const minutes = ref('');
const decisions = ref('');
const follow_up_tasks = ref('');
const action_items = ref('');

// Meta & Settings
const tags = ref('');
const reminder_time = ref('');
const repeat_frequency = ref('');
const attachment = ref('');
const conduct_type_id = ref('');
const privacy_setup_id = ref('');
const is_publish = ref('');
const approval_status = ref('');
const is_active = ref('1');

// Preparation & Review
const prepared_by = ref('');
const reviewed_by = ref('');

// Cancellation
const cancellation_reason = ref('');

// Files
const file_attachments = ref(null);
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);


const conductTypeList = ref([]);
const privacySetupList = ref([]);

const getConductTypes = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/conduct-types', {}, 'GET');
    conductTypeList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching conduct types:', error);
    conductTypeList.value = [];
  }
};

const getPrivacySetups = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/privacy-setups', {}, 'GET');
    privacySetupList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching privacy setups:', error);
    privacySetupList.value = [];
  }
};


const resetForm = () => {
  // Meeting Details
  name.value = '';
  short_name.value = '';
  subject.value = '';
  date.value = '';
  start_time.value = '';
  end_time.value = '';
  meeting_type.value = '';
  timezone.value = '';
  meeting_mode.value = '';
  duration.value = '';
  priority.value = '';
  address.value = '';
  meeting_location.value = '';

  // Online & Video Links
  video_conference_link.value = '';
  access_code.value = '';
  recording_link.value = '';
  video_link.value = '';
  feedback_link.value = '';

  // Host & Participants
  meeting_host.value = '';
  max_participants.value = '';
  rsvp_status.value = '';
  participants.value = '';

  // Descriptions
  description.value = '';
  agenda.value = '';
  requirements.value = '';
  note.value = '';
  minutes.value = '';
  decisions.value = '';
  follow_up_tasks.value = '';
  action_items.value = '';

  // Meta & Settings
  tags.value = '';
  reminder_time.value = '';
  repeat_frequency.value = '';
  attachment.value = '';
  conduct_type_id.value = '';
  privacy_setup_id.value = '';
  is_publish.value = '';
  approval_status.value = '';
  is_active.value = '1';

  // Preparation & Review
  prepared_by.value = '';
  reviewed_by.value = '';

  // Cancellation
  cancellation_reason.value = '';

  // Files
  file_attachments.value = null;
  images.value = [{ id: Date.now(), file: null }];
  documents.value = [{ id: Date.now(), file: null }];
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

const submitForm = async () => {
  // if (!validateForm()) return;

  const formData = new FormData();

  // Meeting Details
  formData.append('name', name.value);
  formData.append('short_name', short_name.value);
  formData.append('subject', subject.value);
  formData.append('date', date.value);
  formData.append('start_time', start_time.value);
  formData.append('end_time', end_time.value);
  formData.append('meeting_type', meeting_type.value);
  formData.append('timezone', timezone.value);
  formData.append('meeting_mode', meeting_mode.value);
  formData.append('duration', duration.value);
  formData.append('priority', priority.value);
  formData.append('address', address.value);
  formData.append('meeting_location', meeting_location.value);

  // Online & Video Links
  formData.append('video_conference_link', video_conference_link.value);
  formData.append('access_code', access_code.value);
  formData.append('recording_link', recording_link.value);
  formData.append('video_link', video_link.value);
  formData.append('feedback_link', feedback_link.value);

  // Host & Participants
  formData.append('meeting_host', meeting_host.value);
  formData.append('max_participants', max_participants.value);
  formData.append('rsvp_status', rsvp_status.value);
  formData.append('participants', participants.value);

  // Descriptions
  formData.append('description', description.value);
  formData.append('agenda', agenda.value);
  formData.append('requirements', requirements.value);
  formData.append('note', note.value);
  formData.append('minutes', minutes.value);
  formData.append('decisions', decisions.value);
  formData.append('follow_up_tasks', follow_up_tasks.value);
  formData.append('action_items', action_items.value);

  // Meta & Settings
  formData.append('tags', tags.value);
  formData.append('reminder_time', reminder_time.value);
  formData.append('repeat_frequency', repeat_frequency.value);
  formData.append('attachment', attachment.value);
  formData.append('conduct_type_id', conduct_type_id.value);
  formData.append('privacy_setup_id', privacy_setup_id.value);
  formData.append('is_publish', is_publish.value);
  formData.append('approval_status', approval_status.value);
  formData.append('is_active', is_active.value);

  // Preparation & Review
  formData.append('prepared_by', prepared_by.value);
  formData.append('reviewed_by', reviewed_by.value);

  // Cancellation
  formData.append('cancellation_reason', cancellation_reason.value);

  // File Attachments
  if (file_attachments.value) {
    formData.append('file_attachments', file_attachments.value);
  }

  // Images
  images.value.forEach((fileData, index) => {
    if (fileData.file) {
      formData.append(`images[${index}]`, fileData.file.file);
    }
  });

  // Documents
  documents.value.forEach((fileData, index) => {
    if (fileData.file) {
      formData.append(`documents[${index}]`, fileData.file.file);
    }
  });

  try {
    const response = await auth.uploadProtectedApi('/api/meetings', formData, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status) {
      await Swal.fire('Success!', 'Meeting added successfully.', 'success');
      router.push({ name: 'index-meeting' });
    } else {
      Swal.fire('Failed!', 'Failed to save meeting.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to add meeting.', 'error');
  }
};


onMounted(() => {
  getConductTypes();
  getPrivacySetups();
});
</script>

<template>
  <div class="container mx-auto max-w-5xl p-6 bg-white shadow-md rounded-lg mt-10">
    <div class="flex justify-between items-center border-b pb-4 mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Create New Meeting</h1>
      <button @click="router.push({ name: 'index-meeting' })" class="btn-primary">
        Back to Meetings
      </button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Row 1: Name and Short Name -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Name</label>
          <input v-model="name" type="text" class="input" placeholder="Enter meeting name" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Short Name</label>
          <input v-model="short_name" type="text" class="input" placeholder="Optional short name" />
        </div>
      </div>

      <!-- Row 2: Date and Time -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Date</label>
          <input v-model="date" type="date" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Start Time</label>
          <input v-model="start_time" type="time" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">End Time</label>
          <input v-model="end_time" type="time" class="input" />
        </div>
      </div>

      <!-- Row 3: Meeting Type, Mode, Duration -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Meeting Type</label>
          <input v-model="meeting_type" type="text" class="input" placeholder="e.g., Workshop" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Mode</label>
          <select v-model="meeting_mode" class="input">
            <option value="">Select Mode</option>
            <option value="In-person">In-person</option>
            <option value="Virtual">Virtual</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Duration (mins)</label>
          <input v-model="duration" type="number" class="input" placeholder="e.g., 90" />
        </div>
      </div>

      <!-- Row 4: Priority, RSVP Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Priority</label>
          <select v-model="priority" class="input">
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">RSVP Status</label>
          <select v-model="rsvp_status" class="input">
            <option value="">Select RSVP Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Maybe">Maybe</option>
          </select>
        </div>
      </div>

      <!-- Row 5: Video Conference and Access Code -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Video Conference Link</label>
          <input v-model="video_conference_link" type="url" class="input" placeholder="e.g., Zoom link" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Access Code</label>
          <input v-model="access_code" type="text" class="input" placeholder="Enter access code" />
        </div>
      </div>

      <!-- Row 6: Address -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Address</label>
        <textarea v-model="address" class="input h-24" placeholder="Enter meeting address"></textarea>
      </div>

      <!-- Row 7: Description, Agenda -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Description</label>
        <textarea v-model="description" class="input h-24" placeholder="Provide a brief description"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600">Agenda</label>
        <textarea v-model="agenda" class="input h-24" placeholder="Meeting agenda"></textarea>
      </div>

      <!-- Row 8: Conduct Type and Privacy Setup -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Conduct Type</label>
          <select v-model="conduct_type_id" class="input">
            <option value="" disabled>Select Conduct Type</option>
            <option v-for="type in conductTypeList" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Privacy Setup</label>
          <select v-model="privacy_setup_id" class="input">
            <option value="" disabled>Select Privacy Setup</option>
            <option v-for="privacy in privacySetupList" :key="privacy.id" :value="privacy.id">
              {{ privacy.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Row 9: Reminder Time, Repeat Frequency -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Reminder Time (mins)</label>
          <input v-model="reminder_time" type="number" class="input" placeholder="e.g., 15" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Repeat Frequency</label>
          <select v-model="repeat_frequency" class="input">
            <option value="">Select Frequency</option>
            <option value="None">None</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </div>

      <!-- Row 10: Note and Tags -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Note</label>
          <textarea v-model="note" class="input h-24" placeholder="Add any notes"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Tags</label>
          <input v-model="tags" type="text" class="input" placeholder="e.g., meeting, workshop" />
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

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button type="submit" class="btn-primary">Save Meeting</button>
      </div>
    </form>
  </div>
</template>


<style scoped>
.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f9fafb;
  font-size: 0.875rem;
  color: #374151;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>
