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

// Selected Event ID
const projectId = ref(route.params.projectId || null);

// Form Data States
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
const image_attachment = ref(null);
const file_attachment = ref(null);

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

// Reset Form
const resetForm = () => {
  total_member_participation.value = '';
  total_guest_participation.value = '';
  total_participation.value = '';
  total_beneficial_person.value = '';
  total_communities_impacted.value = '';
  summary.value = '';
  highlights.value = '';
  feedback.value = '';
  challenges.value = '';
  suggestions.value = '';
  financial_overview.value = '';
  total_expense.value = '';
  next_steps.value = '';
  outcomes.value = '';
  privacy_setup_id.value = '';
  is_publish.value = '';
  is_active.value = '1';
  image_attachment.value = null;
  file_attachment.value = null;
};

// Validate Form
const validateForm = () => {
  if (!summary.value || !privacy_setup_id.value) {
    Swal.fire('Error!', 'Please fill out all required fields.', 'error');
    return false;
  }
  return true;
};

// Handle File Attachments
const handleImageAttachment = (event) => {
  image_attachment.value = event.target.files[0];
};

const handleFileAttachment = (event) => {
  file_attachment.value = event.target.files[0];
};

console.log('projectId', projectId.value)
// Submit Form
const submitForm = async () => {
  if (!validateForm()) return;

  const formData = new FormData();
  formData.append('org_project_id', projectId.value);
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
  if (image_attachment.value) {
    formData.append('image_attachment', image_attachment.value);
  }
  if (file_attachment.value) {
    formData.append('file_attachment', file_attachment.value);
  }
  formData.append('next_steps', next_steps.value);
  formData.append('outcomes', outcomes.value);
  formData.append('privacy_setup_id', privacy_setup_id.value);
  formData.append('is_publish', is_publish.value);
  formData.append('is_active', is_active.value);

  try {
    const response = await auth.uploadProtectedApi('/api/project-summaries', formData, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status) {
      Swal.fire('Success!', 'Project summary saved successfully.', 'success');
      router.push({ name: 'index-project-summary' });
    } else {
      console.error('Validation Errors:', response.errors); // Log validation errors
      Swal.fire('Failed!', 'Could not save project summary.', 'error');
    }
  } catch (error) {
    console.error('Error Response:', error.response); // Log full error details
    Swal.fire('Error!', 'Failed to save project summary.', 'error');
  }

};

// Fetch Data on Mounted
onMounted(fetchPrivacySetups);
</script>
<template>
  <div class="container mx-auto max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Add New Project Summary</h5>
      <button @click="router.push({ name: 'index-project' })"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium">
        Back to Project List
      </button>
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

      <!-- Attachments -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Image Attachment</label>
          <input @change="handleImageAttachment" type="file" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">File Attachment</label>
          <input @change="handleFileAttachment" type="file" class="w-full p-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <!-- Privacy Setup -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Privacy Setup</label>
          <select v-model="privacy_setup_id" class="w-full p-2 border border-gray-300 rounded-md" required>
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

      <!-- Submit Button -->
      <div class="text-center">
        <button type="submit" class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 font-medium">
          Submit
        </button>
      </div>
    </form>
  </div>
</template>
