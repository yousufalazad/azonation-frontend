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
const recordList = ref([])
const loading = ref(false)
const search = ref('')
const quickFilter = ref('')
const selectedProfile = ref(localStorage.getItem('strategic_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('strategic_columns')) || ['title', 'start_date', 'end_date', 'privacy', 'status', 'actions'])

/* ------------------ Column Profiles ------------------ */
const columnProfiles = {
  minimal: ['title', 'status', 'actions'],
  detailed: ['title', 'start_date', 'end_date', 'privacy', 'status', 'actions'],
}

/* ------------------ Table Headers ------------------ */
const headers = [
  { text: 'Title', value: 'title', sortable: true },
  { text: 'Start Date', value: 'start_date', sortable: true },
  { text: 'End Date', value: 'end_date', sortable: true },
  { text: 'Privacy', value: 'privacy', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Actions', value: 'actions' },
]

const filteredHeaders = computed(() =>
  headers.filter(h => visibleColumns.value.includes(h.value))
)

watch([selectedProfile, visibleColumns], () => {
  localStorage.setItem('strategic_profile', selectedProfile.value)
  localStorage.setItem('strategic_columns', JSON.stringify(visibleColumns.value))
})

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}
const org_name = computed(() => auth.user?.org_name ?? 'Unknown');

/* ------------------ Fetch Records ------------------ */
const getRecords = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/strategic-plans', {}, 'GET')
    if (response.status) {
        // recordList.value = response.data;

      recordList.value = response.data.map((r) => ({
        id: r.id,
        title: r.title,
        start_date: r.start_date,
        end_date: r.end_date,
        privacy: r.privacy_name || 'Unknown',
        status: r.status === 1 ? 'Active' : 'Disabled',
      }))
    } else {
      recordList.value = []
    }
  } catch (error) {
    console.error('Error fetching records:', error)
    recordList.value = []
  } finally {
    loading.value = false
  }
}


/* ------------------ Sanitize HTML ------------------ */
const sanitize = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: [],
  })
}

/* ------------------ Delete Record ------------------ */
const deleteRecord = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this record?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  })
  if (result.isConfirmed) {
    const res = await auth.fetchProtectedApi(`/api/strategic-plans/${id}`, {}, 'DELETE')
    if (res.status) {
      Swal.fire('Deleted!', 'Record has been deleted.', 'success')
      getRecords()
    } else {
      Swal.fire('Failed!', 'Failed to delete record.', 'error')
    }
  }
}

/* ------------------ Search & Pagination ------------------ */
const rowsPerPage = ref(10)
const currentPage = ref(1)

const filteredRecords = computed(() => {
  return recordList.value.filter((r) => {
    const matchSearch =
      search.value === '' ||
      r.title.toLowerCase().includes(search.value.toLowerCase()) 
    const matchQuick = quickFilter.value === '' || r.status === quickFilter.value
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
    title: 'Strategic Plans List',
    fileName: 'Strategic_Plans.csv',
  })
}

const exportXLSX = async () => {
  await excelExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: 'Strategic Plans List',
    fileName: 'Strategic_Plans.xlsx',
  })
}

const exportPDF = () => {
  pdfExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: 'Strategic Plans List',
    fileName: 'Strategic_Plans.pdf',
  })
}

onMounted(() => getRecords())
</script>

<template>
  <div class="p-6 space-y-6 bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
      <h2 class="text-lg font-semibold text-gray-700">Strategic Plans</h2>
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
        <button @click="$router.push({ name: 'create-strategic-plan' })" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
          + Add Strategic Plan
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
        <label class="text-sm text-gray-600">Status</label>
        <select v-model="quickFilter" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Disabled">Disabled</option>
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
        <!-- <template #item-plan="{ plan }">
          <div v-html="sanitize(plan)" class="text-sm text-gray-700"></div>
        </template> -->
        <template #item-status="{ status }">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ status }}
          </span>
        </template>
        <template #item-actions="{ id }">
          <div class="flex justify-end gap-2">
            <button @click="$router.push({ name: 'view-strategic-plan', params: { id } })" class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
              View
            </button>
            <button @click="$router.push({ name: 'edit-strategic-plan', params: { id } })" class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
              Edit
            </button>
            <button @click="deleteRecord(id)" class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
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
