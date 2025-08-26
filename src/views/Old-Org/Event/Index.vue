<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
const eventList = ref([])
const eventSummary = ref([])
const loading = ref(false)

const columnProfiles = {
  minimal: ['user_id', 'title', 'date', 'status_display', 'actions'],
  detailed: ['user_id', 'title', 'name', 'date', 'time', 'venue_name', 'status_display', 'actions'],
}
const selectedProfile = ref(localStorage.getItem('selected_event_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('visible_event_columns')) || columnProfiles[selectedProfile.value])

const allHeaders = [
  { text: 'ID', value: 'user_id', sortable: true },
  { text: 'Title', value: 'title', sortable: true },
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Date', value: 'date', sortable: true },
  { text: 'Time', value: 'time', sortable: true },
  { text: 'Venue', value: 'venue_name', sortable: true },
  { text: 'Status', value: 'status_display', sortable: true },
  { text: 'Actions', value: 'actions' },
]

watch([visibleColumns, selectedProfile], () => {
  localStorage.setItem('visible_event_columns', JSON.stringify(visibleColumns.value))
  localStorage.setItem('selected_event_profile', selectedProfile.value)
}, { deep: true })

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

const filteredHeaders = computed(() => {
  return allHeaders.filter(h => visibleColumns.value.includes(h.value))
})

const filteredEvents = computed(() => {
  return eventList.value.filter(event => {
    if (startDate.value && event.date < startDate.value) return false
    if (endDate.value && event.date > endDate.value) return false
    if (search.value && !event.title.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
})

const rowsPerPage = ref(10)
const currentPage = ref(1)

const totalItems = computed(() => filteredEvents.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / rowsPerPage.value))

const paginatedCommittees = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return [...filteredEvents.value]
    .sort((a, b) => a.user_id - b.user_id)
    .slice(start, start + rowsPerPage.value)
})

watch(rowsPerPage, () => {
  currentPage.value = 1
})

const goToFirst = () => { currentPage.value = 1 }
const goToPrev = () => { if (currentPage.value > 1) currentPage.value-- }
const goToNext = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const goToLast = () => { currentPage.value = totalPages.value }

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
  const rows = paginatedCommittees.value.map(e => filteredHeaders.value.map(h => e[h.value] ?? ''))
  const ws = utils.aoa_to_sheet([header, ...rows])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Events')
  writeFileXLSX(wb, 'events.csv', { bookType: 'csv' })
}

const exportXLSX = () => {
  const json = paginatedCommittees.value.map(e => {
    const obj = {}
    filteredHeaders.value.forEach(h => (obj[h.text] = e[h.value]))
    return obj
  })
  const ws = utils.json_to_sheet(json)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Events')
  writeFileXLSX(wb, 'events.xlsx')
}

const exportPDF = () => {
  const doc = new jsPDF()
  const hdr = filteredHeaders.value.map(h => h.text)
  const body = paginatedCommittees.value.map(e => hdr.map(txt => e[allHeaders.find(c => c.text === txt)?.value] ?? ''))
  autoTable(doc, { head: [hdr], body })
  doc.save('events.pdf')
}

const getEvents = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/events', {}, 'GET')
    eventList.value = response.status
      ? response.data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title ?? '',
        name: item.name ?? '',
        date: item.date ?? '',
        time: item.time ?? '',
        venue_name: item.venue_name ?? '',
        status: item.status ?? 0,
        status_display: item.status === 0 ? 'Active' : 'Disabled',
      }))
      : []
  } catch (e) {
    console.error('Error fetching events:', e)
    eventList.value = []
  } finally {
    loading.value = false
  }
}

const getEventSummaries = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/event-summaries', {}, 'GET')
    eventSummary.value = response.status ? response.data : []
  } catch (e) {
    console.error('Error fetching event summaries:', e)
    eventSummary.value = []
  }
}

const deleteRecord = async (eventId) => {
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
      const response = await auth.fetchProtectedApi(`/api/events/${eventId}`, {}, 'DELETE')
      if (response.status) {
        eventList.value = eventList.value.filter(e => e.id !== eventId)
        Swal.fire('Deleted!', 'Event has been deleted.', 'success')
      } else {
        Swal.fire('Error!', 'Failed to delete event.', 'error')
      }
    } catch (e) {
      Swal.fire('Error!', 'Failed to delete event.', 'error')
    }
  }
}

const viewSummary = (record) => {
  const summary = eventSummary.value.find(s => s.event_id === record.id)
  if (summary) {
    router.push({ name: 'view-event-summary', params: { id: summary.id } })
  }
}
const addSummary = (record) => {
  router.push({ name: 'create-event-summary', params: { eventId: record.id } })
}
const goToCreateEvent = () => router.push({ name: 'create-event' })
const goToEditEvent = (id) => router.push({ name: 'edit-event', params: { id } })
const goToViewEvent = (id) => router.push({ name: 'view-event', params: { id } })
const goToAttendances = (id) => router.push({ name: 'event-attendances', params: { id } })
const goToGuestAttendance = (id) => router.push({ name: 'event-guest-attendance', params: { id } })

onMounted(() => {
  getEvents()
  getEventSummaries()
})
</script>


