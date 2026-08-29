<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const auth = authStore;
const router = useRouter();
const isLoading = ref(true);
const allMeetings = ref([]);

const canCreate = computed(() => auth.hasPermission('meeting.create'));

const canManage = (meeting) =>
  meeting.org_id === auth.currentOrgId && auth.hasPermission('meeting.update');

const canRemove = (meeting) =>
  meeting.org_id === auth.currentOrgId && auth.hasPermission('meeting.delete');

const activeOrgName = computed(() => {
  const org = auth.orgAccess.find(o => o.org_type_user_id === auth.currentOrgId);
  return org?.org_name || 'Unknown';
});

const fetchMeetingsData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/meetings', {}, 'GET');
    if (response.status) {
      const orgMeetings = response.data || [];
      allMeetings.value = orgMeetings.flatMap(org =>
        (org.meetings || []).map(meeting => ({
          ...meeting,
          org_id: org.org_type_user_id, // ⚠️ confirm this key matches your API response
          org_name: org.org_name || 'Unknown Organisation',
        }))
      );
    }
  } catch (error) {
    console.error('Failed to load meetings data:', error);
  } finally {
    isLoading.value = false;
  }
};

const goToCreateMeeting = () => router.push({ name: 'create-individual-meeting' });
const goToEditMeeting = (id) => router.push({ name: 'edit-individual-meeting', params: { id } });
const goToViewMeeting = (id) => router.push({ name: 'view-individual-meeting', params: { id } });

const deleteMeeting = async (id) => {
  const confirmed = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!confirmed.isConfirmed) return;

  try {
    const response = await auth.fetchProtectedApi(`/api/meetings/${id}`, {}, 'DELETE');
    if (response.status) {
      allMeetings.value = allMeetings.value.filter(m => m.id !== id);
      Swal.fire('Deleted!', 'Meeting has been deleted.', 'success');
    } else {
      Swal.fire('Error!', 'Failed to delete meeting.', 'error');
    }
  } catch (e) {
    console.error(e);
    Swal.fire('Error!', 'Failed to delete meeting.', 'error');
  }
};

onMounted(() => {
  fetchMeetingsData();
});
</script>

<template>
  <div class="space-y-6 sm:space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-2 sm:mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800 break-words">Upcoming Meetings</h1>
        <p v-if="canCreate" class="text-xs text-gray-500 mt-1">
          Creating for: <span class="font-medium">{{ activeOrgName }}</span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <button v-if="canCreate" @click="goToCreateMeeting"
          class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300">
          Create Meeting
        </button>
        <button @click="$router.push({ name: 'past-individual-meetings' })"
          class="w-full sm:w-auto bg-gray-500 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300">
          Past Meeting List
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>
    <div v-else-if="!allMeetings.length" class="text-gray-500 italic">No meetings found.</div>

    <div v-else class="bg-white p-4 sm:p-6 rounded shadow">
      <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">All Upcoming Meetings</h2>

      <!-- Mobile -->
      <div class="sm:hidden space-y-3">
        <div v-for="(meeting, index) in allMeetings" :key="meeting.id" class="border rounded-lg p-3 bg-white shadow-sm">
          <div class="text-xs text-gray-500 mb-2"><span class="font-medium"># {{ index + 1 }}</span></div>
          <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
            <tbody>
              <tr><td class="text-gray-500 w-[100px] pr-2">Organisation</td><td class="w-3 text-center">:</td><td class="text-gray-800">{{ meeting.org_name || '—' }}</td></tr>
              <tr><td class="text-gray-500 w-[100px] pr-2">Meeting Name</td><td class="w-3 text-center">:</td><td class="text-gray-800">{{ meeting.name || '—' }}</td></tr>
              <tr><td class="text-gray-500 w-[100px] pr-2">Date</td><td class="w-3 text-center">:</td><td class="text-gray-800">{{ meeting.date || '—' }}</td></tr>
              <tr><td class="text-gray-500 w-[100px] pr-2">Start Time</td><td class="w-3 text-center">:</td><td class="text-gray-800">{{ meeting.start_time || '—' }}</td></tr>
              <tr><td class="text-gray-500 w-[100px] pr-2">End Time</td><td class="w-3 text-center">:</td><td class="text-gray-800">{{ meeting.end_time || '—' }}</td></tr>
            </tbody>
          </table>
          <div class="flex justify-end gap-3 mt-3 pt-2 border-t">
            <button @click="goToViewMeeting(meeting.id)" class="text-green-600 text-xs font-medium">View</button>
            <button v-if="canManage(meeting)" @click="goToEditMeeting(meeting.id)" class="text-yellow-600 text-xs font-medium">Edit</button>
            <button v-if="canRemove(meeting)" @click="deleteMeeting(meeting.id)" class="text-red-600 text-xs font-medium">Delete</button>
          </div>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full bg-white shadow rounded-md">
          <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">#</th>
              <th class="px-4 py-3 text-left">Organisation</th>
              <th class="px-4 py-3 text-left">Meeting Name</th>
              <th class="px-4 py-3 text-left">Date</th>
              <th class="px-4 py-3 text-left">Start Time</th>
              <th class="px-4 py-3 text-left">End Time</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(meeting, index) in allMeetings" :key="meeting.id" class="border-t text-sm text-gray-800 hover:bg-gray-50 align-top">
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3 break-words">{{ meeting.org_name || '—' }}</td>
              <td class="px-4 py-3 break-words">{{ meeting.name || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ meeting.date || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ meeting.start_time || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ meeting.end_time || '—' }}</td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button @click="goToViewMeeting(meeting.id)" class="text-green-600 mr-3 hover:underline">View</button>
                <button v-if="canManage(meeting)" @click="goToEditMeeting(meeting.id)" class="text-yellow-600 mr-3 hover:underline">Edit</button>
                <button v-if="canRemove(meeting)" @click="deleteMeeting(meeting.id)" class="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>