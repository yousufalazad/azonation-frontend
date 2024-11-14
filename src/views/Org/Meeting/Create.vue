<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';
const auth = authStore;
const router = useRouter();

const name = ref('');
const short_name = ref('');
const subject = ref('');
const date = ref('');
const time = ref('');
const description = ref('');
const address = ref('');
const agenda = ref('');
const requirements = ref('');
const note = ref('');
const conduct_type = ref("");
const status = ref(0);

const conductTypeList = ref([]);
const getConductTypes = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/get-meeting-conduct-types', {}, 'GET');
    conductTypeList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching funds:', error);
    conductTypeList.value = [];
  }
};

const resetForm = () => {
  name.value = '';
  short_name.value = '';
  subject.value = '';
  date.value = '';
  time.value = '';
  description.value = '';
  address.value = '';
  agenda.value = '';
  requirements.value = '';
  note.value = '';
  conduct_type.value = "";
  status.value = 0;
};

const submitForm = async () => {
  try {
    const payload = {
      name: name.value,
      short_name: short_name.value,
      subject: subject.value,
      date: date.value,
      time: time.value,
      description: description.value,
      address: address.value,
      agenda: agenda.value,
      requirements: requirements.value,
      note: note.value,
      conduct_type: conduct_type.value,
      status: status.value,
    };
    const response = await auth.fetchProtectedApi('/api/create-meeting', payload, 'POST');
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

// Fetch transactions on mount
onMounted(() => {
  getConductTypes();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl mx-auto w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Add New Meeting</h5>
      <button @click="router.push({ name: 'index-meeting' })" class="btn-primary">
        Back to Meeting List
      </button>
    </div>

    <form @submit.prevent="submitForm">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input v-model="name" type="text" class="input" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Short Name</label>
          <input v-model="short_name" type="text" class="input" required />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Subject</label>
          <input v-model="subject" type="text" class="input" required />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <input v-model="date" type="date" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Time</label>
            <input v-model="time" type="time" class="input" required />
          </div>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Description</label>
        <input v-model="description" class="textarea" rows="2"></input>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Address</label>
        <input v-model="address" class="textarea" rows="2"></input>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Agenda</label>
          <input v-model="agenda" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Requirements</label>
          <input v-model="requirements" type="text" class="input" />
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Note</label>
        <input v-model="note" class="textarea" rows="2"></input>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Conduct Type</label>
          <select v-model="conduct_type" id="conduct_type" class="w-full border border-gray-300 rounded-md p-2" required>
            <option value="">Select Conduct Type</option>
            <option v-for="conductType in conductTypeList" :key="conductType.id" :value="conductType.id">{{ conductType.name }}
            </option>
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