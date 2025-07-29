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
const pastAttendances = ref([]);
const pastAttendancesAbsent = ref([]);

// const isLoading = ref(true);

const fetchAttendanceData = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/individual/attendance', {}, 'GET');
        // console.log(JSON.stringify(response, null, 2));
        // console.log('Attendance Data:', response);
        // isLoading.value = false;
        attendanceStats.value = response.stats;
        pastAttendances.value = response.past;
        pastAttendancesAbsent.value = response.past_absent;
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
    <div class="p-6 bg-white rounded-xl shadow-lg mt-8">
        <div>
            <h2 class="text-3xl font-semibold text-gray-800 mb-8">Attendance Record</h2>

            <!-- Summary Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div class="bg-blue-100 rounded-lg p-5 text-center shadow-sm">
                    <p class="text-3xl font-extrabold text-blue-800">{{ attendanceStats.meetings_attended }}</p>
                    <p class="text-sm text-gray-700 mt-1">Meetings Attended</p>
                </div>
                <div class="bg-green-100 rounded-lg p-5 text-center shadow-sm">
                    <p class="text-3xl font-extrabold text-green-800">{{ attendanceStats.events_attended }}</p>
                    <p class="text-sm text-gray-700 mt-1">Events Attended</p>
                </div>
                <div class="bg-yellow-100 rounded-lg p-5 text-center shadow-sm">
                    <p class="text-3xl font-extrabold text-yellow-800">{{ attendanceStats.projects_participated }}</p>
                    <p class="text-sm text-gray-700 mt-1">Projects Participated</p>
                </div>
            </div>

            <!-- Attendance Records -->
            <div class="mt-10">
                <p class="text-sm text-gray-500 mb-6">Your past attendance history for meetings, events, and projects.
                </p>

                <!-- Past Attendance -->
                <div class="mb-10">
                    <h3 class="text-xl font-semibold text-gray-700 mb-3">Attended</h3>
                    <div v-if="pastAttendances.length" class="space-y-4">
                        <div v-for="(item, index) in pastAttendances" :key="item.id"
                            class="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                            <div>
                                <p class="font-medium text-gray-800">{{ index + 1 }}. {{ item.type }} – {{ item.title }}
                                </p>
                                <p class="text-sm text-gray-500">{{ formatDate(item.date) }}</p>
                            </div>
                            <span :class="{
                                'text-green-600 font-semibold': item.status === 'attended',
                                'text-red-500 font-semibold': item.status === 'absent',
                                'text-gray-500': item.status === 'scheduled',
                            }">
                                {{ item.status === 'attended' ? 'Attended' : item.status === 'absent' ? 'Absent' :
                                'Scheduled' }}
                            </span>
                        </div>
                    </div>
                    <div v-else class="text-sm text-gray-500">No past attendance records.</div>
                </div>

                <!-- Past Absences -->
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-3">Absences</h3>
                    <div v-if="pastAttendancesAbsent.length" class="space-y-4">
                        <div v-for="(item, index) in pastAttendancesAbsent" :key="item.id"
                            class="flex justify-between items-center bg-red-50 p-4 rounded-lg shadow-sm">
                            <div>
                                <p class="font-medium text-gray-800">{{ index + 1 }}. {{ item.type }} – {{ item.title }}
                                </p>
                                <p class="text-sm text-gray-500">{{ formatDate(item.date) }}</p>
                            </div>
                            <span class="text-red-600 font-semibold">Absent</span>
                        </div>
                    </div>
                    <div v-else class="text-sm text-gray-500">No past absence records.</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
