<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const successStory = ref(null);

// Fetch the successStory details
const fetchSuccessStory = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/success-stories/${id}`, {}, 'GET');
        if (response.status) {
            successStory.value = response.data;
        } else {
            successStory.value = null;
        }
    } catch (error) {
        console.error('Error fetching successStory:', error);
        successStory.value = null;
    }
};

onMounted(() => {
    fetchSuccessStory();
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

        <section v-if="successStory" class="mb-5">
            <!-- {{successStory}} -->
            <h5 class="text-lg font-semibold mb-3">{{ successStory.title }}</h5>
            <div class="mb-4">
                <p class="text-gray-700 mb-2 font-semibold">Story:</p>
                <p class="text-gray-600">{{ successStory.story }}</p>
            </div>

            <!-- {{successStory.images}} -->

            <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Images</label>
            <div v-if="successStory.images && successStory.images.length">
                <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <img v-for="(img, index) in successStory.images" :key="img.id || index" :src="img.image_url"
                    alt="History Image" class="max-w-full rounded-lg" />
                </div>
            </div>
            <div v-else>
                <p class="text-gray-700">No images available</p>
            </div>
            </div>

            <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Documents</label>
          <div v-if="successStory.documents && successStory.documents.length">
            <ul class="mt-2 list-disc list-inside text-blue-600">
              <li v-for="(doc, index) in successStory.documents" :key="doc.id || index">
                <a :href="doc.document_url" target="_blank" class="hover:text-blue-800">
                  {{ doc.file_name || 'Download Document' }}
                </a>
              </li>
            </ul>
          </div>
          <div v-else>
            <p class="text-gray-700">No documents available</p>
          </div>
        </div>

            <div>
                <p class="text-gray-700 font-semibold mb-1">Status:</p>
                <span :class="successStory.status == 1 ? 'text-green-600' : 'text-red-600'">
                    {{ successStory.status == 1 ? 'Active' : 'Disabled' }}
                </span>
            </div>
        </section>

        <section v-else class="text-center">
            <p class="text-red-500">successStory not found or failed to fetch details.</p>
        </section>
    </div>
</template>

<style scoped>
/* Add custom styles if needed */
</style>