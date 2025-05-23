<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const router = useRouter();
const route = useRoute();

const summaryId = ref(route.params.summaryId || null);
const projectSummary = ref(null);
const errorMessage = ref('');

// Fetch Project Summary Details
const fetchProjectSummaryDetails = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/project-summaries/${summaryId.value}`);
    if (response.status) {
      projectSummary.value = response.data;
    } else {
      Swal.fire('Error!', 'Failed to load project summary details.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

// Back to List
const goBack = () => {
  router.push({ name: 'index-project-summary' });
};

onMounted(() => {
  if (summaryId.value) fetchProjectSummaryDetails();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl p-6 bg-white rounded-lg shadow-md mt-10">
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">View Project Summary</h5>
      <div>
        <button @click="$router.push({ name: 'edit-project-summary', params: { summaryId: projectSummary.id } })"
          class="bg-yellow-500 hover:bg-yellow-600 text-white p-2 m-2 rounded">Project Summary Edit </button>

        <button @click="$router.push({ name: 'index-project' })"
          class="bg-blue-500 text-white font-semibold py-2 px-2 rounded-md">Back Project List
        </button>
      </div>
    </div>

    <!-- Show Details -->
    <div v-if="projectSummary">
      <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <tbody class="text-gray-600 text-md font-medium">
          <!-- Participation Details -->
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Total Member Participation</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.total_member_participation }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Total Guest Participation</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.total_guest_participation }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Total Participation</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.total_participation }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Total Beneficial Person</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.total_beneficial_person }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Total Communities Impacted</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.total_communities_impacted }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Total Expense</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.total_expense }}</td>
          </tr>

          <!-- Textual Fields -->
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Summary</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.summary }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Highlights</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.highlights }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Feedback</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.feedback }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Challenges</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.challenges }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Suggestions</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.suggestions }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Financial Overview</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.financial_overview }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Next Steps</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.next_steps }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Outcomes</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.outcomes }}</td>
          </tr>
          <!-- Status Fields -->
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Privacy Setup</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.privacy_setup_name }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Publish Status</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.is_publish === 1 ? 'Yes' : 'No' }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 text-left font-semibold w-36">Status</td>
            <td>:</td>
            <td class="px-2 py-2 text-left">{{ projectSummary.is_active === 1 ? 'Active' : 'Inactive' }}</td>
          </tr>
          <tr>
          <td class="px-2 py-2 text-left font-semibold w-36">Images</td>
          <td>:</td>
          <td class="px-2 py-2 text-left">
            <div v-if="projectSummary.images && projectSummary.images.length">
              <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <img v-for="(img, index) in projectSummary.images" :key="img.id || index" :src="img.image_url"
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
            <div v-if="projectSummary.documents && projectSummary.documents.length">
              <ul class="mt-2 list-disc list-inside text-blue-600">
                <li v-for="(doc, index) in projectSummary.documents" :key="doc.id || index">
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

    <!-- Error Message -->
    <!-- <div v-else>
      <p class="text-red-500">Unable to load project summary details.</p>
    </div> -->
  </div>
</template>

<style scoped>
p {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
</style>
