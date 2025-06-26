<script setup>
import { ref, onMounted, computed } from 'vue'
import { authStore } from '../../../store/authStore'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg'
import { utils, writeFileXLSX } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const auth = authStore

const memberList = ref([])
const search = ref("")
const dateFrom = ref("")
const dateTo = ref("")
const loading = ref(false)

const membershipTypes = ref([])
const selectedMember = ref(null)
const viewModal = ref(false)
const editModal = ref(false)
const membership_type_id = ref("")
const sponsored_user_id = ref("")

const headersMap = {
  image_url: 'Image',
  full_name: 'Name',
  membership_type: 'Membership Type',
  membership_start_date: 'Joining Date',
  membership_age: 'Membership Age',
  existing_membership_id: 'Membership ID',
  actions: 'Actions'
}

const columnVisibility = ref({
  image_url: true,
  full_name: true,
  membership_type: true,
  membership_start_date: true,
  existing_membership_id: true,
  membership_age: true,
  actions: true
})

// ✅ Fetch member list
const fetchMemberList = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/org-members/', {}, 'GET')
    memberList.value = response.status ? response.data.map(m => ({
      ...m,
      full_name: `${m.individual.first_name || ''} ${m.individual.last_name || ''}`.trim()
    })) : []
  } catch {
    memberList.value = []
  } finally {
    loading.value = false
  }
}

// ✅ Fetch membership types
const fetchMembershipType = async () => {
  const res = await auth.fetchProtectedApi('/api/membership-types', {}, 'GET')
  membershipTypes.value = res.status ? res.data : []
}

// ✅ Membership age calculator
const calculateMembershipAge = (startDate) => {
  if (!startDate) return ''
  const start = dayjs(startDate)
  const now = dayjs()
  const diffYears = now.diff(start, 'year')
  const diffMonths = now.diff(start.add(diffYears, 'year'), 'month')
  const diffDays = now.diff(start.add(diffYears, 'year').add(diffMonths, 'month'), 'day')
  return `${diffYears}y ${diffMonths}m ${diffDays}d`
}

// ✅ Data filter with advanced search
const filteredMembers = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  let list = [...memberList.value]

  if (keyword) {
    list = list.filter(m => {
      const fullName = m.full_name?.toLowerCase() || ''
      const membershipId = m.existing_membership_id?.toString().toLowerCase() || ''
      const membershipType = m.membership_type?.name?.toLowerCase() || ''
      const joiningDate = m.membership_start_date
        ? dayjs(m.membership_start_date).format('YYYY-MM-DD').toLowerCase()
        : ''
      const membershipAge = calculateMembershipAge(m.membership_start_date)?.toLowerCase() || ''

      return (
        fullName.includes(keyword) ||
        membershipId.includes(keyword) ||
        membershipType.includes(keyword) ||
        joiningDate.includes(keyword) ||
        membershipAge.includes(keyword)
      )
    })
  }

  if (dateFrom.value && dateTo.value) {
    const from = dayjs(dateFrom.value)
    const to = dayjs(dateTo.value)
    list = list.filter(m => {
      const d = dayjs(m.membership_start_date)
      return d.isAfter(from.subtract(1, 'day')) && d.isBefore(to.add(1, 'day'))
    })
  }

  return list
})

// ✅ Table headers
const headers = computed(() => [
  columnVisibility.value.image_url && { text: 'Image', value: 'image_url' },
  columnVisibility.value.full_name && { text: 'Name', value: 'full_name', sortable: true },
  columnVisibility.value.membership_type && { text: 'Membership Type', value: 'membership_type.name', sortable: true },
  columnVisibility.value.membership_start_date && { text: 'Joining Date', value: 'membership_start_date', sortable: true },
  columnVisibility.value.membership_age && { text: 'Membership Age', value: 'membership_start_date' },
  columnVisibility.value.existing_membership_id && { text: 'Membership ID', value: 'existing_membership_id', sortable: true },
  columnVisibility.value.actions && { text: 'Actions', value: 'actions' },
].filter(Boolean))

