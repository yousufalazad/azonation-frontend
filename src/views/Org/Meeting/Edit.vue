<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const route = useRoute();
const router = useRouter();

// Form Fields
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
const status = ref(0); // Default to Active
const conduct_type = ref('');

// Selected Record ID
const selectedRecordId = ref(route.params.id);

// Fetch meeting details on mount
const fetchMeetingDetails = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-meeting/${selectedRecordId.value}`, {}, 'GET');
    if (response.status) {
      const record = response.data;
      name.value = record.name;
      short_name.value = record.short_name;
      subject.value = record.subject;
      date.value = record.date;
      time.value = record.time;
      description.value = record.description;
      address.value = record.address;
      agenda.value = record.agenda;
      requirements.value = record.requirements;
      note.value = record.note;
      status.value = record.status;
      conduct_type.value = record.conduct_type;
    } else {
      Swal.fire('Error', 'Meeting not found!', 'error');
      router.push({ name: 'index' });
    }
  } catch (error) {
    console.error('Error fetching meeting details:', error);
    Swal.fire('Error', 'Failed to fetch meeting details.', 'error');
    router.push({ name: 'index' });
  }
};

// Update meeting details
const updateMeeting = async () => {
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
    status: status.value,
    conduct_type: conduct_type.value,
  };

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this meeting?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/update-meeting/${selectedRecordId.value}`, payload, 'PUT');

      if (response.status) {
        await Swal.fire('Success', 'Meeting updated successfully.', 'success');
        router.push({ name: 'index-meeting' });
      } else {
        Swal.fire('Failed', 'Failed to update meeting.', 'error');
      }
    }
  } catch (error) {
    console.error('Error updating meeting:', error);
    Swal.fire('Error', 'Failed to update meeting.', 'error');
  }
};

// Fetch the meeting details on component mount
onMounted(() => {
  fetchMeetingDetails();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl mx-auto w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Edit Meeting</h5>
      <button @click="router.push({ name: 'index-meeting' })" class="btn-primary">
        Back to Meeting List
      </button>
    </div>

    <form @submit.prevent="updateMeeting">
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
          <select v-model="conduct_type" id="conduct_type" class="input">
            <option value="1">In Person</option>
            <option value="2">Remote</option>
            <option value="3">Hybrid</option>
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
        <button type="submit" class="btn-primary">Update Meeting</button>
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
