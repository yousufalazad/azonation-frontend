<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const router = useRouter();
const auth = authStore;
const route = useRoute();

const record = ref([]);
const id = ref(route.params.id); // Selected Meeting ID

// Fetch meeting minutes details
const fetchMeetingMinutes = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/meeting-minutes/${id.value}`, {}, 'GET');
        record.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching meeting minutes:', error);
        record.value = [];
    }
};

// Fetch the meeting minutes on component mount
onMounted(() => {
    fetchMeetingMinutes();
});
</script>

<template>
    <div class="container mx-auto max-w-7xl w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Meeting Minutes Details</h5>
            <button @click="router.push({ name: 'index-meeting-minutes' })" class="btn-primary">
                Back to Meeting Minutes List
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <tbody class="text-gray-600 text-md font-medium">
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Meeting ID</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.meeting_id }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Prepared By</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.prepared_by }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Reviewed By</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.reviewed_by }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Minutes</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.minutes }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Decisions</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.decisions }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Note</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.note }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">File Attachments</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.file_attachments }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Start Time</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.start_time }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">End Time</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.end_time }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Follow-Up Tasks</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.follow_up_tasks }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Tags</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.tags }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Action Items</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.action_items }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Meeting Location</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.meeting_location }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Video Link</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">
                            <a :href="record.video_link" target="_blank" class="text-blue-500 underline">{{ record.video_link }}</a>
                        </td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Privacy Setup ID</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.privacy_setup_id }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Approval Status</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.approval_status }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Is Publish</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.is_publish ? 'Yes' : 'No' }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Is Active</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">{{ record.is_active ? 'Yes' : 'No' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>
