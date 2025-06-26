<script setup>
import { ref, onMounted, computed } from 'vue'
import { authStore } from '../../../store/authStore'
import router from "../../../router/router"
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

const columnVisibility = ref({
  image_url: true,
  'individual.first_name': true,
  'individual.last_name': true,
  existing_membership_id: true,
  membership_start_date: true,
  actions: true
})

// ✅ Fetch member list
const fetchMemberList = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/org-members/', {}, 'GET')
    memberList.value = response.status ? response.data : []
  } catch (error) {
    console.error("Error fetching member list:", error)
    memberList.value = []
  } finally {
    loading.value = false
  }
}

// ✅ Fetch membership types
const fetchMembershipType = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/membership-types', {}, 'GET')
    membershipTypes.value = response.status ? response.data : []
  } catch (error) {
    console.error('Error fetching membership types:', error)
  }
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

// ✅ Data filter
// const filteredMembers = computed(() => {
//   let list = [...memberList.value]

//   if (search.value.trim()) {
//     list = list.filter(m =>
//       m.individual.name?.toLowerCase().includes(search.value.toLowerCase())
//     )
//   }

//   if (dateFrom.value && dateTo.value) {
//     const from = dayjs(dateFrom.value)
//     const to = dayjs(dateTo.value)
//     list = list.filter(m => {
//       const d = dayjs(m.membership_start_date)
//       return d.isAfter(from.subtract(1, 'day')) && d.isBefore(to.add(1, 'day'))
//     })
//   }

//   return list
// })

