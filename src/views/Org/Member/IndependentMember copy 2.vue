<script setup>
import { ref, computed, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import { exportToCSV, exportToExcel, exportToPDF } from '../../../global/exportUtils';


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
const columnView = ref('detailed');

// Column Visibility
const visibleColumns = ref({
  image: true,
  name: true,
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
    const res = await auth.uploadProtectedApi('/api/independent-members', {}, 'GET');
    members.value = res.status ? res.data : [];
  } catch (err) {
    console.error(err);
  }
};

onMounted(fetchMembers);

// Filtered Members
const filteredMembers = computed(() => {
  if (!search.value) return members.value;
  const keyword = search.value.toLowerCase();
  return members.value.filter((m) =>
    [m.first_name, m.last_name, m.email, m.mobile]
      .some((field) => field?.toLowerCase().includes(keyword))
  );
});

// Modal functions
const openModal = (member = null) => {
  isEditMode.value = !!member;
  form.value = member
    ? {
      id: member.id,
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
  formData.append('first_name', form.value.first_name);
  formData.append('last_name', form.value.last_name);
  formData.append('email', form.value.email);
  formData.append('mobile', form.value.mobile);
  formData.append('address', form.value.address);
  formData.append('note', form.value.note);
  formData.append('is_active', form.value.is_active ? '1' : '0');
  if (form.value.image_file) {
    formData.append('image_path', form.value.image_file);
  }

  try {
    const endpoint = isEditMode.value
      ? `/api/independent-members/${form.value.id}`
      : '/api/independent-members';
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
      const res = await auth.uploadProtectedApi(`/api/independent-members/${id}`, {}, 'DELETE');
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

// Export Functions
const exportCSV = () => {
  exportToCSV(filteredMembers.value, 'independent_members');
};
const exportExcel = () => {
  exportToExcel(filteredMembers.value, 'independent_members');
};
const exportPDF = () => {
  exportToPDF(filteredMembers.value, 'independent_members');
};
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center py-4 gap-2 border-b">
      <h2 class="text-lg font-semibold text-gray-600">Independent Members (Unlinked)</h2>
      <div class="flex gap-2">
        <input v-model="search" type="text" placeholder="Search..."
          class="px-3 py-1.5 border border-gray-300 rounded text-sm" />

        <button @click="exportCSV"
          class="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-100">CSV</button>
        <button @click="exportExcel"
          class="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-100">Excel</button>
        <button @click="exportPDF"
          class="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-100">PDF</button>
        <button @click="openModal()" class="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">+
          Add</button>
      </div>
    </div>

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
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th v-if="visibleColumns.image" class="py-3 text-left text-xs font-bold text-gray-600">Image</th>
            <th v-if="visibleColumns.name" class="py-3 text-left text-xs font-bold text-gray-600">Name</th>
            <th v-if="visibleColumns.email && columnView === 'detailed'" class="py-3 text-left text-xs font-bold">Email
            </th>
            <th v-if="visibleColumns.mobile" class="py-3 text-left text-xs font-bold">Mobile</th>
            <th v-if="visibleColumns.address && columnView === 'detailed'" class="py-3 text-left text-xs font-bold">
              Address</th>
            <th v-if="visibleColumns.note && columnView === 'detailed'" class="py-3 text-left text-xs font-bold">Note
            </th>
            <th v-if="visibleColumns.is_active" class="py-3 text-left text-xs font-bold">Active</th>
            <th v-if="visibleColumns.action" class="py-3 text-left text-xs font-bold text-gray-600">Actions</th>

          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(member, index) in filteredMembers" :key="member.id" class="hover:bg-gray-50 transition">
            <td v-if="visibleColumns.image" class="py-4">
              <img :src="member.image_url || placeholderImage" class="h-10 w-10 rounded-full object-cover" />
            </td>
            <td v-if="visibleColumns.name" class="py-4 text-sm text-gray-700">
              {{ member.first_name }} {{ member.last_name }}
            </td>
            <td v-if="visibleColumns.email && columnView === 'detailed'" class="py-4 text-sm text-gray-700">{{
              member.email }}</td>
            <td v-if="visibleColumns.mobile" class="py-4 text-sm text-gray-700">{{ member.mobile }}</td>
            <td v-if="visibleColumns.address && columnView === 'detailed'" class="py-4 text-sm text-gray-700">{{
              member.address }}</td>
            <td v-if="visibleColumns.note && columnView === 'detailed'" class="py-4 text-sm text-gray-700">{{
              member.note }}</td>
            <td v-if="visibleColumns.is_active" class="py-4 text-sm text-gray-700">
              {{ member.is_active === 1 || member.is_active === true ? 'Yes' : 'No' }}
            </td>
            <td v-if="visibleColumns.action" class="py-4 text-sm">
              <button @click="openViewModal(member)"
                class="text-blue-600 hover:underline hover:text-blue-800">Details</button>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ isEditMode ? 'Edit' : 'Add' }} Member
        </h2>
        <div class="grid grid-cols-2 gap-4">
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
      <div class="bg-white p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Member Details</h2>
        <div class="grid grid-cols-2 gap-4">
          <div><strong>Name:</strong> {{ selectedMember.first_name }} {{ selectedMember.last_name }}</div>
          <div><strong>Email:</strong> {{ selectedMember.email }}</div>
          <div><strong>Mobile:</strong> {{ selectedMember.mobile }}</div>
          <div><strong>Address:</strong> {{ selectedMember.address }}</div>
          <div><strong>Note:</strong> {{ selectedMember.note }}</div>
          <div><strong>Active:</strong> {{ selectedMember.is_active ? 'Yes' : 'No' }}</div>
          <div v-if="selectedMember.image_url" class="col-span-2">
            <img :src="selectedMember.image_url" class="h-32 border rounded" />
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="openModal(selectedMember)"
            class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
          <button @click="deleteMember(selectedMember.id)"
            class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
          <button @click="closeViewModal" class="px-4 py-2 bg-blue-600 text-white rounded">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
