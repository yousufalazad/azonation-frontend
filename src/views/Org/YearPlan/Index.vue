<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import DOMPurify from 'dompurify'
import { authStore } from '../../../store/authStore'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { FileText, FileSpreadsheet, FileDown, Eye, Pencil, Trash2, Plus } from 'lucide-vue-next'
import { csvExport } from '@/helpers/csvExport.js'
import { excelExport } from '@/helpers/excelExport.js'
import { pdfExport } from '@/helpers/pdfExport.js'

/* ---------------- init ---------------- */
const router = useRouter()
const auth = authStore
const recordList = ref([])
const loading = ref(false)

const search = ref('')
const quickFilter = ref('')
const startDate = ref('')
const endDate = ref('')

const selectedProfile = ref(localStorage.getItem('yearplan_profile') || 'detailed')
const visibleColumns = ref(
  JSON.parse(localStorage.getItem('yearplan_columns')) ||
  ['title', 'start_year', 'end_year', 'budget', 'start_date', 'end_date', 'actions']
)

/* ---------------- column profiles & headers ---------------- */
const columnProfiles = {
  minimal: ['title', 'start_year', 'end_year', 'actions'],
  detailed: ['title', 'start_year', 'end_year', 'budget', 'start_date', 'end_date', 'actions']
}

const headers = [
  { text: 'Title', value: 'title', sortable: true },
  { text: 'Start Year', value: 'start_year', sortable: true },
  { text: 'End Year', value: 'end_year', sortable: true },
  { text: 'Budget', value: 'budget', sortable: true },
  { text: 'Start Date', value: 'start_date', sortable: true },
  { text: 'End Date', value: 'end_date', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false }
]

const filteredHeaders = computed(() =>
  headers.filter(h => visibleColumns.value.includes(h.value))
)

watch([selectedProfile, visibleColumns], () => {
  localStorage.setItem('yearplan_profile', selectedProfile.value)
  localStorage.setItem('yearplan_columns', JSON.stringify(visibleColumns.value))
})

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

/* ---------------- fetch ---------------- */
const getRecords = async () => {
  loading.value = true
  try {
    const res = await auth.fetchProtectedApi('/api/year-plans', {}, 'GET')
    if (res.status) {
      // normalize if necessary
      recordList.value = res.data.map(r => ({
        id: r.id,
        title: r.title,
        start_year: r.start_year,
        end_year: r.end_year,
        budget: r.budget,
        start_date: r.start_date,
        end_date: r.end_date,
      }))
    } else {
      recordList.value = []
    }
  } catch (err) {
    console.error('Error fetching year plans:', err)
    recordList.value = []
  } finally {
    loading.value = false
  }
}

/* ---------------- sanitize (if you show html fields later) ---------------- */
const sanitize = (html) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'br'],
    ALLOWED_ATTR: []
  })

/* ---------------- delete ---------------- */
const deleteRecord = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this year plan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  })
  if (result.isConfirmed) {
    const res = await auth.fetchProtectedApi(`/api/year-plans/${id}`, {}, 'DELETE')
    if (res.status) {
      Swal.fire('Deleted!', 'Year plan has been deleted.', 'success')
      getRecords()
    } else {
      Swal.fire('Failed!', 'Failed to delete year plan.', 'error')
    }
  }
}

/* ---------------- filtering & pagination ---------------- */
const rowsPerPage = ref(10)
const currentPage = ref(1)

watch(rowsPerPage, () => (currentPage.value = 1))

const filteredRecords = computed(() =>
  recordList.value.filter(record => {
    const matchSearch =
      search.value === '' ||
      Object.values(record).some(v => String(v).toLowerCase().includes(search.value.toLowerCase()))
    const matchQuick = quickFilter.value === '' || String(record.is_active) === quickFilter.value
    const matchStart = startDate.value === '' || (record.start_date && record.start_date >= startDate.value)
    const matchEnd = endDate.value === '' || (record.end_date && record.end_date <= endDate.value)
    return matchSearch && matchQuick && matchStart && matchEnd
  })
)

