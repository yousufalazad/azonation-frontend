<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { authStore } from '../../../store/authStore'
import EasyDataTable from 'vue3-easy-data-table'
import { utils, writeFileXLSX } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import 'vue3-easy-data-table/dist/style.css'
import { FileText, FileSpreadsheet, FileDown } from 'lucide-vue-next'
import dayjs from 'dayjs'

const router = useRouter()
const auth = authStore
const recordList = ref([])
const loading = ref(false)
const search = ref('')
const quickFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const selectedProfile = ref(localStorage.getItem('asset_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('asset_columns')) || ['name', 'quantity', 'asset_lifecycle_status', 'start_date', 'end_date', 'responsible_user_full_name', 'actions'])

const currentPage = ref(1)
const rowsPerPage = ref(10)

const goToFirst = () => (currentPage.value = 1)
const goToPrev = () => { if (currentPage.value > 1) currentPage.value-- }
const goToNext = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const goToLast = () => (currentPage.value = totalPages.value)

watch(rowsPerPage, () => (currentPage.value = 1))

//get records from API
const getRecords = async () => {
  loading.value = true
  try {
    const res = await auth.fetchProtectedApi('/api/assets', {}, 'GET')
    // if (res.status) {
    console.log('Asset response:', res.data)
    recordList.value = res.data.map(r => ({
      id: r.id,
      name: r.name,
      quantity: r.quantity,
      start_date: r.start_date ? new Date(r.start_date).toLocaleDateString() : '',
      end_date: r.end_date ? new Date(r.end_date).toLocaleDateString() : '',
      responsible_user_first_name: r.responsible_user_first_name,
      responsible_user_last_name: r.responsible_user_last_name,
      responsible_user_full_name: `${r.responsible_user_first_name ?? ''} ${r.responsible_user_last_name ?? ''}`.trim(),
      asset_lifecycle_status: r.asset_lifecycle_statuses_name,
      is_active: r.is_active === 1 ? 'Yes' : 'No'
    }))
    // } else {
    //   recordList.value = []
    // }
  } catch (err) {
    console.error('Error fetching assets:', err)
  } finally {
    loading.value = false
  }
}

const columnProfiles = {
  minimal: ['name', 'quantity', 'asset_lifecycle_status'],
  detailed: ['name', 'quantity', 'asset_lifecycle_status', 'start_date', 'end_date', 'responsible_user_full_name', 'actions']
}

const headers = [
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Quantity', value: 'quantity', sortable: true },
  { text: 'Start Date', value: 'start_date', sortable: true },
  { text: 'End Date', value: 'end_date', sortable: true },
  { text: 'Lifecycle Status', value: 'asset_lifecycle_status', sortable: true },
  { text: 'Responsible User', value: 'responsible_user_full_name', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false }
]

const filteredHeaders = computed(() =>
  headers.filter(h => visibleColumns.value.includes(h.value))
)

watch([selectedProfile, visibleColumns], () => {
  localStorage.setItem('asset_profile', selectedProfile.value)
  localStorage.setItem('asset_columns', JSON.stringify(visibleColumns.value))
})

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

const filteredAssets = computed(() => {
  return recordList.value.filter(record => {
    const matchSearch = search.value === '' || record.name.toLowerCase().includes(search.value.toLowerCase())
    const matchQuick = quickFilter.value === '' || record.is_active === quickFilter.value
    const matchStart = startDate.value === '' || (record.start_date && record.start_date >= startDate.value)
    const matchEnd = endDate.value === '' || (record.end_date && record.end_date <= endDate.value)
    return matchSearch && matchQuick && matchStart && matchEnd
  })
})

const totalItems = computed(() => filteredAssets.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / rowsPerPage.value))

const paginatedAssets = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredAssets.value.slice(start, start + rowsPerPage.value)
})

// Delete record function
const deleteRecord = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this asset?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  })
  if (result.isConfirmed) {
    const res = await auth.fetchProtectedApi(`/api/assets/${id}`, {}, 'DELETE')
    if (res.status) {
      Swal.fire('Deleted!', 'Asset has been deleted.', 'success')
      getRecords()
    } else {
      Swal.fire('Failed!', 'Failed to delete asset.', 'error')
    }
  }
}