// ✅ Export functions
const exportToExcel = () => {
  const data = filteredMembers.value.map(m => ({
    'Full Name': m.full_name,
    'Membership Type': m.membership_type?.name || '--',
    'Joining Date': m.membership_start_date ? dayjs(m.membership_start_date).format('YYYY-MM-DD') : '--',
    'Membership ID': m.existing_membership_id || '--',
    'Membership Age': calculateMembershipAge(m.membership_start_date)
  }))
  const ws = utils.json_to_sheet(data)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Members")
  writeFileXLSX(wb, "OrgMembers.xlsx")
}

const exportToCSV = () => {
  const data = filteredMembers.value.map(m => [
    m.full_name,
    m.membership_type?.name || '--',
    m.membership_start_date ? dayjs(m.membership_start_date).format('YYYY-MM-DD') : '--',
    m.existing_membership_id || '--',
    calculateMembershipAge(m.membership_start_date)
  ])
  const ws = utils.aoa_to_sheet([
    ['Full Name', 'Membership Type', 'Joining Date', 'Membership ID', 'Membership Age'],
    ...data
  ])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Members")
  writeFileXLSX(wb, "OrgMembers.csv", { bookType: 'csv' })
}

const exportToPDF = () => {
  const doc = new jsPDF()
  const rows = filteredMembers.value.map(m => [
    m.full_name,
    m.membership_type?.name || '--',
    m.membership_start_date ? dayjs(m.membership_start_date).format('YYYY-MM-DD') : '--',
    m.existing_membership_id || '--',
    calculateMembershipAge(m.membership_start_date)
  ])
  autoTable(doc, {
    head: [['Full Name', 'Membership Type', 'Joining Date', 'Membership ID', 'Membership Age']],
    body: rows,
  })
  doc.save("OrgMembers.pdf")
}

// ✅ Modal handlers
const viewMemberDetail = (member) => {
  selectedMember.value = member
  viewModal.value = true
}
const editMember = () => {
  if (selectedMember.value) {
    membership_type_id.value = selectedMember.value.membership_type_id
    sponsored_user_id.value = selectedMember.value.sponsored_user_id
    editModal.value = true
  }
}
const closeViewModal = () => {
  viewModal.value = false
}
const closeEditModal = () => {
  editModal.value = false
  viewModal.value = false
}

// ✅ Update Member
const updateMember = async () => {
  try {
    const memberId = selectedMember.value?.id
    const payload = {
      existing_membership_id: selectedMember.value?.existing_membership_id,
      membership_start_date: selectedMember.value?.membership_start_date,
      membership_type_id: membership_type_id.value,
      sponsored_user_id: sponsored_user_id.value,
    }
    const response = await auth.fetchProtectedApi(`/api/org-members/${memberId}`, payload, 'PUT')

    if (response.status) {
      await fetchMemberList()
      closeEditModal()
      Swal.fire({
        icon: 'success',
        title: 'Member Updated',
        text: 'Member information has been updated.',
        timer: 2000,
        showConfirmButton: false
      })
    } else {
      Swal.fire('Failed', 'Update failed', 'error')
    }
  } catch {
    Swal.fire('Error', 'An unexpected error occurred.', 'error')
  }
}

// ✅ Delete Member
const deleteMember = async (memberId) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  })

  if (result.isConfirmed) {
    const response = await auth.fetchProtectedApi(`/api/org-members/${memberId}`, {}, 'DELETE')
    if (response.status) {
      await fetchMemberList()
      closeViewModal()
      Swal.fire('Deleted!', 'Member deleted successfully.', 'success')
    } else {
      Swal.fire('Error!', 'Failed to delete member.', 'error')
    }
  }
}

