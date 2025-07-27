<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

const auth = authStore;
const router = useRouter();
const isLoading = ref(true);
const allCommittees = ref([]);

const fetchCommitteesData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/committees', {}, 'GET');
    if (response.status) {
      const orgCommittees = response.data || [];

      // Flatten committees with org name added to each
      allCommittees.value = orgCommittees.flatMap(org =>
        (org.committees || []).map(committee => ({
          ...committee,
          org_name: org.org_name || 'Unknown Organisation',
        }))
      );
    }
  } catch (error) {
    console.error('Failed to load committee data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCommitteesData();
});
</script>
<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-800">Committees</h1>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <div v-else-if="!allCommittees.length" class="text-gray-500 italic">No committees found.</div>

    <div v-else class="bg-white p-6 rounded shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">All Committees</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow rounded-md">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Organisation</th>
              <th class="px-4 py-3 text-left">Committee Name</th>
              <th class="px-4 py-3 text-left">Designation</th>
              <th class="px-4 py-3 text-left">Start Date</th>
            <th class="px-4 py-3 text-left">End Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(singleCommittee, index) in allCommittees"
              :key="singleCommittee.id"
              class="border-t text-sm text-gray-800 hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ singleCommittee.org_name }}</td>
              <td class="px-4 py-3">{{ singleCommittee.committee.name || '—' }}</td>
            <td class="px-4 py-3">{{ singleCommittee.designation || '—' }}</td>
              <td class="px-4 py-3">{{ singleCommittee.start_date || '—' }}</td>
            <td class="px-4 py-3">{{ singleCommittee.end_date || '—' }}</td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
