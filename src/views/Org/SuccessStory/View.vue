<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const record = ref(null);

// Fetch the record details
const fetchRecord = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/success-stories/${id}`, {}, 'GET');
        if (response.status) {
            record.value = response.data;
        } else {
            record.value = null;
        }
    } catch (error) {
        console.error('Error fetching record:', error);
        record.value = null;
    }
};

onMounted(() => {
    fetchRecord();
});
</script>

<template>
    <div class="max-w-4xl mx-auto w-full mt-10 bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">View Success Story</h5>
            <button
                @click="router.push({ name: 'success-story' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700"
            >
                Back to Success Story
            </button>
        </div>

        <section v-if="record" class="mb-5">
            <h5 class="text-lg font-semibold mb-3">{{ record.title }}</h5>
            <div class="mb-4">
                <p class="text-gray-700 mb-2 font-semibold">Story:</p>
                <p class="text-gray-600">{{ record.story }}</p>
            </div>
           
            <div>
                <p class="text-gray-700 font-semibold mb-1">Status:</p>
                <span :class="record.status == 1 ? 'text-green-600' : 'text-red-600'">
                    {{ record.status == 1 ? 'Active' : 'Disabled' }}
                </span>
            </div>
        </section>

        <section v-else class="text-center">
            <p class="text-red-500">Record not found or failed to fetch details.</p>
        </section>
    </div>
</template>

<style scoped>
/* Add custom styles if needed */
</style>