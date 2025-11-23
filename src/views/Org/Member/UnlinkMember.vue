<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import { pdfExport } from "@/helpers/pdfExport.js";
import { excelExport } from "@/helpers/excelExport.js";
import { csvExport } from "@/helpers/csvExport.js";
import { docxExport } from '@/helpers/docxExport'

const auth = authStore;

// State
const members = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const previewImage = ref(null);
const viewModalOpen = ref(false);
const selectedMember = ref({});

// Search
const search = ref('');

// Column View Mode
const columnView = ref('minimal'); // 'minimal' or 'detailed'

// ✅ Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Sorting
const sortBy = ref('');
const sortDirection = ref('asc');

// Handle sorting
const sort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'asc';
  }
};

// Column Visibility
const visibleColumns = ref({
  image: true,
  existing_membership_id: true,
  membership_type_id: true,
  membership_status_id: true,
  membership_start_date: true,
  first_name: true,
  last_name: true,
  email: true,
  mobile: true,
  address: true,
  note: true,
  is_active: true,
  action: true,
});


// Form
const form = ref({
  id: null,
  existing_membership_id: '',
  membership_type_id: '',
  membership_status_id: '',
  membership_start_date: '',
  first_name: '',
  last_name: '',
  email: '',
  mobile: '',
  address: '',
  note: '',
  is_active: true,
  image_file: null,
});

// Fetch members
const fetchMembers = async () => {
  try {
    const res = await auth.uploadProtectedApi('/api/unlink-members', {}, 'GET');
    members.value = res.status ? res.data : [];
  } catch (err) {
    console.error(err);
  }
};

// onMounted(fetchMembers);
// Initial fetch
onMounted(() => {
  fetchMembers();
  fetchMembershipType();
  fetchMembershipSatatuses();
});

const membershipTypes = ref([])
// ✅ Fetch membership types
const fetchMembershipType = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/org-membership-types', {}, 'GET')
    membershipTypes.value = response.status ? response.data : []
  } catch (error) {
    console.error('Error fetching membership types:', error)
  }
}

const membershipStatuses = ref([])
const fetchMembershipSatatuses = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/membership-statuses', {}, 'GET')
    membershipStatuses.value = response.status ? response.data : []
  } catch (error) {
    console.error('Error fetching membership types:', error)
  }
}
const filteredMembers = computed(() => {
  if (!search.value) return members.value;
  const keyword = search.value.toLowerCase();
  return members.value.filter((m) =>
    [m.first_name, m.last_name, m.email, m.mobile]
      .some((field) => field?.toLowerCase().includes(keyword))
  );
});

