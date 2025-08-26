<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { utils, writeFileXLSX } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { authStore } from '../../../store/authStore'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

const router = useRouter()
const auth = authStore

const search = ref('')
const startDate = ref('')
const endDate = ref('')
const quickDateFilter = ref('')
const meetingList = ref([])
const loading = ref(false)

const rowsPerPage = ref(10)
const currentPage = ref(1)


const openMenuId = ref(null)
const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}
const closeMenu = () => (openMenuId.value = null)

const _onDocClick = () => closeMenu()

onMounted(() => {
  document.addEventListener('click', _onDocClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', _onDocClick)
})

const columnProfiles = {
  minimal: ['name', 'date', 'status_display', 'actions'],
  detailed: ['name', 'short_name', 'subject', 'date', 'time', 'status_display', 'conduct_type_name', 'actions'],
}
const selectedProfile = ref(localStorage.getItem('selected_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('visible_columns')) || columnProfiles[selectedProfile.value])

const allHeaders = [
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Short Name', value: 'short_name', sortable: true },
  { text: 'Subject', value: 'subject', sortable: true },
  { text: 'Date', value: 'date', sortable: true },
  { text: 'Time', value: 'time', sortable: true },
  { text: 'Status', value: 'status_display', sortable: true },
  { text: 'Conduct Type', value: 'conduct_type_name', sortable: true },
  { text: 'Actions', value: 'actions' },
]

watch([visibleColumns, selectedProfile], () => {
  localStorage.setItem('visible_columns', JSON.stringify(visibleColumns.value))
  localStorage.setItem('selected_profile', selectedProfile.value)
}, { deep: true })

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

const filteredHeaders = computed(() => {
  return allHeaders.filter(h => visibleColumns.value.includes(h.value))
})

const filteredMeetings = computed(() => {
  return meetingList.value.filter(meeting => {
    if (startDate.value && meeting.date < startDate.value) return false
    if (endDate.value && meeting.date > endDate.value) return false
    if (search.value && !meeting.name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
})

const totalItems = computed(() => filteredMeetings.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / rowsPerPage.value))
const paginatedCommittees = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return [...filteredMeetings.value].sort((a, b) => a.name.localeCompare(b.name)).slice(start, start + rowsPerPage.value)
})

watch(rowsPerPage, () => {
  currentPage.value = 1
})

const goToFirst = () => (currentPage.value = 1)
const goToPrev = () => (currentPage.value = Math.max(1, currentPage.value - 1))
const goToNext = () => (currentPage.value = Math.min(totalPages.value, currentPage.value + 1))
const goToLast = () => (currentPage.value = totalPages.value)

const applyQuickDateFilter = () => {
  const today = new Date()
  const formatDate = d => d.toISOString().split('T')[0]

  if (quickDateFilter.value === 'last7') {
    const date = new Date(today)
    date.setDate(today.getDate() - 7)
    startDate.value = formatDate(date)
    endDate.value = formatDate(today)
  } else if (quickDateFilter.value === 'thisMonth') {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    startDate.value = formatDate(firstDay)
    endDate.value = formatDate(lastDay)
  } else if (quickDateFilter.value === 'last30') {
    const date = new Date(today)
    date.setDate(today.getDate() - 30)
    startDate.value = formatDate(date)
    endDate.value = formatDate(today)
  } else {
    startDate.value = ''
    endDate.value = ''
  }
}

const exportCSV = () => {
  const header = filteredHeaders.value.map(h => h.text)
  const rows = paginatedCommittees.value.map(m => filteredHeaders.value.map(h => m[h.value] ?? ''))
  const ws = utils.aoa_to_sheet([header, ...rows])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Meetings')
  writeFileXLSX(wb, 'meetings.csv', { bookType: 'csv' })
}

const exportXLSX = () => {
  const json = paginatedCommittees.value.map(m => {
    const obj = {}
    filteredHeaders.value.forEach(h => obj[h.text] = m[h.value])
    return obj
  })
  const ws = utils.json_to_sheet(json)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Meetings')
  writeFileXLSX(wb, 'meetings.xlsx')
}

const exportPDF = () => {
  const doc = new jsPDF()
  const hdr = filteredHeaders.value.map(h => h.text)
  const body = paginatedCommittees.value.map(m => hdr.map(txt => m[allHeaders.find(c => c.text === txt)?.value] ?? ''))
  autoTable(doc, { head: [hdr], body })
  doc.save('meetings.pdf')
}

const getMeetings = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/meetings', {}, 'GET')
    meetingList.value = response.status
      ? response.data.map(item => ({
        id: item.id,
        name: item.name ?? '',
        short_name: item.short_name ?? '',
        subject: item.subject ?? '',
        date: item.date ?? '',
        time: item.time ?? '',
        status: item.status ?? 0,
        status_display: item.status === 0 ? 'Active' : 'Disabled',
        conduct_type_name: item.conduct_type_name ?? '',
      }))
      : []
  } catch (e) {
    console.error('Error fetching meetings:', e)
    meetingList.value = []
  } finally {
    loading.value = false
  }
}

const viewMeeting = id => router.push({ name: 'view-meeting', params: { id } })
const editMeeting = id => router.push({ name: 'edit-meeting', params: { id } })
const goToCreateMeeting = () => router.push({ name: 'create-meeting' })

const deleteMeeting = async id => {
  const confirmed = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  })

  if (confirmed.isConfirmed) {
    try {
      const response = await auth.fetchProtectedApi(`/api/meetings/${id}`, {}, 'DELETE')
      if (response.status) {
        meetingList.value = meetingList.value.filter(m => m.id !== id)
        Swal.fire('Deleted!', 'Meeting has been deleted.', 'success')
      } else {
        Swal.fire('Error!', 'Failed to delete meeting.', 'error')
      }
    } catch (e) {
      Swal.fire('Error!', 'Failed to delete meeting.', 'error')
    }
  }
}

