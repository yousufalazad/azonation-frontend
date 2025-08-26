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
const committeeList = ref([])
const modalVisible = ref(false)
const viewModalVisible = ref(false)
const isEditMode = ref(false)
const selectedCommittee = ref({})
const newName = ref('')
const short_description = ref('')
const start_date = ref('')
const end_date = ref('')
const note = ref('')
const is_active = ref('1')
const userId = authStore.user.id;

const search = ref('')
const startFilter = ref('')
const endFilter = ref('')
const quickDateFilter = ref('')
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
  minimal: ['name', 'start_date', 'status_display', 'actions'],
  detailed: ['name', 'start_date', 'end_date', 'status_display', 'actions']
}
const selectedProfile = ref(localStorage.getItem('selected_committee_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('visible_committee_columns')) || columnProfiles[selectedProfile.value])

const allHeaders = [
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Start Date', value: 'start_date', sortable: true },
  { text: 'End Date', value: 'end_date', sortable: true },
  { text: 'Is Active', value: 'status_display', sortable: true },
  { text: 'Actions', value: 'actions' }
]

watch([visibleColumns, selectedProfile], () => {
  localStorage.setItem('visible_committee_columns', JSON.stringify(visibleColumns.value))
  localStorage.setItem('selected_committee_profile', selectedProfile.value)
}, { deep: true })

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

const filteredHeaders = computed(() =>
  allHeaders.filter(h => visibleColumns.value.includes(h.value))
)

const filteredCommittees = computed(() => {
  let list = [...committeeList.value]
  if (startFilter.value) list = list.filter(c => c.start_date >= startFilter.value)
  if (endFilter.value) list = list.filter(c => c.end_date <= endFilter.value)
  if (search.value.trim()) {
    const keyword = search.value.toLowerCase()
    list = list.filter(c => String(c.name).toLowerCase().includes(keyword))
  }
  return list
})

const totalItems = computed(() => filteredCommittees.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / rowsPerPage.value))
const paginatedCommittees = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredCommittees.value.slice(start, start + rowsPerPage.value)
})

watch(rowsPerPage, () => { currentPage.value = 1 })

const goToFirst = () => (currentPage.value = 1)
const goToPrev = () => (currentPage.value = Math.max(1, currentPage.value - 1))
const goToNext = () => (currentPage.value = Math.min(totalPages.value, currentPage.value + 1))
const goToLast = () => (currentPage.value = totalPages.value)

const applyQuickDateFilter = () => {
  const today = new Date()
  const format = d => d.toISOString().split('T')[0]
  if (quickDateFilter.value === 'last7') {
    const d = new Date(today); d.setDate(today.getDate() - 7)
    startFilter.value = format(d); endFilter.value = format(today)
  } else if (quickDateFilter.value === 'thisMonth') {
    const d1 = new Date(today.getFullYear(), today.getMonth(), 1)
    const d2 = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    startFilter.value = format(d1); endFilter.value = format(d2)
  } else {
    startFilter.value = ''; endFilter.value = ''
  }
}

const exportCSV = () => {
  const header = filteredHeaders.value.map(h => h.text)
  const rows = filteredCommittees.value.map(c => filteredHeaders.value.map(h => c[h.value] || ''))
  const ws = utils.aoa_to_sheet([header, ...rows])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Committees')
  writeFileXLSX(wb, 'committees.csv', { bookType: 'csv' })
}

const exportXLSX = () => {
  const json = filteredCommittees.value.map(c => {
    const obj = {}
    filteredHeaders.value.forEach(h => obj[h.text] = c[h.value])
    return obj
  })
  const ws = utils.json_to_sheet(json)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Committees')
  writeFileXLSX(wb, 'committees.xlsx')
}

const exportPDF = () => {
  const doc = new jsPDF()
  const hdr = filteredHeaders.value.map(h => h.text)
  const body = filteredCommittees.value.map(c =>
    hdr.map(txt => c[allHeaders.find(hdr => hdr.text === txt).value] || ''))
  autoTable(doc, { head: [hdr], body })
  doc.save('committees.pdf')
}

