<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const auth = authStore;
const attendanceStats = ref({
    meetings_attended: 0,
    events_attended: 0,
    projects_participated: 0,
});
const upcomingAttendances = ref([]);
const pastAttendances = ref([]);
// const isLoading = ref(true);

const fetchAttendanceData = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/individual/attendance', {}, 'GET');
        // console.log(JSON.stringify(response, null, 2));
        // console.log('Attendance Data:', response);
        // isLoading.value = false;
        attendanceStats.value = response.stats;
        upcomingAttendances.value = response.upcoming;
        pastAttendances.value = response.past;
    } catch (err) {
        console.error('Failed to fetch attendance data:', err);
        Swal.fire('Error', 'Unable to load attendance data', 'error');
    }
};

const formatDate = (dateStr) => {
    return format(new Date(dateStr), 'dd MMM yyyy');
};

onMounted(fetchAttendanceData);
</script>

<template>
    <div class="p-6 bg-white rounded shadow-md mt-6">
        <!-- <div v-if="isLoading">Loading attendance...</div> -->
        <!-- <div v-else> -->
        <div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Attendance Overview</h2>

            <!-- Summary Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div class="bg-blue-50 p-4 rounded text-center">
                    <p class="text-2xl font-bold text-blue-800">{{ attendanceStats.meetings_attended }}</p>
                    <p class="text-sm text-gray-600">Meetings Attended</p>
                </div>
                <div class="bg-green-50 p-4 rounded text-center">
                    <p class="text-2xl font-bold text-green-800">{{ attendanceStats.events_attended }}</p>
                    <p class="text-sm text-gray-600">Events Attended</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded text-center">
                    <p class="text-2xl font-bold text-yellow-800">{{ attendanceStats.projects_participated }}</p>
                    <p class="text-sm text-gray-600">Projects Participated</p>
                </div>
            </div>

            <!-- Upcoming -->
            <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Upcoming Attendance</h3>
                <ul class="divide-y divide-gray-200">
                    <li v-for="(item, index) in upcomingAttendances" :key="item.id" class="py-3">
                        <div class="flex justify-between">
                            <span class="text-gray-800">{{ index + 1 }}. {{ item.type }} - {{ item.title }}</span>
                            <span class="text-gray-500">{{ formatDate(item.date) }}</span>
                        </div>
                    </li>
                    <li v-if="!upcomingAttendances.length" class="text-sm text-gray-500">No upcoming attendance.</li>
                </ul>
            </div>

            <!-- Past -->
            <div>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Past Attendance</h3>
                <ul class="divide-y divide-gray-200">
                    <li v-for="(item, index) in pastAttendances" :key="item.id" class="py-3">
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-gray-800 font-medium">{{ index + 1 }}. {{ item.type }} - {{ item.title
                                    }}</span>
                                <div class="text-sm text-gray-500">{{ formatDate(item.date) }}</div>
                            </div>
                            <span :class="{
                                'text-green-600': item.status === 'attended',
                                'text-red-500': item.status === 'absent',
                                'text-gray-500': item.status === 'scheduled',
                            }">
                                {{ item.status === 'attended' ? 'Attended' : item.status === 'absent' ? 'Absent' :
                                'Scheduled' }}
                            </span>
                        </div>
                    </li>
                    <li v-if="!pastAttendances.length" class="text-sm text-gray-500">No past attendance records.</li>
                </ul>
            </div>
        </div>
    </div>
</template>


<style scoped></style>