<template>
  <div class="p-4 sm:p-6 bg-white rounded-lg shadow space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800">Events</h2>

      <!-- Export + Create Buttons -->
      <div class="flex flex-wrap gap-2">
        <button @click="exportCSV"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileText class="w-4 h-4" /> CSV
        </button>
        <button @click="exportXLSX"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileSpreadsheet class="w-4 h-4" /> Excel
        </button>
        <button @click="exportPDF"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileDown class="w-4 h-4" /> PDF
        </button>
        <button @click="goToCreateEvent"
          class="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded">
          Add Event
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Start Date</label>
        <input type="date" v-model="startDate" class="w-full border rounded px-3 py-1.5 text-xs sm:text-sm" />
      </div>
      <div>
        <label class="block text-xs sm:text-sm text-gray-600 mb-1">End Date</label>
        <input type="date" v-model="endDate" class="w-full border rounded px-3 py-1.5 text-xs sm:text-sm" />
      </div>
      <div>
        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Quick Filter</label>
        <select v-model="quickDateFilter" @change="applyQuickDateFilter"
          class="w-full border rounded px-3 py-1.5 text-xs sm:text-sm">
          <option value="">All</option>
          <option value="last7">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="last30">Last 30 Days</option>
        </select>
      </div>
      <div>
        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Search</label>
        <input type="text" v-model="search" placeholder="Search..."
          class="w-full border rounded px-3 py-1.5 text-xs sm:text-sm" />
      </div>
    </div>

    <!-- Column Settings -->
    <div class="bg-gray-50 border rounded p-4 flex flex-col lg:flex-row flex-wrap gap-6">
      <!-- Column Profile Selector -->
      <div class="flex flex-col w-full sm:w-auto">
        <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Column View:</label>
        <select v-model="selectedProfile" @change="applyProfile"
          class="border rounded px-3 py-1.5 text-xs sm:text-sm w-full sm:w-48">
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>

      <!-- Column Visibility -->
      <div class="w-full">
        <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Select Visible Columns</label>
        <div class="flex flex-wrap gap-4">
          <div v-for="header in allHeaders" :key="header.value" class="flex items-center gap-2 text-xs sm:text-sm">
            <input type="checkbox" v-model="visibleColumns" :value="header.value" :id="header.value"
              class="accent-blue-600" />
            <label :for="header.value" class="text-gray-700">{{ header.text }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="overflow-x-auto">
      <EasyDataTable :headers="filteredHeaders" :items="paginatedCommittees" :loading="loading" show-index hide-footer
        table-class="min-w-full text-xs sm:text-sm" header-class="bg-gray-100"
        body-row-class="text-xs sm:text-sm" :theme-color="'#3b82f6'">
        <!-- Status Badge Slot -->
        <template #item-status_display="{ status_display }">
          <span :class="{
            'text-green-600 font-medium': status_display === 'Active',
            'text-red-500 font-medium': status_display !== 'Active'
          }">
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
          <div class="flex flex-wrap justify-end gap-2">
            <button @click="viewSummary(eventList.find(e => e.id === id))"
              v-if="eventSummary.find(s => s.event_id === id)"
              class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-xs">
              Summary View
            </button>
            <button @click="addSummary(eventList.find(e => e.id === id))" v-else
              class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-xs">
              Summary Add
            </button>
            <button @click="goToAttendances(id)"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">
              Attendances
            </button>
            <button @click="goToGuestAttendance(id)"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">
              Guests
            </button>
            <button @click="goToEditEvent(id)"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">
              Edit
            </button>
            <button @click="goToViewEvent(id)"
              class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">
              View
            </button>
            <button @click="deleteRecord(id)"
              class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
              Delete
            </button>
          </div>
        </template>
      </EasyDataTable>
    </div>

    <!-- ✅ Bottom Pagination -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
      <!-- ✅ Left info -->
      <div class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
        Items
        {{ (currentPage - 1) * rowsPerPage + 1 }}-
        {{ Math.min(currentPage * rowsPerPage, totalItems) }}
        of {{ totalItems }} |
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <!-- ✅ Right controls -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <!-- Page Size -->
        <div class="flex items-center gap-1">
          <span class="text-xs sm:text-sm text-gray-600">Items per page:</span>
          <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-xs sm:text-sm">
            <option v-for="size in [5, 10, 50, 100, 250, 500, 1000]" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex flex-wrap justify-center gap-1">
          <button @click="goToFirst" :disabled="currentPage === 1"
            class="border rounded px-3 py-1 text-xs sm:text-sm"
            :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
            First
          </button>
          <button @click="goToPrev" :disabled="currentPage === 1"
            class="border rounded px-3 py-1 text-xs sm:text-sm"
            :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
            Prev
          </button>
          <button @click="goToNext" :disabled="currentPage === totalPages"
            class="border rounded px-3 py-1 text-xs sm:text-sm"
            :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
            Next
          </button>
          <button @click="goToLast" :disabled="currentPage === totalPages"
            class="border rounded px-3 py-1 text-xs sm:text-sm"
            :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
            Last
          </button>
        </div>
      </div>
    </div>
  </div>
</template>