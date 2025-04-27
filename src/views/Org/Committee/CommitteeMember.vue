<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();
const auth = authStore;

const isModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isEditMode = ref(false);
const selectedCommitteeMemberId = ref(null);

const user_id = ref('');
const designation_id = ref('');
const start_date = ref('');
const end_date = ref('');
const note = ref('');
const status = ref('1');

const viewData = ref({});
const userList = ref([]);
const designationList = ref([]);
const committeeMemberList = ref([]);

const committeeId = ref(route.params.committeeId || null);
console.log('committeeId', committeeId.value);

const getOrgUserList = async () => {
    const res = await auth.fetchProtectedApi('/api/project-attendances/org-user-list', {}, 'GET');
    if (res.status) userList.value = res.data;
};

const getDesignationList = async () => {
    const res = await auth.fetchProtectedApi('/api/designations', {}, 'GET');
    if (res.status) designationList.value = res.data;
};

const getCommitteeMemberList = async () => {
    const res = await auth.fetchProtectedApi(`/api/committee-members/${committeeId.value}`, {}, 'GET');
    if (res.status) committeeMemberList.value = res.data;
};

const resetForm = () => {
    user_id.value = '';
    designation_id.value = '';
    start_date.value = '';
    end_date.value = '';
    note.value = '';
    status.value = '1';
    selectedCommitteeMemberId.value = null;
    isEditMode.value = false;
    isModalOpen.value = false;
};

const openModalForAdd = () => {
    resetForm();
    isModalOpen.value = true;
};

const openModalForEdit = (member) => {
    user_id.value = member.user_id;
    designation_id.value = member.designation_id;
    start_date.value = member.start_date;
    end_date.value = member.end_date;
    note.value = member.note;
    status.value = member.status;
    selectedCommitteeMemberId.value = member.id;
    isEditMode.value = true;
    isModalOpen.value = true;
};

const openViewModal = (item) => {
    viewData.value = item;
    isViewModalOpen.value = true;
};

