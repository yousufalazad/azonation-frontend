<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const router = useRouter();
const auth = authStore;
const route = useRoute();

// Error Message State
const errorMessage = ref('');

// Selected Event ID
const id = ref(route.params.id || null);

const record = ref([]);
const fetchEventSummary = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/event-summaries/${id.value}`, {}, 'GET');
    record.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching meeting minutes:', error);
    record.value = [];
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
      <div>
        <button @click="$router.push({ name: 'edit-event-summary', params: { id: record.id } })"
          class="bg-yellow-500 hover:bg-yellow-600 text-white p-2 m-2 rounded">Event Summary Edit </button>

        <button @click="$router.push({ name: 'index-event' })"
          class="bg-blue-500 text-white font-semibold py-2 px-2 rounded-md">Back Event List
        </button>
      </div>
    </div>

    <table class="table-auto w-full border-collapse border border-gray-300">
      <tbody>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Org Event ID</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.org_event_id }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Total Member Attendance</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.total_member_attendance }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Total Guest Attendance</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.total_guest_attendance }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Summary</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.summary }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Highlights</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.highlights }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Feedback</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.feedback }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Challenges</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.challenges }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Suggestions</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.suggestions }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Financial Overview</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.financial_overview }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Total Expense</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.total_expense }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Next Steps</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.next_steps }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Privacy Setup</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.privacy_setup_name }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Publish Status</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.is_publish }}</td>
        </tr>
        <tr>
          <td class="py-2 px-4 border-b font-medium">Status</td>
          <td class="py-2 px-4 border-b">:</td>
          <td class="py-2 px-4 border-b">{{ record.is_active }}</td>
        </tr>

        <tr>
          <td class="px-2 py-2 text-left font-semibold w-36">Images</td>
          <td>:</td>
          <td class="px-2 py-2 text-left">
            <div v-if="record.images && record.images.length">
              <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <img v-for="(img, index) in record.images" :key="img.id || index" :src="img.image_url"
                  alt="History Image" class="max-w-full rounded-lg" />
              </div>
            </div>
            <div v-else>
              <p class="text-gray-700">No images available</p>
            </div>
          </td>
        </tr>

        <tr>
          <td class="px-2 py-2 text-left font-semibold w-36">Documents</td>
          <td>:</td>
          <td class="px-2 py-2 text-left">
            <div v-if="record.documents && record.documents.length">
              <ul class="mt-2 list-disc list-inside text-blue-600">
                <li v-for="(doc, index) in record.documents" :key="doc.id || index">
                  <a :href="doc.document_url" target="_blank" class="hover:text-blue-800">
                    {{ doc.file_name || 'Download Document' }}
                  </a>
                </li>
              </ul>
            </div>
          </td>
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
