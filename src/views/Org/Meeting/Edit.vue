<!-- meeting edit -->

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const route = useRoute();
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

// Conduct Type List
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

// Selected Record ID
const selectedRecordId = ref(route.params.id);

// Fetch meeting details on mount
const fetchMeetingDetails = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/meetings/${selectedRecordId.value}`, {}, 'GET');

    if (response.status) {
      const data = response.data;

      // Meeting Details
      name.value = data.name || '';
      short_name.value = data.short_name || '';
      subject.value = data.subject || '';
      date.value = data.date || '';
      start_time.value = data.start_time || '';
      end_time.value = data.end_time || '';
      meeting_type.value = data.meeting_type || '';
      timezone.value = data.timezone || '';
      meeting_mode.value = data.meeting_mode || '';
      duration.value = data.duration || '';
      priority.value = data.priority || '';
      address.value = data.address || '';
      meeting_location.value = data.meeting_location || '';

      // Online & Video Links
      video_conference_link.value = data.video_conference_link || '';
      access_code.value = data.access_code || '';
      recording_link.value = data.recording_link || '';
      video_link.value = data.video_link || '';
      feedback_link.value = data.feedback_link || '';

      // Host & Participants
      meeting_host.value = data.meeting_host || '';
      max_participants.value = data.max_participants || '';
      rsvp_status.value = data.rsvp_status || '';
      participants.value = data.participants || '';

      // Descriptions
      description.value = data.description || '';
      agenda.value = data.agenda || '';
      requirements.value = data.requirements || '';
      note.value = data.note || '';
      minutes.value = data.minutes || '';
      decisions.value = data.decisions || '';
      follow_up_tasks.value = data.follow_up_tasks || '';
      action_items.value = data.action_items || '';

      // Meta & Settings
      tags.value = data.tags || '';
      reminder_time.value = data.reminder_time || '';
      repeat_frequency.value = data.repeat_frequency || '';
      attachment.value = data.attachment || '';
      conduct_type_id.value = data.conduct_type_id || '';
      privacy_setup_id.value = data.privacy_setup_id || '';
      is_publish.value = data.is_publish || '';
      approval_status.value = data.approval_status || '';
      is_active.value = data.is_active || '1';

      // Preparation & Review
      prepared_by.value = data.prepared_by || '';
      reviewed_by.value = data.reviewed_by || '';

      // Cancellation
      cancellation_reason.value = data.cancellation_reason || '';

      // Files
      images.value = (data.images || []).map((image) => ({
        id: image.id,
        file: {
          preview: image.image_url || '',
          name: image.file_name || '',
        },
      }));

      documents.value = (data.documents || []).map((doc) => ({
        id: doc.id,
        file: {
          preview: doc.document_url || '',
          name: doc.file_name || '',
        },
      }));

    } else {
      Swal.fire('Error', 'Meeting not found!', 'error');
      router.push({ name: 'index-meeting' });
    }
  } catch (error) {
    console.error('Error fetching meeting details:', error);
    Swal.fire('Error', 'Failed to fetch meeting details.', 'error');
    router.push({ name: 'index-meeting' });
  }
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

// Update meeting details
const updateMeeting = async () => {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this meeting?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!',
    });

    if (!result.isConfirmed) return;

    const formData = new FormData();

    // Append meeting fields
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

    // Online & video
    formData.append('video_conference_link', video_conference_link.value);
    formData.append('access_code', access_code.value);
    formData.append('recording_link', recording_link.value);
    formData.append('video_link', video_link.value);
    formData.append('feedback_link', feedback_link.value);

    // Participants
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

    // Meta
    formData.append('tags', tags.value);
    formData.append('reminder_time', reminder_time.value);
    formData.append('repeat_frequency', repeat_frequency.value);
    formData.append('attachment', attachment.value);
    formData.append('conduct_type_id', conduct_type_id.value);
    formData.append('privacy_setup_id', privacy_setup_id.value);
    formData.append('is_publish', is_publish.value);
    formData.append('approval_status', approval_status.value);
    formData.append('is_active', is_active.value);

    // Review
    formData.append('prepared_by', prepared_by.value);
    formData.append('reviewed_by', reviewed_by.value);

    // Cancellation
    formData.append('cancellation_reason', cancellation_reason.value);

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

    const response = await auth.uploadProtectedApi(
      `/api/meetings/${selectedRecordId.value}`,
      formData,
      'POST', // Use POST if your endpoint accepts FormData updates via POST. Otherwise use PUT if your backend is set to handle `multipart/form-data` with PUT.
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (response.status) {
      await Swal.fire('Success', 'Meeting updated successfully.', 'success');
      router.push({ name: 'index-meeting' });
    } else {
      Swal.fire('Failed', 'Failed to update meeting.', 'error');
    }
  } catch (error) {
    console.error('Error updating meeting:', error);
    Swal.fire('Error', 'Failed to update meeting.', 'error');
  }
};


// Fetch the meeting details on component mount
onMounted(() => {
  getConductTypes();
  getPrivacySetups();
  fetchMeetingDetails();
});
</script>


<template>
  <div class="container mx-auto max-w-5xl p-6 bg-white shadow-md rounded-lg mt-10">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <h5 class="text-xl font-semibold text-center sm:text-left">
        Edit Meeting
      </h5>

      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <button @click="router.push({ name: 'view-meeting', params: { selectedRecordId } })"
          class="btn-primary mr-2 w-full sm:w-auto">
          Meeting View
        </button>

        <button @click="router.push({ name: 'index-meeting' })" class="btn-primary w-full sm:w-auto">
          Back to Meeting List
        </button>
      </div>
    </div>


    <form @submit.prevent="updateMeeting">
      <!-- Row 1: Name and Short Name -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Name <span class="text-red-500">*</span></label>
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
          <label class="block text-sm font-medium text-gray-600">Privacy Setup <span
              class="text-red-500">*</span></label>
          <select v-model="privacy_setup_id" class="input" required>
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
      <!-- Images Upload -->
      <div class="mb-4">
        <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>

        <div class="space-y-3">
          <div v-for="(file, index) in images" :key="file.id" class="flex flex-col md:flex-row gap-4">
            <input type="file" class="w-full md:w-auto border border-gray-300 rounded-md py-2 px-4" accept="image/*"
              @change="event => handleFileChange(event, images, index)" />

            <!-- preview + remove (same row) -->
            <div class="flex items-center gap-3">
              <div v-if="file.file && file.file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
                <img :src="file.file.preview" alt="Preview" class="w-full h-full object-cover" />
              </div>

              <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                @click="removeFile(images, index)">
                X
              </button>
            </div>
          </div>
        </div>

        <button type="button"
          class="mt-3 w-full md:w-auto bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(images)">
          Add more image
        </button>
      </div>


      <!-- Documents Upload -->
      <div class="mb-4">
        <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>

        <div class="space-y-3">
          <div v-for="(file, index) in documents" :key="file.id" class="flex flex-col md:flex-row gap-4">
            <input type="file" class="w-full md:w-auto border border-gray-300 rounded-md py-2 px-4"
              accept=".pdf,.doc,.docx" @change="event => handleFileChange(event, documents, index)" />

            <!-- filename + remove (same row) -->
            <div class="flex items-center gap-3 w-full md:w-auto">
              <span v-if="file.file" class="w-full md:w-32 truncate">
                {{ file.file.name }}
              </span>

              <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                @click="removeFile(documents, index)">
                X
              </button>
            </div>
          </div>
        </div>

        <button type="button"
          class="mt-3 w-full md:w-auto bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(documents)">
          Add more document
        </button>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button type="submit" class="btn-primary">Update Meeting</button>
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

.textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
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