const fetchCommitteeList = async () => {
  loading.value = true
  try {
    const res = await auth.fetchProtectedApi('/api/committees', {}, 'GET')
    committeeList.value = res.status ? res.data.map(c => ({
      id: c.id, name: c.name, start_date: c.start_date,
      end_date: c.end_date, is_active: c.is_active,
      status_display: c.is_active === 1 ? 'Yes' : 'No',
      note: c.note, short_description: c.short_description
    })) : []
  } catch {
    committeeList.value = []
  } finally {
    loading.value = false
  }
}

const deleteCommittee = async id => {
  const r = await Swal.fire({
    title: 'Are you sure?', text: 'Delete committee?', icon: 'warning',
    showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'No'
  })
  if (r.isConfirmed) {
    const res = await auth.fetchProtectedApi(`/api/committees/${id}`, {}, 'DELETE')
    if (res.status) { Swal.fire('Deleted!', '', 'success'); fetchCommitteeList() }
    else Swal.fire('Error!', '', 'error')
  }
}

const openModal = c => {
  isEditMode.value = !!c
  selectedCommittee.value = c || {}
  newName.value = c?.name || ''
  short_description.value = c?.short_description || ''
  start_date.value = c?.start_date || ''
  end_date.value = c?.end_date || ''
  note.value = c?.note || ''
  is_active.value = String(c?.is_active || 1)
  modalVisible.value = true
}

const closeModal = () => modalVisible.value = false

const submitForm = async () => {
  const payload = {
    name: newName.value, short_description: short_description.value,
    start_date: start_date.value, end_date: end_date.value,
    note: note.value, is_active: is_active.value
  }
  if (isEditMode.value) {
    await auth.fetchProtectedApi(`/api/committees/${selectedCommittee.value.id}`, payload, 'PUT')
    Swal.fire('Updated', '', 'success')
  } else {
    await auth.fetchProtectedApi('/api/committees', payload, 'POST')
    Swal.fire('Created', '', 'success')
  }
  closeModal()
  fetchCommitteeList()
}

// Create committee
const createCommittee = async () => {
  try {
    const response = await auth.fetchProtectedApi(
      "/api/committees",
      {
        user_id: userId,
        name: newName.value,
        short_description: short_description.value,
        start_date: start_date.value,
        end_date: end_date.value,
        note: note.value,
        is_active: is_active.value,
      },
      "POST"
    );

    Swal.fire({
      icon: 'success',
      title: 'Committee created successfully',
      showConfirmButton: false,
      timer: 1500
    });
    closeModal();
    fetchCommitteeList();
  } catch (error) {
    console.error("Error creating committee:", error);
  }
};

// Update committee
const updateCommittee = async () => {
  try {
    const response = await auth.fetchProtectedApi(
      `/api/committees/${selectedCommittee.value.id}`,
      {
        user_id: userId,
        name: newName.value,
        short_description: short_description.value,
        start_date: start_date.value,
        end_date: end_date.value,
        note: note.value,
        is_active: is_active.value,
      },
      "PUT"
    );

    Swal.fire({
      icon: 'success',
      title: 'Committee created successfully',
      showConfirmButton: false,
      timer: 1500
    });
    closeModal();
    fetchCommitteeList();
  } catch (error) {
    console.error("Error creating committee:", error);
  }
};


const openViewModal = c => { selectedCommittee.value = c; viewModalVisible.value = true }
const closeViewModal = () => viewModalVisible.value = false

onMounted(fetchCommitteeList)
</script>