// ✅ Lifecycle
onMounted(() => {
  fetchMemberList()
  fetchMembershipType()
})
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-6">

    <!-- Header with Actions -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-semibold text-gray-800">Organization Members</h2>
        <p class="text-sm text-gray-500">Manage and track your organization members efficiently.</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportToCSV" class="btn-outline">CSV</button>
        <button @click="exportToExcel" class="btn-outline">Excel</button>
        <button @click="exportToPDF" class="btn-outline">PDF</button>
        <button @click="$router.push({ name: 'create-member' })" class="btn-add">+ Add Member</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="label">Search</label>
        <input v-model="search" type="text" placeholder="Search members..." class="input" />
      </div>
      <div>
        <label class="label">Start Date</label>
        <input v-model="dateFrom" type="date" class="input" />
      </div>
      <div>
        <label class="label">End Date</label>
        <input v-model="dateTo" type="date" class="input" />
      </div>
    </div>

    <!-- Column Visibility -->
    <div class="flex flex-wrap gap-4">
      <label v-for="(visible, key) in columnVisibility" :key="key" class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="columnVisibility[key]" class="accent-blue-600" />
        {{ headersMap[key] }}
      </label>
    </div>

    <!-- Data Table -->
    <EasyDataTable
      :headers="headers"
      :items="filteredMembers"
      :loading="loading"
      :theme-color="'#2563eb'"
      show-index
    >
      <template #item-image_url="{ image_url }">
        <img :src="image_url || placeholderImage" class="h-10 w-10 rounded-full object-cover" />
      </template>

      <template #item-membership_start_date="{ membership_start_date }">
        {{ membership_start_date ? new Date(membership_start_date).toLocaleDateString('en-GB') : '--' }}
      </template>

      <template #item-membership_age="{ membership_start_date }">
        <span class="badge">
          {{ calculateMembershipAge(membership_start_date) }}
        </span>
      </template>

      <template #item-actions="{ id }">
        <div class="flex gap-2">
          <button @click="viewMemberDetail(memberList.find(m => m.id === id))" class="btn-icon">👁️</button>
          <button @click="deleteMember(id)" class="btn-icon">🗑️</button>
        </div>
      </template>
    </EasyDataTable>

    <!-- ✅ View Modal -->
    <div v-if="viewModal" class="modal">
      <div class="modal-content max-w-xl">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-semibold">{{ selectedMember?.full_name }}</h2>
            <p class="text-sm text-gray-500">ID: {{ selectedMember?.existing_membership_id }}</p>
          </div>
          <span class="badge"
            :class="selectedMember?.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
            {{ selectedMember?.is_active === 1 ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership Type:</span>
            <span>{{ selectedMember?.membership_type?.name ?? '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Joining Date:</span>
            <span>
              {{
                selectedMember?.membership_start_date
                  ? new Date(selectedMember?.membership_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '--'
              }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership Age:</span>
            <span>{{ calculateMembershipAge(selectedMember?.membership_start_date) }}</span>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="editMember" class="btn">Edit</button>
          <button @click="deleteMember(selectedMember.id)" class="btn-danger">Delete</button>
          <button @click="closeViewModal" class="btn-cancel">Close</button>
        </div>
      </div>
    </div>

    <!-- ✅ Edit Modal -->
    <div v-if="editModal" class="modal">
      <div class="modal-content max-w-xl">
        <h2 class="text-xl font-semibold mb-4">Edit Member</h2>
        <form @submit.prevent="updateMember" class="space-y-4">
          <div>
            <label class="label">Membership ID</label>
            <input v-model="selectedMember.existing_membership_id" type="text" class="input" />
          </div>

          <div>
            <label class="label">Membership Type</label>
            <select v-model="membership_type_id" class="input">
              <option value="" disabled>Select Membership Type</option>
              <option v-for="type in membershipTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <div>
            <label class="label">Joining Date</label>
            <input v-model="selectedMember.membership_start_date" type="date" class="input" />
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="submit" class="btn">Update</button>
            <button type="button" @click="closeEditModal" class="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
