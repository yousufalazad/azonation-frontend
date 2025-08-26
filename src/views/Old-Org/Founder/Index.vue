<!-- Founder add and update -->
<script setup>
import { ref, onMounted, computed, watch } from 'vue';

import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { utils, writeFileXLSX } from 'xlsx';

const auth = authStore;
const userId = auth.user.id;
const founderList = ref([]);
const isEditModalOpen = ref(false);
const isViewModalOpen = ref(false);
const selectedFounder = ref({ id: null, full_name: '', designation: '', isNameEditable: false });
const searchQuery = ref('');
const searchResults = ref([]);
const baseURL = auth.apiBase;
const addedFounder = ref([]);
const showAddFounderSection = ref(false);
const isAddModalOpen = ref(false);
const full_name = ref('');
const designation = ref('');
const email = ref('');
const mobile = ref('');
const address = ref('');
const note = ref('');
const profile_image = ref(null);
const isActive = ref(true);

const currentPage = ref(1);
const pageSize = ref(10);

const isViewMode = ref(false);


const paginatedFounders = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredFounders.value.slice(start, end);
});
const totalPages = computed(() => Math.ceil(filteredFounders.value.length / pageSize.value));

const filteredFounders = computed(() => {
    if (!searchQuery.value) return founderList.value;
    return founderList.value.filter(f => {
        const name = f.founders?.first_name || f.full_name || '';
        return name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (f.designation || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (f.email || '').toLowerCase().includes(searchQuery.value.toLowerCase());
    });
});

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) profile_image.value = file;
};
const getFounders = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/founders`, {}, 'GET');
        founderList.value = response.status ? response.data : [];
    } catch (error) {
        founderList.value = [];
    }
};

const openEditModal = (founder) => {
    // If the founder has a full_name in the relational table, don't allow editing
    const isNameEditable = !(founder.founders && founder.founders.full_name);

    // Set founder details for editing
    selectedFounder.value = {
        id: founder.id,
        full_name: isNameEditable ? founder.full_name : founder.founders.full_name,
        designation: founder.designation,
        email: founder.email || '', // Ensure email is included
        mobile: founder.mobile || '', // Ensure mobile is included
        address: founder.address || '', // Ensure address is included
        note: founder.note || '', // Ensure note is included
        isActive: founder.is_active,
        image_url: founder.image_url || null, // Include image URL if available
        isNameEditable: isNameEditable
    };
    isEditModalOpen.value = true;

    // selectedFounder.value = { ...founder, full_name: founder.founders?.first_name || founder.full_name };
};

const openViewModal = (founder) => {
    selectedFounder.value = { ...founder, full_name: founder.founders?.first_name || founder.full_name };
    isViewModalOpen.value = true;
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
};

const closeViewModal = () => {
    isViewModalOpen.value = false;
};

const updateFounder = async () => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to update this founder's details?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!'
    });
    if (!result.isConfirmed) return;

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('full_name', selectedFounder.value.full_name);
    formData.append('designation', selectedFounder.value.designation || '');
    formData.append('email', selectedFounder.value.email || '');
    formData.append('mobile', selectedFounder.value.mobile || '');
    formData.append('address', selectedFounder.value.address || '');
    formData.append('note', selectedFounder.value.note || '');
    formData.append('is_active', selectedFounder.value.is_active ? '1' : '0');
    if (profile_image.value) formData.append('profile_image', profile_image.value);

    const response = await auth.uploadProtectedApi(`/api/founders/${selectedFounder.value.id}`, formData, 'POST', {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status) {
        await Swal.fire('Updated!', 'Founder details updated successfully.', 'success');
        getFounders();
        closeEditModal();
    } else {
        Swal.fire('Failed!', 'Failed to update details.', 'error');
    }
};

// const searchIndividuals = async () => {
//     try {
//         const response = await auth.fetchProtectedApi('/api/org-members/search', { query: searchQuery.value }, 'POST');
//         if (response.status) {
//             searchResults.value = response.data;
//             //console.log(response.data);
//         } else {
//             searchResults.value = [];
//         }
//     } catch (error) {
//         console.error("Error searching individuals:", error);
//         searchResults.value = [];
//     }
// };
const searchIndividuals = async () => {
    if (!searchQuery.value.trim()) return; // prevent empty call

    try {
        const response = await auth.fetchProtectedApi('/api/org-members/search', { query: searchQuery.value }, 'POST');
        searchResults.value = response.status ? response.data : [];
    } catch (error) {
        console.error("Error searching individuals:", error);
        searchResults.value = [];
    }
};


const addFounder = async (individualTypeUserId) => {
    //console.log('Founder user id:', individualTypeUserId);
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to add as a founder?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi('/api/founders', { user_id: userId, founder_user_id: individualTypeUserId }, 'POST');
            if (response.status) {
                await Swal.fire(
                    'Added!',
                    'Founder added successfully.',
                    'success'
                );
                getFounders();

                // window.location.reload();
            } else {
                Swal.fire(
                    'Failed!',
                    'Failed to add founder.',
                    'error'
                );
            }
        }
    } catch (error) {
        console.error("Error adding founder:", error);
        Swal.fire(
            'Error!',
            'Failed to add founder.',
            'error'
        );
    }
};
const addUnlinkFounder = async () => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to add as a founder?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'No, cancel!',
        });

        if (!result.isConfirmed) return;

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('full_name', full_name.value);
        formData.append('email', email.value);
        formData.append('mobile', mobile.value);
        formData.append('address', address.value || '');
        formData.append('note', note.value || '');
        formData.append('designation', designation.value || '');
        formData.append('is_active', isActive.value ? '1' : '0');
        if (profile_image.value) {
            formData.append('profile_image', profile_image.value);
        }

        const response = await authStore.uploadProtectedApi('/api/founders', formData, 'POST', {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status && response.data) {
            addedFounder.value = response.data;

            await Swal.fire(
                'Added!',
                'Founder added successfully.',
                'success'
            );
            getFounders();
            isAddModalOpen.value = false;
            // window.location.reload();
        } else {
            addedFounder.value = [];
            Swal.fire(
                'Failed!',
                'Failed to add founder.',
                'error'
            );
        }
    } catch (error) {
        console.error('Error adding founder:', error);
        addedFounder.value = [];
        Swal.fire(
            'Error!',
            'An error occurred. Please try again.',
            'error'
        );
    }
};

const deleteFounderMember = async (id) => {
    const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'This Founder Member will be deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    });
    if (!confirm.isConfirmed) return;

    const res = await auth.fetchProtectedApi(`/api/founders/${id}`, {}, 'DELETE');
    if (res.status) {
        Swal.fire('Deleted!', 'Founder Member deleted.', 'success');
        getFounders();
    } else {
        Swal.fire('Error!', 'Failed to delete.', 'error');
    }
};

const exportToExcel = () => {
    const table = document.getElementById('founder-table');
    if (!table) return;

    const worksheet = utils.table_to_sheet(table);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Founders');

    writeFileXLSX(workbook, 'founders.xlsx');
};

const exportToPDF = async () => {
    const jsPDFModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');

    const doc = new jsPDFModule.jsPDF(); // ✅ use .jsPDF instead of .default
    autoTableModule.default(doc, { html: '#founder-table' }); // ✅ register the plugin
    doc.save('founders.pdf');
};

const exportToCSV = () => {
    let csv = 'Name,Designation,Email,Mobile,Address\n';
    founderList.value.forEach(f => {
        const name = f.founders?.first_name || f.full_name || '';
        csv += `${name},${f.designation || ''},${f.email || ''},${f.mobile || ''},${f.address || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'founders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const onSearchFocus = () => {
    isSearchModalOpen.value = true;
    searchResults.value = []; // ✅ Always clear the list when opening modal
};

