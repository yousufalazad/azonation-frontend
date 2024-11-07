<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;

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
const status = ref(0); // Default to Active (0)
const conduct_type = ref('');

// State Management
const isEditMode = ref(false);
const selectedRecordId = ref(null);
const recordList = ref([]);

function isAuthenticated() {
    return !!sessionStorage.getItem('authToken');
}


// Fetch list of meetings
const getRecords = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-org-meetings`, {}, 'GET');

    if (response.status) {
      recordList.value = response.data;
      //console.log(response.data);
    } else {
      recordList.value = [];
    }
  } catch (error) {
    console.error('Error fetching meetings:', error);
    recordList.value = [];
  }
};

// Reset form fields
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
  status.value = 0;
  conduct_type.value = '';
  isEditMode.value = false;
  selectedRecordId.value = null;
};

// Add or update meeting
const submitForm = async () => {
  const payload = {
    // user_id: userId,
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
    let apiUrl = '/api/create-meeting';
    let method = 'POST';

    if (isEditMode.value && selectedRecordId.value) {
      apiUrl = `/api/update-meeting/${selectedRecordId.value}`;
      method = 'PUT';
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this meeting?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi(apiUrl, payload, method);

      if (response.status) {
        await Swal.fire('Success!', `Meeting ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
        getRecords();
        resetForm();
      } else {
        Swal.fire('Failed!', 'Failed to save meeting.', 'error');
      }
    }
  } catch (error) {
    console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} meeting:`, error);
    Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} meeting.`, 'error');
  }
};

// Edit record
const editRecord = (record) => {
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
  selectedRecordId.value = record.id;
  isEditMode.value = true;
};

// Delete record
const deleteRecord = async (id) => {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this meeting?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/delete-meeting/${id}`, {}, 'DELETE');

      if (response.status) {
        await Swal.fire('Deleted!', 'Meeting has been deleted.', 'success');
        getRecords();
      } else {
        Swal.fire('Failed!', 'Failed to delete meeting.', 'error');
      }
    }
  } catch (error) {
    console.error('Error deleting meeting:', error);
    Swal.fire('Error!', 'Failed to delete meeting.', 'error');
  }
};

// Fetch records on mount
onMounted(() => {
  getRecords();
});
</script>

<template>
  <div class="max-w-7xl mx-auto w-10/12">
    <section class="mb-5">
      <div class="flex justify-between left-color-shade py-2 my-3">
        <div>
          <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Meeting</h5>
        </div>
      </div>
      <form @submit.prevent="submitForm">
        <!-- Name -->
        <div class="mb-4">
          <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
          <input v-model="name" type="text" id="name" class="w-full border border-gray-300 rounded-md py-2 px-4"
            required>
        </div>

        <!-- Short Name -->
        <div class="mb-4">
          <label for="short_name" class="block text-gray-700 font-semibold mb-2">Short Name</label>
          <input v-model="short_name" type="text" id="short_name"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <!-- Subject -->
        <div class="mb-4">
          <label for="subject" class="block text-gray-700 font-semibold mb-2">Subject</label>
          <input v-model="subject" type="text" id="subject"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <!-- Date -->
        <div class="mb-4">
          <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
          <input v-model="date" type="date" id="date" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <!-- Time -->
        <div class="mb-4">
          <label for="time" class="block text-gray-700 font-semibold mb-2">Time</label>
          <input v-model="time" type="time" id="time" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
          <textarea v-model="description" id="description"
            class="w-full border border-gray-300 rounded-md py-2 px-4"></textarea>
        </div>

        <!-- Address -->
        <div class="mb-4">
          <label for="address" class="block text-gray-700 font-semibold mb-2">Address</label>
          <textarea v-model="address" id="address"
            class="w-full border border-gray-300 rounded-md py-2 px-4"></textarea>
        </div>

        <!-- Agenda -->
        <div class="mb-4">
          <label for="agenda" class="block text-gray-700 font-semibold mb-2">Agenda</label>
          <input v-model="agenda" type="text" id="agenda" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <!-- Requirements -->
        <div class="mb-4">
          <label for="requirements" class="block text-gray-700 font-semibold mb-2">Requirements</label>
          <input v-model="requirements" type="text" id="requirements"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <!-- Note -->
        <div class="mb-4">
          <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
          <input v-model="note" type="text" id="note" class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <!-- Status -->
        <div class="mb-4">
          <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
          <select v-model="status" id="status" class="w-full border border-gray-300 rounded-md py-2 px-4">
            <option value="0">Active</option>
            <option value="1">Disable</option>
          </select>
        </div>

        <!-- Conduct Type -->
        <div class="mb-4">
          <label for="conduct_type" class="block text-gray-700 font-semibold mb-2">Conduct Type</label>
          <input v-model="conduct_type" type="text" id="conduct_type"
            class="w-full border border-gray-300 rounded-md py-2 px-4" />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button type="submit" class="bg-blue-500 text-white font-semibold py-2 px-6 rounded-md">
            {{ isEditMode ? 'Update Meeting' : 'Add Meeting' }}
          </button>
        </div>
      </form>
    </section>

    <section>
      <h5 class="text-lg font-semibold mb-4">Meeting List</h5>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="border px-6 py-3 text-left"> ID</th>
              <th class="border px-6 py-3 text-left"> Name</th>
              <th class="border px-6 py-3 text-left">Short Name</th>
              <th class="border px-6 py-3 text-left">Subject</th>
              <th class="border px-6 py-3 text-left">Date</th>
              <th class="border px-6 py-3 text-left">Time</th>
              <th class="border px-6 py-3 text-left">Description</th>
              <th class="border px-6 py-3 text-left">Address</th>
              <th class="border px-6 py-3 text-left">Agenda</th>
              <th class="border px-6 py-3 text-left">Requirements</th>
              <th class="border px-6 py-3 text-left">Note</th>
              <th class="border px-6 py-3 text-left">Status</th>
              <th class="border px-6 py-3 text-left">Conduct Type</th>
              <th class="border px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-md font-medium">
            <tr v-for="(record, index) in recordList" :key="index"
              class="border-b border-gray-200 hover:bg-gray-100 transition duration-200">
              <td class="border px-6 py-4">{{ record.user_id }}</td>
              <td class="border px-6 py-4">{{ record.name }}</td>
              <td class="border px-6 py-4">{{ record.short_name }}</td>
              <td class="border px-6 py-4">{{ record.subject }}</td>
              <td class="border px-6 py-4">{{ record.date }}</td>
              <td class="border px-6 py-4">{{ record.time }}</td>
              <td class="border px-6 py-4">{{ record.description }}</td>
              <td class="border px-6 py-4">{{ record.address }}</td>
              <td class="border px-6 py-4">{{ record.agenda }}</td>
              <td class="border px-6 py-4">{{ record.requirements }}</td>
              <td class="border px-6 py-4">{{ record.note }}</td>
              <td class="border px-6 py-4">{{ record.status === 0 ? 'Active' : 'Disabled' }}</td>
              <td class="border px-6 py-4">{{ record.conduct_type }}</td>
              <td class="border px-6 py-4">
                <button @click="editRecord(record)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 m-2 rounded">Edit</button>
                <button @click="deleteRecord(record.id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>


  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  padding: 12px;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

td {
  border-bottom: 1px solid #ddd;
}

button {
  margin-right: 5px;
}
</style>
