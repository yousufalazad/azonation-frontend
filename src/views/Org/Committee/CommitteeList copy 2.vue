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

const getOrgUserList = async () => {
    const res = await auth.fetchProtectedApi('/api/project-attendances/org-user-list', {}, 'GET');
    if (res.status) userList.value = res.data;
};

const getDesignationList = async () => {
    const res = await auth.fetchProtectedApi('/api/designations', {}, 'GET');
    if (res.status) designationList.value = res.data;
};

const getCommitteeMemberList = async () => {
    const res = await auth.fetchProtectedApi('/api/committee-members', {}, 'GET');
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
    <div class="max-w-7xl mx-auto w-10/12">
        <!-- Add/Edit Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <h2 class="text-xl font-semibold mb-4">{{ isEditMode ? 'Edit' : 'Add' }} Committee Member</h2>
                <form @submit.prevent="submitForm">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div class="col-span-4">
                            <label class="block text-gray-700 mb-1">User Name</label>
                            <select v-model="user_id" class="w-full border border-gray-300 rounded p-2" required>
                                <option value="">Select User</option>
                                <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }}
                                </option>
                            </select>
                        </div>
                        <div class="col-span-4">
                            <label class="block text-gray-700 mb-1">Designation</label>
                            <select v-model="designation_id" class="w-full border border-gray-300 rounded p-2" required>
                                <option value="">Select Designation</option>
                                <option v-for="d in designationList" :key="d.id" :value="d.id">{{ d.name }}</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-gray-700 mb-1">Start Date</label>
                            <input v-model="start_date" type="date" class="w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div class="col-span-2">
                            <label class="block text-gray-700 mb-1">End Date</label>
                            <input v-model="end_date" type="date" class="w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div class="col-span-4">
                            <label class="block text-gray-700 mb-1">Note</label>
                            <input v-model="note" type="text" class="w-full border border-gray-300 rounded p-2" />
                        </div>
                        <div class="col-span-3">
                            <label class="block text-gray-700 mb-1">Status</label>
                            <select v-model="status" class="w-full border border-gray-300 rounded p-2">
                                <option value="1">Active</option>
                                <option value="0">Disabled</option>
                            </select>
                        </div>
                        <div class="col-span-5 flex items-end space-x-3">
                            <button type="submit" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-500">
                                {{ isEditMode ? 'Update' : 'Add' }}
                            </button>
                            <button @click="resetForm" type="button"
                                class="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-500">Reset</button>
                            <button @click="isModalOpen = false" type="button"
                                class="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- View Modal -->
        <div v-if="isViewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
                <h2 class="text-xl font-semibold mb-4">View Committee Member</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div><strong>User:</strong> {{ viewData.user_name }}</div>
                    <div><strong>Designation:</strong> {{ viewData.designation_name }}</div>
                    <div><strong>Start Date:</strong> {{ viewData.start_date }}</div>
                    <div><strong>End Date:</strong> {{ viewData.end_date }}</div>
                    <div><strong>Note:</strong> {{ viewData.note }}</div>
                    <div><strong>Status:</strong> <span
                            :class="viewData.status == 1 ? 'text-green-600' : 'text-red-600'">
                            {{ viewData.status == 1 ? 'Active' : 'Disabled' }}</span>
                    </div>
                </div>
                <div class="mt-4 text-right">
                    <button @click="isViewModalOpen = false"
                        class="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600">
                        Close
                    </button>
                </div>
            </div>
        </div>

        <!-- Member List Table -->
        <section class="mt-6">
            <div class="flex justify-between left-color-shade bg-sky-100 py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Committee Member List</h5>

                <div class="">
                    <button @click="openModalForAdd"
                        class="bg-green-600 text-white py-2 px-4 mx-3 rounded hover:bg-green-500">
                        Add Committee Member
                    </button>
                    <button @click="router.push({ name: 'committee-list' })"
                        class="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600">
                        Back to Committee List
                    </button>
                </div>
            </div>
            <table class="min-w-full border border-gray-300 text-left table-auto">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="border px-4 py-2">User</th>
                        <th class="border px-4 py-2">Designation</th>
                        <th class="border px-4 py-2">Start Date</th>
                        <th class="border px-4 py-2">End Date</th>
                        <th class="border px-4 py-2">Status</th>
                        <th class="border px-4 py-2 w-60">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in committeeMemberList" :key="item.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="border px-4 py-2">{{ item.user_name }}</td>
                        <td class="border px-4 py-2">{{ item.designation_name }}</td>
                        <td class="border px-4 py-2">{{ item.start_date }}</td>
                        <td class="border px-4 py-2">{{ item.end_date }}</td>
                        <td class="border px-4 py-2">
                            <span :class="item.status == 1 ? 'text-green-600' : 'text-red-600'">
                                {{ item.status == 1 ? 'Active' : 'Disabled' }}
                            </span>
                        </td>
                        <td class="border px-4 py-2 space-x-2">
                            <button @click="openViewModal(item)" class="bg-blue-600 text-white rounded-md py-1 px-2 hover:bg-blue-700">View</button>
                            <button @click="openModalForEdit(item)" class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteMember(item.id)" class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>