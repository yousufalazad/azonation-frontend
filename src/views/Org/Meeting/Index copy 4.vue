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
const meetingList = ref([])
const loading = ref(false)

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
    return true
  })
})

const sortedMeetings = computed(() => {
  return [...filteredMeetings.value].sort((a, b) => a.name.localeCompare(b.name))
})

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
  const rows = sortedMeetings.value.map(m => filteredHeaders.value.map(h => m[h.value] ?? ''))
  const ws = utils.aoa_to_sheet([header, ...rows])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Meetings')
  writeFileXLSX(wb, 'meetings.csv', { bookType: 'csv' })
}

const exportXLSX = () => {
  const json = sortedMeetings.value.map(m => {
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
  const body = sortedMeetings.value.map(m => hdr.map(txt => m[allHeaders.find(c => c.text === txt)?.value] ?? ''))
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

onMounted(getMeetings)
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">Meeting List</h2>

      <!-- Export + Create Buttons -->
      <div class="flex gap-2 items-center">
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
        <button @click="goToCreateMeeting"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded">
          Create Meeting
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Start Date</label>
        <input type="date" v-model="startDate" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">End Date</label>
        <input type="date" v-model="endDate" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Quick Filter</label>
        <select v-model="quickDateFilter" @change="applyQuickDateFilter"
          class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="last7">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="last30">Last 30 Days</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Search</label>
        <input type="text" v-model="search" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
    </div>

    <!-- Column Settings -->
    <div class="bg-gray-50 border rounded p-4 flex flex-wrap gap-8 items-start">
      <!-- Column Profile Selector -->
      <div class="flex flex-col">
        <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
        <select v-model="selectedProfile" @change="applyProfile" class="border rounded px-3 py-1.5 text-sm w-48">
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>

      <!-- Column Visibility -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Select Visible Columns</label>
        <div class="flex flex-wrap gap-4">
          <div v-for="header in allHeaders" :key="header.value" class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="visibleColumns" :value="header.value" :id="header.value"
              class="accent-blue-600" />
            <label :for="header.value" class="text-gray-700">{{ header.text }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <EasyDataTable :headers="filteredHeaders" :items="sortedMeetings" :search-value="search"
      :rows-per-page="rowsPerPage" :current-page="currentPage" :loading="loading" show-index table-class="!rounded-none"
      header-class="bg-gray-100 text-sm" body-row-class="text-sm" buttons-pagination :theme-color="'#3b82f6'">
      <template #item-status_display="{ status_display }">
        <span :class="{
          'bg-green-100 text-green-800': status_display === 'Active',
          'bg-red-100 text-red-800': status_display !== 'Active'
        }" class="text-xs font-medium px-2 py-1 rounded">
          {{ status_display }}
        </span>
      </template>

      <template #item-actions="{ id }">
        <div class="flex justify-end gap-2">
          <button @click="viewMeeting(id)"
            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">View</button>
          <button @click="editMeeting(id)"
            class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">Edit</button>
          <button @click="deleteMeeting(id)"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
        </div>
      </template>
    </EasyDataTable>
  </div>
</template>