const sortedMembers = computed(() => {
  if (!sortBy.value) return filteredMembers.value;

  return [...filteredMembers.value].sort((a, b) => {
    const aValue = sortBy.value === 'full_name'
      ? (a.first_name + ' ' + (a.last_name ?? '')).toLowerCase()
      : (a[sortBy.value] ?? '').toString().toLowerCase();

    const bValue = sortBy.value === 'full_name'
      ? (b.first_name + ' ' + (b.last_name ?? '')).toLowerCase()
      : (b[sortBy.value] ?? '').toString().toLowerCase();

    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// Modal functions
const openModal = (member = null) => {
  closeViewModal();
  isEditMode.value = !!member;
  form.value = member
    ? {
      id: member.id,
      existing_membership_id: member.existing_membership_id,
      membership_type_id: member.membership_type_id,
      membership_status_id: member.membership_status_id,
      membership_start_date: member.membership_start_date,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      mobile: member.mobile,
      address: member.address,
      note: member.note,
      is_active: member.is_active === 1,
      image_file: null,
    }
    : {
      id: null,
      existing_membership_id: '',
      membership_type_id: '',
      membership_status_id: '',
      membership_start_date: '',
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      address: '',
      note: '',
      is_active: true,
      image_file: null,
    };

  previewImage.value = member?.image_url ?? null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  form.value = {
    id: null,
    existing_membership_id: '',
    membership_type_id: '',
    membership_status_id: '',
    membership_start_date: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    address: '',
    note: '',
    is_active: true,
    image_file: null,
  };
  previewImage.value = null;
};

const handleImage = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.value.image_file = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const saveMember = async () => {
  const formData = new FormData();
  formData.append('existing_membership_id', form.value.existing_membership_id ?? '');
  formData.append('membership_type_id', form.value.membership_type_id ?? '');
  formData.append('membership_status_id', form.value.membership_status_id ?? '');
  formData.append('membership_start_date', form.value.membership_start_date ?? '');
  formData.append('first_name', form.value.first_name ?? '');
  formData.append('last_name', form.value.last_name ?? '');
  formData.append('email', form.value.email ?? '');
  formData.append('mobile', form.value.mobile ?? '');
  formData.append('address', form.value.address ?? '');
  formData.append('note', form.value.note ?? '');
  formData.append('is_active', form.value.is_active ? '1' : '0');
  if (form.value.image_file) {
    formData.append('image_path', form.value.image_file);
  }

  try {
    const endpoint = isEditMode.value
      ? `/api/unlink-members/${form.value.id}`
      : '/api/unlink-members';
    const method = isEditMode.value ? 'POST' : 'POST';

    if (isEditMode.value) formData.append('_method', 'PUT');

    const res = await auth.uploadProtectedApi(endpoint, formData, method);
    if (res.status) {
      Swal.fire('Success', `Member ${isEditMode.value ? 'updated' : 'created'} successfully.`, 'success');
      fetchMembers();
      closeModal();
    } else {
      Swal.fire('Error', 'Could not save member.', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'An error occurred. Please try again.', 'error');
  }
};

const deleteMember = async (id) => {
  closeViewModal();
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will permanently delete the member.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  });
  if (result.isConfirmed) {
    try {
      const res = await auth.uploadProtectedApi(`/api/unlink-members/${id}`, {}, 'DELETE');
      if (res.status) {
        Swal.fire('Deleted', 'Member deleted.', 'success');
        fetchMembers();
      } else {
        Swal.fire('Error', 'Could not delete member.', 'error');
      }
    } catch {
      Swal.fire('Error', 'An error occurred. Please try again.', 'error');
    }
  }
};

const openViewModal = (member) => {
  selectedMember.value = member;
  viewModalOpen.value = true;
};

const closeViewModal = () => {
  viewModalOpen.value = false;
  selectedMember.value = {};
};

// Pagination Computed Properties
const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedMembers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredMembers.value.length / itemsPerPage.value));
});

// ✅ Item Summary
const itemSummary = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(currentPage.value * itemsPerPage.value, filteredMembers.value.length);
  const total = filteredMembers.value.length;
  return `Items ${start}-${end} of ${total}`;
});


const minimalColumns = ['image', 'full_name', 'mobile', 'is_active', 'action'];
const detailedColumns = ['image', 'full_name', 'email', 'mobile', 'address', 'note', 'is_active', 'action'];

const columnLabels = {
  full_name: "Full Name",
  email: "Email",
  mobile: "Mobile",
  address: "Address",
  note: "Note",
  is_active: "Status",
};

