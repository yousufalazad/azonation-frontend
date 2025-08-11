<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '@/store/authStore';
import { useRouter } from 'vue-router';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

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

const calculateMembershipAge = (startDate) => {
  if (!startDate) return '—';

  const start = dayjs(startDate);
  if (!start.isValid()) return '—';

  const now = dayjs();
  if (start.isAfter(now)) return '—';

  const diffYears = now.diff(start, 'year');
  const diffMonths = now.diff(start.add(diffYears, 'year'), 'month');
  const diffDays = now.diff(start.add(diffYears, 'year').add(diffMonths, 'month'), 'day');

  return `${diffYears}y ${diffMonths}m ${diffDays}d`;
};

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
          org_name: org.org_name,
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

    <!-- Loading -->
    <div v-if="isLoading" class="text-gray-500">Loading...</div>

    <!-- No connection -->
    <div v-else-if="!hasConnection" class="p-6 bg-yellow-50 text-yellow-700 rounded shadow">
      <p>You are not currently connected to any organisation.</p>
    </div>

    <!-- Main content -->
    <div v-else class="space-y-8">

      <!-- Connected Organisations -->
      <div class="bg-white p-6 rounded shadow">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Connected Organisations</h2>
          <router-link to="/individual-dashboard/connected-orgs"
            class="text-sm text-blue-600 hover:underline self-start sm:self-auto">
            See all
          </router-link>
        </div>

        <!-- Mobile Cards -->
        <div v-if="connectedOrgs.length" class="sm:hidden space-y-3">
          <div v-for="(org, index) in connectedOrgs" :key="org.id"
            class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div class="text-xs text-gray-500 mb-2 font-semibold"># {{ index + 1 }}</div>
            <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
              <tbody>
                <tr>
                  <td class="text-gray-600 w-[120px] pr-2 font-medium">Organisation</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ org.org_name }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Membership ID</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ org.existing_membership_id || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Membership Type</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ org.membership_type?.name || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Start Date</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ org.membership_start_date || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Membership Age</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ calculateMembershipAge(org.membership_start_date) }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Status</td>
                  <td class="w-3 text-center">:</td>
                  <td :class="org.is_active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                    {{ org.is_active ? 'Active' : 'Inactive' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Organisation Name</th>
                <th class="px-4 py-3 text-left">Membership ID</th>
                <th class="px-4 py-3 text-left">Membership Type</th>
                <th class="px-4 py-3 text-left">Start Date</th>
                <th class="px-4 py-3 text-left">Membership Age</th>
                <th class="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(org, index) in connectedOrgs" :key="org.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50 align-top">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3 break-words">{{ org.org_name }}</td>
                <td class="px-4 py-3 break-words">{{ org.existing_membership_id || '—' }}</td>
                <td class="px-4 py-3 break-words">{{ org.membership_type?.name || '—' }}</td>
                <td class="px-4 py-3">{{ org.membership_start_date || '—' }}</td>
                <td class="px-4 py-3">{{ calculateMembershipAge(org.membership_start_date) }}</td>
                <td class="px-4 py-3">
                  <span :class="org.is_active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                    {{ org.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Your Committees -->
      <div class="bg-white p-6 rounded shadow">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Your Committees</h2>
          <button @click="$router.push({ name: 'individual-committees' })"
            class="text-sm text-blue-600 hover:underline self-start sm:self-auto">
            See all
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="!allCommittees.length" class="text-gray-500 italic">
          You are not a member of any committee yet.
        </div>

        <!-- Mobile Cards -->
        <div v-else class="sm:hidden space-y-3">
          <div v-for="(item, index) in allCommittees" :key="`${item.org_name}-${item.id}-${index}`"
            class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div class="text-xs text-gray-500 mb-2 font-semibold">
              # {{ index + 1 }}
            </div>
            <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
              <tbody>
                <tr>
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Designation</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ item.designation_id || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Committee</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ item.name || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Organisation</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ item.org_name || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Start Date</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ item.start_date || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">End Date</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ item.end_date || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Desktop Table -->
        <div v-if="allCommittees.length" class="hidden sm:block overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Designation</th>
                <th class="px-4 py-3 text-left">Committee Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Start Date</th>
                <th class="px-4 py-3 text-left">End Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(committee, index) in allCommittees" :key="`${committee.org_name}-${committee.id}-${index}`"
                class="border-t text-sm text-gray-800 hover:bg-gray-50 align-top">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3 break-words">{{ committee.designation_id || '—' }}</td>
                <td class="px-4 py-3 break-words">{{ committee.name || '—' }}</td>
                <td class="px-4 py-3 break-words">{{ committee.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ committee.start_date || '—' }}</td>
                <td class="px-4 py-3">{{ committee.end_date || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Upcoming Meetings -->
      <div class="bg-white p-6 rounded shadow">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Upcoming Meetings</h2>
          <button @click="$router.push({ name: 'individual-meetings' })"
            class="text-sm text-blue-600 hover:underline self-start sm:self-auto">
            See all
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="!allMeetings.length" class="text-gray-500 italic">
          No upcoming meetings.
        </div>

        <!-- Mobile Cards -->
        <div v-else class="sm:hidden space-y-3">
          <div v-for="(item, index) in allMeetings" :key="item.id"
            class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div class="text-xs text-gray-500 mb-2 font-semibold">
              # {{ index + 1 }}
            </div>
            <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
              <tbody>
                <tr>
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Meeting Name</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ item.name || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Organisation</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ item.org_name || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Date</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ item.date || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">Start Time</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ item.start_time || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-gray-600 font-medium">End Time</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ item.end_time || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Desktop Table -->
        <div v-if="allMeetings.length" class="hidden sm:block overflow-x-auto">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Meeting Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Date</th>
                <th class="px-4 py-3 text-left">Start Time</th>
                <th class="px-4 py-3 text-left">End Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(meeting, index) in allMeetings" :key="meeting.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50 align-top">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3 break-words">{{ meeting.name || '—' }}</td>
                <td class="px-4 py-3 break-words">{{ meeting.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ meeting.date || '—' }}</td>
                <td class="px-4 py-3">{{ meeting.start_time || '—' }}</td>
                <td class="px-4 py-3">{{ meeting.end_time || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="bg-white p-6 rounded shadow">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Upcoming Events</h2>
          <button @click="$router.push({ name: 'individual-events' })"
            class="text-sm text-blue-600 hover:underline self-start sm:self-auto">
            See all
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-gray-500 italic">Loading...</div>

        <!-- Empty State (Mobile) -->
        <div v-else-if="!allEvents.length" class="text-gray-500 italic md:hidden">
          No upcoming events.
        </div>

        <!-- Mobile Cards -->
        <div v-else class="md:hidden space-y-3">
          <div v-for="(event, index) in allEvents" :key="event.id"
            class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div class="text-xs text-gray-500 mb-2 font-semibold">
              # {{ index + 1 }}
            </div>
            <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
              <tbody>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Event Name</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ event.name || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Organisation</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ event.org_name || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Date</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ event.date || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Time</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ event.time || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Desktop Table -->
        <div v-if="!isLoading && allEvents.length" class="overflow-x-auto hidden md:block">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left w-12">#</th>
                <th class="px-4 py-3 text-left">Event Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Date</th>
                <th class="px-4 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(event, index) in allEvents" :key="event.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50 transition">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3 max-w-[240px] whitespace-normal break-words">{{ event.name || '—' }}</td>
                <td class="px-4 py-3 max-w-[240px] whitespace-normal break-words">{{ event.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ event.date || '—' }}</td>
                <td class="px-4 py-3">{{ event.time || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State (Desktop) -->
        <div v-else-if="!isLoading && !allEvents.length" class="text-gray-500 italic hidden md:block">
          No upcoming events.
        </div>
      </div>


      <!-- Upcoming Projects -->
      <div class="bg-white p-6 rounded shadow">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Upcoming Projects</h2>
          <button @click="$router.push({ name: 'individual-projects' })"
            class="text-sm text-blue-600 hover:underline self-start sm:self-auto">
            See all
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-gray-500 italic">Loading...</div>

        <!-- Empty State (Mobile) -->
        <div v-else-if="!allProjects.length" class="text-gray-500 italic md:hidden">
          No upcoming projects.
        </div>

        <!-- Mobile Cards -->
        <div v-else class="md:hidden space-y-3">
          <div v-for="(project, index) in allProjects" :key="project.id"
            class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div class="text-xs text-gray-500 mb-2 font-semibold">
              # {{ index + 1 }}
            </div>
            <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
              <tbody>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Project Name</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ project.title || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Organisation</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ project.org_name || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Start Date</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ project.start_date || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">End Date</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ project.end_date || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Desktop Table -->
        <div v-if="!isLoading && allProjects.length" class="overflow-x-auto hidden md:block">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Project Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Start Date</th>
                <th class="px-4 py-3 text-left">End Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(project, index) in allProjects" :key="project.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50 align-top">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3 max-w-[280px] whitespace-normal break-words">{{ project.title || '—' }}</td>
                <td class="px-4 py-3 max-w-[280px] whitespace-normal break-words">{{ project.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ project.start_date || '—' }}</td>
                <td class="px-4 py-3">{{ project.end_date || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State (Desktop) -->
        <div v-else-if="!isLoading && !allProjects.length" class="text-gray-500 italic hidden md:block">
          No upcoming projects.
        </div>
      </div>


      <!-- Responsible Assets -->
      <div class="bg-white p-6 rounded shadow">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Responsible Assets</h2>
          <button @click="$router.push({ name: 'individual-assets' })"
            class="text-sm text-blue-600 hover:underline self-start sm:self-auto">
            See all
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-gray-500 italic">Loading...</div>

        <!-- Empty State -->
        <div v-else-if="!allAssets.length" class="text-gray-500 italic md:hidden">
          No responsible assets found.
        </div>

        <!-- Mobile Cards -->
        <div v-else class="md:hidden space-y-3">
          <div v-for="(asset, index) in allAssets" :key="asset.id"
            class="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div class="text-xs text-gray-500 mb-2 font-semibold">
              # {{ index + 1 }}
            </div>
            <table class="text-sm w-full border-collapse border-0" style="border-spacing: 0;">
              <tbody>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Organisation</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ asset.org_name || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Asset</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ asset.name || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">From</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ asset.assignment_start_date || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Lifecycle</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800 break-words">{{ asset.asset_lifecycle_status_name || '—' }}</td>
                </tr>
                <tr class="border-0 border-b-0">
                  <td class="text-gray-600 w-[100px] pr-2 font-medium">Qty</td>
                  <td class="w-3 text-center">:</td>
                  <td class="text-gray-800">{{ asset.quantity || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Desktop Table -->
        <div v-if="!isLoading && allAssets.length" class="overflow-x-auto hidden md:block">
          <table class="min-w-full bg-white shadow rounded-md">
            <thead class="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th class="px-4 py-3 text-left">#</th>
                <th class="px-4 py-3 text-left">Asset Name</th>
                <th class="px-4 py-3 text-left">Organisation</th>
                <th class="px-4 py-3 text-left">Responsible From</th>
                <th class="px-4 py-3 text-left">Life Cycle</th>
                <th class="px-4 py-3 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(asset, index) in allAssets" :key="asset.id"
                class="border-t text-sm text-gray-800 hover:bg-gray-50 align-top">
                <td class="px-4 py-3">{{ index + 1 }}</td>
                <td class="px-4 py-3 max-w-[280px] whitespace-normal break-words">{{ asset.name || '—' }}</td>
                <td class="px-4 py-3 max-w-[280px] whitespace-normal break-words">{{ asset.org_name || '—' }}</td>
                <td class="px-4 py-3">{{ asset.assignment_start_date || '—' }}</td>
                <td class="px-4 py-3 max-w-[240px] whitespace-normal break-words">{{ asset.asset_lifecycle_status_name
                  || '—' }}</td>
                <td class="px-4 py-3">{{ asset.quantity || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Empty State -->
        <div v-else-if="!isLoading && !allAssets.length" class="text-gray-500 italic hidden md:block">
          No responsible assets found.
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
        <div v-for="(count, label) in summaryCounts" :key="label"
          class="bg-white p-4 sm:p-5 rounded shadow text-center">
          <p class="text-[11px] sm:text-sm text-gray-500 uppercase tracking-wide break-words">{{ label }}</p>
          <p class="text-xl sm:text-2xl font-bold text-blue-700 mt-1">{{ count }}</p>
        </div>
      </div>
    </div>
  </div>
</template>