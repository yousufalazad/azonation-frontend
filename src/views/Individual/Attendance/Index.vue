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

// Attendance
const currentPageAttended = ref(1);
const itemsPerPageAttended = ref(10);

// Absences
const currentPageAbsent = ref(1);
const itemsPerPageAbsent = ref(10);

// Computed paginated data
const paginatedPastAttendances = computed(() => {
    const start = (currentPageAttended.value - 1) * itemsPerPageAttended.value;
    return pastAttendances.value.slice(start, start + itemsPerPageAttended.value);
});
const paginatedPastAbsences = computed(() => {
    const start = (currentPageAbsent.value - 1) * itemsPerPageAbsent.value;
    return pastAttendancesAbsent.value.slice(start, start + itemsPerPageAbsent.value);
});

const totalPagesAttended = computed(() =>
    Math.ceil(pastAttendances.value.length / itemsPerPageAttended.value)
);
const totalPagesAbsent = computed(() =>
    Math.ceil(pastAttendancesAbsent.value.length / itemsPerPageAbsent.value)
);

// Reset to page 1 on size change
watch(itemsPerPageAttended, () => currentPageAttended.value = 1);
watch(itemsPerPageAbsent, () => currentPageAbsent.value = 1);

const formatDate = (dateStr) => format(new Date(dateStr), 'dd MMM yyyy');

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
    <div class="p-6 bg-white rounded-xl shadow-lg mt-8">
        <h2 class="text-3xl font-semibold text-gray-800 mb-8">Attendance Overview</h2>
        <!-- Summary Stats -->
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

    <div class="p-6 bg-white rounded-xl shadow-lg mt-8">
        <!-- Past Attendance -->
        <div class="mb-10">
            <h3 class="text-xl font-semibold text-gray-700 mb-3">Attendances</h3>
            <div v-if="paginatedPastAttendances.length" class="space-y-4">
                <div v-for="(item, index) in paginatedPastAttendances" :key="item.id"
                    class="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                    <div>
                        <p class="font-medium text-gray-800">
                            {{ (currentPageAttended - 1) * itemsPerPageAttended + index + 1 }}. {{ item.type }} – {{
                                item.title }}
                        </p>
                        <p class="text-sm text-gray-500">{{ formatDate(item.date) }}</p>
                    </div>
                    <span :class="{
                        'text-green-600 font-semibold': item.status === 'attended',
                        'text-red-500 font-semibold': item.status === 'absent',
                        'text-gray-500': item.status === 'scheduled',
                    }">
                        {{ item.status === 'attended' ? 'Attended' : item.status === 'absent' ? 'Absent' : 'Scheduled'
                        }}
                    </span>
                </div>
            </div>
            <div v-else class="text-sm text-gray-500">No past attendance records.</div>

            <!-- Pagination -->
            <div v-if="totalPagesAttended > 1 || pastAttendances.length"
                class="flex flex-col sm:flex-row justify-between items-center bg-gray-50 border rounded-lg p-3 mt-4">
                <div class="text-sm text-gray-700 mb-2 sm:mb-0">
                    Items {{ (currentPageAttended - 1) * itemsPerPageAttended + 1 }} –
                    {{ Math.min(currentPageAttended * itemsPerPageAttended, pastAttendances.length) }}
                    of {{ pastAttendances.length }} |
                    Page {{ currentPageAttended }} of {{ totalPagesAttended }}
                </div>

                <div class="flex items-center space-x-2">
                    <label class="text-sm text-gray-700">Items per page:</label>
                    <select v-model="itemsPerPageAttended" class="border rounded px-2 py-1 text-sm">
                        <option v-for="opt in itemsPerPageOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>

                    <button class="px-3 py-1 text-sm rounded border disabled:opacity-50"
                        :disabled="currentPageAttended === 1" @click="currentPageAttended = 1">First</button>

                    <button class="px-3 py-1 text-sm rounded border disabled:opacity-50"
                        :disabled="currentPageAttended === 1" @click="currentPageAttended--">Prev</button>

                    <button class="px-3 py-1 text-sm rounded border disabled:opacity-50"
                        :disabled="currentPageAttended === totalPagesAttended"
                        @click="currentPageAttended++">Next</button>

                    <button class="px-3 py-1 text-sm rounded border disabled:opacity-50"
                        :disabled="currentPageAttended === totalPagesAttended"
                        @click="currentPageAttended = totalPagesAttended">Last</button>
                </div>
            </div>
        </div>
    </div>

    <div class="p-6 bg-white rounded-xl shadow-lg mt-8">
        <!-- Past Absences -->
        <div>
            <h3 class="text-xl font-semibold text-gray-700 mb-3">Absences</h3>
            <div v-if="paginatedPastAbsences.length" class="space-y-4">
                <div v-for="(item, index) in paginatedPastAbsences" :key="item.id"
                    class="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                    <div>
                        <p class="font-medium text-gray-800">
                            {{ (currentPageAbsent - 1) * itemsPerPageAbsent + index + 1 }}. {{ item.type }} – {{
                            item.title }}
                        </p>
                        <p class="text-sm text-gray-500">{{ formatDate(item.date) }}</p>
                    </div>
                    <span class="text-red-600 font-semibold">Absent</span>
                </div>
            </div>
            <div v-else class="text-sm text-gray-500">No past absence records.</div>

            <!-- Pagination -->
            <div v-if="totalPagesAbsent > 1 || pastAttendancesAbsent.length"
                class="flex flex-col sm:flex-row justify-between items-center bg-gray-50 border rounded-lg p-3 mt-4">
                <div class="text-sm text-gray-700 mb-2 sm:mb-0">
                    Items {{ (currentPageAbsent - 1) * itemsPerPageAbsent + 1 }} –
                    {{ Math.min(currentPageAbsent * itemsPerPageAbsent, pastAttendancesAbsent.length) }}
                    of {{ pastAttendancesAbsent.length }} |
                    Page {{ currentPageAbsent }} of {{ totalPagesAbsent }}
                </div>

                <div class="flex items-center space-x-2">
                    <label class="text-sm text-gray-700">Items per page:</label>
                    <select v-model="itemsPerPageAbsent" class="border rounded px-2 py-1 text-sm">
                        <option v-for="opt in itemsPerPageOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>

                    <button class="px-3 py-1 text-sm rounded border disabled:opacity-50"
                        :disabled="currentPageAbsent === 1" @click="currentPageAbsent = 1">First</button>

                    <button class="px-3 py-1 text-sm rounded border disabled:opacity-50"
                        :disabled="currentPageAbsent === 1" @click="currentPageAbsent--">Prev</button>

                    <button class="px-3 py-1 text-sm rounded border disabled:opacity-50"
                        :disabled="currentPageAbsent === totalPagesAbsent" @click="currentPageAbsent++">Next</button>

                    <button class="px-3 py-1 text-sm rounded border disabled:opacity-50"
                        :disabled="currentPageAbsent === totalPagesAbsent"
                        @click="currentPageAbsent = totalPagesAbsent">Last</button>
                </div>
            </div>
        </div>
    </div>
</template>