<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = authStore;

// Form fields
const membership_type_id = ref('');
const starts_on = ref('');
const ends_on = ref('');
const is_active = ref('1'); // Default Active
const is_public = ref('1'); // Default Public
const sort_order = ref(0);
const meta = ref('');

const isEditMode = ref(false);
const selectedOrgMembershipTypeId = ref(null);
const orgMembershipTypeList = ref([]);

// Modal control
const showModal = ref(false);

// Fetch all organisation membership types
const getOrgMembershipTypes = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-membership-types', {}, 'GET');
        orgMembershipTypeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching organisation membership types:', error);
        orgMembershipTypeList.value = [];
    }
};

// Reset form
const resetForm = () => {
    membership_type_id.value = '';
    starts_on.value = '';
    ends_on.value = '';
    is_active.value = '1';
    is_public.value = '1';
    sort_order.value = 0;
    meta.value = '';
    selectedOrgMembershipTypeId.value = null;
    isEditMode.value = false;
};

// Open modal for Add/Edit
const openModal = (item = null) => {
    resetForm();
    if (item) {
        membership_type_id.value = item.membership_type_id;
        starts_on.value = item.starts_on || '';
        ends_on.value = item.ends_on || '';
        is_active.value = item.is_active ? '1' : '0';
        is_public.value = item.is_public ? '1' : '0';
        sort_order.value = item.sort_order ?? 0;
        meta.value = item.meta ? JSON.stringify(item.meta) : '';
        selectedOrgMembershipTypeId.value = item.id;
        isEditMode.value = true;
    }
    showModal.value = true;
};

// Close modal
const closeModal = () => {
    resetForm();
    showModal.value = false;
};

// Submit (Add/Update)
const submitForm = async () => {
    const payload = {
        membership_type_id: membership_type_id.value,
        starts_on: starts_on.value || null,
        ends_on: ends_on.value || null,
        is_active: is_active.value,
        is_public: is_public.value,
        sort_order: sort_order.value,
        meta: meta.value || null
    };

    try {
        let apiUrl = '/api/org-membership-types';
        let method = 'POST';

        if (isEditMode.value && selectedOrgMembershipTypeId.value) {
            apiUrl = `/api/org-membership-types/${selectedOrgMembershipTypeId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this organisation membership type?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Organisation membership type ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getOrgMembershipTypes();
                closeModal();
            } else {
                Swal.fire('Failed!', 'Failed to save organisation membership type.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} organisation membership type:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} organisation membership type.`, 'error');
    }
};

const membershipTypes = ref([])
// ✅ Fetch membership types
const fetchMembershipType = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/membership-types', {}, 'GET')
        membershipTypes.value = response.status ? response.data : []
    } catch (error) {
        console.error('Error fetching membership types:', error)
    }
}
// Fetch on mount
onMounted(() => {
    getOrgMembershipTypes();
    fetchMembershipType();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-11/12">
        <section class="bg-white shadow-md rounded-xl border">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                <h5 class="text-lg font-semibold text-gray-700">Organisation Membership Types</h5>
                <button @click="openModal()"
                    class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 w-full sm:w-auto">
                    Add Organisation Membership Type
                </button>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto p-4">
                <table class="min-w-full table-auto border-collapse border border-gray-200 text-sm text-left">
                    <thead class="bg-gray-100">
                        <tr class="text-gray-700">
                            <th class="border px-4 py-2">SL</th>
                            <th class="py-2 px-4 border">Membership Type</th>
                            <th class="py-2 px-4 border">Starts On</th>
                            <th class="py-2 px-4 border">Ends On</th>
                            <th class="py-2 px-4 border">Active</th>
                            <th class="py-2 px-4 border">Public</th>
                            <th class="py-2 px-4 border">Sort Order</th>
                            <th class="py-2 px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in orgMembershipTypeList" :key="item.id">
                            <td class="py-2 px-4 border">{{ index + 1 }}</td>
                            <td class="py-2 px-4 border">{{ item.membership_type_id }}</td>
                            <td class="py-2 px-4 border">{{ item.starts_on ?? '-' }}</td>
                            <td class="py-2 px-4 border">{{ item.ends_on ?? '-' }}</td>
                            <td class="py-2 px-4 border">
                                <span :class="Number(item.is_active) === 0 ? 'text-red-500' : 'text-green-500'">
                                    {{ Number(item.is_active) === 0 ? 'Inactive' : 'Active' }}
                                </span>
                            </td>
                            <td class="py-2 px-4 border">
                                <span :class="Number(item.is_public) === 0 ? 'text-red-500' : 'text-green-500'">
                                    {{ Number(item.is_public) === 0 ? 'Hidden' : 'Public' }}
                                </span>
                            </td>
                            <td class="py-2 px-4 border">{{ item.sort_order }}</td>
                            <td class="py-2 px-4 border flex gap-2">
                                <button @click="openModal(item)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Edit
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div class="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <!-- Header -->
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h5 class="text-lg font-semibold">{{ isEditMode ? 'Edit' : 'Add' }} Organisation Membership Type
                    </h5>
                    <button @click="closeModal" class="text-gray-500 hover:text-gray-700">✖</button>
                </div>

                <!-- Form -->
                <form @submit.prevent="submitForm" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Membership Type ID -->
                        <div>
                            <label for="membership_type_id" class="block text-sm font-medium text-gray-700">Membership
                                type</label>
                            <select v-model="membership_type_id" id="membership_type_id"
                                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                <option value="" disabled>Select membership type</option>
                                <option v-for="membershipType in membershipTypes" :key="membershipType.id"
                                    :value="membershipType.id">
                                    {{ membershipType.name }}
                                </option>
                            </select>
                        </div>
                        <!-- Starts On -->
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1">Starts On</label>
                            <input v-model="starts_on" type="date"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>

                        <!-- Ends On -->
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1">Ends On</label>
                            <input v-model="ends_on" type="date"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>

                        <!-- Active Status -->
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1">Active</label>
                            <select v-model="is_active" class="w-full border border-gray-300 rounded-md p-2">
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>

                        <!-- Public Status -->
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1">Public</label>
                            <select v-model="is_public" class="w-full border border-gray-300 rounded-md p-2">
                                <option value="1">Public</option>
                                <option value="0">Hidden</option>
                            </select>
                        </div>

                        <!-- Sort Order -->
                        <div>
                            <label class="block text-gray-700 font-semibold mb-1">Sort Order</label>
                            <input v-model="sort_order" type="number"
                                class="w-full border border-gray-300 rounded-md py-2 px-3" />
                        </div>

                        <!-- Meta -->
                        <div class="col-span-2">
                            <label class="block text-gray-700 font-semibold mb-1">Meta (JSON)</label>
                            <textarea v-model="meta" rows="3"
                                class="w-full border border-gray-300 rounded-md p-2"></textarea>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="flex justify-end gap-3 mt-4">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Submit' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 hover:bg-yellow-700">Reset</button>
                        <button type="button" @click="closeModal"
                            class="bg-gray-500 text-white rounded-md py-2 px-4 hover:bg-gray-600">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>