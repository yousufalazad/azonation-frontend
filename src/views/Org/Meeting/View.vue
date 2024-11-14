<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';
const router = useRouter();

const auth = authStore;
const route = useRoute();
const record = ref([]);

// Selected Record ID
const selectedRecordId = ref(route.params.id);

// Fetch meeting details on mount
const fetchMeetingDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/get-meeting/${selectedRecordId.value}`, {}, 'GET');
        record.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching meetings:', error);
        record.value = [];
    }
};

// Fetch the meeting details on component mount
onMounted(() => {
    fetchMeetingDetails();
});
</script>

<template>
    <div class="container mx-auto max-w-7xl w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Meeting Details</h5>
            <button @click="router.push({ name: 'index-meeting' })" class="btn-primary">
                Back to Meeting List
            </button>
        </div>
        
        <div class="overflow-x-auto">
  <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
    <tbody class="text-gray-600 text-md font-medium">
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">ID</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.user_id }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Name</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.name }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Short Name</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.short_name }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Subject</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.subject }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Date</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.date }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Time</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.time }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Description</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.description }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Address</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.address }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Agenda</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.agenda }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Requirements</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.requirements }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Note</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.note }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Status</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.status === 0 ? 'Active' : 'Disabled' }}</td>
      </tr>
      <tr>
        <td class="px-2 py-2 text-left font-semibold w-36">Conduct Type</td>
        <td>:</td>
        <td class="px-2 py-2 text-left">{{ record.conduct_type_name }}</td>
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