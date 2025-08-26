<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';

const auth = authStore;
const router = useRouter();
const route = useRoute();

const id = route.params.id;
const record = ref(null);

// Fetch the record details
const fetchRecord = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/recognitions/${id}`, {}, 'GET');
        if (response.status) {
            record.value = response.data;
        } else {
            Swal.fire('Error', 'Failed to fetch record details.', 'error');
            router.push({ name: 'recognition-list' });
        }
    } catch (error) {
        console.error('Error fetching record:', error);
        Swal.fire('Error', 'An error occurred. Please try again.', 'error');
        router.push({ name: 'recognition-list' });
    }
};

// Sanitize description
const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'p', 'ul', 'li', 'strong', 'em', 'br'],
    });
};

onMounted(() => {
    fetchRecord();
});
</script>

<template>
    <div class="container mx-auto max-w-4xl p-6 bg-white rounded-lg shadow-md mt-10">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Recognition Details</h5>
            <button @click="router.push({ name: 'recognition' })"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
                Back to Recognition List
            </button>
        </div>

        <div v-if="record" class="space-y-4">
            <div>
                <strong>Title:</strong> {{ record.title }}
            </div>
            <div>
                <strong>Description:</strong>
                <div v-html="sanitize(record.description)" class="border p-3 rounded bg-gray-50"></div>
            </div>
            <div>
                <strong>Recognition Date:</strong> {{ record.recognition_date }}
            </div>
            <div>
                <strong>Privacy:</strong>
                {{ record.privacy_name}}
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Images</label>
                <div v-if="record.images && record.images.length">
                    <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <img v-for="(img, index) in record.images" :key="img.id || index" :src="img.image_url"
                            alt="History Image" class="max-w-full rounded-lg" />
                    </div>
                </div>
                <div v-else>
                    <p class="text-gray-700">No images available</p>
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Documents</label>
                <div v-if="record.documents && record.documents.length">
                    <ul class="mt-2 list-disc list-inside text-blue-600">
                        <li v-for="(doc, index) in record.documents" :key="doc.id || index">
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
                <strong>Status:</strong> {{ record.is_active === 1 ? 'Active' : 'Disabled' }}
            </div>
        </div>

        <div v-else class="text-center py-6">
            <p class="text-red-500">Failed to load the record.</p>
        </div>
    </div>
</template>