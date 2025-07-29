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
const recordList = ref([])
const projectSummary = ref([])
const search = ref('')
const startDate = ref('')
const endDate = ref('')
const quickDateFilter = ref('')
const loading = ref(false)
const currentPage = ref(1)
const rowsPerPage = ref(10)

const columnProfiles = {
  minimal: ['title', 'start_date', 'status_display', 'actions'],
  detailed: ['title', 'start_date', 'end_date', 'status_display', 'actions'],
}
const selectedProfile = ref(localStorage.getItem('selected_project_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('visible_project_columns')) || columnProfiles[selectedProfile.value])

const allHeaders = [
  { text: 'Title', value: 'title', sortable: true },
  { text: 'Start Date', value: 'start_date', sortable: true },
  { text: 'End Date', value: 'end_date', sortable: true },
  { text: 'Status', value: 'status_display', sortable: true },
  { text: 'Actions', value: 'actions' },
]

watch([visibleColumns, selectedProfile], () => {
  localStorage.setItem('visible_project_columns', JSON.stringify(visibleColumns.value))
  localStorage.setItem('selected_project_profile', selectedProfile.value)
}, { deep: true })

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

const filteredHeaders = computed(() =>
  allHeaders.filter(h => visibleColumns.value.includes(h.value))
)

const filteredProjects = computed(() =>
  recordList.value.filter(p => {
    if (startDate.value && p.start_date < startDate.value) return false
    if (endDate.value && p.end_date > endDate.value) return false
    if (search.value && !p.title.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
)

const totalItems = computed(() => filteredProjects.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / rowsPerPage.value))

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return filteredProjects.value.slice(start, end)
})

const goToFirst = () => (currentPage.value = 1)
const goToPrev = () => { if (currentPage.value > 1) currentPage.value-- }
const goToNext = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const goToLast = () => (currentPage.value = totalPages.value)

const applyQuickDateFilter = () => {
  const today = new Date()
  const format = d => d.toISOString().split('T')[0]

  if (quickDateFilter.value === 'last7') {
    const start = new Date(today)
    start.setDate(today.getDate() - 7)
    startDate.value = format(start)
    endDate.value = format(today)
  } else if (quickDateFilter.value === 'thisMonth') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    startDate.value = format(first)
    endDate.value = format(last)
  } else {
    startDate.value = ''
    endDate.value = ''
  }
}

const getRecords = async () => {
  loading.value = true
  try {
    const res = await auth.fetchProtectedApi('/api/projects', {}, 'GET')
    recordList.value = res.status
      ? res.data.map(p => ({
          id: p.id,
          title: p.title ?? '',
          start_date: p.start_date ?? '',
          end_date: p.end_date ?? '',
          status: p.is_active ?? 0,
          status_display: p.is_active === 1 ? 'Active' : 'Disabled'
        }))
      : []
  } catch (e) {
    console.error('Error fetching projects:', e)
    recordList.value = []
  } finally {
    loading.value = false
  }
}

const fetchProjectSummary = async () => {
  try {
    const res = await auth.fetchProtectedApi('/api/project-summaries', {}, 'GET')
    projectSummary.value = res.status ? res.data : []
  } catch (e) {
    console.error('Error fetching summaries:', e)
    projectSummary.value = []
  }
}

const deleteRecord = async id => {
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
      const res = await auth.fetchProtectedApi(`/api/projects/${id}`, {}, 'DELETE')
      if (res.status) {
        recordList.value = recordList.value.filter(p => p.id !== id)
        Swal.fire('Deleted!', 'Project has been deleted.', 'success')
      } else {
        Swal.fire('Error!', 'Failed to delete project.', 'error')
      }
    } catch {
      Swal.fire('Error!', 'Failed to delete project.', 'error')
    }
  }
}

const exportCSV = () => {
  const header = filteredHeaders.value.map(h => h.text)
  const rows = filteredProjects.value.map(p => filteredHeaders.value.map(h => p[h.value] ?? ''))
  const ws = utils.aoa_to_sheet([header, ...rows])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Projects')
  writeFileXLSX(wb, 'projects.csv', { bookType: 'csv' })
}

const exportXLSX = () => {
  const json = filteredProjects.value.map(p => {
    const obj = {}
    filteredHeaders.value.forEach(h => obj[h.text] = p[h.value])
    return obj
  })
  const ws = utils.json_to_sheet(json)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Projects')
  writeFileXLSX(wb, 'projects.xlsx')
}

