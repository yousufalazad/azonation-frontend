<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { authStore } from '../../../store/authStore';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const auth = authStore;

const attendanceStats = ref({
  meetings_attended: 0,
  events_attended: 0,
  projects_participated: 0,
});

const pastAttendances = ref([]);
const pastAttendancesAbsent = ref([]);

const itemsPerPageOptions = [10, 20, 50, 100, 250];

// Attendance pagination
const currentPageAttended = ref(1);
const itemsPerPageAttended = ref(10);

// Absences pagination
const currentPageAbsent = ref(1);
const itemsPerPageAbsent = ref(10);

// Computed paginated data for attendance
const paginatedPastAttendances = computed(() => {
  const start = (currentPageAttended.value - 1) * itemsPerPageAttended.value;
  return pastAttendances.value.slice(start, start + itemsPerPageAttended.value);
});

// Computed paginated data for absences
const paginatedPastAbsences = computed(() => {
  const start = (currentPageAbsent.value - 1) * itemsPerPageAbsent.value;
  return pastAttendancesAbsent.value.slice(start, start + itemsPerPageAbsent.value);
});

// Total pages for pagination
const totalPagesAttended = computed(() =>
  Math.ceil(pastAttendances.value.length / itemsPerPageAttended.value)
);
const totalPagesAbsent = computed(() =>
  Math.ceil(pastAttendancesAbsent.value.length / itemsPerPageAbsent.value)
);

// Reset to page 1 on items per page change
watch(itemsPerPageAttended, () => {
  currentPageAttended.value = 1;
});
watch(itemsPerPageAbsent, () => {
  currentPageAbsent.value = 1;
});

// Format date safely
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return '—';
  }
};

// Fetch attendance data
const fetchAttendanceData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/individual/attendance', {}, 'GET');
    attendanceStats.value = response.stats;
    pastAttendances.value = response.past;
    pastAttendancesAbsent.value = response.past_absent;
  } catch (err) {
    console.error('Failed to fetch attendance data:', err);
    Swal.fire('Error', 'Unable to load attendance data', 'error');
  }
};

onMounted(fetchAttendanceData);
</script>

<template>
  <div class="space-y-8">
    <!-- Attendance Overview -->
    <div class="p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 class="text-3xl font-semibold text-gray-800 mb-8">Attendance Overview</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div class="bg-blue-50 rounded-lg p-5 text-center shadow-sm">
          <p class="text-3xl font-bold text-blue-800">{{ attendanceStats.meetings_attended }}</p>
          <p class="text-sm text-gray-700 mt-1">Meetings Attended</p>
        </div>
        <div class="bg-green-50 rounded-lg p-5 text-center shadow-sm">
          <p class="text-3xl font-bold text-green-800">{{ attendanceStats.events_attended }}</p>
          <p class="text-sm text-gray-700 mt-1">Events Attended</p>
        </div>
        <div class="bg-yellow-50 rounded-lg p-5 text-center shadow-sm">
          <p class="text-3xl font-bold text-yellow-800">{{ attendanceStats.projects_participated }}</p>
          <p class="text-sm text-gray-700 mt-1">Projects Participated</p>
        </div>
      </div>
    </div>

    <!-- Past Attendances -->
    <div class="p-6 bg-white rounded-xl shadow-lg mt-8">
      <h3 class="text-xl font-semibold text-gray-700 mb-3">Attendances</h3>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="(item, index) in paginatedPastAttendances"
          :key="item.id"
          class="bg-white rounded-lg shadow-sm p-3 border border-gray-200"
        >
          <div class="text-xs text-gray-500 mb-2 font-semibold">
            # {{ (currentPageAttended - 1) * itemsPerPageAttended + index + 1 }}
          </div>
          <table class="text-sm w-full border-collapse" style="border-spacing: 0;">
            <tbody>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Type</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ item.type || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Title</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ item.title || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Date</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ formatDate(item.date) || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Status</td>
                <td class="w-3 text-center">:</td>
                <td
                  :class="{
                    'text-green-600 font-semibold': item.status === 'attended',
                    'text-red-500 font-semibold': item.status === 'absent',
                    'text-gray-500': item.status === 'scheduled',
                  }"
                >
                  {{
                    item.status === 'attended'
                      ? 'Attended'
                      : item.status === 'absent'
                      ? 'Absent'
                      : 'Scheduled'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Desktop List -->
      <div class="hidden sm:block space-y-4">
        <div
          v-for="(item, index) in paginatedPastAttendances"
          :key="item.id"
          class="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
        >
          <div>
            <p class="font-medium text-gray-800">
              {{ (currentPageAttended - 1) * itemsPerPageAttended + index + 1 }}. {{ item.type }} – {{
                item.title
              }}
            </p>
            <p class="text-sm text-gray-500">{{ formatDate(item.date) }}</p>
          </div>
          <span
            :class="{
              'text-green-600 font-semibold': item.status === 'attended',
              'text-red-500 font-semibold': item.status === 'absent',
              'text-gray-500': item.status === 'scheduled',
            }"
          >
            {{
              item.status === 'attended'
                ? 'Attended'
                : item.status === 'absent'
                ? 'Absent'
                : 'Scheduled'
            }}
          </span>
        </div>
      </div>

      <!-- Pagination Controls -->
      <PaginationControls
        :current-page.sync="currentPageAttended"
        :items-per-page.sync="itemsPerPageAttended"
        :total-items="pastAttendances.length"
        :items-per-page-options="itemsPerPageOptions"
      />
    </div>

    <!-- Past Absences -->
    <div class="p-6 bg-white rounded-xl shadow-lg mt-8">
      <h3 class="text-xl font-semibold text-gray-700 mb-3">Absences</h3>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="(item, index) in paginatedPastAbsences"
          :key="item.id"
          class="bg-white rounded-lg shadow-sm p-3 border border-gray-200"
        >
          <div class="text-xs text-gray-500 mb-2 font-semibold">
            # {{ (currentPageAbsent - 1) * itemsPerPageAbsent + index + 1 }}
          </div>
          <table class="text-sm w-full border-collapse" style="border-spacing: 0;">
            <tbody>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Type</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ item.type || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Title</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800 break-words">{{ item.title || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Date</td>
                <td class="w-3 text-center">:</td>
                <td class="text-gray-800">{{ formatDate(item.date) || '—' }}</td>
              </tr>
              <tr class="border-0 border-b-0">
                <td class="text-gray-600 w-[110px] pr-2 font-medium">Status</td>
                <td class="w-3 text-center">:</td>
                <td class="text-red-600 font-semibold">Absent</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Desktop List -->
      <div class="hidden sm:block space-y-4">
        <div
          v-for="(item, index) in paginatedPastAbsences"
          :key="item.id"
          class="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
        >
          <div>
            <p class="font-medium text-gray-800">
              {{ (currentPageAbsent - 1) * itemsPerPageAbsent + index + 1 }}. {{ item.type }} – {{ item.title }}
            </p>
            <p class="text-sm text-gray-500">{{ formatDate(item.date) }}</p>
          </div>
          <span class="text-red-600 font-semibold">Absent</span>
        </div>
      </div>

      <!-- Pagination Controls -->
      <PaginationControls
        :current-page.sync="currentPageAbsent"
        :items-per-page.sync="itemsPerPageAbsent"
        :total-items="pastAttendancesAbsent.length"
        :items-per-page-options="itemsPerPageOptions"
      />
    </div>
  </div>
</template>