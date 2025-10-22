<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const route = useRoute();
const router = useRouter();

const auth = authStore;
const userId = auth.user.id;
const projectId = route.params.id;

// Form fields
const title = ref('');
const venue_name = ref('');
const venue_address = ref('');
const start_date = ref('');
const end_date = ref('');
const start_time = ref('');
const end_time = ref('');
const status = ref(0);
const conduct_type = ref(1);

const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

// Quill editor references
let requirementsEditor, noteEditor, descriptionEditor, shortDescriptionEditor;

// Quill editor content
const requirements = ref('');
const note = ref('');
const description = ref('');
const short_description = ref('');

const conductTypeList = ref([]);

const getConductTypes = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/conduct-types', {}, 'GET');
    conductTypeList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching conduct types:', error);
    conductTypeList.value = [];
  }
};


// Initialize Quill editors and fetch existing data
onMounted(() => {

  const options = {
    theme: 'snow',
    placeholder: 'Type here...',
  };

  requirementsEditor = new Quill('#requirements-editor', options);
  noteEditor = new Quill('#note-editor', options);
  descriptionEditor = new Quill('#description-editor', options);
  shortDescriptionEditor = new Quill('#short-description-editor', options);

  // Fetch existing project details
  fetchProjectDetails();
  getConductTypes();


  // Update refs when content changes
  requirementsEditor.on('text-change', () => {
    requirements.value = requirementsEditor.root.innerHTML;
  });
  noteEditor.on('text-change', () => {
    note.value = noteEditor.root.innerHTML;
  });
  descriptionEditor.on('text-change', () => {
    description.value = descriptionEditor.root.innerHTML;
  });
  shortDescriptionEditor.on('text-change', () => {
    short_description.value = shortDescriptionEditor.root.innerHTML;
  });
});

