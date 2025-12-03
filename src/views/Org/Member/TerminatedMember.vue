<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { authStore } from '../../../store/authStore'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { pdfExport } from "@/helpers/pdfExport.js";
import { excelExport } from "@/helpers/excelExport.js";
import { csvExport } from "@/helpers/csvExport.js";
import { docxExport } from "@/helpers/docxExport";

dayjs.extend(duration)
dayjs.extend(relativeTime)

const auth = authStore

const memberList = ref([])
const search = ref("")
const dateFrom = ref("")
const dateTo = ref("")
const loading = ref(false)

const membershipTypes = ref([])
const membershipTerminationReasons = ref([])
const selectedMember = ref(null)
const viewModal = ref(false)
const membership_type_id = ref("")
const sponsored_user_id = ref("")
const compact_view = ref(false)


// ✅ Column Profile Logic
const columnProfiles = {
  minimal: ['full_name', 'membership_type_before_termination', 'existing_membership_id', 'terminated_at'],

  detailed: ['image_url', 'full_name', 'existing_membership_id', 'membership_type_before_termination', 'joined_at', 'terminated_at', 'actions']
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
  { text: 'Membership Type', value: 'membership_type_before_termination', sortable: true },
  { text: 'Joining Date', value: 'joined_at', sortable: true },
  { text: 'Terminated Date', value: 'terminated_at' },
  { text: 'Actions', value: 'actions' }
]

// Visibility filter
const headers = computed(() =>
  allHeaders.filter(h => visibleColumns.value.includes(h.value))
)


// ✅ Fetch Terminated Member List
const fetchMemberList = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/org-terminated-members/', {}, 'GET')
    memberList.value = response.status
      ? response.data.map(m => {
        // Parse more_info safely
        let parsedMoreInfo = {}
        try {
          parsedMoreInfo = typeof m.more_info === 'string' ? JSON.parse(m.more_info) : (m.more_info || {})
        } catch {
          parsedMoreInfo = {}
        }

        return {
          ...m,
          // full_name: `${m.individual.first_name || ''} ${m.individual.last_name || ''}`.trim(),
          full_name: m.terminated_member_name,
          image_url: m.image_url ?? placeholderImage,
          existing_membership_id: parsedMoreInfo.existing_membership_id || '--', // ✅ Extracted field
          more_info_date: parsedMoreInfo.date || '--', // Optional: keep for later use
        }
      })
      : []
  } catch (error) {
    console.error('Error fetching members:', error)
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
const fetchMemberTerminationReasons = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/membership-termination-reasons', {}, 'GET')
    membershipTerminationReasons.value = response.status ? response.data : []
  } catch (error) {
    console.error('Error fetching member Termination Reasons:', error)
  }
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
      const membershipStart = m.joined_at
        ? dayjs(m.joined_at).format('YYYY-MM-DD').toLowerCase()
        : ''
      const membershipTerminated = m.terminated_at
        ? dayjs(m.terminated_at).format('YYYY-MM-DD').toLowerCase()
        : ''

      return (
        fullName.includes(keyword) ||
        membershipId.includes(keyword) ||
        membershipType.includes(keyword) ||
        membershipStart.includes(keyword) ||
        membershipTerminated.includes(keyword)
      )
    })
  }

  if (membership_type_id.value) {
    list = list.filter(m => m.membership_type_before_termination === membership_type_id.value)
  }

  if (dateFrom.value && dateTo.value) {
    const from = dayjs(dateFrom.value)
    const to = dayjs(dateTo.value)
    list = list.filter(m => {
      const d = dayjs(m.terminated_at)
      return d.isAfter(from.subtract(1, 'day')) && d.isBefore(to.add(1, 'day'))
    })
  }

  return list
})

// Export CSV with custom header/footer
const exportCSV = async () => {
  await csvExport({
    headers: headers.value,
    rows: filteredMembers.value,
    title: "Terminated Member List",
    fileName: "Members.csv",
  });
};


// Export XLSX with custom header/footer
const exportXLSX = async () => {
  await excelExport({
    headers: headers.value,
    rows: filteredMembers.value,
    title: "Terminated Member List",
    fileName: "Members.xlsx",
  });

};

