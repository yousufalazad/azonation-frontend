<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user
const eventList = ref([]);

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
</template>

<style>

</style>