const isSearchModalOpen = ref(false);

watch(searchQuery, (val) => {
    if (!val) {
        searchResults.value = []; // clear list only, not modal
    }
});

const closeSearchModal = () => {
    isSearchModalOpen.value = false;
    searchQuery.value = '';
    searchResults.value = [];
};

onMounted(() => {
    getFounders();
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearchModal();
    });
});

</script>

<template>
    <!-- Search and Add Founder section -->
    <section v-if="showAddFounderSection" class="mb-5 md:mb-16">
        <div class="add-member">
            <h2 class="text-center text-2xl text-gray-500">Search & add founder</h2>

            <!-- Search Input -->
            <div class="flex justify-center my-6">
                <input type="text" v-model="searchQuery" @focus="isSearchModalOpen = true" @input="searchIndividuals"
                    placeholder="Search by name, email, mobile, Azon ID"
                    class="form-input flex-1 max-w-lg px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />


                <button @click="searchIndividuals"
                    class="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 transition-all focus:outline-none">
                    Search
                </button>
            </div>

            <!-- Full Search Modal -->
            <div v-if="isSearchModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white w-full max-w-4xl p-6 rounded shadow-lg max-h-[90vh] overflow-y-auto relative">
                    <h2 class="text-xl font-semibold mb-4">Search Results</h2>

                    <!-- ✅ Show Search Input Inside Modal -->
                    <div class="flex mb-4">
                        <input type="text" v-model="searchQuery" @input="searchIndividuals" @focus="onSearchFocus"
                            placeholder="Search by name, email, mobile, Azon ID"
                            class="form-input flex-1 px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button @click="searchIndividuals"
                            class="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                            Search
                        </button>
                    </div>

                    <!-- Search Results -->
                    <div v-if="searchResults.length">
                        <ul class="divide-y divide-gray-200">
                            <li v-for="individualUser in searchResults" :key="individualUser.id"
                                class="flex items-center py-4">
                                <img :src="`${baseURL}/storage/${individualUser.image}`" alt="Profile picture"
                                    class="w-16 h-16 rounded-full object-cover mr-4" />
                                <div class="flex-1">
                                    <p class="font-medium text-lg text-gray-700">
                                        {{ individualUser.first_name }} {{ individualUser.last_name }}
                                    </p>
                                    <p class="text-sm text-gray-500">{{ individualUser.city }}, {{
                                        individualUser.country_name }}</p>
                                    <p class="text-sm text-gray-500">Username: {{ individualUser.username }}</p>
                                    <p class="text-sm text-gray-500">Azon ID: {{ individualUser.azon_id }}</p>
                                </div>
                                <!-- <button @click="addFounder(individualUser.id)"
                                    class="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded">
                                    Add
                                </button> -->
                                <!-- Inside Search Results v-for -->
                                <div class="ml-4">
                                    <template
                                        v-if="founderList.some(f => f.founder_user_id === individualUser.id || f.founders?.id === individualUser.id)">
                                        <span class="text-sm text-gray-500 italic">Already Added</span>
                                    </template>
                                    <template v-else>
                                        <button @click="addFounder(individualUser.id)"
                                            class="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded">
                                            Add
                                        </button>
                                    </template>
                                </div>

                            </li>
                        </ul>
                    </div>
                    <!-- No Results -->
                    <div v-else>
                        <p class="text-gray-400">Start typing to search individuals...</p>
                    </div>

                    <!-- Close Button -->
                    <div class="absolute top-4 right-4">
                        <button @click="closeSearchModal" class="text-gray-600 hover:text-gray-900 text-xl">×</button>
                    </div>
                </div>
            </div>

            <!-- No Results -->
            <div v-else>
                <p class="text-center text-gray-500">
                    Want to add founder manually, without link?
                    <a href="#" @click.prevent="isAddModalOpen = true"
                        class="text-blue-600 hover:text-blue-800 hover:underline">
                        click here
                    </a>
                </p>
            </div>

            <!-- Manual Founder Form Modal -->
            <div v-if="isAddModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white p-6 rounded shadow-lg w-1/3 max-h-[90vh] overflow-y-auto">
                    <h3 class="text-xl font-bold mb-4">Add Founder Manually</h3>
                    <div>
                        <!-- Form Fields -->
                        <div class="mb-4">
                            <label class="block font-semibold mb-2">Full Name <span
                                    class="text-red-500">*</span></label>
                            <input type="text" v-model="full_name" placeholder="Founder full name"
                                class="w-full border rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500" />
                            <p v-if="auth.errors?.full_name" class="text-red-500 mt-2">{{ auth.errors.full_name[0] }}
                            </p>
                        </div>

                        <div class="mb-4">
                            <label class="block font-semibold mb-2">Designation</label>
                            <input type="text" v-model="designation" placeholder="Optional"
                                class="w-full border rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div class="mb-4">
                            <label class="block font-semibold mb-2">Email</label>
                            <input type="email" v-model="email" placeholder="Email"
                                class="w-full border rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div class="mb-4">
                            <label class="block font-semibold mb-2">Mobile</label>
                            <input type="text" v-model="mobile" placeholder="Mobile"
                                class="w-full border rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div class="mb-4">
                            <label class="block font-semibold mb-2">Address</label>
                            <textarea v-model="address"
                                class="w-full border rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>

                        <div class="mb-4">
                            <label class="block font-semibold mb-2">Note</label>
                            <textarea v-model="note"
                                class="w-full border rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>

                        <div class="mb-4">
                            <label class="block font-semibold mb-2">Profile Image</label>
                            <input type="file" @change="handleFileChange"
                                class="w-full border rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end gap-2 mt-4">
                            <button @click="isAddModalOpen = false" type="button"
                                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                Cancel
                            </button>
                            <button @click="addUnlinkFounder" type="button"
                                class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div>
        <!-- Export Buttons and Search -->
        <div class="flex justify-between items-center border-gray-200 mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Founders</h2>
            <div class="flex flex-wrap gap-2">
                <button @click="exportToCSV"
                    class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">CSV</button>
                <button @click="exportToPDF"
                    class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">PDF</button>
                <button @click="exportToExcel"
                    class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">Excel</button>
                <input v-model="searchQuery" type="text" placeholder="Search..."
                    class="border px-3 py-1.5 rounded text-sm" />
                <button @click="showAddFounderSection = !showAddFounderSection"
                    class="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                    + Add Founder
                </button>
            </div>
        </div>

        <!-- Founders Table -->
        <div v-if="paginatedFounders.length" class="bg-white shadow-sm rounded-md overflow-hidden">
            <table id="founder-table" class="min-w-full table-auto text-sm text-gray-700">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left font-medium">#</th>
                        <th class="px-4 py-3 text-left font-medium">Image</th>
                        <th class="px-4 py-3 text-left font-medium">Name</th>
                        <th class="px-4 py-3 text-left font-medium">Designation</th>
                        <!-- <th class="px-4 py-3 text-left font-medium">Status</th> -->
                        <th class="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(founder, index) in paginatedFounders" :key="founder.id"
                        class="hover:bg-gray-50 transition">
                        <td class="px-4 py-3">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
                        <td class="px-4 py-3">
                            <img v-if="founder.image_url" :src="founder.image_url" alt="Founder Image"
                                class="h-10 w-10 rounded-full object-cover">
                            <span v-else class="text-gray-400 italic">No Image</span>
                        </td>
                        <td class="px-4 py-3">{{ founder.founders?.first_name || founder.full_name }}</td>
                        <td class="px-4 py-3">{{ founder.designation }}</td>
                        <!-- <td class="px-4 py-3">
                            <span :class="founder.is_active ? 'text-green-600' : 'text-red-500'">
                                {{ founder.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td> -->
                        <td class="px-4 py-3 text-right space-x-2">
                            <button @click="openEditModal(founder)" class="text-blue-600 hover:underline">Edit</button>
                            <button @click="openViewModal(founder)" class="text-gray-600 hover:underline">View</button>
                            <button @click="deleteFounderMember(founder.id)"
                                class="text-red-500 hover:underline">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Pagination Controls -->
        <div v-if="paginatedFounders.length"
            class="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-md mt-2">
            <div class="text-sm text-gray-600">
                Items {{ (currentPage - 1) * pageSize + 1 }} -
                {{ Math.min(currentPage * pageSize, filteredFounders.length) }}
                of {{ filteredFounders.length }} |
                Page {{ currentPage }} of {{ totalPages }}
            </div>

            <div class="flex items-center space-x-2 text-sm">
                <label class="mr-1">Items per page:</label>
                <select v-model="pageSize"
                    class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:border-blue-500">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                </select>

                <button @click="currentPage = 1" :disabled="currentPage === 1"
                    class="px-2 py-1 border rounded text-gray-500 hover:text-gray-700 disabled:opacity-50">
                    First
                </button>
                <button @click="currentPage--" :disabled="currentPage === 1"
                    class="px-2 py-1 border rounded text-gray-500 hover:text-gray-700 disabled:opacity-50">
                    Prev
                </button>
                <button @click="currentPage++" :disabled="currentPage === totalPages"
                    class="px-2 py-1 border rounded text-gray-500 hover:text-gray-700 disabled:opacity-50">
                    Next
                </button>
                <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
                    class="px-2 py-1 border rounded text-gray-500 hover:text-gray-700 disabled:opacity-50">
                    Last
                </button>
            </div>
        </div>


        <!-- Edit Modal -->
        <div v-if="isEditModalOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div class="bg-white p-6 rounded shadow-lg w-1/3 max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-bold mb-4">Edit Founder</h3>
                <form @submit.prevent="updateFounder">
                    <div class="mb-4">
                        <label for="full_name" class="block text-sm font-bold mb-2">Name</label>
                        <input type="text" id="full_name" v-model="selectedFounder.full_name"
                            class="w-full border px-3 py-2 rounded"
                            :readonly="isViewMode || !selectedFounder.isNameEditable" />
                        <p v-if="!selectedFounder.isNameEditable" class="text-sm text-gray-500 mt-1">
                            Name cannot be edited as it comes from a linked founder record.
                        </p>
                    </div>
                    <div class="mb-4">
                        <label for="designation" class="block text-sm font-bold mb-2">Designation</label>
                        <input type="text" id="designation" v-model="selectedFounder.designation"
                            class="w-full border px-3 py-2 rounded" :readonly="isViewMode" />
                    </div>
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-bold mb-2">Email</label>
                        <input type="email" id="email" v-model="selectedFounder.email"
                            class="w-full border px-3 py-2 rounded" :readonly="isViewMode" />
                        <p v-if="auth.errors?.email" class="text-red-500 mt-2">{{ auth.errors?.email[0] }}</p>
                    </div>
                    <div class="mb-4">
                        <label for="mobile" class="block text-sm font-bold mb-2">Mobile</label>
                        <input type="text" id="mobile" v-model="selectedFounder.mobile"
                            class="w-full border px-3 py-2 rounded" :readonly="isViewMode" />
                        <p v-if="auth.errors?.mobile" class="text-red-500 mt-2">{{ auth.errors?.mobile[0] }}</p>
                    </div>
                    <div class="mb-4">
                        <label for="address" class="block text-sm font-bold mb-2">Address</label>
                        <textarea id="address" v-model="selectedFounder.address" class="w-full border px-3 py-2 rounded"
                            :readonly="isViewMode" placeholder="Address"></textarea>
                        <p v-if="auth.errors?.address" class="text-red-500 mt-2">{{ auth.errors?.address[0] }}</p>
                    </div>
                    <div class="mb-4">
                        <label for="note" class="block text-sm font-bold mb-2">Note</label>
                        <textarea id="note" v-model="selectedFounder.note" class="w-full border px-3 py-2 rounded"
                            :readonly="isViewMode" placeholder="Note"></textarea>
                        <p v-if="auth.errors?.note" class="text-red-500 mt-2">{{ auth.errors?.note[0] }}</p>
                    </div>

                    <div class="mb-4" v-if="!isViewMode">
                        <label for="profile_image" class="block text-sm font-bold mb-2">Profile Image</label>
                        <input type="file" id="profile_image" @change="handleFileChange"
                            class="w-full border px-3 py-2 rounded" />
                    </div>
                    <div class="mb-4">
                        <img v-if="selectedFounder.image_url" :src="selectedFounder.image_url" alt="Profile Image"
                            class="h-20 w-20 rounded-full object-cover mb-2">
                        <p v-if="!selectedFounder.image_url" class="text-gray-500">No image uploaded</p>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="closeEditModal"
                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                            {{ isViewMode ? 'Close' : 'Cancel' }}
                        </button>
                        <button v-if="!isViewMode" type="submit"
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- View Modal -->
        <div v-if="isViewModalOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div class="bg-white p-6 rounded shadow-lg w-1/3 max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-bold mb-4">View Founder</h3>
                <table class="min-w-full table-auto text-sm text-gray-700">
                    <tbody>
                        <tr>
                            <td class="font-semibold py-2 w-32">Name</td>
                            <td class="w-4 text-center">:</td>
                            <td>{{ selectedFounder.full_name }}</td>
                        </tr>
                        <tr>
                            <td class="font-semibold py-2">Designation</td>
                            <td class="text-center">:</td>
                            <td>{{ selectedFounder.designation }}</td>
                        </tr>
                        <tr>
                            <td class="font-semibold py-2">Email</td>
                            <td class="text-center">:</td>
                            <td>{{ selectedFounder.email }}</td>
                        </tr>
                        <tr>
                            <td class="font-semibold py-2">Mobile</td>
                            <td class="text-center">:</td>
                            <td>{{ selectedFounder.mobile }}</td>
                        </tr>
                        <tr>
                            <td class="font-semibold py-2">Address</td>
                            <td class="text-center">:</td>
                            <td>{{ selectedFounder.address }}</td>
                        </tr>
                        <tr>
                            <td class="font-semibold py-2">Note</td>
                            <td class="text-center">:</td>
                            <td>{{ selectedFounder.note }}</td>
                        </tr>
                        <tr v-if="selectedFounder.image_url">
                            <td class="font-semibold py-2 align-top">Image</td>
                            <td class="text-center align-top">:</td>
                            <td>
                                <img :src="selectedFounder.image_url" alt="Founder Image"
                                    class="h-24 w-24 object-cover rounded border border-gray-300">
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="flex justify-end mt-4">
                    <button @click="closeViewModal"
                        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Close</button>
                </div>
            </div>
        </div>


    </div>
    <div v-if="!paginatedFounders.length" class="text-center text-gray-500 py-6">
        <p>No founders found.</p>
    </div>
</template>