const filteredMembers = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  let list = [...memberList.value]

  if (keyword) {
    list = list.filter(m => {
      const firstName = m.individual.first_name?.toLowerCase() || ''
      const lastName = m.individual.last_name?.toLowerCase() || ''
      const membershipId = m.existing_membership_id?.toString().toLowerCase() || ''
      const membershipType = m.membership_type?.name?.toLowerCase() || ''
      const membershipStart = m.membership_start_date
        ? dayjs(m.membership_start_date).format('YYYY-MM-DD').toLowerCase()
        : ''
      const membershipAge = calculateMembershipAge(m.membership_start_date)?.toLowerCase() || ''

      return (
        firstName.includes(keyword) ||
        lastName.includes(keyword) ||
        membershipId.includes(keyword) ||
        membershipType.includes(keyword) ||
        membershipStart.includes(keyword) ||
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
  //columnVisibility.value['individual.first_name', 'individual.last_name'] && { text: 'Name', value: ['individual.first_name', 'individual.last_name'], sortable: true },
  columnVisibility.value['individual.first_name'] && { text: 'Name', value: 'individual.first_name', sortable: true },
  columnVisibility.value.existing_membership_id && { text: 'Membership ID', value: 'existing_membership_id', sortable: true },
  columnVisibility.value.membership_start_date && { text: 'Membership Age', value: 'membership_start_date' },
  columnVisibility.value.actions && { text: 'Actions', value: 'actions' },
].filter(Boolean))

// ✅ Export functions
const exportToExcel = () => {
  const data = filteredMembers.value.map(m => ({
    Name: m.individual.name,
    ID: m.existing_membership_id || '--',
    'Membership Age': calculateMembershipAge(m.membership_start_date)
  }))
  const ws = utils.json_to_sheet(data)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Members")
  writeFileXLSX(wb, "OrgMembers.xlsx")
}

const exportToCSV = () => {
  const data = filteredMembers.value.map(m => [
    m.individual.name,
    m.existing_membership_id || '--',
    calculateMembershipAge(m.membership_start_date)
  ])
  const ws = utils.aoa_to_sheet([
    ['Name', 'Membership ID', 'Membership Age'],
    ...data
  ])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Members")
  writeFileXLSX(wb, "OrgMembers.csv", { bookType: 'csv' })
}

const exportToPDF = () => {
  const doc = new jsPDF()
  const rows = filteredMembers.value.map(m => [
    m.individual.name,
    m.existing_membership_id || '--',
    calculateMembershipAge(m.membership_start_date)
  ])
  autoTable(doc, {
    head: [['Name', 'Membership ID', 'Membership Age']],
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
  selectedMember.value = null
  viewModal.value = false
}

const closeEditModal = () => {
  selectedMember.value = null
  membership_type_id.value = ""
  sponsored_user_id.value = ""
  editModal.value = false
  closeViewModal()
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
        text: 'Member information has been successfully updated.',
        timer: 2000,
        showConfirmButton: false
      })
    } else {
      Swal.fire('Failed', 'Update failed', 'error')
    }
  } catch (error) {
    console.error(error)
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
    try {
      const response = await auth.fetchProtectedApi(`/api/org-members/${memberId}`, {}, 'DELETE')
      if (response.status) {
        await fetchMemberList()
        closeViewModal()
        Swal.fire('Deleted!', 'Member deleted successfully.', 'success')
      } else {
        Swal.fire('Error!', 'Failed to delete member.', 'error')
      }
    } catch (error) {
      console.error(error)
      Swal.fire('Error!', 'An error occurred.', 'error')
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

    <!-- Top Bar -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-700">Organization Members</h2>
      <div class="flex gap-2">
        <button @click="exportToCSV"
          class="border border-gray-300 bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">CSV</button>
        <button @click="exportToExcel"
          class="border border-gray-300 bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">Excel</button>
        <button @click="exportToPDF"
          class="border border-gray-300 bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">PDF</button>
        <button @click="$router.push({ name: 'create-member' })"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ Add Member</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search..."
          class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Start Date</label>
        <input v-model="dateFrom" type="date" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">End Date</label>
        <input v-model="dateTo" type="date" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
    </div>

    <!-- Column Visibility -->
    <div class="flex flex-wrap gap-4">
      <label v-for="(visible, key) in columnVisibility" :key="key"
        class="text-sm text-gray-600 flex gap-2 items-center">
        <input type="checkbox" v-model="columnVisibility[key]" class="accent-blue-600" />
        {{ key.replace('.', ' ').replace(/_/g, ' ').replace('individual name', 'Name')
        .replace('image url', 'Image').replace('membership start date', 'Membership Age')
        .replace('existing membership id', 'Membership ID').replace('actions', 'Actions') }}
      </label>
    </div>

    <!-- Data Table -->
    <EasyDataTable :headers="headers" :items="filteredMembers" :search-value="search" :loading="loading" show-index
      :theme-color="'#3b82f6'">
      <template #item-image_url="{ image_url }">
        <img :src="image_url || placeholderImage" class="h-10 w-10 rounded-full object-cover" />
      </template>

      <template #item-membership_start_date="{ membership_start_date }">
        <span class="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
          {{ calculateMembershipAge(membership_start_date) }}
        </span>
      </template>

      <template #item-actions="{ id }">
        <button @click="viewMemberDetail(memberList.find(m => m.id === id))"
          class="text-blue-600 hover:underline text-xs">Details</button>
      </template>
    </EasyDataTable>


    <!-- ✅ View Member Modal -->
    <div v-if="viewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8 relative">

        <div class="flex justify-between items-start border-b pb-4 mb-6">
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">{{ selectedMember?.individual?.name ?? '--' }}</h2>
            <p class="text-sm text-gray-500">ID: {{ selectedMember?.existing_membership_id }}</p>
          </div>
          <div class="text-right">
            <span class="text-sm px-3 py-1 rounded-full"
              :class="selectedMember?.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
              {{ selectedMember?.is_active === 1 ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-y-4 gap-x-8 text-sm text-gray-700">
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership type:</span>
            <span class="text-right">{{ selectedMember?.membership_type?.name ?? '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Start date:</span>
            <span class="text-right">
              {{
                selectedMember?.membership_start_date
                ? new Date(selectedMember?.membership_start_date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
                : 'Not provided'
              }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership age:</span>
            <span class="text-right">
              {{ calculateMembershipAge(selectedMember?.membership_start_date) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Reference/sponsored by:</span>
            <span class="text-right">
              {{
                selectedMember?.sponsored_user_id
                ? memberList.find(m => m.individual.id === selectedMember.sponsored_user_id)?.individual.name
                : 'Not provided'
              }}
            </span>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <button @click="editMember"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">Edit</button>
          <button @click="deleteMember(selectedMember.id)"
            class="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-lg">Delete</button>
          <button @click="closeViewModal"
            class="bg-gray-200 hover:bg-gray-300 text-sm px-5 py-2 rounded-lg">Close</button>
        </div>
      </div>
    </div>


    <!-- ✅ Edit Member Modal -->
    <div v-if="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
        <h2 class="text-lg font-semibold mb-4">{{ selectedMember?.individual?.name }}</h2>
        <form @submit.prevent="updateMember">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Membership Id</label>
              <input v-model="selectedMember.existing_membership_id" type="text"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div>
              <label for="membership_type_id" class="block text-sm font-medium text-gray-700">Membership type</label>
              <select v-model="membership_type_id" id="membership_type_id"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="" disabled>Select membership type</option>
                <option v-for="membershipType in membershipTypes" :key="membershipType.id" :value="membershipType.id">
                  {{ membershipType.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Membership Start Date</label>
              <input v-model="selectedMember.membership_start_date" type="date"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <div>
              <label for="sponsored_user_id" class="block text-sm font-medium text-gray-700">Reference/Sponsored
                Member</label>
              <select v-model="sponsored_user_id" id="sponsored_user_id"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="" disabled>Select Reference/Sponsored Member</option>
                <option v-for="orgMember in memberList" :key="orgMember.individual.id"
                  :value="orgMember.individual.id">
                  {{ orgMember.individual.name }}
                </option>
              </select>
            </div>

          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="submit"
              class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg">Save</button>
            <button @click="closeEditModal" type="button"
              class="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

