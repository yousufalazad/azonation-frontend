<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill CSS
import { useRouter } from 'vue-router';
const router = useRouter();


// Quill
let quillRequirements = null;
let quillNote = null;
let quillShortDescription = null;
let quillDescription = null;

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
  // Delay to ensure modal is visible, then initialize Quill
  nextTick(() => {
    if (!quillRequirements) {
      quillRequirements = new Quill('#requirements-editor', { theme: 'snow' });
    }
    if (!quillNote) {
      quillNote = new Quill('#note-editor', { theme: 'snow' });
    }
    if (!quillShortDescription) {
      quillShortDescription = new Quill('#short-description-editor', { theme: 'snow' });
    }
    if (!quillDescription) {
      quillDescription = new Quill('#description-editor', { theme: 'snow' });
    }

    // Set existing values to Quill editor if editing
    if (isEditMode.value) {
      quillRequirements.root.innerHTML = requirements.value || '';
      quillNote.root.innerHTML = note.value || '';
      quillShortDescription.root.innerHTML = short_description.value || '';
      quillDescription.root.innerHTML = description.value || '';
    }
  });
};

const closeModal = () => {
  modalVisible.value = false;
};

const createProject = async () => {
  requirements.value = quillRequirements.root.innerHTML;
  note.value = quillNote.root.innerHTML;
  short_description.value = quillShortDescription.root.innerHTML;
  description.value = quillDescription.root.innerHTML;

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
  requirements.value = quillRequirements.root.innerHTML;
  note.value = quillNote.root.innerHTML;
  short_description.value = quillShortDescription.root.innerHTML;
  description.value = quillDescription.root.innerHTML;

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
    <!-- Card container -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <!-- Card header -->
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Project List</h5>
        <div>
          <button @click="openModal()" class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Create
            Project</button>
          <button @click="$router.push({ name: 'index-project-summary' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-2 rounded-md">
            Project Summary List
          </button>
        </div>
      </div>
      <!-- Table container inside the card body -->
      <div v-if="projectList.length" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr class="border-b">
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="project in projectList" :key="project.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-700">{{ project.id }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ project.title }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ project.start_date }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ project.venue_address }}</td>
                <td class="px-4 py-3">
                  <button @click="$router.push({ name: 'create-project-summary', params: { projectId: project.id } })"
                    class="bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 m-2 rounded">Project Summary
                  </button>
                  <button @click="$router.push({ name: 'project-attendances', params: { id: project.id } })"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 m-2 rounded">Attendances </button>
                  <button @click="openModal(project)"
                    class="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600">
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="p-4">
        <p class="text-center text-gray-500">No projects available. Click "Create Project" to add a new one.</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalVisible" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-500">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-1/2 mx-auto px-8 h-3/4 overflow-y-auto">
        <!-- Header -->
        <h2 class="text-xl font-semibold mb-6 text-center">{{ isEditMode ? 'Edit Project' : 'Create Project' }}</h2>

        <!-- Form grid layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Project Title -->
          <div class="lg:col-span-2">
            <label for="title" class="block text-sm font-medium text-gray-700">Project Title</label>
            <input v-model="title" type="text" id="title"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8"
              placeholder="Enter project title" required>
          </div>

          <!-- Short Description -->
          <!-- <div>
            <label for="short_description" class="block text-sm font-medium text-gray-700">Short Description</label>
            <input v-model="short_description" type="text" id="short_description"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8"
              placeholder="Brief description">
          </div> -->

          <!-- Description -->

          <!-- <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <input v-model="description" type="text" id="description"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8"
              placeholder="Detailed description">
          </div> -->

          <!-- Venue Information -->
          <div>
            <label for="venue_name" class="block text-sm font-medium text-gray-700">Venue Name</label>
            <input v-model="venue_name" type="text" id="venue_name"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8"
              placeholder="Venue name">
          </div>

          <div>
            <label for="venue_address" class="block text-sm font-medium text-gray-700">Venue Address</label>
            <input v-model="venue_address" type="text" id="venue_address"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8"
              placeholder="Venue address">
          </div>
        </div>

        <!-- Date and Time grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Start Date and Start Time (side by side) -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Start Date -->
            <div>
              <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
              <input v-model="start_date" type="date" id="start_date"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8">
            </div>
            <!-- Start Time -->
            <div>
              <label for="start_time" class="block text-sm font-medium text-gray-700">Start Time</label>
              <input v-model="start_time" type="time" id="start_time"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8">
            </div>
          </div>

          <!-- End Date and End Time (side by side) -->
          <div class="grid grid-cols-2 gap-4">
            <!-- End Date -->
            <div>
              <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
              <input v-model="end_date" type="date" id="end_date"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8">
            </div>
            <!-- End Time -->
            <div>
              <label for="end_time" class="block text-sm font-medium text-gray-700">End Time</label>
              <input v-model="end_time" type="time" id="end_time"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8">
            </div>
          </div>
        </div>

        <!-- Status and Conduct Type -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
            <input v-model="status" type="text" id="status"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8"
              placeholder="Project status">
          </div>

          <!-- Conduct Type -->
          <div>
            <label for="conduct_type" class="block text-sm font-medium text-gray-700">Conduct Type</label>
            <input v-model="conduct_type" type="text" id="conduct_type"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-8"
              placeholder="How it will be conducted">
          </div>
        </div>

        <!-- Large Text Areas -->
        <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="lg:col-span-2">
            <label for="requirements" class="block text-sm font-medium text-gray-700">Requirements</label>
            <textarea v-model="requirements" id="requirements" rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter any specific requirements"></textarea>
          </div>

          <div class="lg:col-span-2">
            <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
            <textarea v-model="note" id="note" rows="4"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Additional notes"></textarea>
          </div>
        </div> -->

        <!-- Quill editor for Requirements -->
        <div class="lg:col-span-2">
          <label for="requirements" class="block text-sm font-medium text-gray-700">Requirements</label>
          <div id="requirements-editor" class="mt-1 h-40"></div>
        </div>

        <!-- Quill editor for Note -->
        <div class="lg:col-span-2">
          <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
          <div id="note-editor" class="mt-1 h-40"></div>
        </div>

        <!-- Quill editor for description -->
        <div class="lg:col-span-2">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <div id="description-editor" class="mt-1 h-40"></div>
        </div>

        <!-- Quill editor for short-description-editor -->
        <div class="lg:col-span-2">
          <label for="short-description" class="block text-sm font-medium text-gray-700">Short Description</label>
          <div id="short-description-editor" class="mt-1 h-40"></div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4">
          <button @click="closeModal"
            class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md">Cancel</button>
          <button @click="isEditMode ? updateProject() : createProject()"
            class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">{{ isEditMode ? 'Update Project' :
              'Create Project' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles here if needed */
</style>