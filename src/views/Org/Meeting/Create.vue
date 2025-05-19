<!-- meeting create -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const router = useRouter();

const form = ref({
  name: '',
  short_name: '',
  subject: '',
  date: '',
  start_time: '',
  end_time: '',
  meeting_type: '',
  timezone: '',
  meeting_mode: '',
  duration: '',
  priority: '',
  video_conference_link: '',
  access_code: '',
  recording_link: '',
  meeting_host: '',
  max_participants: '',
  rsvp_status: '',
  participants: '',
  description: '',
  address: '',
  agenda: '',
  requirements: '',
  note: '',
  tags: '',
  reminder_time: '',
  repeat_frequency: '',
  attachment: '',
  conduct_type_id: '',
  is_active: true,
  privacy_setup_id: '',
  cancellation_reason: '',
  feedback_link: ''
});

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
  for (const key in form.value) {
    form.value[key] = key === 'is_active' ? true : '';
  }
};

const submitForm = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/meetings', form.value, 'POST');
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
      <button
        @click="router.push({ name: 'index-meeting' })" class="btn-primary">
        Back to Meetings
      </button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Row 1: Name and Short Name -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Name</label>
          <input v-model="form.name" type="text" class="input" placeholder="Enter meeting name" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Short Name</label>
          <input v-model="form.short_name" type="text" class="input" placeholder="Optional short name" />
        </div>
      </div>

      <!-- Row 2: Date and Time -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Date</label>
          <input v-model="form.date" type="date" class="input"  />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Start Time</label>
          <input v-model="form.start_time" type="time" class="input"  />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">End Time</label>
          <input v-model="form.end_time" type="time" class="input"  />
        </div>
      </div>

      <!-- Row 3: Meeting Type, Mode, Duration -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Meeting Type</label>
          <input v-model="form.meeting_type" type="text" class="input" placeholder="e.g., Workshop" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Mode</label>
          <select v-model="form.meeting_mode" class="input">
            <option value="">Select Mode</option>
            <option value="In-person">In-person</option>
            <option value="Virtual">Virtual</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Duration (mins)</label>
          <input v-model="form.duration" type="number" class="input" placeholder="e.g., 90" />
        </div>
      </div>

      <!-- Row 4: Priority, RSVP Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Priority</label>
          <select v-model="form.priority" class="input">
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">RSVP Status</label>
          <select v-model="form.rsvp_status" class="input">
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
          <input v-model="form.video_conference_link" type="url" class="input" placeholder="e.g., Zoom link" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Access Code</label>
          <input v-model="form.access_code" type="text" class="input" placeholder="Enter access code" />
        </div>
      </div>

      <!-- Row 6: Address -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Address</label>
        <textarea v-model="form.address" class="input h-24" placeholder="Enter meeting address"></textarea>
      </div>

      <!-- Row 7: Description, Agenda -->
      <div>
        <label class="block text-sm font-medium text-gray-600">Description</label>
        <textarea v-model="form.description" class="input h-24" placeholder="Provide a brief description"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600">Agenda</label>
        <textarea v-model="form.agenda" class="input h-24" placeholder="Meeting agenda"></textarea>
      </div>

      <!-- Row 8: Conduct Type and Privacy Setup -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-600">Conduct Type</label>
          <select v-model="form.conduct_type_id" class="input">
            <option value="" disabled>Select Conduct Type</option>
            <option v-for="type in conductTypeList" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Privacy Setup</label>
          <select v-model="form.privacy_setup_id" class="input">
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
          <input v-model="form.reminder_time" type="number" class="input" placeholder="e.g., 15" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Repeat Frequency</label>
          <select v-model="form.repeat_frequency" class="input">
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
          <textarea v-model="form.note" class="input h-24" placeholder="Add any notes"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Tags</label>
          <input v-model="form.tags" type="text" class="input" placeholder="e.g., meeting, workshop" />
        </div>
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
