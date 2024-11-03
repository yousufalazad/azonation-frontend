<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

// Form Fields
const auth = authStore;
const userId = auth.user.id;
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

// State Management
const isEditMode = ref(false);
const selectedRecordId = ref(null);
const recordList = ref([]);

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

const getRecords = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/get-assets/${userId}`, {}, 'GET');
        recordList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching assets:', error);
        recordList.value = [];
    }
};

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
    isEditMode.value = false;
    selectedRecordId.value = null;
};

const validateForm = () => {
    if (quantity.value < 0 || value_amount.value < 0 || inkind_value.value < 0) {
        Swal.fire('Error!', 'Ensure no numerical values are negative.', 'error');
        return false;
    }
    return true;
};

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
        const apiUrl = isEditMode.value ? `/api/update-asset/${selectedRecordId.value}` : '/api/create-asset';
        const method = isEditMode.value ? 'PUT' : 'POST';
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this asset?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);
            if (response.status) {
                await Swal.fire('Success!', `Asset ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getRecords();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save asset.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} asset:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} asset.`, 'error');
    }
};

const editRecord = (record) => {
    name.value = record.name;
    description.value = record.description;
    is_long_term.value = record.is_long_term ? 1 : 0;
    quantity.value = record.quantity;
    value_amount.value = record.value_amount;
    inkind_value.value = record.inkind_value;
    is_tangible.value = record.is_tangible ? 1 : 0;
    responsible_user_id.value = record.responsible_user_id;
    assignment_start_date.value = record.assignment_start_date;
    assignment_end_date.value = record.assignment_end_date;
    note.value = record.note;
    asset_lifecycle_statuses_id.value = record.asset_lifecycle_statuses_id;
    privacy_setup_id.value = record.privacy_setup_id;
    is_active.value = record.is_active ? 1 : 0;
    selectedRecordId.value = record.id;
    isEditMode.value = true;
};

const deleteRecord = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this asset?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-asset/${id}`, {}, 'DELETE');
            if (response.status) {
                await Swal.fire('Deleted!', 'Asset has been deleted.', 'success');
                getRecords();
            } else {
                Swal.fire('Failed!', 'Failed to delete asset.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting asset:', error);
        Swal.fire('Error!', 'Failed to delete asset.', 'error');
    }
};

onMounted(() => {
    fetchDropdownData(`/api/org-member-list/${userId}`, responsibleUsers);
    fetchDropdownData('/api/asset-lifecycle-setups', assetLifecycleSetups);
    fetchDropdownData('/api/privacy-setups', privacySetups);
    getRecords();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <!-- Asset Form Section -->
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <div>
                    <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Asset</h5>
                </div>
            </div>

            <form @submit.prevent="submitForm">
                <div class="mb-4">
                    <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
                    <input v-model="name" type="text" id="name" class="w-full border-gray-300 rounded-md py-2 px-4"
                        required />
                </div>

                <div class="mb-4">
                    <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                    <input v-model="description" type="text" id="description"
                        class="w-full border-gray-300 rounded-md py-2 px-4" required />
                </div>

                <div class="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label for="quantity" class="block text-gray-700 font-semibold mb-2">Quantity</label>
                        <input v-model="quantity" type="number" id="quantity" min="0"
                            class="w-full border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    <div>
                        <label for="value_amount" class="block text-gray-700 font-semibold mb-2">Value Amount</label>
                        <input v-model="value_amount" type="number" id="value_amount" min="0"
                            class="w-full border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    <div>
                        <label for="inkind_value" class="block text-gray-700 font-semibold mb-2">In-Kind Value</label>
                        <input v-model="inkind_value" type="number" id="inkind_value" min="0"
                            class="w-full border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="is_long_term" class="block text-gray-700 font-semibold mb-2">Is Long Term?</label>
                        <select v-model="is_long_term" id="is_long_term"
                            class="w-full border-gray-300 rounded-md py-2 px-4" required>
                            <option :value="1">Yes</option>
                            <option :value="0">No</option>
                        </select>
                    </div>

                    <div>
                        <label for="is_tangible" class="block text-gray-700 font-semibold mb-2">Is Tangible?</label>
                        <select v-model="is_tangible" id="is_tangible"
                            class="w-full border-gray-300 rounded-md py-2 px-4" required>
                            <option :value="1">Yes</option>
                            <option :value="0">No</option>
                        </select>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="responsible_user_id" class="block text-gray-700 font-semibold mb-2">Responsible
                        User</label>
                    <select v-model="responsible_user_id" id="responsible_user_id"
                        class="w-full border-gray-300 rounded-md py-2 px-4" required>
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
                            class="w-full border-gray-300 rounded-md py-2 px-4" required />
                    </div>

                    <div>
                        <label for="assignment_end_date" class="block text-gray-700 font-semibold mb-2">End Date</label>
                        <input v-model="assignment_end_date" type="date" id="assignment_end_date"
                            class="w-full border-gray-300 rounded-md py-2 px-4" required />
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
                            class="w-full border-gray-300 rounded-md py-2 px-4" required>
                            <option value="" disabled>Select Lifecycle Status</option>
                            <option v-for="status in assetLifecycleSetups" :key="status.id" :value="status.id">{{
                                status.name }}</option>
                        </select>
                    </div>

                    <div>
                        <label for="privacy_setup_id" class="block text-gray-700 font-semibold mb-2">Privacy
                            Setup</label>
                        <select v-model="privacy_setup_id" id="privacy_setup_id"
                            class="w-full border-gray-300 rounded-md py-2 px-4" required>
                            <option value="" disabled>Select Privacy Setup</option>
                            <option v-for="setup in privacySetups" :key="setup.id" :value="setup.id">{{ setup.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="is_active" class="block text-gray-700 font-semibold mb-2">Is Active?</label>
                    <select v-model="is_active" id="is_active" class="w-full border-gray-300 rounded-md py-2 px-4"
                        required>
                        <option :value="1">Yes</option>
                        <option :value="0">No</option>
                    </select>
                </div>

                <div class="flex justify-end space-x-3">
                    <button type="button" @click="resetForm"
                        class="bg-gray-500 hover:bg-gray-400 text-white py-2 px-4 rounded-md">Reset</button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md">
                        {{ isEditMode ? 'Update' : 'Add' }} Asset
                    </button>
                </div>
            </form>
        </section>

        <!-- Asset List Section -->
        <section>
            <h5 class="text-md font-semibold mt-5 mb-3">Assets List</h5>
            <table class="table-auto w-full text-left border-collapse">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="p-3 border">#</th>
                        <th class="p-3 border">Name</th>
                        <th class="p-3 border">Description</th>
                        <th class="p-3 border">Quantity</th>
                        <th class="p-3 border">Value</th>
                        <th class="p-3 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record, index) in recordList" :key="record.id">
                        <td class="p-3 border">{{ index + 1 }}</td>
                        <td class="p-3 border">{{ record.name }}</td>
                        <td class="p-3 border">{{ record.description }}</td>
                        <td class="p-3 border">{{ record.quantity }}</td>
                        <td class="p-3 border">{{ record.value_amount }}</td>
                        <td class="p-3 border">
                            <button @click="editRecord(record)"
                                class="text-white bg-blue-500 hover:bg-blue-400 py-1 px-2 rounded-md mr-2">Edit</button>
                            <button @click="deleteRecord(record.id)"
                                class="text-white bg-red-500 hover:bg-red-400 py-1 px-2 rounded-md">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>
