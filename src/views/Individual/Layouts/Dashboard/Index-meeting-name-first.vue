<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

const auth = authStore;
const router = useRouter();

const isLoading = ref(true);
const hasConnection = ref(false);

const connectedOrgs = ref([]);
const organisationsSummary = ref([]);
const approvalRequests = ref([]);
const summaryCounts = ref({
  committees: 0,
  meetings: 0,
  events: 0,
  projects: 0,
  assets: 0,
  founders: 0
});

// Flattened global meeting and event lists
const allCommittees = ref([]);
const allMeetings = ref([]);
const allEvents = ref([]);
const allProjects = ref([]);
const allAssets = ref([]);

const fetchDashboardData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/dashboard-summary', {}, 'GET');
    if (response.status) {
      hasConnection.value = response.data.has_connection || false;
      connectedOrgs.value = response.data.connected_organisations || [];
      organisationsSummary.value = response.data.organisations_summary || [];
      approvalRequests.value = response.data.approval_requests || [];
      summaryCounts.value = response.data.summary_counts || {};

      // Flatten all committees
      allCommittees.value = organisationsSummary.value.flatMap(org =>
        (org.committees || []).map(committee => ({
          ...committee,
          org_name: org.org_name
        }))
      );

      // Flatten all meetings and add org_name to each
      allMeetings.value = organisationsSummary.value.flatMap(org =>
        (org.next_meetings || []).map(meeting => ({
          ...meeting,
          org_name: org.org_name
        }))
      );

      // Flatten all events and add org_name to each
      allEvents.value = organisationsSummary.value.flatMap(org =>
        (org.upcoming_events || []).map(event => ({
          ...event,
          org_name: org.org_name
        }))
      );

      // Flatten all events and add org_name to each
      allProjects.value = organisationsSummary.value.flatMap(org =>
        (org.upcoming_projects || []).map(project => ({
          ...project,
          org_name: org.org_name
        }))
      );

      // After fetching organisationsSummary
      allAssets.value = organisationsSummary.value.flatMap(org =>
        (org.responsible_assets || []).map(asset => ({
          ...asset,
          org_name: org.org_name
        }))
      );

    }

  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>


