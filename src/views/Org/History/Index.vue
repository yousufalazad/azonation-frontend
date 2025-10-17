<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import DOMPurify from 'dompurify'
import { authStore } from '../../../store/authStore'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { FileText, FileSpreadsheet, FileDown } from 'lucide-vue-next'
import { pdfExport } from "@/helpers/pdfExport.js"
import { excelExport } from "@/helpers/excelExport.js"
import { csvExport } from "@/helpers/csvExport.js"

const auth = authStore
const historyList = ref([])
const loading = ref(false)
const search = ref('')
const quickFilter = ref('')
const selectedProfile = ref(localStorage.getItem('history_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('history_columns')) || ['title', 'privacy', 'is_active', 'actions'])

/* ------------------ Column Profiles ------------------ */
const columnProfiles = {
  minimal: ['title', 'is_active', 'actions'],
  detailed: ['title', 'history', 'privacy', 'is_active', 'actions'],
}

/* ------------------ Table Headers ------------------ */
const headers = [
  { text: 'Title', value: 'title', sortable: true },
  { text: 'History', value: 'history', sortable: false },
  { text: 'Privacy', value: 'privacy', sortable: true },
  { text: 'Active', value: 'is_active', sortable: true },
  { text: 'Actions', value: 'actions' },
]

const filteredHeaders = computed(() =>
  headers.filter(h => visibleColumns.value.includes(h.value))
)

watch([selectedProfile, visibleColumns], () => {
  localStorage.setItem('history_profile', selectedProfile.value)
  localStorage.setItem('history_columns', JSON.stringify(visibleColumns.value))
})

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

/* ------------------ Fetch Histories ------------------ */
const getHistories = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/histories', {}, 'GET')
    if (response.status) {
      historyList.value = response.data.map((h) => ({
        id: h.id,
        title: h.title,
        history: h.history,
        privacy: h.privacy_name || 'Unknown',
        is_active: h.is_active === 1 ? 'Yes' : 'No',
      }))
    } else {
      historyList.value = []
    }
  } catch (error) {
    console.error('Error fetching histories:', error)
    historyList.value = []
  } finally {
    loading.value = false
  }
}

/* ------------------ Delete History ------------------ */
const deleteHistory = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this history?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  })
  if (result.isConfirmed) {
    const res = await auth.fetchProtectedApi(`/api/histories/${id}`, {}, 'DELETE')
    if (res.status) {
      Swal.fire('Deleted!', 'History has been deleted.', 'success')
      getHistories()
    } else {
      Swal.fire('Failed!', 'Failed to delete history.', 'error')
    }
  }
}

/* ------------------ Sanitize HTML ------------------ */
const sanitize = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br', 'img'],
    ALLOWED_ATTR: ['src', 'alt', 'title', 'href'],
  })
}

/* ------------------ Search & Pagination ------------------ */
const rowsPerPage = ref(10)
const currentPage = ref(1)

const filteredRecords = computed(() => {
  return historyList.value.filter((h) => {
    const matchSearch =
      search.value === '' ||
      h.title.toLowerCase().includes(search.value.toLowerCase())
    const matchQuick = quickFilter.value === '' || h.is_active === quickFilter.value
    return matchSearch && matchQuick
  })
})

const totalItems = computed(() => filteredRecords.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / rowsPerPage.value))
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredRecords.value.slice(start, start + rowsPerPage.value)
})

const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}

/* ------------------ Exports ------------------ */
const exportCSV = async () => {
  await csvExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: 'Organizational History List',
    fileName: 'Histories.csv',
  })
}

const exportXLSX = async () => {
  await excelExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: 'Organizational History List',
    fileName: 'Histories.xlsx',
  })
}

const exportPDF = () => {
  pdfExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: 'Organizational History List',
    fileName: 'Histories.pdf',
  })
}

onMounted(() => getHistories())
</script>

<template>
  <div class="p-6 space-y-6 bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
      <h2 class="text-lg font-semibold text-gray-700">Organizational History</h2>
      <div class="flex flex-wrap gap-2">
        <button @click="exportCSV" class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileText class="w-4 h-4" /> CSV
        </button>
        <button @click="exportXLSX" class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileSpreadsheet class="w-4 h-4" /> Excel
        </button>
        <button @click="exportPDF" class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileDown class="w-4 h-4" /> PDF
        </button>
        <button @click="$router.push({ name: 'create-history' })" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
          + Add History
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Active</label>
        <select v-model="quickFilter" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
    </div>

    <!-- Column Settings -->
    <div class="bg-gray-50 border rounded p-4 flex flex-col lg:flex-row flex-wrap gap-6 items-start">
      <div class="flex flex-col w-full sm:w-auto">
        <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
        <select v-model="selectedProfile" @change="applyProfile" class="border rounded px-3 py-1.5 text-sm w-full sm:w-48">
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="text-sm font-medium text-gray-700 mb-1 block">Visible Columns</label>
        <div class="flex flex-wrap gap-4">
          <div v-for="header in headers" :key="header.value" class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="visibleColumns" :value="header.value" :id="header.value" class="accent-blue-600" />
            <label :for="header.value" class="text-gray-700">{{ header.text }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <EasyDataTable :headers="filteredHeaders" :items="paginatedRecords" :loading="loading" show-index hide-footer :theme-color="'#2563eb'">
        <template #item-history="{ history }">
          <div v-html="sanitize(history)" class="text-sm text-gray-700 max-w-[400px] line-clamp-3"></div>
        </template>
        <template #item-is_active="{ is_active }">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="is_active === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ is_active }}
          </span>
        </template>
        <template #item-actions="{ id }">
          <div class="flex justify-end gap-2">
            <button @click="$router.push({ name: 'view-history', params: { id } })" class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
              View
            </button>
            <button @click="$router.push({ name: 'edit-history', params: { id } })" class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
              Edit
            </button>
            <button @click="deleteHistory(id)" class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
              Delete
            </button>
          </div>
        </template>
      </EasyDataTable>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
      <div class="text-sm text-gray-600 text-center md:text-left">
        Items {{ (currentPage - 1) * rowsPerPage + 1 }} -
        {{ Math.min(currentPage * rowsPerPage, totalItems) }} of {{ totalItems }} |
        Page {{ currentPage }} of {{ totalPages }}
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-end">
        <div class="flex justify-center gap-1">
          <span class="text-sm text-gray-600">Items per page:</span>
          <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-sm">
            <option v-for="size in [5, 10, 50, 100, 250, 500, 1000]" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
        <div class="flex gap-1 justify-center">
          <button @click="goToPage(1)" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm" :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">First</button>
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm" :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">Prev</button>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm" :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">Next</button>
          <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm" :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">Last</button>
        </div>
      </div>
    </div>
  </div>
</template>