const exportPDF = () => {
  const doc = new jsPDF()
  const headers = filteredHeaders.value.map(h => h.text)
  const body = filteredProjects.value.map(p => headers.map(txt => p[allHeaders.find(c => c.text === txt)?.value] ?? ''))
  autoTable(doc, { head: [headers], body })
  doc.save('projects.pdf')
}

onMounted(() => {
  getRecords()
  fetchProjectSummary()
})
</script>

<template>
  <div class="p-6 space-y-6 bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">Project List</h2>
      <div class="flex gap-2">
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
        <button @click="$router.push({ name: 'create-project' })"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
          Add Project
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Start Date</label>
        <input type="date" v-model="startDate" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">End Date</label>
        <input type="date" v-model="endDate" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Quick Filter</label>
        <select v-model="quickDateFilter" @change="applyQuickDateFilter"
          class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="last7">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
    </div>

    <!-- Column Settings -->
    <div class="bg-gray-50 border rounded p-4 flex flex-wrap gap-8 items-start">
      <div class="flex flex-col">
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

    <!-- Table -->
    <EasyDataTable
      :headers="filteredHeaders"
      :items="paginatedProjects"
      :loading="loading"
      :search-value="search"
      show-index
      hide-footer
      table-class="min-w-full text-sm"
      header-class="bg-gray-100"
      body-row-class="text-sm"
      :theme-color="'#3b82f6'">

      <template #item-status_display="{ status_display }">
        <span :class="{
          'text-green-600 font-medium': status_display === 'Active',
          'text-red-500 font-medium': status_display !== 'Active'
        }">
          {{ status_display }}
        </span>
      </template>

      <template #item-actions="{ id }">
        <div class="flex justify-end flex-wrap gap-2">
          <button
            v-if="projectSummary.find(s => s.project_id === id)"
            @click="$router.push({ name: 'view-project-summary', params: { summaryId: projectSummary.find(s => s.project_id === id).id } })"
            class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-xs">
            Summary
          </button>
          <button
            v-else
            @click="$router.push({ name: 'create-project-summary', params: { projectId: id } })"
            class="bg-sky-600 text-white px-3 py-1 rounded text-xs hover:bg-sky-700">
            Add Summary
          </button>
          <button @click="$router.push({ name: 'project-attendances', params: { id } })"
            class="bg-blue-500 text-white px-3 py-1 rounded text-xs">Attendance</button>
          <button @click="$router.push({ name: 'project-guest-attendance', params: { id } })"
            class="bg-blue-600 text-white px-3 py-1 rounded text-xs">Guests</button>
          <button @click="$router.push({ name: 'edit-project', params: { id } })"
            class="bg-yellow-500 text-white px-3 py-1 rounded text-xs">Edit</button>
          <button @click="$router.push({ name: 'view-project', params: { id } })"
            class="bg-green-600 text-white px-3 py-1 rounded text-xs">View</button>
          <button @click="deleteRecord(id)"
            class="bg-red-500 text-white px-3 py-1 rounded text-xs">Delete</button>
        </div>
      </template>
    </EasyDataTable>

    <!-- Pagination Controls -->
    <div class="flex justify-between items-center px-2 py-3 bg-gray-50 rounded border">
      <!-- Info -->
      <div class="text-sm text-gray-600">
        Items
        {{ (currentPage - 1) * rowsPerPage + 1 }} -
        {{ Math.min(currentPage * rowsPerPage, totalItems) }}
        of {{ totalItems }} |
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1">
          <span class="text-sm text-gray-600">Items per page:</span>
          <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-sm">
            <option v-for="size in [5, 10, 50, 100, 250, 500, 1000]" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="flex gap-1">
          <button @click="goToFirst" :disabled="currentPage === 1"
            class="border rounded px-3 py-1 text-sm"
            :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">
            First
          </button>
          <button @click="goToPrev" :disabled="currentPage === 1"
            class="border rounded px-3 py-1 text-sm"
            :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">
            Prev
          </button>
          <button @click="goToNext" :disabled="currentPage === totalPages"
            class="border rounded px-3 py-1 text-sm"
            :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">
            Next
          </button>
          <button @click="goToLast" :disabled="currentPage === totalPages"
            class="border rounded px-3 py-1 text-sm"
            :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">
            Last
          </button>
        </div>
      </div>
    </div>
  </div>
</template>