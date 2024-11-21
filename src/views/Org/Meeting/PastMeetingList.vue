<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const meetingList = ref([]);
const orgId = authStore.org.id; // Assuming the org ID is stored in the logged-in user

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
                <td>{{ meeting.conduct_type_name }}</td> <!-- relational data from conduct_types table -->
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

</template>

<style>

</style>