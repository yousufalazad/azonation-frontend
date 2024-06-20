<!-- project create vue file -->
<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user
const projectList = ref([]);

const fetchProjectList = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-project-list/${orgId}`, {}, 'GET');
    if (response.status) {
        projectList.value = response.data;
    } else {
        projectList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    projectList.value = [];
  }
};

onMounted(fetchProjectList);
</script>

<template>
  <br>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <div class="org-member-list">
        <h2>Project List</h2>
        <br>
        <div v-if="projectList.length">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Sl</th>
                <th scope="col">title</th>
                <th scope="col">short_description</th>
                <th scope="col">description</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Start Time</th>
                <th scope="col">End Time</th>
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
              <tr v-for="project in projectList" :key="project.id">
                <td>{{ project.id }}</td>
                <td>{{ project.title }}</td>
                <td>{{ project.short_description }}</td>
                <td>{{ project.description }}</td>
                <td>{{ project.start_date }}</td>
                <td>{{ project.end_date }}</td>
                <td>{{ project.start_time }}</td>
                <td>{{ project.end_time }}</td>
                <td>{{ project.venue_name }}</td>
                <td>{{ project.venue_address }}</td>
                <td>{{ project.requirements }}</td>
                <td>{{ project.note }}</td>
                <td>{{ project.status }}</td>
                <td>{{ project.conduct_type }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No project found</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>