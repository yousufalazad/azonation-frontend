<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const route = useRoute();
const router = useRouter();
const record = ref([]);

const assetId = route.params.id;


// Selected Record ID
const selectedRecordId = ref(route.params.id);

// Fetch Event details on mount
const fetchAssetDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/assets/${assetId}`, {}, 'GET');
        // const response = await auth.fetchProtectedApi(`/api/events/event/${selectedRecordId.value}`, {}, 'GET');
        record.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching events:', error);
        record.value = [];
    }
};

// Fetch the Event details on component mount
onMounted(() => {
    fetchAssetDetails();
});
</script>
<template>
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">View Asset</h5>
            <button @click="$router.push({ name: 'index-asset' })"
                class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                Back to Asset List
            </button>
        </div>
        <!-- Event Details Table -->
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <tbody>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Name</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.name }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Description</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.description }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Quantity</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.quantity }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Asset Start Date</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.start_date }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Asset End Date</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.end_date }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Value</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.value_amount }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">In-kind Value</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.inkind_value }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Long Term</td>
                        <td class="p-2">:</td>
                        <td class="p-2">
                            <span :class="record.is_long_term === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ record.is_long_term === 0 ? 'No' : 'Yes' }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Tangible</td>
                        <td class="p-2">:</td>
                        <td class="p-2">
                            <span :class="record.is_tangible === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ record.is_tangible === 0 ? 'No' : 'Yes' }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Responsible User</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.responsible_user_first_name }} {{ record.responsible_user_last_name }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Assignment Start Date</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.assignment_start_date }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Assignment End Date</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.assignment_end_date }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Asset Lifecycle Status</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.asset_lifecycle_statuses_name }}</td>
                    </tr>

                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Privacy Setup</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.privacy_setup_name }}</td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Active</td>
                        <td class="p-2">:</td>
                        <td class="p-2">
                            <span :class="record.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ record.is_active === 0 ? 'No' : 'Yes' }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td class="p-2 text-left font-semibold w-36">Note</td>
                        <td class="p-2">:</td>
                        <td class="p-2">{{ record.note }}</td>
                    </tr>
                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Images</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">
                            <div v-if="record.images && record.images.length">
                                <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <img v-for="(img, index) in record.images" :key="img.id || index"
                                        :src="img.image_url" alt="History Image" class="max-w-full rounded-lg" />
                                </div>
                            </div>
                            <div v-else>
                                <p class="text-gray-700">No images available</p>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td class="px-2 py-2 text-left font-semibold w-36">Documents</td>
                        <td>:</td>
                        <td class="px-2 py-2 text-left">
                            <div v-if="record.documents && record.documents.length">
                                <ul class="mt-2 list-disc list-inside text-blue-600">
                                    <li v-for="(doc, index) in record.documents" :key="doc.id || index">
                                        <a :href="doc.document_url" target="_blank" class="hover:text-blue-800">
                                            {{ doc.file_name || 'Download Document' }}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>