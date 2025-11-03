<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { authStore } from '../../../store/authStore'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import { utils, writeFileXLSX } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";

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
const compact_view = ref(false)


const exportToWord = async () => {
  const tableRows = [
    new TableRow({
      children: [
        'Name',
        'Membership Type',
        'Membership ID',
        'Joining Date',
        'Membership Age'
      ].map(header => new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ text: header, bold: true })]
      }))
    }),
    ...filteredMembers.value.map(m => new TableRow({
      children: [
        m.full_name || '--',
        m.membership_type?.name || '--',
        m.existing_membership_id || '--',
        m.membership_start_date ? dayjs(m.membership_start_date).format('YYYY-MM-DD') : '--',
        calculateMembershipAge(m.membership_start_date)
      ].map(text => new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [new Paragraph(text)]
      }))
    }))
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Members",
          heading: "Heading1",
        }),
        new Table({
          rows: tableRows
        })
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "OrgMembers.docx");
};

// ✅ Column Profile Logic
const columnProfiles = {
  minimal: ['full_name', 'membership_type.name', 'existing_membership_id'],

  detailed: ['image_url', 'full_name', 'existing_membership_id', 'membership_type.name', 'membership_start_date', 'membership_age', 'actions']
}

const selectedProfile = ref(localStorage.getItem('selected_member_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('visible_member_columns')) || columnProfiles[selectedProfile.value])

watch([visibleColumns, selectedProfile], () => {
  localStorage.setItem('visible_member_columns', JSON.stringify(visibleColumns.value))
  localStorage.setItem('selected_member_profile', selectedProfile.value)
}, { deep: true })

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

// ✅ Table Headers
const allHeaders = [
  { text: 'Image', value: 'image_url' },
  { text: 'Name', value: 'full_name', sortable: true },
  { text: 'Membership ID', value: 'existing_membership_id', sortable: true },
  { text: 'Membership Type', value: 'membership_type.name', sortable: true },
  { text: 'Joining Date', value: 'membership_start_date', sortable: true },
  { text: 'Membership Age', value: 'membership_age' },
  { text: 'Actions', value: 'actions' }
]

// Visibility filter
const headers = computed(() =>
  allHeaders.filter(h => visibleColumns.value.includes(h.value))
)


// ✅ Fetch member list
const fetchMemberList = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/org-terminated-members/', {}, 'GET')
    memberList.value = response.status ? response.data.map(m => ({
      ...m,
      full_name: `${m.individual.first_name || ''} ${m.individual.last_name || ''}`.trim(),
      image_url: m.image_url ?? placeholderImage // Force fallback URL at data source
    })) : []
  } catch {
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
const filteredMembers = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  let list = [...memberList.value].map(member => ({
    ...member,
    image_url: member.image_url || placeholderImage
  }));

  if (keyword) {
    list = list.filter(m => {
      const fullName = m.full_name?.toLowerCase() || ''
      const membershipId = m.existing_membership_id?.toString().toLowerCase() || ''
      const membershipType = m.membership_type?.name?.toLowerCase() || ''
      const membershipStart = m.membership_start_date
        ? dayjs(m.membership_start_date).format('YYYY-MM-DD').toLowerCase()
        : ''
      const membershipAge = calculateMembershipAge(m.membership_start_date)?.toLowerCase() || ''

      return (
        fullName.includes(keyword) ||
        membershipId.includes(keyword) ||
        membershipType.includes(keyword) ||
        membershipStart.includes(keyword) ||
        membershipAge.includes(keyword)
      )
    })
  }

  if (membership_type_id.value) {
    list = list.filter(m => m.membership_type_id === membership_type_id.value)
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

const currentPage = ref(1)
const rowsPerPage = ref(10)

const totalItems = computed(() => filteredMembers.value.length)

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / rowsPerPage.value) || 1
})

const paginatedMembers = computed(() => {
  if (!filteredMembers.value?.length) return [];
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredMembers.value.slice(start, start + rowsPerPage.value);
});



