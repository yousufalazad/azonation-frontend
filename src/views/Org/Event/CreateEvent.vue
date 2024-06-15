<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user
const eventList = ref([]);

const title = ref('');
const name = ref('');
const short_description = ref('');
const description = ref('');
const date = ref('');
const time = ref('');
const venue_name = ref('');
const venue_address = ref('');
const requirements = ref('');
const note = ref('');
const status = ref('');
const conduct_type = ref('');


const createEvent= async () => {
  try {
    await auth.createEvent(orgId, title.value, name.value, short_description.value, description.value, 
    date.value, time.value, venue_name.value, venue_address.value, requirements.value, note.value, status.value, conduct_type.value);
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Event created successfully',
      showConfirmButton: false,
      timer: 1000
    });
  } catch (error) {
    // Handle error if needed
    console.error("Error creating event", error);
  }
};

const fetchEventList = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-event-list/${orgId}`, {}, 'GET');
    if (response.status) {
        eventList.value = response.data;
    } else {
        eventList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    eventList.value = [];
  }
};

onMounted(fetchEventList);
</script>

<template>
  <br>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <div class="org-member-list">
        <h2>Create and Edit Event</h2>
        <br>
        <div v-if="eventList.length">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Sl</th>
                <th scope="col">title</th>
                <th scope="col">name</th>
                <th scope="col">short_description</th>
                <th scope="col">description</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">venue_name</th>
                <th scope="col">venue_address</th>
                <th scope="col">Requirements</th>
                <th scope="col">Note</th>
                <th scope="col">Status</th>
                <th scope="col">Conduct type</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in eventList" :key="event.id">
                <td>{{ event.id }}</td>
                <td>{{ event.title }}</td>
                <td>{{ event.name }}</td>
                <td>{{ event.short_description }}</td>
                <td>{{ event.description }}</td>
                <td>{{ event.date }}</td>
                <td>{{ event.time }}</td>
                <td>{{ event.venue_name }}</td>
                <td>{{ event.venue_address }}</td>
                <td>{{ event.requirements }}</td>
                <td>{{ event.note }}</td>
                <td>{{ event.status }}</td>
                <td>{{ event.conduct_type }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No event found</p>
        </div>
      </div>
    </div>
  </div>
<br>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <h1 class="h4 mb-4 fw-bold text-center">Create event</h1>

      <div class="mb-3">
        <label for="title" class="form-label">Event title</label>
        <input v-model="title" type="text" id="title" class="form-control" placeholder="Event title" required>
        <p v-if="auth.errors?.title" class="text-danger mt-2">{{ auth.errors?.title[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="name" class="form-label">Event name</label>
        <input v-model="name" type="text" id="name" class="form-control" placeholder="Event Name">
        <p v-if="auth.errors?.name" class="text-danger mt-2">{{ auth.errors?.name[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="short_description" class="form-label">short_description</label>
        <input v-model="short_description" type="text" id="short_description" class="form-control" placeholder="short_description">
        <p v-if="auth.errors?.short_description" class="text-danger mt-2">{{ auth.errors?.short_description[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="description" class="form-label">description</label>
        <input v-model="description" type="text" id="description" class="form-control" placeholder="description">
        <p v-if="auth.errors?.description" class="text-danger mt-2">{{ auth.errors?.description[0] }}</p>
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
        <label for="venue_name" class="form-label">venue_name</label>
        <input v-model="venue_name" type="text" id="venue_name" class="form-control"
          placeholder="venue_name">
        <p v-if="auth.errors?.venue_name" class="text-danger mt-2">{{ auth.errors?.venue_name[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="venue_address" class="form-label">venue_address</label>
        <input v-model="venue_address" type="text" id="venue_address" class="form-control" placeholder="venue_address">
        <p v-if="auth.errors?.venue_address" class="text-danger mt-2">{{ auth.errors?.venue_address[0] }}</p>
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
        <button @click="createEvent" class="btn btn-primary">Create event</button>
      </div>
    </div>
  </div>
</template>

<style>

</style>