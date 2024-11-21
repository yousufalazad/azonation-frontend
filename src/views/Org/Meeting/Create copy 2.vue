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
    const response = await auth.fetchProtectedApi('/api/get-conduct-types', {}, 'GET');
    conductTypeList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching conduct types:', error);
    conductTypeList.value = [];
  }
};

const getPrivacySetups = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/get-privacy-setups', {}, 'GET');
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
    const response = await auth.fetchProtectedApi('/api/create-meeting', form.value, 'POST');
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
  <div class="container mx-auto max-w-7xl w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Add New Meeting</h5>
      <button @click="router.push({ name: 'index-meeting' })" class="btn-primary">
        Back to Meeting List
      </button>
    </div>

    <form @submit.prevent="submitForm">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium">Name</label>
          <input v-model="form.name" type="text" class="input" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Short Name</label>
          <input v-model="form.short_name" type="text" class="input" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium">Subject</label>
          <input v-model="form.subject" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium">Date</label>
          <input v-model="form.date" type="date" class="input" />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium">Start Time</label>
          <input v-model="form.start_time" type="time" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium">End Time</label>
          <input v-model="form.end_time" type="time" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium">Duration (minutes)</label>
          <input v-model="form.duration" type="number" class="input" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium">Meeting Type</label>
          <input v-model="form.meeting_type" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium">Timezone</label>
          <input v-model="form.timezone" type="text" class="input" />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium">Description</label>
        <textarea v-model="form.description" class="textarea"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium">Conduct Type</label>
          <select v-model="form.conduct_type_id" class="input">
            <option value="" disabled>Select Conduct Type</option>
            <option v-for="type in conductTypeList" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Privacy Setup</label>
          <select v-model="form.privacy_setup_id" class="input">
            <option value="" disabled>Select Privacy Setup</option>
            <option v-for="privacy in privacySetupList" :key="privacy.id" :value="privacy.id">
              {{ privacy.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end">
        <button type="submit" class="btn-primary">Add Meeting</button>
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