watch([search, rowsPerPage], () => {
  currentPage.value = 1
})
const goToFirst = () => currentPage.value = 1
const goToPrev = () => {
  if (currentPage.value > 1) currentPage.value--
}
const goToNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToLast = () => currentPage.value = totalPages.value



// ✅ Lifecycle
onMounted(() => {
  fetchMemberList()
  fetchMembershipType()
})
</script>


<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-6">

    <!-- Top Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h2 class="text-lg font-semibold text-gray-700">Terminated Members</h2>
      <div class="flex flex-wrap gap-2">
        <!-- Export Buttons -->
        <button @click="exportToCSV"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileText class="w-4 h-4" /> CSV
        </button>
        <button @click="exportToExcel"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileSpreadsheet class="w-4 h-4" /> Excel
        </button>
        <button @click="exportToPDF"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileDown class="w-4 h-4" /> PDF
        </button>
        <button @click="exportToWord"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileText class="w-4 h-4" /> Word
        </button>
        <button @click="$router.push({ name: 'index-member' })"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          Present Member
        </button>
        
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search..."
          class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Membership Type</label>
        <select v-model="membership_type_id" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All Types</option>
          <option v-for="type in membershipTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
        </select>
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

    <!-- Column View -->
    <div class="bg-gray-50 border rounded p-4 flex flex-col lg:flex-row gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
        <select v-model="selectedProfile" @change="applyProfile"
          class="border rounded px-3 py-1.5 text-xs sm:text-sm w-full sm:w-48">
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="text-sm font-medium text-gray-700 mb-1 block">Visible Columns</label>
        <div class="flex flex-wrap gap-4">
          <div v-for="header in allHeaders" :key="header.value"
            class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="visibleColumns" :value="header.value"
              :id="header.value" class="accent-blue-600" />
            <label :for="header.value" class="text-gray-700">{{ header.text }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Member Table -->
    <div class="overflow-x-auto">
      <EasyDataTable :headers="headers" :items="paginatedMembers" :search-value="search"
        :loading="loading" show-index hide-footer
        table-class="min-w-full text-sm" header-class="bg-gray-100"
        body-row-class="text-sm" :theme-color="'#3b82f6'">

        <!-- Profile Image -->
        <template #item-image_url="{ image_url }">
          <img :src="image_url" class="h-10 w-10 rounded-full object-cover bg-gray-100" />
        </template>

        <!-- Full Name -->
        <template #item-full_name="{ full_name }">
          <span class="text-gray-700">{{ full_name || '--' }}</span>
        </template>

        <!-- Membership ID -->
        <template #item-existing_membership_id="{ existing_membership_id }">
          <span>{{ existing_membership_id || '--' }}</span>
        </template>

        <!-- Membership Type -->
        <template #item-membership_type.name="{ membership_type }">
          <span>{{ membership_type?.name || '--' }}</span>
        </template>

        <!-- Joining Date -->
        <template #item-membership_start_date="{ membership_start_date }">
          <span>{{ membership_start_date ? dayjs(membership_start_date).format('DD-MM-YYYY') : '--' }}</span>
        </template>

        <!-- Membership Age -->
        <template #item-membership_age="{ membership_start_date }">
          <span>{{ calculateMembershipAge(membership_start_date) }}</span>
        </template>

        <!-- Actions -->
        <template #item-actions="{ id }">
          <button @click="viewMemberDetail(memberList.find(m => m.id === id))"
            class="text-blue-600 hover:underline text-xs">Details</button>
        </template>
      </EasyDataTable>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
  <!-- Status Text -->
  <div class="text-xs sm:text-sm text-gray-600 text-center md:text-left">
    Items {{ (currentPage - 1) * rowsPerPage + 1 }} -
    {{ Math.min(currentPage * rowsPerPage, totalItems) }}
    of {{ totalItems }} |
    Page {{ currentPage }} of {{ totalPages }}
  </div>

  <!-- Controls -->
  <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
    <!-- Page Size -->
    <div class="flex items-center justify-center sm:justify-start gap-1">
      <span class="text-xs sm:text-sm text-gray-600">Items per page:</span>
      <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-xs sm:text-sm">
        <option v-for="size in [5, 10, 50, 100, 250, 500, 1000]" :key="size" :value="size">{{ size }}</option>
      </select>
    </div>

    <!-- Navigation -->
    <div class="flex justify-center flex-wrap gap-1">
      <button @click="goToFirst" :disabled="currentPage === 1"
        class="border rounded px-3 py-1 text-xs sm:text-sm transition"
        :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
        First
      </button>
      <button @click="goToPrev" :disabled="currentPage === 1"
        class="border rounded px-3 py-1 text-xs sm:text-sm transition"
        :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
        Prev
      </button>
      <button @click="goToNext" :disabled="currentPage === totalPages"
        class="border rounded px-3 py-1 text-xs sm:text-sm transition"
        :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
        Next
      </button>
      <button @click="goToLast" :disabled="currentPage === totalPages"
        class="border rounded px-3 py-1 text-xs sm:text-sm transition"
        :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
        Last
      </button>
    </div>
  </div>
</div>


    <!-- ✅ Modals -->
    <!-- View Modal -->
    <div v-if="viewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6 gap-4">
          <img :src="selectedMember?.image_url ?? placeholderImage" alt="Member Image"
            class="h-24 w-24 rounded-full object-cover" />
          <div class="flex-1">
            <h2 class="text-2xl font-semibold text-gray-800">
              {{ selectedMember?.individual?.first_name ?? '--' }} {{ selectedMember?.individual?.last_name ?? '--' }}
            </h2>
            <p class="text-sm text-gray-500">Membership Id: {{ selectedMember?.existing_membership_id }}</p>
          </div>
          <div>
            <span class="text-sm px-3 py-1 rounded-full"
              :class="selectedMember?.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
              {{ selectedMember?.is_active === 1 ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <!-- Details -->
        <div class="grid grid-cols-1 gap-y-4 text-sm text-gray-700">
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership type:</span>
            <span>{{ selectedMember?.membership_type?.name ?? '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Start date:</span>
            <span>
              {{ selectedMember?.membership_start_date
                ? new Date(selectedMember?.membership_start_date).toLocaleDateString('en-GB',{ day:'numeric',month:'long',year:'numeric' })
                : 'Not provided' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership age:</span>
            <span>{{ calculateMembershipAge(selectedMember?.membership_start_date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Reference/sponsored by:</span>
            <span>
              {{ selectedMember?.sponsored_user_id
                ? memberList.find(m => m.individual.id === selectedMember.sponsored_user_id)?.full_name
                : 'Not provided' }}
            </span>
          </div>
        </div>

        <!-- Actions -->
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

    <!-- Edit Modal -->
    <div v-if="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <div class="flex justify-between items-center border-b pb-4 mb-6">
          <h2 class="text-xl font-semibold text-gray-800">Edit Member</h2>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <div class="mb-6 text-center">
          <img :src="selectedMember?.image_url ?? placeholderImage" alt="Member Image"
            class="h-24 w-24 rounded-full object-cover mx-auto mb-4" />
          <h2 class="text-2xl font-semibold text-gray-800">
            {{ selectedMember?.individual?.first_name ?? '--' }} {{ selectedMember?.individual?.last_name ?? '--' }}
          </h2>
          <p class="text-sm text-gray-500">Unique Azon Id: {{ selectedMember?.individual?.azon_id ?? '' }}</p>
        </div>

        <form @submit.prevent="updateMember" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Organisation Membership Id</label>
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
              <option v-for="orgMember in memberList" :key="orgMember.individual.id" :value="orgMember.individual.id">
                {{ orgMember.full_name }}
              </option>
            </select>
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
