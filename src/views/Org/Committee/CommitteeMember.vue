<script setup>
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';
import { utils, writeFileXLSX } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

const router = useRouter();
const route = useRoute();
const auth = authStore;

const committeeId = ref(route.params.committeeId || null);
const committeeName = ref(route.params.committeeName || null);
const isModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isEditMode = ref(false);
const selectedCommitteeMemberId = ref(null);

const user_id = ref('');
const designation_id = ref('');
const start_date = ref('');
const end_date = ref('');
const note = ref('');
const is_active = ref(1);

const viewData = ref({});
const userList = ref([]);
const designationList = ref([]);
const committeeMemberList = ref([]);

const search = ref('');
const startFilter = ref('');
const endFilter = ref('');
const quickDateFilter = ref('');
const rowsPerPage = ref(10);
const currentPage = ref(1);

const headers = [
    { text: 'Name', value: 'full_name' },
    { text: 'Designation', value: 'designation_name' },
    { text: 'Start Date', value: 'start_date' },
    { text: 'End Date', value: 'end_date' },
    { text: 'Status', value: 'status_display' },
    { text: 'Actions', value: 'actions', sortable: false }
];

const filteredList = computed(() => {
    let list = [...committeeMemberList.value];
    if (startFilter.value) list = list.filter(item => item.start_date >= startFilter.value);
    if (endFilter.value) list = list.filter(item => item.end_date <= endFilter.value);
    if (search.value.trim()) {
        const s = search.value.toLowerCase();
        list = list.filter(item =>
        (`${item.first_name} ${item.last_name}`.toLowerCase().includes(s) ||
            item.designation_name.toLowerCase().includes(s))
        );
    }
    return list.map(item => ({
        ...item,
        full_name: `${item.first_name} ${item.last_name}`,
        status_display: item.is_active === 1 ? 'Active' : 'Disabled'
    }));
});

const paginatedList = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    return filteredList.value.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / rowsPerPage.value));

const applyQuickDateFilter = () => {
    const today = new Date();
    const format = d => d.toISOString().split('T')[0];
    if (quickDateFilter.value === 'last7') {
        const d = new Date(today); d.setDate(today.getDate() - 7);
        startFilter.value = format(d); endFilter.value = format(today);
    } else if (quickDateFilter.value === 'thisMonth') {
        const d1 = new Date(today.getFullYear(), today.getMonth(), 1);
        const d2 = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startFilter.value = format(d1); endFilter.value = format(d2);
    } else {
        startFilter.value = ''; endFilter.value = '';
    }
};

const exportCSV = () => {
    const header = headers.filter(h => h.value !== 'actions').map(h => h.text);
    const rows = filteredList.value.map(item => [
        item.full_name,
        item.designation_name,
        item.start_date,
        item.end_date,
        item.status_display
    ]);
    const ws = utils.aoa_to_sheet([header, ...rows]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Members');
    writeFileXLSX(wb, 'committee_members.csv', { bookType: 'csv' });
};

const exportXLSX = () => {
    const rows = filteredList.value.map(item => ({
        Name: item.full_name,
        Designation: item.designation_name,
        'Start Date': item.start_date,
        'End Date': item.end_date,
        Status: item.status_display
    }));
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Members');
    writeFileXLSX(wb, 'committee_members.xlsx');
};

const exportPDF = () => {
    const doc = new jsPDF();
    const header = [['Name', 'Designation', 'Start Date', 'End Date', 'Status']];
    const body = filteredList.value.map(item => [
        item.full_name,
        item.designation_name,
        item.start_date,
        item.end_date,
        item.status_display
    ]);
    autoTable(doc, { head: header, body });
    doc.save('committee_members.pdf');
};

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
    is_active.value = 1;
    selectedCommitteeMemberId.value = null;
    isEditMode.value = false;
    isModalOpen.value = false;
};

const openModalForAdd = () => { resetForm(); isModalOpen.value = true; };

const openModalForEdit = (member) => {
    user_id.value = member.user_id;
    designation_id.value = member.designation_id;
    start_date.value = member.start_date;
    end_date.value = member.end_date;
    note.value = member.note;
    is_active.value = member.is_active;
    selectedCommitteeMemberId.value = member.id;
    isEditMode.value = true;
    isModalOpen.value = true;
};
const openViewModal = (item) => { viewData.value = item; isViewModalOpen.value = true; };