// --- Export Members PDF ---
const exportPDF = () => {
  pdfExport({
    headers: headers.value,
    rows: filteredMembers.value,
    title: "Terminated Member List",
    fileName: "Members.pdf",
  });
};


const exportDOCX = () => {
  docxExport({
    headers: headers.value,
    rows: filteredMembers.value,
    title: "Terminated Member List",
    fileName: "Members.docx",
    logoPath: "/storage/org/profile/image/20250924184601_map.JPG",

  });
};

// ✅ Modal handlers
const viewMemberDetail = (member) => {
  selectedMember.value = member
  viewModal.value = true
}

const closeViewModal = () => {
  selectedMember.value = null
  viewModal.value = false
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
  fetchMemberTerminationReasons()
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
        <button @click="exportCSV"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileText class="w-4 h-4" /> CSV
        </button>
        <button @click="exportXLSX"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileSpreadsheet class="w-4 h-4" /> Excel
        </button>
        <button @click="exportPDF"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileDown class="w-4 h-4" /> PDF
        </button>
        <button @click="exportDOCX"
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
        <input v-model="search" type="text" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Membership Type</label>
        <select v-model="membership_type_id" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All Types</option>
          <option v-for="type in membershipTypes" :key="type.id" :value="type.name">{{ type.name }}</option>
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
          <div v-for="header in allHeaders" :key="header.value" class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="visibleColumns" :value="header.value" :id="header.value"
              class="accent-blue-600" />
            <label :for="header.value" class="text-gray-700">{{ header.text }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Member Table -->
    <div class="overflow-x-auto">
      <EasyDataTable :headers="headers" :items="paginatedMembers" :search-value="search" :loading="loading" show-index
        hide-footer table-class="min-w-full text-sm" header-class="bg-gray-100" body-row-class="text-sm"
        :theme-color="'#3b82f6'">

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

        <template #item-joined_at="{ joined_at }">
          <span>{{ joined_at ? dayjs(joined_at).format('DD-MM-YYYY') : '--' }}</span>
        </template>
        <template #item-terminated_at="{ terminated_at }">
          <span>{{ terminated_at ? dayjs(terminated_at).format('DD-MM-YYYY') : '--' }}</span>
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
              <!-- {{ selectedMember?.individual?.first_name ?? '--' }} {{ selectedMember?.individual?.last_name ?? '--' }} -->
              {{ selectedMember.terminated_member_name ?? '--' }}

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
            <span class="font-medium text-gray-600">Member Email:</span>
            <span>{{ selectedMember?.terminated_member_email ?? '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Member Mobile:</span>
            <span>{{ selectedMember?.terminated_member_mobile ?? '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership type:</span>
            <span>{{ selectedMember?.membership_type_before_termination ?? '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Start date:</span>
            <span>
              {{ selectedMember?.joined_at
                ? new Date(selectedMember?.joined_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
                : 'Not provided' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Terminated date:</span>
            <span>
              {{ selectedMember?.terminated_at
                ? new Date(selectedMember?.joined_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
                : 'Not provided' }}
            </span>
          </div>
          <div class="flex justify-between" v-if="selectedMember?.membership_duration_days">
            <span class="font-medium text-gray-600">Membership Duration:</span>
            <span>
              {{ selectedMember.membership_duration_days + ' days' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Termination Reason:</span>
            <span>
              {{selectedMember?.membership_termination_reason_id
                ? membershipTerminationReasons.find(m => m.id === selectedMember.membership_termination_reason_id).reason
                : 'Not Reason Provided'}}
            </span>
          </div>

        </div>

        <!-- Actions -->
        <div class="mt-8 flex justify-end gap-3">
          <!-- <button @click="editMember"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">Edit</button>
          <button @click="deleteMember(selectedMember.id)"
            class="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-lg">Delete</button> -->
          <button @click="closeViewModal"
            class="bg-gray-200 hover:bg-gray-300 text-sm px-5 py-2 rounded-lg">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>