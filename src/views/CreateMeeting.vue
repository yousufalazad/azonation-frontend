<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;

const name = ref('');
const name_for_admin = ref('');
const subject = ref('');
const date = ref('');
const time = ref('');
const description = ref('');
const address = ref('');
const agenda = ref('');
const requirements = ref('');
const note = ref('');
const status = ref('');
const conduct_type = ref('');

const meetingList = ref([]);

const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user

const createMeeting = async () => {
  try {
    await auth.createMeeting(orgId, name.value, name_for_admin.value, subject.value, date.value, 
    time.value, description.value, address.value, agenda.value, requirements.value, note.value, status.value, conduct_type.value);
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Meeting created successfully',
      showConfirmButton: false,
      timer: 1000
    });
  } catch (error) {
    // Handle error if needed
    console.error("Error creating meeting", error);
  }
};

const fetchMeetingList = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/meeting-list/${orgId}`, {}, 'GET');
    if (response.status) {
        meetingList.value = response.data;
    } else {
        meetingList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    meetingList.value = [];
  }
};

onMounted(fetchMeetingList);
</script>

<template>
  <br>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <div class="org-member-list">
        <h2>Create and Edit Meeting</h2>
        <br>
        <div v-if="meetingList.length">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Sl</th>
                <th scope="col">Ord ID</th>
                <th scope="col">Meeting name</th>
                <th scope="col">Name for admin</th>
                <th scope="col">Subject</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Description</th>
                <th scope="col">Address</th>
                <th scope="col">Agenda</th>
                <th scope="col">Requirements</th>
                <th scope="col">Note</th>
                <th scope="col">Status</th>
                <th scope="col">Conduct type</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="meeting in meetingList" :key="meeting.id">
                <td>{{ meeting.id }}</td>
                <td>{{ meeting.org_id }}</td>
                <td>{{ meeting.name }}</td>
                <td>{{ meeting.name_for_admin }}</td>
                <td>{{ meeting.subject }}</td>
                <td>{{ meeting.date }}</td>
                <td>{{ meeting.time }}</td>
                <td>{{ meeting.description }}</td>
                <td>{{ meeting.address }}</td>
                <td>{{ meeting.agenda }}</td>
                <td>{{ meeting.requirements }}</td>
                <td>{{ meeting.note }}</td>
                <td>{{ meeting.status }}</td>
                <td>{{ meeting.conduct_type }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No meeting found</p>
        </div>
      </div>
    </div>
  </div>
<br>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <h1 class="h4 mb-4 fw-bold text-center">Create meeting</h1>

      <div class="mb-3">
        <label for="name" class="form-label">Meeting name</label>
        <input v-model="name" type="text" id="name" class="form-control" placeholder="Meeting Name" required>
        <p v-if="auth.errors?.name" class="text-danger mt-2">{{ auth.errors?.name[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="name_for_admin" class="form-label">Meeting name for admin only (will not show on member profile)</label>
        <input v-model="name_for_admin" type="text" id="name_for_admin" class="form-control" placeholder="Name for admin to easily remember">
        <p v-if="auth.errors?.name_for_admin" class="text-danger mt-2">{{ auth.errors?.name_for_admin[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="subject" class="form-label">Subject</label>
        <input v-model="subject" type="text" id="subject" class="form-control" placeholder="subject">
        <p v-if="auth.errors?.subject" class="text-danger mt-2">{{ auth.errors?.subject[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="date" class="form-label">Date</label>
        <input v-model="date" type="date" id="date" class="form-control" placeholder="Date">
        <p v-if="auth.errors?.date" class="text-danger mt-2">{{ auth.errors?.date[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="time" class="form-label">Time</label>
        <input v-model="time" type="time" id="time" class="form-control" placeholder="Time">
        <p v-if="auth.errors?.time" class="text-danger mt-2">{{ auth.errors?.time[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <input v-model="description" type="text" id="description" class="form-control"
          placeholder="Description">
        <p v-if="auth.errors?.description" class="text-danger mt-2">{{ auth.errors?.description[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="address" class="form-label">Address</label>
        <input v-model="address" type="text" id="address" class="form-control" placeholder="Address">
        <p v-if="auth.errors?.address" class="text-danger mt-2">{{ auth.errors?.address[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="agenda" class="form-label">Agenda</label>
        <input v-model="agenda" type="text" id="agenda" class="form-control" placeholder="Agenda">
        <p v-if="auth.errors?.agenda" class="text-danger mt-2">{{ auth.errors?.agenda[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="requirements" class="form-label">Requirements</label>
        <input v-model="requirements" type="text" id="requirements" class="form-control" placeholder="Requirements">
        <p v-if="auth.errors?.requirements" class="text-danger mt-2">{{ auth.errors?.requirements[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="note" class="form-label">Note</label>
        <input v-model="note" type="text" id="note" class="form-control" placeholder="Note">
        <p v-if="auth.errors?.note" class="text-danger mt-2">{{ auth.errors?.note[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="status" class="form-label">Status: Postponed/cancelled/hold</label>
        <input v-model="status" type="dropdown" id="status" class="form-control" placeholder="Meeting status"
          required>
        <p v-if="auth.errors?.status" class="text-danger mt-2">{{ auth.errors?.status[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="conduct_type" class="form-label">Meeting conduct type</label>
        <input v-model="conduct_type" type="dropdown" id="conduct_type" class="form-control" placeholder="Meeting conduct type">
        <p v-if="auth.errors?.conduct_type" class="text-danger mt-2">{{ auth.errors?.conduct_type[0] }}</p>
      </div>

      
      <div class="text-end">
        <button @click="createMeeting" class="btn btn-primary">Create meeting</button>
      </div>
    </div>
  </div>
</template>

<style>

</style>