// Fetch project details
const fetchProjectDetails = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/projects/${projectId}`, {}, 'GET');

    if (response.status) {
      const project = response.data;
      title.value = project.title;
      venue_name.value = project.venue_name;
      venue_address.value = project.venue_address;
      start_date.value = project.start_date;
      end_date.value = project.end_date;
      start_time.value = project.start_time;
      end_time.value = project.end_time;
      status.value = project.status;
      conduct_type.value = project.conduct_type;

      // Populate Quill editors
      requirements.value = project.requirements;
      note.value = project.note;
      description.value = project.description;
      short_description.value = project.short_description;

      requirementsEditor.clipboard.dangerouslyPasteHTML(requirements.value);
      noteEditor.clipboard.dangerouslyPasteHTML(note.value);
      descriptionEditor.clipboard.dangerouslyPasteHTML(description.value);
      shortDescriptionEditor.clipboard.dangerouslyPasteHTML(short_description.value);

      // Files
      images.value = (project.images || []).map((image) => ({
        id: image.id,
        file: {
          preview: image.image_url || '',
          name: image.file_name || '',
        },
      }));

      documents.value = (project.documents || []).map((doc) => ({
        id: doc.id,
        file: {
          preview: doc.document_url || '',
          name: doc.file_name || '',
        },
      }));

    } else {
      Swal.fire('Error!', 'Failed to fetch project details.', 'error');
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

// Reset form to fetched data
const resetForm = fetchProjectDetails;

// Handle File Attachments
const handleDocument = (event) => {
  file_attachments.value = event.target.files[0];
};

const handleFileChange = (event, fileList, index) => {
  const file = event.target.files[0];
  if (file) {
    fileList[index].file = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    };
  }
};

const addMoreFiles = (fileList) => {
  fileList.push({ id: Date.now(), file: null });
};

const removeFile = (fileList, index) => {
  if (fileList[index].file && fileList[index].file.preview) {
    URL.revokeObjectURL(fileList[index].file.preview); // Release memory
  }
  fileList.splice(index, 1);
};

// Submit form (edit project)
const submitForm = async () => {
  if (!title.value || !venue_name.value) {
    Swal.fire('Error!', 'Please fill in all required fields.', 'error');
    return;
  }

  const formData = new FormData();

  // Basic fields
  formData.append('user_id', userId);
  formData.append('title', title.value);
  formData.append('venue_name', venue_name.value);
  formData.append('venue_address', venue_address.value ?? '');
  formData.append('start_date', start_date.value ?? '');
  formData.append('end_date', end_date.value ?? '');
  formData.append('start_time', start_time.value ?? '');
  formData.append('end_time', end_time.value ?? '');
  formData.append('status', status.value ?? '');
  formData.append('conduct_type', conduct_type.value ?? '');
  formData.append('requirements', requirements.value ?? '');
  formData.append('note', note.value ?? '');
  formData.append('description', description.value ?? '');
  formData.append('short_description', short_description.value ?? '');

  // Append images
  images.value.forEach((fileData, index) => {
    if (fileData.file) {
      formData.append(`images[${index}]`, fileData.file.file);
    }
  });

  // Append documents
  documents.value.forEach((fileData, index) => {
    if (fileData.file) {
      formData.append(`documents[${index}]`, fileData.file.file);
    }
  });

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this project?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.uploadProtectedApi(
        `/api/projects/${route.params.id}`,
        formData,
        'POST', // Or 'PUT' if your backend supports it
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status) {
        Swal.fire('Success!', 'Project updated successfully.', 'success').then(() => {
          router.push({ name: 'index-project' });
        });
      } else {
        Swal.fire('Failed!', 'Failed to update the project.', 'error');
      }
    }
  } catch (error) {
    console.error('Error updating project:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

</script>

<template>
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-4 ">
      <!-- Title -->
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
        Edit Project
      </h2>
      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2">
        <!-- View Project Button -->
        <button @click="$router.push({ name: 'view-project', params: { id: projectId } })"
          class="bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base py-2 px-3 sm:px-4 rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-300">
          Project View
        </button>

        <!-- Back to Project List Button -->
        <button @click="$router.push({ name: 'index-project' })"
          class="bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base py-2 px-3 sm:px-4 rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300">
          Back to Project List
        </button>
      </div>
    </div>


    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Form grid layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="col-span-full">
          <label for="title"
            class="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">
            Project Title
          </label>
          <input v-model="title" type="text" id="title"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2"
            placeholder="Enter project title" required />
        </div>
        <div>
          <label for="venue_name"
            class="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-500 after:ml-1">Venue
            Name</label>
          <input v-model="venue_name" type="text" id="venue_name"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2"
            placeholder="Venue name" required />
        </div>
        <div>
          <label for="venue_address" class="block text-sm font-medium text-gray-700">Venue Address</label>
          <input v-model="venue_address" type="text" id="venue_address"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2"
            placeholder="Venue address" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
          <input v-model="start_date" type="date" id="start_date"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
          <input v-model="end_date" type="date" id="end_date"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="start_time" class="block text-sm font-medium text-gray-700">Start Time</label>
          <input v-model="start_time" type="time" id="start_time"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
        <div>
          <label for="end_time" class="block text-sm font-medium text-gray-700">End Time</label>
          <input v-model="end_time" type="time" id="end_time"
            class="mt-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2" />
        </div>
      </div>
      <!-- Editors -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Requirements</label>
        <div id="requirements-editor" style="height: 5rem"
          class="mt-2 h-40 border border-gray-300 rounded-lg shadow-sm"></div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Note</label>
        <div id="note-editor" style="height: 5rem" class="mt-2 h-40 border border-gray-300 rounded-lg shadow-sm"></div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Description</label>
        <div id="description-editor" style="height: 5rem" class="mt-2 h-40 border border-gray-300 rounded-lg shadow-sm">
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Short Description</label>
        <div id="short-description-editor" style="height: 5rem"
          class="mt-2 h-40 border border-gray-300 rounded-lg shadow-sm"></div>
      </div>

      <!-- status and Conduct type -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="status" id="status"
            class="mt-2 w-full border border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
            <option value="0">Active</option>
            <option value="1">Disabled</option>
          </select>
        </div>
        <div>
          <label for="conduct_type" class="block text-sm font-medium text-gray-700">Conduct Type</label>
          <select v-model="conduct_type" id="conduct_type"
            class="mt-2 w-full border border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
            <option v-for="type in conductTypeList" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Images Upload -->
      <div class="mb-4">
        <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
        <div class="space-y-3">
          <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
            <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept="image/*"
              @change="event => handleFileChange(event, images, index)" />

            <div v-if="file.file && file.file.preview" class="w-16 h-16 border rounded-md overflow-hidden">
              <img :src="file.file.preview" alt="Preview" class="w-full h-full object-cover" />
            </div>

            <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
              @click="removeFile(images, index)">X</button>
          </div>
        </div>
        <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(images)">
          Add more image
        </button>
      </div>

      <!-- Documents Upload -->
      <div class="mb-4">
        <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
        <div class="space-y-3">
          <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
            <input type="file" class="border border-gray-300 rounded-md py-2 px-4" accept=".pdf,.doc,.docx"
              @change="event => handleFileChange(event, documents, index)" />

            <span v-if="file.file" class="truncate w-32">{{ file.file.name }}</span>

            <button type="button" class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
              @click="removeFile(documents, index)">X</button>
          </div>
        </div>
        <button type="button" class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
          @click="() => addMoreFiles(documents)">
          Add more document
        </button>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4">
        <button type="submit"
          class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow focus:ring-2 focus:ring-blue-400 focus:outline-none">
          Save Changes
        </button>
        <button type="button" @click="resetForm"
          class="px-6 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 shadow focus:ring-2 focus:ring-gray-400 focus:outline-none">
          Reset
        </button>
      </div>
    </form>
  </div>
</template>