<template>
  <div class="p-6 bg-white shadow rounded-lg space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">Committees</h2>
      <div class="flex gap-2">
        <button @click="exportCSV"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          CSV
        </button>
        <button @click="exportXLSX"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          Excel
        </button>
        <button @click="exportPDF"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          PDF
        </button>
        <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded text-sm">+ Add Committee</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Start Date</label>
        <input type="date" v-model="startFilter" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">End Date</label>
        <input type="date" v-model="endFilter" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Quick Filter</label>
        <select v-model="quickDateFilter" @change="applyQuickDateFilter" class="w-full border rounded px-3 py-1.5 text-sm">
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
    <!-- Table -->
    <EasyDataTable :headers="filteredHeaders" :items="paginatedCommittees" :loading="loading" show-index hide-footer
      table-class="min-w-full text-sm" header-class="bg-gray-100" body-row-class="text-sm" :theme-color="'#3b82f6'">


      <template #item-status_display="{ status_display }">
        <span :class="status_display === 'Active' ? 'text-green-600' : 'text-red-600'">{{ status_display }}</span>
      </template>
      <!-- Header Alignment Fix -->
      <template #header-actions>
        <div class="text-right w-full pr-2">
          Actions
        </div>
      </template>
      <!-- Actions Slot -->
      <template #item-actions="{ id }">
        <div class="flex justify-end gap-2">
          <!-- <button @click="$router.push({ name: 'index-committee-member', params: { committeeId: id, committeeName: name } })"
            class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-lg text-xs">
            Members
          </button> -->
          <button @click="$router.push({ name: 'index-committee-member', params: { committeeId: id } })"
            class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-lg text-xs">
            Members
          </button>
          <button @click="openViewModal(committeeList.find(c => c.id === id))"
            class="bg-green-500 px-3 py-1 rounded text-xs">
            View
          </button>
          <button @click="openModal(committeeList.find(c => c.id === id))"
            class="bg-yellow-400 px-3 py-1 rounded text-xs">
            Edit
          </button>
          <button @click="deleteCommittee(id)" class="bg-red-500 px-3 py-1 rounded text-xs">
            Delete
          </button>
        </div>
      </template>
    </EasyDataTable>

    <!-- ✅ Custom Footer -->
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

    <!-- Modals (View/Edit) go here... -->
     <!-- Create/Edit Modal -->
  <div v-if="modalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-auto p-6 md:p-8">
      <!-- Modal Header -->
      <h2 class="text-lg md:text-2xl font-semibold text-center text-gray-800 mb-6">
        {{ isEditMode ? 'Edit Committee' : 'Create Committee' }}
      </h2>

      <!-- Scrollable Form -->
      <div class="max-h-[28rem] overflow-y-auto space-y-4">
        <!-- Committee Name -->
        <div>
          <label for="newName" class="block text-sm font-medium text-gray-700 mb-1">Committee Name</label>
          <input v-model="newName" id="newName" type="text"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Short Description -->
        <div>
          <label for="short_description" class="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <input v-model="short_description" id="short_description" type="text"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input v-model="start_date" id="start_date" type="date"
              class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input v-model="end_date" id="end_date" type="date"
              class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <!-- Note -->
        <div>
          <label for="note" class="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea v-model="note" id="note" rows="3"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <!-- is_active -->
        <div>
          <label for="is_active" class="block text-sm font-medium text-gray-700 mb-1">Is Active</label>
          <select v-model="is_active" id="is_active"
            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end mt-6 space-x-3">
        <button @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <!-- <button @click="submitForm()" -->
        <button @click="isEditMode ? updateCommittee() : createCommittee()"
          class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          {{ isEditMode ? 'Update' : 'Submit' }}
        </button>
      </div>
    </div>
  </div>

  <!-- View Modal -->
  <div v-if="viewModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-auto p-6 md:p-8">
      <!-- Header -->
      <h2 class="text-lg md:text-2xl font-semibold text-center text-gray-800 mb-6">
        View Committee
      </h2>

      <!-- Committee Info Table -->
      <div class="max-h-[28rem] overflow-y-auto">
        <table class="w-full table-auto border-separate border-spacing-y-3">
          <tbody class="text-gray-700 text-sm md:text-base">
            <tr v-for="(value, label) in {
              'Name': selectedCommittee.name,
              'Short Description': selectedCommittee.short_description,
              'Start Date': selectedCommittee.start_date,
              'End Date': selectedCommittee.end_date,
              'Note': selectedCommittee.note,
              'Is Active': selectedCommittee.is_active == '1' ? 'Yes' : 'No'
            }" :key="label">
              <td class="font-medium text-gray-600 w-40 align-top">{{ label }}</td>
              <td class="text-gray-500">:</td>
              <td class="text-gray-800">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="text-right mt-6">
        <button @click="closeViewModal"
          class="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          Close
        </button>
      </div>
    </div>
  </div>
  
  </div>
</template>