<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <div v-else-if="!hasConnection" class="p-6 bg-yellow-50 text-yellow-700 rounded shadow">
      <p>You are not currently connected to any organisation.</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Connected Organisations -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Connected Organisations</h2>
          <!-- <router-link to="/individual-dashboard/connected-orgs" class="text-sm text-blue-600 hover:underline">See
            all</router-link> -->
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Organisation Name</th>
                <th class="px-4 py-3 text-left">Membership ID</th>
                <th class="px-4 py-3 text-left">Membership Type ID</th>
                <th class="px-4 py-3 text-left">Start Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(org, index) in connectedOrgs" :key="org.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3">{{ org.org_name }}</td>
                <td class="px-4 py-3">{{ org.existing_membership_id || '—' }}</td>
                <td class="px-4 py-3">{{ org.membership_type_id || '—' }}</td>
                <td class="px-4 py-3">{{ org.membership_start_date || '—' }}</td>
                <!-- <td class="px-4 py-3">{{ org.sponsored_user_id || '—' }}</td>
                <td class="px-4 py-3">
                  <span :class="org.is_active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                    {{ org.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td> -->
              </tr>
            </tbody>
          </table>
        </div>
      </div>



      <!-- All Committees -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Your Committees</h2>
          <button @click="router.push({ name: 'individual-committees' })" class="text-sm text-blue-600 hover:underline">
            See all
          </button>
        </div>
        <div v-if="allCommittees.length" class="overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Committee Name</th>
                <th class="px-4 py-3 text-left">Designation</th>
                <th class="px-4 py-3 text-left">Organization</th>
                <th class="px-4 py-3 text-left">Start Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(committee, index) in allCommittees" :key="`${committee.org_name}-${committee.id}-${index}`"
                class="border-t text-sm text-gray-800 hover:bg-gray-50">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3">{{ committee.name || '—' }}</td>
                <td class="px-4 py-3">{{ committee.designation_id || '—' }}</td>
                <td class="px-4 py-3">{{ committee.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ committee.start_date || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-gray-500 italic">You are not a member of any committee yet.</div>
      </div>

      <!-- All Upcoming Meetings -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Upcoming Meetings</h2>
          <button @click="router.push({ name: 'individual-meetings' })"
            class="text-sm text-blue-600 hover:underline">See all</button>
        </div>
        <div v-if="allMeetings.length" class="overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Meeting Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Date</th>
                <th class="px-4 py-3 text-left">Time</th>
                <th class="px-4 py-3 text-left">Venue</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(meeting, index) in allMeetings" :key="meeting.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3">{{ meeting.name || '—' }}</td>
                <td class="px-4 py-3">{{ meeting.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ meeting.date || '—' }}</td>
                <td class="px-4 py-3">{{ meeting.start_time || '—' }}</td>
                <td class="px-4 py-3">{{ meeting.address || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-gray-500 italic">No upcoming meetings.</div>
      </div>

      <!-- All Upcoming Events -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Upcoming Events</h2>
          <button @click="router.push({ name: 'individual-events' })" class="text-sm text-blue-600 hover:underline">See
            all</button>
        </div>
        <div v-if="allEvents.length" class="overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Event Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Date</th>
                <th class="px-4 py-3 text-left">Time</th>
                <th class="px-4 py-3 text-left">Venue</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(event, index) in allEvents" :key="event.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3">{{ event.name || '—' }}</td>
                <td class="px-4 py-3">{{ event.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ event.date || '—' }}</td>
                <td class="px-4 py-3">{{ event.time || '—' }}</td>
                <td class="px-4 py-3">{{ event.venue_name || '—' }}, {{ event.venue_address || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-gray-500 italic">No upcoming events.</div>
      </div>
      <!-- All Upcoming Projects -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Upcoming Projects</h2>
          <button @click="router.push({ name: 'individual-projects' })"
            class="text-sm text-blue-600 hover:underline">See
            all</button>
        </div>
        <div v-if="allProjects.length" class="overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Project Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Date</th>
                <th class="px-4 py-3 text-left">Time</th>
                <th class="px-4 py-3 text-left">Venue</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(project, index) in allProjects" :key="project.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3">{{ project.title || '—' }}</td>
                <td class="px-4 py-3">{{ project.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ project.start_date || '—' }}</td>
                <td class="px-4 py-3">{{ project.start_time || '—' }}</td>
                <td class="px-4 py-3">{{ project.venue_name || '—' }}, {{ project.venue_address || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-gray-500 italic">No upcoming projects.</div>
      </div>

      <!-- Responsible Assets -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Responsible Assets</h2>
          <button @click="router.push({ name: 'individual-assets' })" class="text-sm text-blue-600 hover:underline">See
            all</button>
        </div>
        <div v-if="allAssets.length" class="overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Asset Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Responsible From</th>
                <th class="px-4 py-3 text-left">Quantity</th>
                <th class="px-4 py-3 text-left">Asset Life Cycle Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(asset, index) in allAssets" :key="asset.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3">{{ asset.name || '—' }}</td>
                <td class="px-4 py-3">{{ asset.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ asset.assignment_start_date || '—' }}</td>
                <td class="px-4 py-3">{{ asset.quantity || 0 }}</td>
                <td class="px-4 py-3">{{ asset.asset_lifecycle_status_id || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-gray-500 italic">No responsible assets found.</div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(count, label) in summaryCounts" :key="label" class="bg-white p-5 rounded shadow text-center">
          <p class="text-sm text-gray-500 uppercase tracking-wide">{{ label }}</p>
          <p class="text-2xl font-bold text-blue-700 mt-1">{{ count }}</p>
        </div>
      </div>
    </div>
  </div>
</template>