const exportCSV = () => {
  const header = filteredHeaders.value.map(h => h.text)
  const rows = filteredAssets.value.map(item => filteredHeaders.value.map(h => item[h.value] || ''))
  const ws = utils.aoa_to_sheet([header, ...rows])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Assets')
  writeFileXLSX(wb, 'assets.csv', { bookType: 'csv' })
}

const exportXLSX = () => {
  const json = filteredAssets.value.map(item => {
    const obj = {}
    filteredHeaders.value.forEach(h => obj[h.text] = item[h.value])
    return obj
  })
  const ws = utils.json_to_sheet(json)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Assets')
  writeFileXLSX(wb, 'assets.xlsx')
}

const exportPDF = () => {
  const doc = new jsPDF()
  const header = filteredHeaders.value.map(h => h.text)
  const body = filteredAssets.value.map(r => header.map(h => r[headers.find(hdr => hdr.text === h).value] || ''))
  autoTable(doc, { head: [header], body })
  doc.save('assets.pdf')
}

onMounted(() => getRecords())
</script>

<template>
  <div class="p-4 md:p-6 space-y-6 bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <h2 class="text-lg font-semibold text-gray-700">Assets</h2>
      <div class="flex flex-wrap gap-2">
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
        <button @click="$router.push({ name: 'create-asset' })"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ Add Asset</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Is Active</label>
        <select v-model="quickFilter" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
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
    <div class="bg-gray-50 border rounded p-4 flex flex-col md:flex-row flex-wrap gap-6">
      <!-- Column Profile Selector -->
      <div class="flex flex-col">
        <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
        <select v-model="selectedProfile" @change="applyProfile"
          class="border rounded px-3 py-1.5 text-sm w-full md:w-48">
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
      <!-- Visible Columns -->
      <div class="flex-1">
        <label class="text-sm font-medium text-gray-700 mb-1 block">Visible Columns</label>
        <div class="flex flex-wrap gap-4">
          <div v-for="header in headers" :key="header.value" class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="visibleColumns" :value="header.value" :id="header.value"
              class="accent-blue-600" />
            <label :for="header.value" class="text-gray-700">{{ header.text }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Table (scrollable on mobile) -->
    <div class="overflow-x-auto">
      <EasyDataTable :headers="filteredHeaders" :items="paginatedAssets" :search-value="search" :loading="loading"
        show-index hide-footer :theme-color="'#2563eb'" table-class="min-w-full text-sm" header-class="bg-gray-100"
        body-row-class="text-sm">
        <!-- Header Alignment Fix -->
        <template #header-actions>
          <div class="text-right w-full pr-2">Actions</div>
        </template>

        <!-- Actions Slot -->
        <template #item-actions="{ id }">
          <div class="flex justify-end flex-wrap gap-2">
            <button @click="$router.push({ name: 'view-asset', params: { id } })"
              class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
              View</button>
            <button @click="$router.push({ name: 'edit-asset', params: { id } })"
              class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
              Edit</button>
            <button @click="deleteRecord(id)"
              class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
              Delete</button>
          </div>
        </template>

        <!-- is_active Badge Slot -->
        <template #item-is_active="{ is_active }">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium"
            :class="is_active === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ is_active }}
          </span>
        </template>
      </EasyDataTable>
    </div>

    <!-- Pagination Controls -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
      <!-- Info -->
      <div class="text-sm text-gray-600 text-center md:text-left">
        Items
        {{ (currentPage - 1) * rowsPerPage + 1 }} -
        {{ Math.min(currentPage * rowsPerPage, totalItems) }}
        of {{ totalItems }} |
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <!-- Controls -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="flex items-center gap-1">
          <span class="text-sm text-gray-600">Items per page:</span>
          <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-sm">
            <option v-for="size in [5, 10, 50, 100, 250, 500, 1000]" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
        <div class="flex gap-1">
          <button @click="goToFirst" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm"
            :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">First</button>
          <button @click="goToPrev" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm"
            :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">Prev</button>
          <button @click="goToNext" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm"
            :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">Next</button>
          <button @click="goToLast" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm"
            :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">Last</button>
        </div>
      </div>
    </div>
  </div>
</template>