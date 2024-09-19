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

<template>
  <div class="p-4">
    <div class="mb-4">
      <button @click="openModal()" class="bg-blue-500 text-white py-2 px-4 rounded">Create Project</button>
    </div>

    <div v-if="projectList.length" class="mb-4">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr class="border-b">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue Address</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirements</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conduct Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projectList" :key="project.id" class="border-b">
            <td class="px-6 py-4">{{ project.id }}</td>
            <td class="px-6 py-4">{{ project.title }}</td>
            <td class="px-6 py-4">{{ project.short_description }}</td>
            <td class="px-6 py-4">{{ project.description }}</td>
            <td class="px-6 py-4">{{ project.start_date }}</td>
            <td class="px-6 py-4">{{ project.end_date }}</td>
            <td class="px-6 py-4">{{ project.start_time }}</td>
            <td class="px-6 py-4">{{ project.end_time }}</td>
            <td class="px-6 py-4">{{ project.venue_name }}</td>
            <td class="px-6 py-4">{{ project.venue_address }}</td>
            <td class="px-6 py-4">{{ project.requirements }}</td>
            <td class="px-6 py-4">{{ project.note }}</td>
            <td class="px-6 py-4">{{ project.status }}</td>
            <td class="px-6 py-4">{{ project.conduct_type }}</td>
            <td class="px-6 py-4">
              <button @click="openModal(project)" class="bg-yellow-500 text-white py-1 px-2 rounded">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
<div v-if="modalVisible" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
  <div class="bg-white p-6 rounded-lg shadow-lg max-w-full mx-auto px-4 h-3/4 overflow-y-auto">
    <h2 class="text-lg font-semibold mb-4">{{ isEditMode ? 'Edit Project' : 'Create Project' }}</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
      <!-- Full-width field -->
      <div class="col-span-3">
        <label for="title" class="block text-sm font-medium text-gray-700">Project Title</label>
        <input v-model="title" type="text" id="title" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12" placeholder="Project Title" required>
      </div>

      <!-- Half-width fields -->
      <div>
        <label for="short_description" class="block text-sm font-medium text-gray-700">Short Description</label>
        <input v-model="short_description" type="text" id="short_description" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12" placeholder="Short Description">
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <input v-model="description" type="text" id="description" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12" placeholder="Description">
      </div>

      <!-- Full-width field -->
      <div class="col-span-3">
        <label for="venue_name" class="block text-sm font-medium text-gray-700">Venue Name</label>
        <input v-model="venue_name" type="text" id="venue_name" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12" placeholder="Venue Name">
      </div>

      <!-- Half-width fields -->
      <div>
        <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
        <input v-model="start_date" type="date" id="start_date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12">
      </div>

      <div>
        <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
        <input v-model="end_date" type="date" id="end_date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12">
      </div>

      <div>
        <label for="start_time" class="block text-sm font-medium text-gray-700">Start Time</label>
        <input v-model="start_time" type="time" id="start_time" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12">
      </div>

      <div>
        <label for="end_time" class="block text-sm font-medium text-gray-700">End Time</label>
        <input v-model="end_time" type="time" id="end_time" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12">
      </div>

      <!-- Full-width fields -->
      <div class="col-span-3">
        <label for="venue_address" class="block text-sm font-medium text-gray-700">Venue Address</label>
        <input v-model="venue_address" type="text" id="venue_address" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12" placeholder="Venue Address">
      </div>

      <!-- Full-width field with bigger textarea -->
      <div class="col-span-3">
        <label for="requirements" class="block text-sm font-medium text-gray-700">Requirements</label>
        <textarea v-model="requirements" id="requirements" rows="4" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Requirements"></textarea>
      </div>

      <!-- Full-width field with bigger textarea -->
      <div class="col-span-3">
        <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
        <textarea v-model="note" id="note" rows="6" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Note"></textarea>
      </div>

      <!-- Half-width fields -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <input v-model="status" type="text" id="status" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12" placeholder="Status">
      </div>

      <div>
        <label for="conduct_type" class="block text-sm font-medium text-gray-700">Conduct Type</label>
        <input v-model="conduct_type" type="text" id="conduct_type" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12" placeholder="Conduct Type">
      </div>
    </div>

    <div class="flex justify-end gap-4 mt-6">
      <button @click="closeModal" class="bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
      <button @click="isEditMode ? updateProject() : createProject()" class="bg-blue-500 text-white py-2 px-4 rounded">{{ isEditMode ? 'Update Project' : 'Create Project' }}</button>
    </div>
  </div>
</div>



  </div>
</template>

<style scoped>
/* Add any additional styles here if needed */
</style>
