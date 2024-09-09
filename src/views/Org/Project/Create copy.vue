<!-- project create vue file -->
<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const userId = auth.user.id; // Assuming the org ID is stored in the logged-in user
const projectList = ref([]);

const title = ref('');
const short_description = ref('');
const description = ref('');
const start_date = ref('');
const end_date = ref('');
const start_time = ref('');
const end_time = ref('');
const venue_name = ref(''); 
const venue_address = ref('');
const requirements = ref('');
const note = ref('');
const status = ref('');
const conduct_type = ref('');
const selectedProject = ref(null);

 
const openModal = (project = null) => {
  if (project) {
    isEditMode.value = true;
    selectedProject.value = project;
    title.value = project.title;
    short_description.value = project.short_description;
    description.value = project.description;
    start_date.value = project.start_date;
    end_date.value = project.end_date;
    start_time.value = project.start_time;
    end_time.value = project.end_time;
    venue_name.value = project.venue_name;
    venue_address.value = project.venue_address;
    requirements.value = project.requirements;
    note.value = project.note;
    status.value = project.status;
    conduct_type.value = project.conduct_type;
  } else {
    isEditMode.value = false;
    selectedProject.value = null;
    title.value = '';
    short_description.value = '';
    description.value = '';
    start_date.value = '';
    end_date.value = '';
    start_time.value = '';
    end_time.value = '';
    venue_name.value = '';
    venue_address.value = '';
    requirements.value = '';
    note.value = '';
    status.value = '';
    conduct_type.value = '';
  }
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};


const createProject= async () => {
  try {
    await auth.createProject(userId, title.value, short_description.value, description.value, start_date.value, end_date.value,  start_time.value, end_time.value, venue_name.value, venue_address.value, 
    requirements.value, note.value, status.value, conduct_type.value);
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Project created successfully',
      showConfirmButton: false,
      timer: 1000
    });
    closeModal();
    fetchProjectList();
  } catch (error) {
    // Handle error if needed
    console.error("Error creating event", error);
  }
};

const fetchProjectList = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-project-list/${userId}`, {}, 'GET');
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
        <h2>Create and Edit Project</h2>
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
<br>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <h1 class="h4 mb-4 fw-bold text-center">Create project</h1>

      <div class="mb-3">
        <label for="title" class="form-label">Project title</label>
        <input v-model="title" type="text" id="title" class="form-control" placeholder="Event title" required>
        <p v-if="auth.errors?.title" class="text-danger mt-2">{{ auth.errors?.title[0] }}</p>
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
        <label for="start_date" class="form-label">Start Date</label>
        <input v-model="start_date" type="date" id="date" class="form-control" placeholder="start_date">
        <p v-if="auth.errors?.start_date" class="text-danger mt-2">{{ auth.errors?.start_date[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="end_date" class="form-label">End Date</label>
        <input v-model="end_date" type="date" id="date" class="form-control" placeholder="end_date">
        <p v-if="auth.errors?.end_date" class="text-danger mt-2">{{ auth.errors?.end_date[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="start_time" class="form-label">Start Time</label>
        <input v-model="start_time" type="time" id="start_time" class="form-control" placeholder="start_time">
        <p v-if="auth.errors?.start_time" class="text-danger mt-2">{{ auth.errors?.start_time[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="end_time" class="form-label">End Time</label>
        <input v-model="end_time" type="time" id="end_time" class="form-control" placeholder="end_time">
        <p v-if="auth.errors?.end_time" class="text-danger mt-2">{{ auth.errors?.end_time[0] }}</p>
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
        <button @click="createProject" class="btn btn-primary">Create project</button>
      </div>
    </div>

</div>
</template>

<style>

</style>