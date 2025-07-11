<script setup>
import { ref } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';

const auth = authStore;
const searchQuery = ref('');
const searchResults = ref([]);
const administrators = ref([]);
const formerAdministrators = ref([]);
const today = new Date().toISOString().split('T')[0];
const showEditModal = ref(false);
const showSearchModal = ref(false);
const editForm = ref({});
const orgTypeUserId = auth.user.id;
const searchLoading = ref(false);

const fetchAdministrators = async () => {
    const res = await auth.fetchProtectedApi('/api/org-administrators');
    if (res && Array.isArray(res)) {
        administrators.value = res.filter(admin => admin.is_primary === 1);
        formerAdministrators.value = res.filter(admin => admin.is_primary === 0);
    } else {
        Swal.fire('Error', 'Failed to load administrators.', 'error');
    }
};

const openSearchModal = () => {
    searchQuery.value = '';
    searchResults.value = [];
    showSearchModal.value = true;
};

const searchIndividuals = async () => {
    const currentQuery = searchQuery.value.trim();
    if (!currentQuery) {
        searchResults.value = [];
        searchLoading.value = false;
        return;
    }
    searchLoading.value = true;
    try {
        const response = await auth.fetchProtectedApi('/api/org-members/search', { query: currentQuery }, 'POST');
        if (searchQuery.value.trim() === currentQuery && response.status) {
            const individuals = response.data;
            const updatedResults = await Promise.all(
                individuals.map(async (individual) => {
                    const checkRes = await auth.fetchProtectedApi(
                        '/api/org-administrators/check',
                        {
                            org_type_user_id: orgTypeUserId,
                            individual_type_user_id: individual.id,
                        },
                        'POST'
                    );
                    return {
                        ...individual,
                        already_added: checkRes.status && checkRes.data.exists,
                    };
                })
            );
            searchResults.value = updatedResults;
        } else {
            searchResults.value = [];
        }
    } catch (error) {
        console.error("Error searching individuals:", error);
        searchResults.value = [];
    } finally {
        searchLoading.value = false;
    }
};

const addAdministrator = async (individualTypeUserId) => {
    const today = new Date().toISOString().split("T")[0];
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to set this administrator as primary?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'No, cancel!'
        });
        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(
                '/api/org-administrators',
                {
                    individual_type_user_id: individualTypeUserId,
                    start_date: today,
                    is_primary: 1,
                    is_active: 1
                },
                'POST'
            );
            if (response.message) {
                await Swal.fire('Added!', 'Administrator added as primary.', 'success');
                searchResults.value = [];
                searchQuery.value = '';
                showSearchModal.value = false;
                fetchAdministrators();
            } else {
                Swal.fire('Failed!', 'Failed to add administrator.', 'error');
            }
        }
    } catch (error) {
        console.error("Error adding administrator:", error);
        Swal.fire('Error!', 'Failed to add administrator.', 'error');
    }
};

const openEditModal = (admin) => {
    editForm.value = { ...admin };
    showEditModal.value = true;
};

const updateAdministrator = async () => {
    const startDate = new Date(editForm.value.start_date);
    const endDate = editForm.value.end_date ? new Date(editForm.value.end_date) : null;
    const today = new Date();

    if (editForm.value.is_primary === 1 && endDate) {
        await Swal.fire('Error!', 'Active administrator cannot have an end date.', 'error');
        return;
    }

    if (endDate) {
        if (endDate < startDate) {
            await Swal.fire('Error!', 'End date cannot be before start date.', 'error');
            return;
        }
    }

    const response = await auth.fetchProtectedApi(
        `/api/org-administrators/${editForm.value.id}`,
        editForm.value,
        'PUT'
    );
    if (response.message) {
        await Swal.fire('Updated!', 'Administrator updated successfully.', 'success');
        showEditModal.value = false;
        fetchAdministrators();
    } else {
        Swal.fire('Failed!', 'Failed to update administrator.', 'error');
    }
};


fetchAdministrators();
</script>

