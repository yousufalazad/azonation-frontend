<!-- Project Summary Edit Component -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();

// Error Message State
const errorMessage = ref('');

// Selected Project ID
const summaryId = ref(route.params.summaryId || null);

// Form Data States
const project_id = ref('');
const total_member_participation = ref('');
const total_guest_participation = ref('');
const total_participation = ref('');
const total_beneficial_person = ref('');
const total_communities_impacted = ref('');
const summary = ref('');
const highlights = ref('');
const feedback = ref('');
const challenges = ref('');
const suggestions = ref('');
const financial_overview = ref('');
const total_expense = ref('');
const next_steps = ref('');
const outcomes = ref('');
const privacy_setup_id = ref('');
const is_publish = ref('');
const is_active = ref('1');

// File Attachments
const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

// Dropdown Data
const privacySetups = ref([]);

// Fetch Dropdown Data
const fetchPrivacySetups = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/privacy-setups');
    if (response.status) {
      privacySetups.value = response.data;
    } else {
      errorMessage.value = 'Error loading privacy setups.';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load privacy setups. Please try again later.';
  }
};

// Fetch Existing Project Summary Data
const fetchProjectSummary = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/project-summaries/${summaryId.value}`);
    if (response.status) {
      const data = response.data;

       // Process images
       images.value = (data.images || []).map((image) => ({
        id: image.id,
        file: {
          preview: image.image_url || '', // Ensure `file_path` contains the correct URL
          name: image.file_name || '',
        },
      }));

      // Process documents
      documents.value = (data.documents || []).map(doc => ({
        id: doc.id,
        file: { preview: doc.document_url, name: doc.file_name },
      }));

      project_id.value = data.project_id || '';
      total_member_participation.value = data.total_member_participation || '';
      total_guest_participation.value = data.total_guest_participation || '';
      total_participation.value = data.total_participation || '';
      total_beneficial_person.value = data.total_beneficial_person || '';
      total_communities_impacted.value = data.total_communities_impacted || '';
      summary.value = data.summary || '';
      highlights.value = data.highlights || '';
      feedback.value = data.feedback || '';
      challenges.value = data.challenges || '';
      suggestions.value = data.suggestions || '';
      financial_overview.value = data.financial_overview || '';
      total_expense.value = data.total_expense || '';
      next_steps.value = data.next_steps || '';
      outcomes.value = data.outcomes || '';
      privacy_setup_id.value = data.privacy_setup_id || '';
      is_publish.value = data.is_publish || '';
      is_active.value = data.is_active || '1';
    } else {
      Swal.fire('Error!', 'Failed to load project summary details.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to load project summary details.', 'error');
  }
};

// Validate Form
const validateForm = () => {
  if (!summary.value) {
    Swal.fire('Error!', 'Please fill out all required fields.', 'error');
    return false;
  }
  return true;
};

// Handle File Attachments

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

// Submit Form
const submitForm = async () => {
  if (!validateForm()) return;

  const formData = new FormData();
  formData.append('project_id', project_id.value);
  formData.append('total_member_participation', total_member_participation.value);
  formData.append('total_guest_participation', total_guest_participation.value);
  formData.append('total_participation', total_participation.value);
  formData.append('total_beneficial_person', total_beneficial_person.value);
  formData.append('total_communities_impacted', total_communities_impacted.value);
  formData.append('summary', summary.value);
  formData.append('highlights', highlights.value);
  formData.append('feedback', feedback.value);
  formData.append('challenges', challenges.value);
  formData.append('suggestions', suggestions.value);
  formData.append('financial_overview', financial_overview.value);
  formData.append('total_expense', total_expense.value);
  formData.append('next_steps', next_steps.value);
  formData.append('outcomes', outcomes.value);

  images.value.forEach((fileData, index) => {
    if (fileData.file) {
      formData.append(`images[${index}]`, fileData.file.file);
    }
  });

  documents.value.forEach((fileData, index) => {
    if (fileData.file) {
      formData.append(`documents[${index}]`, fileData.file.file);
    }
  });

  formData.append('privacy_setup_id', privacy_setup_id.value);
  formData.append('is_publish', is_publish.value);
  formData.append('is_active', is_active.value);

  // Log formData contents for debugging
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    const response = await auth.uploadProtectedApi(`/api/project-summaries/${summaryId.value}`, formData, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });


    if (response.status) {
      Swal.fire('Success!', 'Project summary updated successfully.', 'success');
      router.push({ name: 'view-project-summary', params: { summaryId: summaryId.value } });
    } else {
      Swal.fire('Failed!', 'Could not update project summary.', 'error');
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Handle validation errors
      const fieldErrors = error.response.data.errors;
      let errorMessages = '';

      for (const [field, message] of Object.entries(fieldErrors)) {
        errorMessages += `${message}\n`; // Combine all error messages into one string
      }

      Swal.fire({
        title: 'Validation Errors!',
        text: errorMessages,
        icon: 'error',
      });
    } else {
      // Handle generic errors
      Swal.fire('Error!', 'Failed to update project summary.', 'error');
    }
  }
};

// Fetch Data on Mounted
onMounted(() => {
  fetchPrivacySetups();
  if (summaryId.value) fetchProjectSummary();
});
</script>
<template>
  <div class="container mx-auto max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Edit Project Summary</h5>
      <div>
        <button @click="$router.push({ name: 'view-project-summary', params: { summaryId: summaryId } })"
          class="bg-green-500 hover:bg-green-600 text-white p-2 m-2 rounded">Project Summary View </button>

        <button @click="$router.push({ name: 'index-project' })"
          class="bg-blue-500 text-white font-semibold py-2 px-2 rounded-md">Back Project List
        </button>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitForm">
      <!-- Attendance Fields -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Total Member Participation</label>
          <input v-model="total_member_participation" type="number"
            class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Total Guest Participation</label>
          <input v-model="total_guest_participation" type="number"
            class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Total Participation</label>
          <input v-model="total_participation" type="number" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Total Beneficial Person</label>
          <input v-model="total_beneficial_person" type="number" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Total Communities Impacted</label>
          <input v-model="total_communities_impacted" type="number"
            class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Total Expense</label>
          <input v-model="total_expense" type="number" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <!-- Highlights and Feedback -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Summary</label>
          <textarea v-model="summary" class="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Highlights</label>
          <textarea v-model="highlights" class="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Feedback</label>
          <textarea v-model="feedback" class="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Challenges</label>
          <textarea v-model="challenges" class="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Suggestions</label>
          <textarea v-model="suggestions" class="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Financial Overview</label>
          <textarea v-model="financial_overview" class="w-full p-2 border border-gray-300 rounded-md"
            rows="3"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Next Steps</label>
          <textarea v-model="next_steps" class="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Outcomes</label>
          <textarea v-model="outcomes" class="w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
        </div>
      </div>

      <!-- Privacy Setup -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Privacy Setup</label>
          <select v-model="privacy_setup_id" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select Privacy Setup</option>
            <option v-for="privacy in privacySetups" :key="privacy.id" :value="privacy.id">{{ privacy.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Publish Status</label>
          <select v-model="is_publish" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select Publish Status</option>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="is_active" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="0">No</option>
            <option value="1">Yes</option>
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

      <!-- Submit Button -->
      <div class="text-center">
        <button type="submit" class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 font-medium">
          Submit
        </button>
      </div>
    </form>
  </div>
</template>