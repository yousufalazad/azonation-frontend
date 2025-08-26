<script setup>
import { ref, onMounted } from 'vue';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const recordId = ref(null);
const recordDetails = ref({});
const sanitizedGoals = ref('');
const sanitizedActivities = ref('');

const fetchRecordDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/view-year-plan/${recordId.value}`, {}, 'GET');
        if (response.status) {
            recordDetails.value = response.data;
            sanitizedGoals.value = DOMPurify.sanitize(recordDetails.value.goals);
            sanitizedActivities.value = DOMPurify.sanitize(recordDetails.value.activities);
        } else {
            console.error('Failed to fetch record details');
        }
    } catch (error) {
        console.error('Error fetching record details:', error);
    }
};

// Get the record ID from the route
onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    recordId.value = urlParams.get('id');
    if (recordId.value) {
        fetchRecordDetails();
    }
});
</script>

<template>
    <div class="max-w-4xl mx-auto mt-5">
        <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h5 class="text-xl font-semibold">Year Plan Details</h5>
                <button @click="$router.push({ name: 'year-plan' })"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                    Back to Year Plan List
                </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h3 class="text-gray-700 font-semibold">Start Year</h3>
                    <p class="text-gray-800">{{ recordDetails.start_year }}</p>
                </div>
                <div>
                    <h3 class="text-gray-700 font-semibold">End Year</h3>
                    <p class="text-gray-800">{{ recordDetails.end_year }}</p>
                </div>
                <div>
                    <h3 class="text-gray-700 font-semibold">Budget</h3>
                    <p class="text-gray-800">${{ recordDetails.budget }}</p>
                </div>
                <div>
                    <h3 class="text-gray-700 font-semibold">Start Date</h3>
                    <p class="text-gray-800">{{ recordDetails.start_date }}</p>
                </div>
                <div>
                    <h3 class="text-gray-700 font-semibold">End Date</h3>
                    <p class="text-gray-800">{{ recordDetails.end_date }}</p>
                </div>
                <div>
                    <h3 class="text-gray-700 font-semibold">Privacy Setup</h3>
                    <p class="text-gray-800">
                        <span v-if="recordDetails.privacy_setup_id === 1">Only Me</span>
                        <span v-else-if="recordDetails.privacy_setup_id === 2">Organization</span>
                        <span v-else-if="recordDetails.privacy_setup_id === 3">Public</span>
                    </p>
                </div>
                <div>
                    <h3 class="text-gray-700 font-semibold">Published</h3>
                    <p class="text-gray-800">
                        <span v-if="recordDetails.published === 1">Yes</span>
                        <span v-else>No</span>
                    </p>
                </div>
                <div>
                    <h3 class="text-gray-700 font-semibold">Status</h3>
                    <p class="text-gray-800">
                        <span v-if="recordDetails.status === 1">Active</span>
                        <span v-else>Inactive</span>
                    </p>
                </div>
            </div>

            <!-- Goals -->
            <div class="mt-6">
                <h3 class="text-gray-700 font-semibold mb-2">Goals</h3>
                <div v-html="sanitizedGoals" class="prose"></div>
            </div>

            <!-- Activities -->
            <div class="mt-6">
                <h3 class="text-gray-700 font-semibold mb-2">Activities</h3>
                <div v-html="sanitizedActivities" class="prose"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.prose {
    max-width: 100%;
}
</style>