const exportHeaders = computed(() => {
  const selectedColumns = columnView.value === 'minimal' ? minimalColumns : detailedColumns;
  // Filter out image and action — we don't export those
  return selectedColumns
    .filter(c => c !== 'image' && c !== 'action')
    .map(c => ({
      text: columnLabels[c] || c,
      value: c,
    }));
});
const exportRows = computed(() => {
  const selectedColumns = columnView.value === 'minimal' ? minimalColumns : detailedColumns;

  return filteredMembers.value.map(m => {
    const row = {};
    if (selectedColumns.includes('full_name'))
      row.full_name = `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim();
    if (selectedColumns.includes('email')) row.email = m.email ?? '';
    if (selectedColumns.includes('mobile')) row.mobile = m.mobile ?? '';
    if (selectedColumns.includes('address')) row.address = m.address ?? '';
    if (selectedColumns.includes('note')) row.note = m.note ?? '';
    if (selectedColumns.includes('is_active'))
      row.is_active = m.is_active ? 'Active' : 'Inactive';
    return row;
  });
});

// Set initial visible columns based on column view
onMounted(() => {
  setVisibleColumns(columnView.value);
});
const setVisibleColumns = (view) => {
  const selectedSet = view === 'minimal' ? minimalColumns : detailedColumns;
  visibleColumns.value = {
    image: selectedSet.includes('image'),
    full_name: true, // New full name column
    email: selectedSet.includes('email'),
    mobile: selectedSet.includes('mobile'),
    address: selectedSet.includes('address'),
    note: selectedSet.includes('note'),
    is_active: selectedSet.includes('is_active'),
    action: selectedSet.includes('action'),
  };
};

// Initialize on setup
setVisibleColumns(columnView.value);

// Pagination Methods
watch([search, itemsPerPage], () => {
  currentPage.value = 1;
});

watch(columnView, (newVal) => {
  setVisibleColumns(newVal);
});

// --- Export CSV ---
const doExportDOCX = async () => {
  docxExport({
    headers: exportHeaders.value,
    rows: exportRows.value,
    title: 'Unlinked Members List',
    fileName: 'Unlinked_Members.docx'
  })
}
// --- Export CSV ---
const exportCSV = async () => {
  await csvExport({
    headers: exportHeaders.value,
    rows: exportRows.value,
    title: "Unlinked Members List",
    fileName: "Unlinked_Members.csv",
  });
};

// --- Export Excel ---
const exportXLSX = async () => {
  await excelExport({
    headers: exportHeaders.value,
    rows: exportRows.value,
    title: "Independent Members List",
    fileName: "Unlinked_Members.xlsx",
  });
};

// --- Export PDF ---
const exportPDF = () => {
  pdfExport({
    headers: exportHeaders.value,
    rows: exportRows.value,
    title: "Unlinked Members List",
    fileName: "Unlinked_Members.pdf",
  });
};


</script>

<template>
  <div class="card p-6 bg-white rounded-lg shadow-md">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-start gap-4 py-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold text-gray-700">Unlinked Members <span class="text-red-500">(Not
            Recommended)</span></h2>
        <p class="text-xs text-gray-500 max-w-2xl break-words">
          It is recommended to add members using the <span class="font-medium text-gray-600">Search</span> option.
          If the member does not have an Azonation account, you can add them manually.
          Please note that <span class="font-semibold text-red-500">unlinked members</span> will not receive updates,
          and no actions can be performed for them within Azonation. This list is for record purposes only.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input v-model="search" type="text" placeholder="Search..."
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

        <button @click="exportCSV"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">CSV</button>
        <button @click="exportXLSX"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">Excel</button>
        <button @click="exportPDF"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">PDF</button>
        <button @click="doExportDOCX"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">Word</button>

        <button @click="openModal()" class="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
          + Add
        </button>

      </div>
    </div>

    <!-- Column View and Visibility Options -->
    <div class="border rounded bg-gray-50 p-4 flex flex-wrap gap-6 items-center mb-5">
      <!-- Column View Dropdown -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Column View:</span>
        <select v-model="columnView" class="px-2 py-1 border rounded text-sm bg-white">
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>

      <!-- Visible Columns -->
      <div class="flex items-center flex-wrap gap-3">
        <span class="text-sm font-medium text-gray-700">Visible Columns</span>
        <label v-for="(value, key) in visibleColumns" :key="key" class="flex items-center gap-1 text-sm">
          <input type="checkbox" v-model="visibleColumns[key]" class="rounded" />
          {{ key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ') }}
        </label>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full min-w-[800px] divide-y divide-gray-200 border">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-bold text-gray-600">#</th>

            <!-- Image -->
            <th v-if="visibleColumns.image" class="py-3 text-left text-xs font-bold text-gray-600">
              Image
            </th>

            <!-- Name with Sorting -->
            <th v-if="visibleColumns.full_name" @click="sort('full_name')"
              class="cursor-pointer py-3 text-left text-xs font-bold text-gray-600 hover:text-blue-600">
              Full Name
              <span v-if="sortBy === 'full_name'">
                {{ sortDirection === 'asc' ? '▲' : '▼' }}
              </span>
            </th>

            <!-- Email with Sorting -->
            <th v-if="visibleColumns.email && columnView === 'detailed'" @click="sort('email')"
              class="cursor-pointer py-3 text-left text-xs font-bold hover:text-blue-600">
              Email
              <span v-if="sortBy === 'email'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>

            <!-- Mobile with Sorting -->
            <th v-if="visibleColumns.mobile" @click="sort('mobile')"
              class="cursor-pointer py-3 text-left text-xs font-bold hover:text-blue-600">
              Mobile
              <span v-if="sortBy === 'mobile'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>

            <!-- Address -->
            <th v-if="visibleColumns.address && columnView === 'detailed'" @click="sort('address')"
              class="cursor-pointer py-3 text-left text-xs font-bold hover:text-blue-600">
              Address
              <span v-if="sortBy === 'address'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>

            <!-- Note -->
            <th v-if="visibleColumns.note && columnView === 'detailed'" class="py-3 text-left text-xs font-bold">Note
            </th>

            <!-- Active -->
            <th v-if="visibleColumns.is_active" @click="sort('is_active')"
              class="cursor-pointer py-3 text-left text-xs font-bold hover:text-blue-600">
              Active
              <span v-if="sortBy === 'is_active'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>

            <!-- Actions -->
            <th v-if="visibleColumns.action" class="py-3 text-left text-xs font-bold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="(member, index) in paginatedMembers" :key="member.id" class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 text-sm text-gray-700">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>

            <td v-if="visibleColumns.image" class="py-3">
              <img :src="member.image_url || placeholderImage" class="h-10 w-10 rounded-full object-cover" />
            </td>

            <td v-if="visibleColumns.full_name" class="py-3 text-sm text-gray-700">
              {{ member.first_name }} {{ member.last_name }}
            </td>

            <td v-if="visibleColumns.email && columnView === 'detailed'" class="py-3 text-sm text-gray-700">
              {{ member.email }}
            </td>

            <td v-if="visibleColumns.mobile" class="py-3 text-sm text-gray-700">
              {{ member.mobile }}
            </td>

            <td v-if="visibleColumns.address && columnView === 'detailed'" class="py-3 text-sm text-gray-700">
              {{ member.address }}
            </td>

            <td v-if="visibleColumns.note && columnView === 'detailed'" class="py-3 text-sm text-gray-700">
              {{ member.note }}
            </td>

            <td v-if="visibleColumns.is_active" class="py-3 text-sm text-gray-700">
              {{ member.is_active === 1 || member.is_active === true ? 'Yes' : 'No' }}
            </td>

            <td v-if="visibleColumns.action" class="py-3 text-sm">
              <button @click="openViewModal(member)" class="text-blue-600 hover:underline hover:text-blue-800">
                Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Responsive Pagination -->
    <div v-if="filteredMembers.length > 0"
      class="border rounded bg-gray-50 p-4 mt-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
      <!-- Item summary -->
      <div class="text-sm text-center md:text-left text-gray-600">
        {{ itemSummary }} | Page {{ currentPage }} of {{ totalPages }}
      </div>

      <!-- Items per page selector -->
      <div class="flex items-center justify-center md:justify-start gap-2 text-sm">
        <label for="itemsPerPage" class="whitespace-nowrap">Items per page:</label>
        <select id="itemsPerPage" v-model="itemsPerPage"
          class="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="250">250</option>
          <option :value="500">500</option>
          <option :value="1000">1000</option>
        </select>
      </div>

      <!-- Navigation buttons -->
      <div class="flex flex-wrap justify-center md:justify-end gap-2 text-sm">
        <button @click="currentPage = 1" :disabled="currentPage === 1" class="px-4 py-2 border rounded transition"
          :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
          First
        </button>
        <button @click="currentPage--" :disabled="currentPage === 1" class="px-4 py-2 border rounded transition"
          :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
          Prev
        </button>
        <button @click="currentPage++" :disabled="currentPage === totalPages"
          class="px-4 py-2 border rounded transition"
          :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
          Next
        </button>
        <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
          class="px-4 py-2 border rounded transition"
          :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
          Last
        </button>
      </div>
    </div>


    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <!-- <div class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"> -->
      <div class="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Unlinked Member Details</h2>
          {{ isEditMode ? 'Edit' : 'Add' }} Unlinked Member
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Organisation Membership Id</label>
            <input v-model="form.existing_membership_id" type="text"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label for="membership_type_id" class="block text-sm font-medium text-gray-700">Membership type</label>
            <select v-model="form.membership_type_id" id="membership_type_id"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="" disabled>Select membership type</option>
              <option v-for="membershipType in membershipTypes" :key="membershipType.membership_type_id"
                :value="membershipType.membership_type_id">
                {{ membershipType.membership_type.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="membership_status_id" class="block text-sm font-medium text-gray-700">Membership status</label>
            <select v-model="form.membership_status_id" id="membership_status_id"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="" disabled>Select membership status</option>
              <option v-for="membershipStatus in membershipStatuses" :key="membershipStatus.id"
                :value="membershipStatus.id">
                {{ membershipStatus.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Membership Start Date</label>
            <input v-model="form.membership_start_date" type="date"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block mb-1">First Name</label>
            <input v-model="form.first_name" type="text" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block mb-1">Last Name</label>
            <input v-model="form.last_name" type="text" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block mb-1">Email</label>
            <input v-model="form.email" type="email" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block mb-1">Mobile</label>
            <input v-model="form.mobile" type="text" class="w-full border rounded p-2" />
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Address</label>
            <textarea v-model="form.address" class="w-full border rounded p-2"></textarea>
          </div>
          <div class="col-span-2">
            <label class="block mb-1">Note</label>
            <textarea v-model="form.note" class="w-full border rounded p-2"></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="form.is_active" />
            <label>Active</label>
          </div>
          <div>
            <label class="block mb-1">Image Upload</label>
            <input type="file" @change="handleImage" accept="image/*" />
            <div v-if="previewImage" class="mt-2">
              <img :src="previewImage" class="h-24 border rounded" />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="closeModal" class="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button @click="saveMember" class="px-4 py-2 bg-blue-600 text-white rounded">
            {{ isEditMode ? 'Update' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="viewModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <!-- <div class="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"> -->
      <div class="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Unlinked Member Details</h2>

        <div class="space-y-4">
          <table class="w-full text-sm text-left text-gray-700">
            <tbody>
              <tr>
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">Image</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2">
                  <img v-if="selectedMember.image_url" :src="selectedMember.image_url" alt="Member Image"
                    class="h-32 w-auto rounded" />
                  <span v-else class="text-gray-500">No image available</span>
                </td>
              </tr>
              <!-- <tr>
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">ID</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2 text-gray-800">{{ selectedMember.id }}</td>
              </tr> -->
              <tr>
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">Name</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2 text-gray-800">{{ selectedMember.first_name }} {{ selectedMember.last_name }}</td>
              </tr>
              <tr v-if="selectedMember.username">
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">Username</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2 text-gray-800">{{ selectedMember.username }}</td>
              </tr>
              <tr>
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">Email</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2 text-gray-800">{{ selectedMember.email }}</td>
              </tr>
              <tr>
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">Mobile</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2 text-gray-800">{{ selectedMember.mobile }}</td>
              </tr>
              <tr>
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">Address</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2 text-gray-800">{{ selectedMember.address }}</td>
              </tr>
              <tr>
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">Note</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2 text-gray-800">{{ selectedMember.note }}</td>
              </tr>
              <tr>
                <th class="py-2 pr-2 font-medium text-gray-600 w-40">Active</th>
                <th class="py-2 pr-2 font-medium text-gray-600 w-3">:</th>
                <td class="py-2 text-gray-800">
                  {{ selectedMember.is_active ? 'Yes' : 'No' }}
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="openModal(selectedMember)"
            class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition">
            <i class="fas fa-edit mr-1"></i> Edit
          </button>
          <button @click="deleteMember(selectedMember.id)"
            class="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition">
            <i class="fas fa-trash mr-1"></i> Delete
          </button>
          <button @click="closeViewModal"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition">
            <i class="fas fa-times mr-1"></i> Close
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 30px;
  /* ✅ Increase height */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
  border: 9px solid #f1f1f1;
  /* ✅ Optional for padding effect */
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
