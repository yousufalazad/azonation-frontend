<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();

const auth = authStore;
const user_id = ref("");
const designation_id = ref("");
const start_date = ref('');
const end_date = ref('');
const note = ref('');
const status = ref('1');
const isEditMode = ref(false);
const selectedMeetingAttendanceId = ref(null);

// Selected committeeId
const committeeId = ref(route.params.committeeId || null);

const meetingDetails = ref([]);
// Fetch meeting details on mount
const fetchMeetingDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/meetings/${committeeId.value}`, {}, 'GET');
        meetingDetails.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching meetings:', error);
        meetingDetails.value = [];
    }
};

const userList = ref([]);
// Fetch userList
const getOrgUserList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/project-attendances/org-user-list', {}, 'GET');
        userList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        userList.value = [];
    }
};

const designationList = ref([]);
// Fetch attendance type list
const getDesignationList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/designations', {}, 'GET');
        designationList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        designationList.value = [];
    }
};

const committeeMemberList = ref([]);
// Fetch getCommitteeMemberList
const getCommitteeMemberList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/committee-members', {}, 'GET');
        committeeMemberList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        committeeMemberList.value = [];
    }
};

// View Modal Logic
const isViewModalOpen = ref(false);
const selectedCommitteeMember = ref({});
const viewCommitteeMember = (committeeMember) => {
    selectedCommitteeMember.value = committeeMember;
    isViewModalOpen.value = true;
};

// Reset form fields
const resetForm = () => {
    user_id.value = "";
    designation_id.value = "";
    start_date.value = '';
    end_date.value = '';
    note.value = '';
    status.value = '1';
    selectedMeetingAttendanceId.value = null;
    isEditMode.value = false;
};

// Add or update committeeMember
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
    try {
        let apiUrl = '/api/committee-members';
        let method = 'POST';
        if (isEditMode.value && selectedMeetingAttendanceId.value) {
            apiUrl = `/api/committee-members/${selectedMeetingAttendanceId.value}`;
            method = 'PUT';
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this committee member?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `committee member ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getCommitteeMemberList();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save committee member.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} committee member:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} committee member.`, 'error');
    }
};

// Edit committeeMember
const editMeetingAttendance = (committeeMember) => {
    user_id.value = committeeMember.user_id;
    designation_id.value = committeeMember.designation_id;
    start_date.value = committeeMember.start_date;
    end_date.value = committeeMember.end_date;
    note.value = committeeMember.note;
    status.value = committeeMember.status;
    selectedMeetingAttendanceId.value = committeeMember.id;
    isEditMode.value = true;
};

// Delete committeeMember
const deleteMeetingAttendance = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this committee member?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/committee-members/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'committee member has been deleted.', 'success');
                getCommitteeMemberList();
            } else {
                Swal.fire('Failed!', 'Failed to delete committee member.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting committee member:', error);
        Swal.fire('Error!', 'Failed to delete committee member.', 'error');
    }
};


// Fetch Dialing Codes on mount
onMounted(() => {
    fetchMeetingDetails();
    getOrgUserList();
    getDesignationList();
    getCommitteeMemberList();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Committee Member</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="user_id" class="block text-gray-700 font-semibold mb-2">User Name</label>
                        <select v-model="user_id" id="user_id" class="w-full border border-gray-300 rounded-md p-2"
                            required>
                            <option value="">Select User</option>
                            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }}</option>
                        </select>
                    </div>
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="designation_id" class="block text-gray-700 font-semibold mb-2">Designation</label>
                        <select v-model="designation_id" id="designation_id"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Designation</option>
                            <option v-for="designation in designationList" :key="designation.id"
                                :value="designation.id">
                                {{ designation.name }}</option>
                        </select>
                    </div>
                    <!-- start_date -->
                    <div class="col-span-2 mb-4">
                        <label for="start_date" class="block text-gray-700 font-semibold mb-2">Start Date</label>
                        <input v-model="start_date" type="date"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" />
                    </div>
                    <!-- end_date -->
                    <div class="col-span-2 mb-4">
                        <label for="end_date" class="block text-gray-700 font-semibold mb-2">End Date</label>
                        <input v-model="end_date" type="date"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" />
                    </div>
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
                        <input v-model="note" type="text" class="w-full border border-gray-300 rounded-md py-2 px-4" />
                    </div>
                    <!-- status -->
                    <div class="col-span-3 mb-4">
                        <label for="status" class="block text-gray-700 font-semibold mb-2">Status</label>
                        <select v-model="status" id="status" class="w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select Status</option>
                            <option value="1">Active</option>
                            <option value="0">Disable</option>
                        </select>
                    </div>
                    <!-- Submit button -->
                    <div class="col-span-5 mb-4 flex items-end">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-yellow-600 text-white rounded-md py-2 px-4 mx-4 hover:bg-yellow-700">
                            Reset
                        </button>
                        <button @click="router.push({ name: 'committee-list' })"
                            class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">
                            Back to Committee List
                        </button>
                    </div>
                </div>
            </form>
        </section>
        <!-- country list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Committee Member List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">User</th>
                        <th class="py-2 px-4 border border-gray-300">Designation</th>
                        <th class="py-2 px-4 border border-gray-300">Start Date</th>
                        <th class="py-2 px-4 border border-gray-300">End Date</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(committeeMember, index) in committeeMemberList" :key="committeeMember.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ committeeMember.user_name }}</td>
                        <td class="py-2 px-4 border">{{ committeeMember.designation_name }}</td>
                        <td class="py-2 px-4 border">{{ committeeMember.start_date }}</td>
                        <td class="py-2 px-4 border">{{ committeeMember.end_date }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="Number(committeeMember.status) === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ Number(committeeMember.status) === 0 ? "Disable" : "Active" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="viewCommitteeMember(committeeMember)"
                                class="bg-blue-600 text-white rounded-md py-1 px-2 hover:bg-blue-700">View</button>
                            <button @click="editMeetingAttendance(committeeMember)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteMeetingAttendance(committeeMember.id)"
                                class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
        <!-- View Modal -->
        <div v-if="isViewModalOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
                <h3 class="text-xl font-semibold mb-6 text-center">Committee Member Details</h3>
                <div class="overflow-x-auto max-h-96 overflow-y-auto">
                    <table class="min-w-full text-gray-700 text-sm">
                        <tbody>
                            <tr>
                                <td class="font-medium py-2 pr-4 text-left w-60">User Name</td>
                                <td class="py-2">:</td>
                                <td class="py-2 text-left">{{ selectedCommitteeMember.user_name }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2 pr-4 text-left">Designation</td>
                                <td class="py-2">:</td>
                                <td class="py-2 text-left">{{ selectedCommitteeMember.designation_name }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2 pr-4 text-left">Start Date</td>
                                <td class="py-2">:</td>
                                <td class="py-2 text-left">{{ selectedCommitteeMember.start_date }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2 pr-4 text-left">End Date</td>
                                <td class="py-2">:</td>
                                <td class="py-2 text-left">{{ selectedCommitteeMember.end_date }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2 pr-4 text-left">Note</td>
                                <td class="py-2">:</td>
                                <td class="py-2 text-left">{{ selectedCommitteeMember.note }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2 pr-4 text-left">Status</td>
                                <td class="py-2">:</td>
                                <td class="py-2 text-left">
                                    <span
                                        :class="Number(selectedCommitteeMember.status) === 0 ? 'text-red-500' : 'text-green-500'">
                                        {{ Number(selectedCommitteeMember.status) === 0 ? 'Disable' : 'Active' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-6 flex justify-end">
                    <button @click="isViewModalOpen = false"
                        class="bg-gray-600 text-white rounded-md py-2 px-4 hover:bg-gray-500">
                        Close
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.left-color-shade {
    background-color: rgba(76, 175, 80, 0.1);
    /* Slightly green background */
}
</style>