const submitForm = async () => {
    const payload = {
        committee_id: committeeId.value,
        user_id: user_id.value,
        designation_id: designation_id.value,
        start_date: start_date.value,
        end_date: end_date.value,
        note: note.value,
        status: status.value
    };

    const method = isEditMode.value ? 'PUT' : 'POST';
    const url = isEditMode.value
        ? `/api/committee-members/${selectedCommitteeMemberId.value}`
        : '/api/committee-members';

    const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: `You want to ${isEditMode.value ? 'update' : 'add'} this member?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!'
    });

    if (confirm.isConfirmed) {
        const res = await auth.fetchProtectedApi(url, payload, method);
        if (res.status) {
            Swal.fire('Success!', 'Saved successfully.', 'success');
            getCommitteeMemberList();
            resetForm();
        } else {
            Swal.fire('Error!', 'Failed to save.', 'error');
        }
    }
};

const deleteMember = async (id) => {
    const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'This member will be deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
        const res = await auth.fetchProtectedApi(`/api/committee-members/${id}`, {}, 'DELETE');
        if (res.status) {
            Swal.fire('Deleted!', 'Member deleted.', 'success');
            getCommitteeMemberList();
        } else {
            Swal.fire('Error!', 'Failed to delete.', 'error');
        }
    }
};

onMounted(() => {
    getOrgUserList();
    getDesignationList();
    getCommitteeMemberList();
});
</script>

<template>
    <div class="container mx-auto px-4 py-6">
        <!-- Committee Member List Section -->
        <section class="mt-8">
            <div class="flex items-center justify-between  bg-white rounded-lg p-4 shadow-sm">
                <h2 class="text-lg font-semibold text-gray-800">Committee Members</h2>
                <div class="flex gap-3">
                    <button @click="openModalForAdd"
                        class="bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-150">
                        + Add Member
                    </button>
                    <button @click="router.push({ name: 'committee-list' })"
                        class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-150">
                        ← Back to List
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto mt-6 shadow rounded-lg border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium">#</th>
                            <th class="px-4 py-3 text-left font-medium">User</th>
                            <th class="px-4 py-3 text-left font-medium">Designation</th>
                            <th class="px-4 py-3 text-left font-medium">Start Date</th>
                            <th class="px-4 py-3 text-left font-medium">End Date</th>
                            <th class="px-4 py-3 text-left font-medium">Status</th>
                            <th class="px-4 py-3 text-left font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                        <tr v-for="(item, index) in committeeMemberList" :key="item.id"
                            class="hover:bg-gray-50 transition">
                            <td class="px-4 py-3">{{ index + 1 }}</td>
                            <td class="px-4 py-3">{{ item.user_name }}</td>
                            <td class="px-4 py-3">{{ item.designation_name }}</td>
                            <td class="px-4 py-3">{{ item.start_date }}</td>
                            <td class="px-4 py-3">{{ item.end_date }}</td>
                            <td class="px-4 py-3">
                                <span
                                    :class="item.status == 1 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                                    {{ item.status == 1 ? 'Active' : 'Disabled' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 space-x-2">
                                <button @click="openViewModal(item)"
                                    class="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-xs transition">
                                    View
                                </button>
                                <button @click="openModalForEdit(item)"
                                    class="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded-md text-xs transition">
                                    Edit
                                </button>
                                <button @click="deleteMember(item.id)"
                                    class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-xs transition">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- View Modal -->
        <div v-if="isViewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-6">View Committee Member</h2>

                <div class="space-y-4 text-sm text-gray-700">
                    <div class="flex justify-between pb-2">
                        <span class="font-medium text-gray-600 w-40">Name:</span>
                        <span class="text-gray-800">{{ viewData.user_name }}</span>
                    </div>

                    <div class="flex justify-between pb-2">
                        <span class="font-medium text-gray-600 w-40">Designation:</span>
                        <span class="text-gray-800">{{ viewData.designation_name }}</span>
                    </div>

                    <div class="flex justify-between pb-2">
                        <span class="font-medium text-gray-600 w-40">Start Date:</span>
                        <span class="text-gray-800">{{ viewData.start_date }}</span>
                    </div>

                    <div class="flex justify-between pb-2">
                        <span class="font-medium text-gray-600 w-40">End Date:</span>
                        <span class="text-gray-800">{{ viewData.end_date }}</span>
                    </div>

                    <div class="flex justify-between pb-2">
                        <span class="font-medium text-gray-600 w-40">Note:</span>
                        <span class="text-gray-800">{{ viewData.note }}</span>
                    </div>

                    <div class="flex justify-between">
                        <span class="font-medium text-gray-600 w-40">Status:</span>
                        <span :class="viewData.status == 1 ? 'text-green-600' : 'text-red-600'">
                            {{ viewData.status == 1 ? 'Active' : 'Disabled' }}
                        </span>
                    </div>
                </div>

                <div class="text-right pt-6">
                    <button @click="isViewModalOpen = false"
                        class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-md transition">
                        Close
                    </button>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
                <h2 class="text-xl font-semibold text-gray-800">
                    {{ isEditMode ? 'Edit' : 'Add' }} Committee Member
                </h2>

                <form @submit.prevent="submitForm" class="space-y-5">
                    <!-- Committee member name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Committee Member Name</label>
                        <select v-model="user_id" required
                            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                            <option value="">Select User</option>
                            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }}</option>
                        </select>
                    </div>

                    <!-- Designation -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <select v-model="designation_id" required
                            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                            <option value="">Select Designation</option>
                            <option v-for="d in designationList" :key="d.id" :value="d.id">{{ d.name }}</option>
                        </select>
                    </div>

                    <!-- Start Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input v-model="start_date" type="date"
                            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                    </div>

                    <!-- End Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input v-model="end_date" type="date"
                            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                    </div>

                    <!-- Note -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <input v-model="note" type="text"
                            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                    </div>

                    <!-- Status -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select v-model="status"
                            class="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                            <option value="1">Active</option>
                            <option value="0">Disabled</option>
                        </select>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="submit"
                            class="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-5 rounded-md transition">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button @click="isModalOpen = false" type="button"
                            class="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-5 rounded-md transition">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>