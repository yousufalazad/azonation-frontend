<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore

// State
const members = ref([])
const isModalOpen = ref(false)
const isEditMode = ref(false)
const previewImage = ref(null)
const viewModalOpen = ref(false)
const selectedMember = ref({})

// Form data
const form = ref({
  id: null,
  name: '',
  email: '',
  mobile: '',
  address: '',
  note: '',
  is_active: true,
  image_file: null,
})

// Fetch members
const fetchMembers = async () => {
  try {
    const res = await auth.uploadProtectedApi('/api/independent-members', {}, 'GET')
    members.value = res.status ? res.data : []
  } catch (err) {
    console.error(err)
  }
}

onMounted(fetchMembers)

// Open Add/Edit modal
const openModal = (member = null) => {
  isEditMode.value = !!member
  form.value = member
    ? {
      id: member.id,
      name: member.name,
      email: member.email,
      mobile: member.mobile,
      address: member.address,
      note: member.note,
      is_active: member.is_active === 1,
      image_file: null,
    }
    : {
      id: null,
      name: '',
      email: '',
      mobile: '',
      address: '',
      note: '',
      is_active: true,
      image_file: null,
    }

  previewImage.value = member?.image_url ?? null
  isModalOpen.value = true
}

// Close Add/Edit modal
const closeModal = () => {
  isModalOpen.value = false
  form.value = {
    id: null,
    name: '',
    email: '',
    mobile: '',
    address: '',
    note: '',
    is_active: true,
    image_file: null,
  }
  previewImage.value = null
}

// Handle image selection
const handleImage = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.value.image_file = file
    previewImage.value = URL.createObjectURL(file)
  }
}

// Save or update member
const saveMember = async () => {
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('email', form.value.email)
  formData.append('mobile', form.value.mobile)
  formData.append('address', form.value.address)
  formData.append('note', form.value.note)
  formData.append('is_active', form.value.is_active ? '1' : '0')

  if (form.value.image_file) {
    formData.append('image_path', form.value.image_file)
  }

  try {
    const endpoint = isEditMode.value
      ? `/api/independent-members/${form.value.id}`
      : '/api/independent-members'
    const method = isEditMode.value ? 'POST' : 'POST'

    if (isEditMode.value) formData.append('_method', 'PUT')

    const res = await auth.uploadProtectedApi(endpoint, formData, method)
    if (res.status) {
      Swal.fire('Success', `Member ${isEditMode.value ? 'updated' : 'created'} successfully.`, 'success')
      fetchMembers()
      closeModal()
    } else {
      Swal.fire('Error', 'Could not save member.', 'error')
    }
  } catch (err) {
    console.error(err)
    Swal.fire('Error', 'An error occurred. Please try again.', 'error')
  }
}

// Delete member
const deleteMember = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will permanently delete the member.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  })
  if (result.isConfirmed) {
    try {
      const res = await auth.uploadProtectedApi(`/api/independent-members/${id}`, {}, 'DELETE')
      if (res.status) {
        Swal.fire('Deleted', 'Member deleted.', 'success')
        fetchMembers()
      } else {
        Swal.fire('Error', 'Could not delete member.', 'error')
      }
    } catch {
      Swal.fire('Error', 'An error occurred. Please try again.', 'error')
    }
  }
}

// Open View modal
const openViewModal = (member) => {
  selectedMember.value = member
  viewModalOpen.value = true
}

// Close View modal
const closeViewModal = () => {
  viewModalOpen.value = false
  selectedMember.value = {}
}
</script>