const submitForm = async () => {
    const payload = {
        committee_id: committeeId.value,
        user_id: user_id.value,
        designation_id: designation_id.value,
        start_date: start_date.value,
        end_date: end_date.value,
        note: note.value,
        is_active: is_active.value
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
            getCommitteeMemberList();
            Swal.fire('Deleted!', 'Member deleted.', 'success');
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
        <!-- Header & Actions -->
        <div class="flex justify-between items-center bg-white p-4 rounded shadow">
            <h2 class="text-lg font-semibold text-gray-800">{{ committeeName }} Members</h2>
            <div class="flex gap-2">
                <button @click="exportCSV" class="border px-3 py-1.5 text-sm rounded hover:bg-gray-100">CSV</button>
                <button @click="exportXLSX" class="border px-3 py-1.5 text-sm rounded hover:bg-gray-100">Excel</button>
                <button @click="exportPDF" class="border px-3 py-1.5 text-sm rounded hover:bg-gray-100">PDF</button>
                <button @click="openModalForAdd"
                    class="bg-green-600 text-white px-4 py-2 text-sm rounded hover:bg-green-500">+ Add Member</button>
                <button @click="router.push({ name: 'committees' })"
                    class="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-500">← Back</button>
            </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
                <label class="text-sm text-gray-600">Search</label>
                <input v-model="search" type="text" placeholder="Search..."
                    class="w-full border rounded px-3 py-1.5 text-sm" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Start Date</label>
                <input type="date" v-model="startFilter" class="w-full border rounded px-3 py-1.5 text-sm" />
            </div>
            <div>
                <label class="text-sm text-gray-600">End Date</label>
                <input type="date" v-model="endFilter" class="w-full border rounded px-3 py-1.5 text-sm" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Quick Filter</label>
                <select v-model="quickDateFilter" @change="applyQuickDateFilter"
                    class="w-full border rounded px-3 py-1.5 text-sm">
                    <option value="">All</option>
                    <option value="last7">Last 7 Days</option>
                    <option value="thisMonth">This Month</option>
                </select>
            </div>

        </div>

        <!-- Table -->
        <div class="mt-6">
            <EasyDataTable :headers="headers" :items="paginatedList" :search-value="search" :rows-per-page="rowsPerPage"
                :current-page="currentPage" :loading="false" :hide-footer="true" table-class="min-w-full text-sm"
                header-class="bg-gray-100" body-row-class="text-sm" theme-color="#3b82f6">
                <template #item-status_display="{ status_display }">
                    <span :class="status_display === 'Active' ? 'text-green-600' : 'text-red-600'">{{ status_display
                        }}</span>
                </template>
                <template #item-actions="{ id }">
                    <div class="flex gap-2 justify-end">
                        <button @click="openViewModal(committeeMemberList.find(c => c.id === id))"
                            class="bg-blue-500 px-3 py-1 text-white rounded text-xs">View</button>
                        <button @click="openModalForEdit(committeeMemberList.find(c => c.id === id))"
                            class="bg-yellow-400 px-3 py-1 text-white rounded text-xs">Edit</button>
                        <button @click="deleteMember(id)"
                            class="bg-red-500 px-3 py-1 text-white rounded text-xs">Delete</button>
                    </div>
                </template>
            </EasyDataTable>
        </div>

        <!-- Custom Pagination -->
        <div class="flex items-center justify-between border rounded px-4 py-3 bg-gray-50 mt-4 text-sm text-gray-700">
            <!-- Left Info -->
            <div>
                Items {{ (currentPage - 1) * rowsPerPage + 1 }} -
                {{ Math.min(currentPage * rowsPerPage, filteredList.length) }}
                of {{ filteredList.length }} |
                Page {{ currentPage }} of {{ totalPages }}
            </div>

            <!-- ✅ Right controls -->
            <div class="flex items-center gap-4">
                <!-- Page Size -->
                <div class="flex items-center gap-1">
                    <span class="text-sm text-gray-600">Items per page:</span>
                    <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-sm">
                        <option v-for="size in [5, 10, 50, 100, 250, 500, 1000]" :key="size" :value="size">
                            {{ size }}
                        </option>
                    </select>
                </div>

                <!-- Page Navigation -->
                <div class="flex gap-1">
                    <button @click="currentPage = 1" :disabled="currentPage === 1" class="border rounded px-3 py-1"
                        :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                        First
                    </button>
                    <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
                        class="border rounded px-3 py-1"
                        :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                        Prev
                    </button>
                    <button @click="currentPage = Math.min(totalPages, currentPage + 1)"
                        :disabled="currentPage === totalPages" class="border rounded px-3 py-1"
                        :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                        Next
                    </button>
                    <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
                        class="border rounded px-3 py-1"
                        :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                        Last
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Add/Edit Modal -->
     <!-- View Modal -->
        <div v-if="isViewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-6">View Committee Member</h2>

                <div class="space-y-4 text-sm text-gray-700">
                    <div class="flex justify-between pb-2">
                        <span class="font-medium text-gray-600 w-40">Name:</span>
                        <span class="text-gray-800">{{ viewData.first_name }} {{ viewData.last_name }}</span>
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
                        <span :class="viewData.is_active == 1 ? 'text-green-600' : 'text-red-600'">
                            {{ viewData.is_active == 1 ? 'Active' : 'Disabled' }}
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
                            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.first_name }} {{ user.last_name }}</option>
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
                        <select v-model="is_active"
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
</template>