const totalItems = computed(() => filteredRecords.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / rowsPerPage.value)))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredRecords.value.slice(start, start + rowsPerPage.value)
})

const goToFirst = () => (currentPage.value = 1)
const goToPrev = () => { if (currentPage.value > 1) currentPage.value-- }
const goToNext = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const goToLast = () => (currentPage.value = totalPages.value)
const goToPage = (p) => { if (p >= 1 && p <= totalPages.value) currentPage.value = p }

/* ---------------- exports (use your helpers) ---------------- */
const exportCSV = async () => {
  await csvExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: 'Year Plans',
    fileName: 'YearPlans.csv'
  })
}

const exportXLSX = async () => {
  await excelExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: 'Year Plans',
    fileName: 'YearPlans.xlsx'
  })
}

const exportPDF = async () => {
  await pdfExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: 'Year Plans',
    fileName: 'YearPlans.pdf'
  })
}

/* ---------------- mount ---------------- */
onMounted(() => {
  applyProfile()
  getRecords()
})
</script>

<template>
  <div class="p-6 space-y-6 bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
      <h2 class="text-lg font-semibold text-gray-700">Year Plans</h2>
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
        <button @click="$router.push({ name: 'create-year-plan' })" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ Add Year Plan</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Quick Filter</label>
        <select v-model="quickFilter" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="1">Active</option>
          <option value="0">Disabled</option>
        </select>
      </div>
      <div>
        <label class="text-sm text-gray-600">Start Date</label>
        <input type="date" v-model="startDate" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">End Date</label>
        <input type="date" v-model="endDate" class="w-full border rounded px-3 py-1.5 text-sm" />
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
      <EasyDataTable
        :headers="filteredHeaders"
        :items="paginatedRecords"
        :search-value="search"
        :loading="loading"
        show-index
        hide-footer
        :theme-color="'#2563eb'"
        table-class="min-w-full text-sm"
        header-class="bg-gray-100"
        body-row-class="text-sm"
      >
        <template #header-actions>
          <div class="text-right w-full pr-2">Actions</div>
        </template>
        <template #item-title="{ title }">
          <div>{{ title }}</div>
        </template>
        <template #item-start_date="{ start_date }">
          <div>{{ start_date }}</div>
        </template>

        <template #item-end_date="{ end_date }">
          <div>{{ end_date }}</div>
        </template>

        <template #item-actions="{ id }">
          <div class="flex justify-end flex-wrap gap-2">
            <button @click="$router.push({ name: 'view-year-plan', params: { id } })" class="bg-white text-gray-700 hover:bg-gray-100 border rounded-md py-1 px-3">View</button>
            <button @click="$router.push({ name: 'edit-year-plan', params: { id } })" class="bg-white text-gray-700 hover:bg-gray-100 border rounded-md py-1 px-3">Edit</button>
            <button @click="deleteRecord(id)" class="bg-white text-gray-700 hover:bg-gray-100 border rounded-md py-1 px-3">Delete</button>
          </div>
        </template>
      </EasyDataTable>
    </div>

    <!-- Pagination Controls -->
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
      <div class="text-sm text-gray-600 text-center md:text-left">
        Items {{ (currentPage - 1) * rowsPerPage + 1 }} -
        {{ Math.min(currentPage * rowsPerPage, totalItems) }} of {{ totalItems }} |
        Page {{ currentPage }} of {{ totalPages }}
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="flex items-center gap-1">
          <span class="text-sm text-gray-600">Items per page:</span>
          <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-sm">
            <option v-for="size in [5, 10, 50, 100, 250]" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
        <div class="flex gap-1">
          <button @click="goToFirst" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm" :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">First</button>
          <button @click="goToPrev" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm" :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">Prev</button>
          <button @click="goToNext" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm" :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">Next</button>
          <button @click="goToLast" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm" :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">Last</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.easy-data-table {
  --easy-table-header-font-weight: 600;
  --easy-table-header-bg-color: #f3f4f6;
  --easy-table-border: 1px solid #e5e7eb;
  --easy-table-body-row-hover-bg-color: #f9fafb;
}
</style>