<template>
  <div class="p-6">
    <!-- Add Button -->
    <div class="mt-4 text-right">
      <button @click="openModal()" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
        Add Member
      </button>
    </div>

    <!-- Members Table -->
    <table class="w-full table-auto border mt-4">
      <thead>
        <tr class="bg-gray-200">
          <th class="px-4 py-2 text-left">Name</th>
          <th class="px-4 py-2 text-left">Image</th>
          <th class="px-4 py-2 text-left">Email</th>
          <th class="px-4 py-2 text-left">Mobile</th>
          <th class="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.id" class="border-t">
          <td class="px-4 py-2">{{ member.name }}</td>
          <td class="px-4 py-2">
            <img :src="member.image_url" alt="Member Image" class="w-16 h-16 object-cover rounded"
              v-if="member.image_url">
            <span v-else class="text-gray-400 italic">No Image</span>
          </td>
          <td class="px-4 py-2">{{ member.email }}</td>
          <td class="px-4 py-2">{{ member.mobile }}</td>
          <td class="px-4 py-2">
            <!-- View Button -->
            <button @click="openViewModal(member)"
              class="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600 transition">
              View
            </button>

            <!-- Edit Button -->
            <button @click="openModal(member)"
              class="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600 transition">
              Edit
            </button>

            <!-- Delete Button -->
            <button @click="deleteMember(member.id)"
              class="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Image</th>
          <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
          <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile</th>
          <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Active</th>
          <th class="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50 transition">
          <td class="px-4 py-2">
            <img :src="member.image_url" alt="Member Image" class="w-16 h-16 object-cover rounded"
              v-if="member.image_url">
            <span v-else class="text-gray-400 italic">No Image</span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-700">{{ member.name }}</td>
          <td class="px-6 py-4 text-sm text-gray-700">{{ member.email }}</td>
          <td class="px-6 py-4 text-sm text-gray-700">{{ member.mobile }}</td>
          <td class="px-6 py-4 text-sm text-gray-700">
            <span :class="member.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
              class="px-2 py-1 rounded-full text-xs font-medium">
              {{ member.is_active ? 'Yes' : 'No' }}
            </span>
          </td>
          <td class="px-6 py-4 text-center">
            <button @click="openViewModal(member)"
              class="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600 transition">
              View
            </button>

            <button @click="openModal(member)"
              class="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600 transition">
              Edit
            </button>
            <button @click="deleteMember(member.id)"
              class="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ isEditMode ? 'Edit' : 'Add' }} Member
        </h2>

        <!-- Name -->
        <div class="mb-4">
          <label class="block mb-1">Name</label>
          <input v-model="form.name" type="text" class="w-full border rounded p-2" />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full border rounded p-2" />
        </div>

        <!-- Mobile -->
        <div class="mb-4">
          <label class="block mb-1">Mobile</label>
          <input v-model="form.mobile" type="text" class="w-full border rounded p-2" />
        </div>

        <!-- Address -->
        <div class="mb-4">
          <label class="block mb-1">Address</label>
          <textarea v-model="form.address" class="w-full border rounded p-2"></textarea>
        </div>

        <!-- Note -->
        <div class="mb-4">
          <label class="block mb-1">Note</label>
          <textarea v-model="form.note" class="w-full border rounded p-2"></textarea>
        </div>

        <!-- is_active -->
        <div class="mb-4">
          <label class="inline-flex items-center">
            <input type="checkbox" v-model="form.is_active" class="mr-2" />
            Active
          </label>
        </div>

        <!-- Image Upload -->
        <div class="mb-4">
          <label class="block mb-1">Image Upload</label>
          <input type="file" @change="handleImage" accept="image/*" />
          <div v-if="previewImage" class="mt-2">
            <img :src="previewImage" class="h-24 border rounded" />
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex justify-end space-x-2">
          <button @click="closeModal" class="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
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
          <div><strong>Name:</strong> {{ selectedMember.name }}</div>
          <div><strong>Email:</strong> {{ selectedMember.email }}</div>
          <div><strong>Mobile:</strong> {{ selectedMember.mobile }}</div>
          <div><strong>Address:</strong> {{ selectedMember.address }}</div>
          <div><strong>Note:</strong> {{ selectedMember.note }}</div>
          <div><strong>Active:</strong> {{ selectedMember.is_active ? 'Yes' : 'No' }}</div>
          <div v-if="selectedMember.image_url" class="col-span-2">
            <img :src="selectedMember.image_url" class="h-32 border rounded" />
          </div>
        </div>
        <div class="mt-4 text-right">
          <button @click="closeViewModal" class="px-4 py-2 bg-blue-600 text-white rounded">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>