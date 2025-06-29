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

const router = useRouter()
const auth = authStore
const recordList = ref([])
const loading = ref(false)
const search = ref('')
const quickFilter = ref('')
const selectedProfile = ref(localStorage.getItem('asset_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('asset_columns')) || ['name', 'quantity', 'responsible_user_first_name', 'status', 'is_active', 'actions'])

//get records from API
const getRecords = async () => {
  loading.value = true
  try {
    const res = await auth.fetchProtectedApi('/api/assets', {}, 'GET')
    if (res.status) {
      recordList.value = res.data.map(r => ({
        id: r.id,
        name: r.name,
        quantity: r.quantity,
        responsible_user_first_name: r.responsible_user_first_name,
        responsible_user_last_name: r.responsible_user_last_name,
        responsible_user_full_name: `${r.responsible_user_first_name ?? ''} ${r.responsible_user_last_name ?? ''}`.trim(), // ✅ Combine first and last names
        status: r.asset_lifecycle_statuses_name,
        is_active: r.is_active === 1 ? 'Yes' : 'No'
      }))
    } else {
      recordList.value = []
    }
  } catch (err) {
    console.error('Error fetching assets:', err)
  } finally {
    loading.value = false
  }
}

const columnProfiles = {
  minimal: ['name', 'status', 'actions'],
  detailed: ['name', 'quantity', 'responsible_user_full_name', 'status', 'is_active', 'actions']
}

const headers = [
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Quantity', value: 'quantity', sortable: true },
  { text: 'Lifecycle Status', value: 'status', sortable: true },
  { text: 'Responsible User', value: 'responsible_user_full_name', sortable: true },
  { text: 'Is Active', value: 'is_active', sortable: true },
  { text: 'Actions', value: 'actions' }
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
    return matchSearch && matchQuick
  })
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
  <div class="p-6 space-y-6 bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-700">Assets</h2>
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
        <button @click="exportPDF"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileDown class="w-4 h-4" /> Old Asset
        </button>
        <button @click="$router.push({ name: 'create-asset' })"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ Add Asset</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div>
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

    <!-- Table -->
    <EasyDataTable :headers="filteredHeaders" :items="filteredAssets" :search-value="search" :loading="loading"
      show-index buttons-pagination :theme-color="'#2563eb'">
      <!-- Actions Slot -->
      <template #item-actions="{ id }">
        <div class="flex justify-end gap-2">
          <button @click="$router.push({ name: 'view-asset', params: { id } })"
            class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">View</button>
          <button @click="$router.push({ name: 'edit-asset', params: { id } })"
            class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs">Edit</button>
          <button @click="deleteRecord(id)"
            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Delete</button>
        </div>
      </template>

      <!-- is_active Badge Slot -->
      <template #item-is_active="{ is_active }">
        <span
          class="px-2 py-0.5 rounded-full text-xs font-medium"
          :class="is_active === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
          {{ is_active }}
        </span>
      </template>
    </EasyDataTable>
  </div>
</template>