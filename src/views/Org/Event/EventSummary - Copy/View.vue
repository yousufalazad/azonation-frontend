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
const id = ref(route.params.id || null);

// Event Data States
const org_event_id = ref('');
const total_member_attendance = ref('');
const total_guest_attendance = ref('');
const summary = ref('');
const highlights = ref('');
const feedback = ref('');
const challenges = ref('');
const suggestions = ref('');
const financial_overview = ref('');
const total_expense = ref('');
const next_steps = ref('');
const privacy_setup_name = ref('');
const is_publish = ref('');
const is_active = ref('');

// Fetch Event Data
const fetchEventSummary = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-event-summary/${id.value}`);
    if (response.status) {
      const data = response.data;
      org_event_id.value = data.org_event_id || 'N/A';
      total_member_attendance.value = data.total_member_attendance || 'N/A';
      total_guest_attendance.value = data.total_guest_attendance || 'N/A';
      summary.value = data.summary || 'N/A';
      highlights.value = data.highlights || 'N/A';
      feedback.value = data.feedback || 'N/A';
      challenges.value = data.challenges || 'N/A';
      suggestions.value = data.suggestions || 'N/A';
      financial_overview.value = data.financial_overview || 'N/A';
      total_expense.value = data.total_expense || 'N/A';
      next_steps.value = data.next_steps || 'N/A';
      privacy_setup_name.value = data.privacy_setup_name || 'N/A';
      is_publish.value = data.is_publish === '1' ? 'Yes' : 'No';
      is_active.value = data.is_active === '1' ? 'Yes' : 'No';
    } else {
      Swal.fire('Error!', 'Failed to load event summary details.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to load event summary details.', 'error');
  }
};

// Fetch Data on Mounted
onMounted(() => {
  if (id.value) fetchEventSummary();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">View Event Summary</h5>
      <button 
        @click="router.push({ name: 'index-event-summary' })" 
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium">
        Back to Event Summary List
      </button>
    </div>

    <table class="table-auto w-full border-collapse border border-gray-300">
      <tbody>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Org Event ID</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ org_event_id }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Total Member Attendance</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ total_member_attendance }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Total Guest Attendance</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ total_guest_attendance }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Summary</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ summary }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Highlights</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ highlights }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Feedback</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ feedback }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Challenges</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ challenges }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Suggestions</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ suggestions }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Financial Overview</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ financial_overview }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Total Expense</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ total_expense }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Next Steps</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ next_steps }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Privacy Setup</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ privacy_setup_name }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Publish Status</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ is_publish }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Status</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ is_active }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style>
  td:first-child {
    width: 250px;
  }
  td:nth-child(2) {
    width: 10px;
  }
  td:nth-child(3) {
    width: auto;
  }
</style>
