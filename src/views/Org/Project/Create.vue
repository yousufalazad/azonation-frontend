<template>
  <div class="container mx-auto mt-6">
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-2xl font-bold mb-4">Create and Edit Project</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="projectTitle" class="block text-sm font-medium text-gray-700">Project Title</label>
          <input v-model="project.title" type="text" id="projectTitle" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter project title" required>
        </div>

        <div>
          <label for="shortDescription" class="block text-sm font-medium text-gray-700">Short Description</label>
          <textarea v-model="project.short_description" id="shortDescription" rows="3" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter short description"></textarea>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="project.description" id="description" rows="4" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Write project description"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="venue" class="block text-sm font-medium text-gray-700">Venue Name</label>
            <input v-model="project.venue" type="text" id="venue" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter venue name">
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Project Date</label>
            <input v-model="project.date" type="date" id="date" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>

        <div>
          <label for="requirements" class="block text-sm font-medium text-gray-700">Requirements</label>
          <input v-model="project.requirements" type="text" id="requirements" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter requirements">
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Project Status</label>
          <select v-model="project.status" id="status" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="hold">On Hold</option>
          </select>
        </div>

        <div class="text-right">
          <button @click.prevent="createProject" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Create Project
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const userId = auth.user.id; // Assuming the org ID is stored in the logged-in user
const projectList = ref([]);
const modalVisible = ref(false);
const isEditMode = ref(false);

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

const createProject = async () => {
  try {
    await auth.createProject(userId, title.value, short_description.value, description.value, start_date.value, end_date.value, start_time.value, end_time.value, venue_name.value, venue_address.value, requirements.value, note.value, status.value, conduct_type.value);
    Swal.fire({
      icon: 'success',
      title: 'Project created successfully',
      showConfirmButton: false,
      timer: 1000
    });
    closeModal();
    fetchProjectList();
  } catch (error) {
    console.error("Error creating project", error);
  }
};

const updateProject = async () => {
  try {
    await auth.updateProject(selectedProject.value.id, title.value, short_description.value, description.value, start_date.value, end_date.value, start_time.value, end_time.value, venue_name.value, venue_address.value, requirements.value, note.value, status.value, conduct_type.value);
    Swal.fire({
      icon: 'success',
      title: 'Project updated successfully',
      showConfirmButton: false,
      timer: 1000
    });
    closeModal();
    fetchProjectList();
  } catch (error) {
    console.error("Error updating project", error);
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
    console.error("Error fetching project list:", error);
    projectList.value = [];
  }
};

onMounted(fetchProjectList);
</script>