const meetingMinuteList = ref([])
const getmeetingMinuteMeetings = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/meeting-minutes`, {}, 'GET')
    meetingMinuteList.value = response.status ? response.data : []
  } catch (error) {
    console.error('Error fetching meetings:', error)
    meetingMinuteList.value = []
  }
}

onMounted(() => {
  getMeetings()
  getmeetingMinuteMeetings()
})
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-6">
    <!-- ✅ Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">Meeting List</h2>
      <div class="flex gap-2 items-center">
        <button @click="exportCSV"
          class="border px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">CSV</button>
        <button @click="exportXLSX"
          class="border px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">Excel</button>
        <button @click="exportPDF"
          class="border px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">PDF</button>
        <button @click="goToCreateMeeting" class="bg-blue-600 text-white px-4 py-2 rounded text-sm">Create
          Meeting</button>
      </div>
    </div>

    <!-- ✅ Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600 mb-1 block">Start Date</label>
        <input type="date" v-model="startDate" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600 mb-1 block">End Date</label>
        <input type="date" v-model="endDate" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600 mb-1 block">Quick Filter</label>
        <select v-model="quickDateFilter" @change="applyQuickDateFilter"
          class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="last7">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="last30">Last 30 Days</option>
        </select>
      </div>
      <div>
        <label class="text-sm text-gray-600 mb-1 block">Search</label>
        <input v-model="search" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
    </div>

    <!-- ✅ Column View Settings -->
    <div class="bg-gray-50 border rounded p-4 flex flex-wrap gap-8 items-start">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
        <select v-model="selectedProfile" @change="applyProfile" class="border rounded px-3 py-1.5 text-sm w-48">
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
      <div>
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

    <!-- ✅ Data Table -->
    <EasyDataTable :headers="filteredHeaders" :items="paginatedCommittees" :loading="loading" show-index hide-footer
      table-class="min-w-full text-sm" header-class="bg-gray-100" body-row-class="text-sm" :theme-color="'#3b82f6'">
      <template #item-status_display="{ status_display }">
        <span :class="{
          'bg-green-100 text-green-800': status_display === 'Active',
          'bg-red-100 text-red-800': status_display !== 'Active'
        }" class="text-xs font-medium px-2 py-1 rounded">
          {{ status_display }}
        </span>
      </template>

      <!-- Header Alignment Fix -->
      <template #header-actions>
        <div class="text-right w-full pr-2">
          Actions
        </div>
      </template>
      <!-- Actions Slot -->
      <template #item-actions="{ id }">
        <div class="relative flex justify-end">
          <!-- ⋯ trigger -->
          <button @click.stop="toggleMenu(id)"
            class="inline-flex items-center justify-center h-8 w-8 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="More actions">
            <!-- vertical dots icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
            </svg>
          </button>

          <!-- dropdown -->
          <div v-if="openMenuId === id" @click.stop
            class="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg p-1">
            <!-- Minutes item (conditional) -->
            <template v-if="meetingMinuteList.find(s => s.meeting_id === id)">
              <button
                @click="$router.push({ name: 'view-meeting-minutes', params: { id: meetingMinuteList.find(s => s.meeting_id === id).id } })"
                class="w-full text-left px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-50">
                Minutes – View
              </button>
            </template>
            <template v-else>
              <button @click="$router.push({ name: 'create-meeting-minutes', params: { meetingId: id } })"
                class="w-full text-left px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-50">
                Minutes – Add
              </button>
            </template>

            <div class="my-1 h-px bg-gray-100"></div>

            <button @click="$router.push({ name: 'meeting-guest-attendance', params: { id } })"
              class="w-full text-left px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-50">
              Guest
            </button>
            <button @click="$router.push({ name: 'meeting-attendances', params: { id } })"
              class="w-full text-left px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-50">
              Attendees
            </button>

            <div class="my-1 h-px bg-gray-100"></div>

            <button @click="viewMeeting(id)"
              class="w-full text-left px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-50">
              View
            </button>
            <button @click="editMeeting(id)"
              class="w-full text-left px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-50">
              Edit
            </button>
            <button @click="deleteMeeting(id)"
              class="w-full text-left px-3 py-2 rounded text-sm text-red-600 hover:bg-red-50">
              Delete
            </button>
          </div>
        </div>
      </template>
    </EasyDataTable>

    <!-- ✅ Bottom Pagination -->
    <div class="flex justify-between items-center px-2 py-3 bg-gray-50 rounded border">
      <!-- ✅ Left info -->
      <div class="text-sm text-gray-600">
        Items
        {{ (currentPage - 1) * rowsPerPage + 1 }}-
        {{
          Math.min(currentPage * rowsPerPage, totalItems)
        }}
        of {{ totalItems }} |
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

        <!-- Navigation Buttons -->
        <div class="flex gap-1">
          <button @click="goToFirst" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm"
            :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">
            First
          </button>
          <button @click="goToPrev" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm"
            :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">
            Prev
          </button>
          <button @click="goToNext" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm"
            :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">
            Next
          </button>
          <button @click="goToLast" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm"
            :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">
            Last
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
