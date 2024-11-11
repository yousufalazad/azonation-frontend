<script setup>
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

const auth = authStore;
const userId = auth.user.id;

// Form Fields
const name = ref('');
const description = ref('');
const is_long_term = ref(1); // Default to 1 (true)
const quantity = ref(1);
const value_amount = ref(0);
const inkind_value = ref(0);
const is_tangible = ref(1); // Default to 1 (true)
const responsible_user_id = ref(null);
const assignment_start_date = ref('');
const assignment_end_date = ref('');
const note = ref('');
const asset_lifecycle_statuses_id = ref(null);
const privacy_setup_id = ref(null);
const is_active = ref(1); // Default to 1 (true)

// Dropdown Data
const responsibleUsers = ref([]);
const assetLifecycleSetups = ref([]);
const privacySetups = ref([]);

// Fetch Data from API
const fetchDropdownData = async (url, stateRef) => {
    try {
        const response = await auth.fetchProtectedApi(url, {}, 'GET');
        if (response.status) stateRef.value = response.data;
    } catch (error) {
        console.error(`Error fetching ${url.split('/').pop()}:`, error);
    }
};

// Reset form fields
const resetForm = () => {
    name.value = '';
    description.value = '';
    is_long_term.value = 1;
    quantity.value = 1;
    value_amount.value = 0;
    inkind_value.value = 0;
    is_tangible.value = 1;
    responsible_user_id.value = null;
    assignment_start_date.value = '';
    assignment_end_date.value = '';
    note.value = '';
    asset_lifecycle_statuses_id.value = null;
    privacy_setup_id.value = null;
    is_active.value = 1;
    selectedRecordId.value = null;
};

const validateForm = () => {
    if (quantity.value < 0 || value_amount.value < 0 || inkind_value.value < 0) {
        Swal.fire('Error!', 'Ensure no numerical values are negative.', 'error');
        return false;
    }
    return true;
};

// Submit form (create event)
const submitForm = async () => {
    if (!validateForm()) return;

    const payload = {
        user_id: userId,
        name: name.value,
        description: description.value,
        is_long_term: !!is_long_term.value,
        quantity: quantity.value,
        value_amount: value_amount.value,
        inkind_value: inkind_value.value,
        is_tangible: !!is_tangible.value,
        responsible_user_id: responsible_user_id.value,
        assignment_start_date: assignment_start_date.value,
        assignment_end_date: assignment_end_date.value,
        note: note.value,
        asset_lifecycle_statuses_id: asset_lifecycle_statuses_id.value,
        privacy_setup_id: privacy_setup_id.value,
        is_active: !!is_active.value
    };

    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to add this event?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi('/api/create-asset', payload, 'POST');

            if (response.status) {
                Swal.fire('Success!', 'Event added successfully.', 'success').then(() => {
                    // Redirect to event list
                    router.push({ name: 'index-asset' });
                });
            } else {
                Swal.fire('Failed!', 'Failed to added event.', 'error');
            } 
        }
    } catch (error) {
        console.error('Error adding event:', error);
        Swal.fire('Error!', 'Failed to add event.', 'error');
    }
};

onMounted(() => {
    fetchDropdownData(`/api/org-member-list/${userId}`, responsibleUsers);
    fetchDropdownData('/api/asset-lifecycle-setups', assetLifecycleSetups);
    fetchDropdownData('/api/privacy-setups', privacySetups);
});
</script>

<template>
    <div class="container mx-auto max-w-7xl mx-auto w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
        <div class="flex justify-between items-center mb-6">
            <h5 class="text-xl font-semibold">Add New Asset</h5>
            <button @click="$router.push({ name: 'index-asset' })"
                class="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                Back to Asset List
            </button>
        </div>

        <form @submit.prevent="submitForm">
                <div class="mb-4">
                    <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
                    <input v-model="name" type="text" id="name" class="w-full border border-gray-300 rounded-md py-2 px-4"
                        required />
                </div>

                <div class="mb-4">
                    <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                    <input v-model="description" type="text" id="description"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                </div>

                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label for="quantity" class="block text-gray-700 font-semibold mb-2">Quantity</label>
                        <input v-model="quantity" type="number" id="quantity" min="0"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    <div>
                        <label for="value_amount" class="block text-gray-700 font-semibold mb-2">Value Amount</label>
                        <input v-model="value_amount" type="number" id="value_amount" min="0"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    <div>
                        <label for="inkind_value" class="block text-gray-700 font-semibold mb-2">In-Kind Value</label>
                        <input v-model="inkind_value" type="number" id="inkind_value" min="0"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="is_long_term" class="block text-gray-700 font-semibold mb-2">Is Long Term?</label>
                        <select v-model="is_long_term" id="is_long_term"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required>
                            <option :value="1">Yes</option>
                            <option :value="0">No</option>
                        </select>
                    </div>

                    <div>
                        <label for="is_tangible" class="block text-gray-700 font-semibold mb-2">Is Tangible?</label>
                        <select v-model="is_tangible" id="is_tangible"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required>
                            <option :value="1">Yes</option>
                            <option :value="0">No</option>
                        </select>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="responsible_user_id" class="block text-gray-700 font-semibold mb-2">Responsible
                        User</label>
                    <select v-model="responsible_user_id" id="responsible_user_id"
                        class="w-full  border border-gray-300 rounded-md py-2 px-4" required>
                        <option value="" disabled>Select Responsible User</option>
                        <option v-for="user in responsibleUsers" :key="user.individual.id" :value="user.individual.id">
                            {{ user.individual.name }}</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="assignment_start_date" class="block text-gray-700 font-semibold mb-2">Start
                            Date</label>
                        <input v-model="assignment_start_date" type="date" id="assignment_start_date"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                    </div>

                    <div>
                        <label for="assignment_end_date" class="block text-gray-700 font-semibold mb-2">End Date</label>
                        <input v-model="assignment_end_date" type="date" id="assignment_end_date"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                </div>

                <div class="mb-4">
                    <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
                    <input v-model="note" type="text" id="note"
                        class="w-full border border-gray-300 rounded-md py-2 px-4" placeholder="Optional note" />
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="asset_lifecycle_statuses_id"
                            class="block text-gray-700 font-semibold mb-2">Lifecycle Status</label>
                        <select v-model="asset_lifecycle_statuses_id" id="asset_lifecycle_statuses_id"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required>
                            <option value="" disabled>Select Lifecycle Status</option>
                            <option v-for="status in assetLifecycleSetups" :key="status.id" :value="status.id">{{
                                status.name }}</option>
                        </select>
                    </div>

                    <div>
                        <label for="privacy_setup_id" class="block text-gray-700 font-semibold mb-2">Privacy
                            Setup</label>
                        <select v-model="privacy_setup_id" id="privacy_setup_id"
                            class="w-full  border border-gray-300 rounded-md py-2 px-4" required>
                            <option value="" disabled>Select Privacy Setup</option>
                            <option v-for="setup in privacySetups" :key="setup.id" :value="setup.id">{{ setup.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="is_active" class="block text-gray-700 font-semibold mb-2">Is Active?</label>
                    <select v-model="is_active" id="is_active" class="w-full  border border-gray-300 rounded-md py-2 px-4"
                        required>
                        <option :value="1">Yes</option>
                        <option :value="0">No</option>
                    </select>
                </div>

                <div class="flex justify-end gap-4">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Asset</button>
                <button type="button" @click="resetForm" class="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">Reset</button>
            </div>
            </form>
    </div>
</template>