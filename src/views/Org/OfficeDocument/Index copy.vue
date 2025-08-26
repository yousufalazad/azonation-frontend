<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { authStore } from '../../../store/authStore'
import EasyDataTable from 'vue3-easy-data-table'
import { utils, writeFileXLSX } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import 'vue3-easy-data-table/dist/style.css'
import { FileText, FileSpreadsheet, FileDown } from 'lucide-vue-next'

const auth = authStore
const documentList = ref([])
const search = ref('')
const quickFilter = ref('')
const loading = ref(false)

const selectedProfile = ref(localStorage.getItem('document_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('document_columns')) || ['title', 'description', 'privacy', 'is_active', 'actions'])

const columnProfiles = {
  minimal: ['title', 'privacy', 'actions'],
  detailed: ['title', 'description', 'privacy', 'is_active', 'actions']
}

const headers = [
  { text: 'Title', value: 'title', sortable: true },
  { text: 'Description', value: 'description', sortable: true },
  { text: 'Privacy', value: 'privacy', sortable: true },
  { text: 'Is Active', value: 'is_active', sortable: true },
  { text: 'Actions', value: 'actions' }
]

const filteredHeaders = computed(() =>
  headers.filter(h => visibleColumns.value.includes(h.value))
)

watch([selectedProfile, visibleColumns], () => {
  localStorage.setItem('document_profile', selectedProfile.value)
  localStorage.setItem('document_columns', JSON.stringify(visibleColumns.value))
})

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

const privacySetups = ref([])

const fetchPrivacySetups = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/privacy-setups', {}, 'GET')
    if (response.status) {
      privacySetups.value = response.data
    }
  } catch (error) {
    console.error('Error fetching privacy setups:', error)
  }
}

const getDocuments = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/office-documents', {}, 'GET')
    if (response.status) {
      documentList.value = response.data.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        privacy: privacySetups.value.find(p => p.id === d.privacy_setup_id)?.name || 'Unknown',
        is_active: d.is_active === 1 ? 'Yes' : 'No'
      }))
    } else {
      documentList.value = []
    }
  } catch (error) {
    console.error('Error fetching documents:', error)
    documentList.value = []
  } finally {
    loading.value = false
  }
}

const rowsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = computed(() => filteredDocuments.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / rowsPerPage.value))

const filteredDocuments = computed(() => {
  return documentList.value.filter(record => {
    const matchSearch = search.value === '' || record.title.toLowerCase().includes(search.value.toLowerCase())
    const matchQuick = quickFilter.value === '' || record.is_active === quickFilter.value
    return matchSearch && matchQuick
  })
})

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return filteredDocuments.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}
const goToFirst = () => goToPage(1)
const goToPrev = () => goToPage(currentPage.value - 1)
const goToNext = () => goToPage(currentPage.value + 1)
const goToLast = () => goToPage(totalPages.value)

const deleteRecord = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this document?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  })
  if (result.isConfirmed) {
    const res = await auth.fetchProtectedApi(`/api/office-documents/${id}`, {}, 'DELETE')
    if (res.status) {
      Swal.fire('Deleted!', 'Document has been deleted.', 'success')
      getDocuments()
    } else {
      Swal.fire('Failed!', 'Failed to delete document.', 'error')
    }
  }
}

const exportCSV = () => {
  const header = filteredHeaders.value.map(h => h.text)
  const rows = filteredDocuments.value.map(item => filteredHeaders.value.map(h => item[h.value] || ''))
  const ws = utils.aoa_to_sheet([header, ...rows])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Documents')
  writeFileXLSX(wb, 'documents.csv', { bookType: 'csv' })
}

const exportXLSX = () => {
  const json = filteredDocuments.value.map(item => {
    const obj = {}
    filteredHeaders.value.forEach(h => obj[h.text] = item[h.value])
    return obj
  })
  const ws = utils.json_to_sheet(json)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Documents')
  writeFileXLSX(wb, 'documents.xlsx')
}

const exportPDF = () => {
  const doc = new jsPDF()
  const header = filteredHeaders.value.map(h => h.text)
  const body = filteredDocuments.value.map(r => header.map(h => r[headers.find(hdr => hdr.text === h).value] || ''))
  autoTable(doc, { head: [header], body })
  doc.save('documents.pdf')
}

onMounted(async () => {
  await fetchPrivacySetups()
  await getDocuments()
})
</script>

<template>
  <div class="p-6 space-y-6 bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-700">Office Documents</h2>
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
        <button @click="$router.push({ name: 'create-document' })"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ Add Document</button>
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
    <EasyDataTable :headers="filteredHeaders" :items="paginatedDocuments" :loading="loading" show-index hide-footer
      :theme-color="'#2563eb'">
      <!-- Header Alignment Fix -->
      <template #header-actions>
        <div class="text-right w-full pr-2">
          Actions
        </div>
      </template>
      <!-- Actions Slot -->
      <template #item-actions="{ id }">
        <div class="flex justify-end gap-2">
          <button @click="$router.push({ name: 'view-document', params: { id } })"
            class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">View</button>
          <button @click="$router.push({ name: 'edit-document', params: { id } })"
            class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs">Edit</button>
          <button @click="deleteRecord(id)"
            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Delete</button>
        </div>
      </template>

      <!-- is_active Badge -->
      <template #item-is_active="{ is_active }">
        <span class="px-2 py-0.5 rounded-full text-xs font-medium"
          :class="is_active === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
          {{ is_active }}
        </span>
      </template>
    </EasyDataTable>

    <!-- Pagination Controls -->
    <div class="flex justify-between items-center px-2 py-3 bg-gray-50 rounded border">
      <div class="text-sm text-gray-600">
        Items {{ (currentPage - 1) * rowsPerPage + 1 }} - {{ Math.min(currentPage * rowsPerPage, totalItems) }} of {{
          totalItems }} |
        Page {{ currentPage }} of {{ totalPages }}
      </div>
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