<template>
    <div class="add-member max-w-7xl mx-auto p-8">
        <button @click="openSearchModal" class="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Add Organisation Administrator
        </button>

        <!-- Search Modal -->
        <div v-if="showSearchModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
                <div class="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 class="text-xl font-semibold text-gray-800">Search</h2>
                    <button @click="showSearchModal = false" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>


                <!-- // Search Input -->
                <div class="flex mb-4">
                    <input type="text" v-model="searchQuery"
                        placeholder="Search by name, email, mobile, username or Azon Id"
                        class="w-full p-2 border rounded-l" />
                    <button @click="searchIndividuals"
                        class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600">
                        Search
                    </button>
                </div>

                <!-- Loading Spinner and Search Results-->
                <div class="max-h-[400px] overflow-y-auto">
                    <div v-if="searchLoading" class="py-4 text-xl text-center text-blue-600">Searching...</div>

                    <ul v-else-if="searchResults.length" class="divide-y py-2 divide-gray-200">
                        <li v-for="individualUser in searchResults" :key="individualUser.id"
                            class="flex items-center py-4">
                            <img :src="individualUser.image_url ? individualUser.image_url : placeholderImage"
                                alt="Profile picture" class="w-16 h-16 rounded-full object-cover mr-4" />

                            <div class="flex-1">
                                <p class="font-medium">{{ individualUser.first_name }} {{ individualUser.last_name }}
                                </p>
                                <p class="text-xs text-gray-500">Azon Id: {{ individualUser.azon_id }}</p>
                                <p class="text-xs text-gray-500">City: {{ individualUser.city }}</p>
                                <p class="text-xs text-gray-500">Country: {{ individualUser.country }}</p>
                            </div>

                            <div class="ml-4">
                                <button v-if="!individualUser.already_added"
                                    class="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded"
                                    @click="addAdministrator(individualUser.id)">
                                    Set as Primary Administrator
                                </button>
                                <span v-else class="text-xs text-gray-500 font-medium">
                                    Already Administrator
                                </span>
                            </div>
                        </li>
                    </ul>

                    <div v-else-if="searchQuery && !searchLoading" class="py-4 text-center text-gray-500">
                        No results found.
                    </div>
                </div>


                <!-- Cancel Button -->
                <div class="flex justify-end">
                    <button @click="showSearchModal = false"
                        class="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <h2 class="mt-12 mb-4 text-lg text-gray-600 font-semibold">Current Administrator</h2>
        <div v-if="administrators.length" class="space-y-4">
            <div v-for="admin in administrators" :key="admin.id" class="flex items-center bg-white p-4 rounded shadow">
                <img :src="admin.image_url || placeholderImage" alt="Profile"
                    class="w-12 h-12 rounded-full object-cover mr-4" />
                <div class="flex-1">
                    <p class="font-medium">{{ admin.individual_user?.first_name }} {{ admin.individual_user?.last_name
                    }}</p>
                    <p class="py-1 text-sm text-gray-400">Azon Id: {{ admin.individual_user?.azon_id }}</p>
                    <p class="py-2 text-xs text-gray-400">From: {{ admin.start_date }}</p>
                    <p class="py-1 text-xs text-gray-400">Admin note: {{ admin.admin_note }}</p>
                </div>
                <button @click="openEditModal(admin)"
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
            </div>
        </div>

        <h2 class="mt-12 mb-4 text-lg text-gray-600 font-semibold">Former Administrators</h2>
        <div class="space-y-4">
            <div v-for="admin in formerAdministrators" :key="admin.id"
                class="flex items-center bg-gray-50 p-4 rounded shadow">
                <img :src="admin.image_url || placeholderImage" alt="Profile"
                    class="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                    <p class="font-medium">{{ admin.individual_user?.first_name }} {{ admin.individual_user?.last_name
                        }}</p>
                    <p class="py-1 text-xs text-gray-400">Azon Id: {{ admin.individual_user?.azon_id }}</p>
                    <p class="py-1 text-xs text-gray-400">From: {{ admin.start_date }}</p>
                    <p class="py-1 text-xs text-gray-400">To: {{ admin.end_date }}</p>
                    <p class="py-1 text-xs text-gray-400">Admin note: {{ admin.admin_note }}</p>
                </div>
                <button @click="openEditModal(admin)"
                    class="ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
            </div>
        </div>



        <!-- Edit Modal -->
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
                <div class="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 class="text-xl font-semibold text-gray-800">Edit Administrator</h2>
                    <button @click="showEditModal = false" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <div class="text-center mb-6">
                    <img :src="editForm.image_url || placeholderImage" alt="Administrator Image"
                        class="h-24 w-24 rounded-full object-cover mx-auto mb-4" />
                    <h2 class="text-2xl font-semibold text-gray-800">{{ editForm.individual_user?.first_name }} {{
                        editForm.individual_user?.last_name }}</h2>
                    <p class="text-sm text-gray-500">Unique Azon Id: {{ editForm.individual_user?.azon_id }}</p>
                </div>

                <form @submit.prevent="updateAdministrator">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Start Date</label>
                            <input v-model="editForm.start_date" type="date"
                                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" :max="today" />
                        </div>

                        <div v-if="editForm.is_primary !== 1">
                            <label class="block text-sm font-medium text-gray-700">End Date</label>
                            <input v-model="editForm.end_date" type="date"
                                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                :min="editForm.start_date" />
                        </div>


                        <div>
                            <label class="block text-sm font-medium text-gray-700">Admin Note</label>
                            <textarea v-model="editForm.admin_note" rows="3"
                                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end gap-3">
                        <button type="submit"
                            class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg">
                            Save
                        </button>
                        <button @click="showEditModal = false" type="button"
                            class="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>

<style scoped></style>
