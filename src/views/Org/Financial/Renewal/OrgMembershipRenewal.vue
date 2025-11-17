<script setup>
/* eslint-disable no-unused-vars */
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import Swal from 'sweetalert2'
import EasyDataTable from 'vue3-easy-data-table'
import { utils as xlsxUtils, writeFileXLSX } from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import { authStore } from '../../../../store/authStore';

dayjs.extend(duration)
dayjs.extend(relativeTime)

const auth = authStore

// Data
const renewals = ref([])
const membershipTypes = ref([])
const individualTypes = ref([])
const renewalCycles = ref([])

// UI state & filters
const search = ref('')
const membershipTypeFilter = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const loading = ref(false)

const showModal = ref(false)
const isEditMode = ref(false)
const viewModal = ref(false)
const selectedMemberView = ref({})

const form = ref({
  id: null,
  individual_type_user_id: '',
  membership_renewal_cycle_id: '',
  period_start: '',
  period_end: '',
  amount_paid: '',
  status: '',
  initiated_by: '',
  initiated_source: '',
  attempt_count: 0,
  last_attempt_at: '',
  renewed_at: '',
  invoice_id: '',
  payment_id: '',
  failure_code: '',
  failure_message: '',
  org_notes: '',
  idempotency_key: '',
  is_active: 1
})

// Column profiles & visibility
const allHeaders = [
  { text: 'Image', value: 'image_url' },
  { text: 'Name', value: 'full_name', sortable: true },
  { text: 'Membership ID', value: 'existing_membership_id', sortable: true },
  { text: 'Membership Type', value: 'membership_type_before_termination', sortable: true },
  { text: 'Amount Paid', value: 'amount_paid', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Renewed At', value: 'renewed_at', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false }
]

const columnProfiles = {
  minimal: ['full_name', 'existing_membership_id', 'membership_type_before_termination', 'status', 'actions'],
  detailed: allHeaders.map(h => h.value)
}

const selectedProfile = ref(localStorage.getItem('selected_renewal_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('visible_renewal_columns')) || columnProfiles[selectedProfile.value])

watch([visibleColumns, selectedProfile], () => {
  localStorage.setItem('visible_renewal_columns', JSON.stringify(visibleColumns.value))
  localStorage.setItem('selected_renewal_profile', selectedProfile.value)
}, { deep: true })

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

// Derived headers (visible)
const visibleHeaders = computed(() => allHeaders.filter(h => visibleColumns.value.includes(h.value)))

// Pagination
const currentPage = ref(1)
const rowsPerPage = ref(10)

const filteredList = computed(() => {
  const kw = search.value.trim().toLowerCase()
  let list = (renewals.value || []).map(m => {
    // normalize response shape defensively
    let parsedMoreInfo = {}
    try { parsedMoreInfo = typeof m.more_info === 'string' ? JSON.parse(m.more_info) : (m.more_info || {}) } catch { parsedMoreInfo = {} }

    return {
      ...m,
      full_name: m.individual ? `${m.individual.first_name || ''} ${m.individual.last_name || ''}`.trim() :
        (m.full_name || `${parsedMoreInfo.first_name || ''} ${parsedMoreInfo.last_name || ''}`.trim()),
      image_url: m.image_url ?? placeholderImage,
      existing_membership_id: parsedMoreInfo.existing_membership_id || m.existing_membership_id || '--'
    }
  })

  if (kw) {
    list = list.filter(m => {
      const fullName = (m.full_name || '').toString().toLowerCase()
      const membershipId = (m.existing_membership_id || '').toString().toLowerCase()
      const membershipType = (m.membership_type_before_termination || '').toString().toLowerCase()
      const invoice = (m.invoice_id || '').toString().toLowerCase()
      const payment = (m.payment_id || '').toString().toLowerCase()
      return fullName.includes(kw) || membershipId.includes(kw) || membershipType.includes(kw) || invoice.includes(kw) || payment.includes(kw)
    })
  }

  if (membershipTypeFilter.value) {
    list = list.filter(m => (m.membership_type_before_termination || '') === membershipTypeFilter.value)
  }

  if (statusFilter.value) {
    list = list.filter(m => (m.status || '') === statusFilter.value)
  }

  if (dateFrom.value && dateTo.value) {
    const from = dayjs(dateFrom.value)
    const to = dayjs(dateTo.value)
    list = list.filter(m => {
      const d = m.renewed_at ? dayjs(m.renewed_at) : null
      if (!d) return false
      return d.isAfter(from.subtract(1, 'day')) && d.isBefore(to.add(1, 'day'))
    })
  }

  // if (dateFrom.value && dateTo.value) {
  //   const from = dayjs(dateFrom.value).startOf('day');
  //   const to = dayjs(dateTo.value).endOf('day');

  //   list = list.filter(m => {
  //     const d = m.renewed_at ? dayjs(m.renewed_at) : null;
  //     return d ? d.isBetween(from, to, null, '[]') : false;
  //   });
  // }


  return list
})

const filteredCount = computed(() => filteredList.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCount.value / rowsPerPage.value)))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredList.value.slice(start, start + rowsPerPage.value)
})

// Helpers
const findById = (id) => renewals.value.find(r => r.id === id) || null
const formatDateTime = (val) => {
  if (!val) return '—'
  try { const d = new Date(val); if (isNaN(d.getTime())) return val; return d.toLocaleString() } catch { return val }
}

// CRUD + fetch
const fetchRenewals = async () => {
  loading.value = true
  try {
    const res = await auth.fetchProtectedApi('/api/org-membership-renewals', {}, 'GET')
    renewals.value = res.status ? res.data : []
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'Failed to fetch renewals. Please try again.', 'error')
    renewals.value = []
  } finally {
    loading.value = false
  }
}

const fetchMembershipType = async () => {
  try {
    const res = await auth.fetchProtectedApi('/api/membership-types', {}, 'GET')
    membershipTypes.value = res.status ? res.data : []
  } catch (e) {
    membershipTypes.value = []
  }
}

const fetchIndividualTypes = async () => {
  try {
    const res = await auth.fetchProtectedApi('/api/org-all-member-name', {}, 'GET')
    individualTypes.value = res.status ? res.data : []
  } catch (e) {
    individualTypes.value = []
  }
}

const fetchRenewalCycles = async () => {
  try {
    const res = await auth.fetchProtectedApi('/api/org-membership-renewal-cycles', {}, 'GET')
    renewalCycles.value = res.status ? res.data : []
  } catch (e) {
    renewalCycles.value = []
  }
}

// Modal handlers
const openModalForCreate = () => {
  isEditMode.value = false
  Object.keys(form.value).forEach(k => form.value[k] = (k === 'attempt_count' ? 0 : (k === 'is_active' ? 1 : '')))
  showModal.value = true
}
const editRenewal = (r) => {
  isEditMode.value = true
  Object.assign(form.value, {
    id: r.id,
    individual_type_user_id: r.individual_type_user_id || '',
    membership_renewal_cycle_id: r.membership_renewal_cycle_id || '',
    period_start: r.period_start || '',
    period_end: r.period_end || '',
    amount_paid: r.amount_paid || '',
    status: r.status || '',
    initiated_by: r.initiated_by || '',
    initiated_source: r.initiated_source || '',
    attempt_count: r.attempt_count || 0,
    last_attempt_at: r.last_attempt_at || '',
    renewed_at: r.renewed_at || '',
    invoice_id: r.invoice_id || '',
    payment_id: r.payment_id || '',
    failure_code: r.failure_code || '',
    failure_message: r.failure_message || '',
    org_notes: r.org_notes || '',
    idempotency_key: r.idempotency_key || '',
    is_active: r.is_active != null ? r.is_active : 1
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveRenewal = async () => {
  try {
    let res
    if (isEditMode.value && form.value.id) {
      res = await auth.fetchProtectedApi(`/api/org-membership-renewals/${form.value.id}`, form.value, 'PUT')
    } else {
      res = await auth.fetchProtectedApi('/api/org-membership-renewals', form.value, 'POST')
    }
    if (res.status) {
      Swal.fire('Success', res.message || 'Saved successfully', 'success')
      fetchRenewals()
      closeModal()
    } else {
      Swal.fire('Error', res.message || 'An error occurred. Please try again.', 'error')
    }
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'An error occurred. Please try again.', 'error')
  }
}

const viewRenewal = (r) => {
  selectedMemberView.value = { ...r }
  viewModal.value = true
}
const closeViewModal = () => viewModal.value = false

const deleteRenewal = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  })
  if (!result.isConfirmed) return
  try {
    const res = await auth.fetchProtectedApi(`/api/org-membership-renewals/${id}`, {}, 'DELETE')
    if (res.status) {
      Swal.fire('Deleted!', res.message || 'Deleted successfully.', 'success')
      fetchRenewals()
    } else {
      Swal.fire('Error', res.message || 'Failed to delete.', 'error')
    }
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'An error occurred. Please try again.', 'error')
  }
}

// Pagination helpers
const goToFirst = () => currentPage.value = 1
const goToPrev = () => { if (currentPage.value > 1) currentPage.value-- }
const goToNext = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const goToLast = () => currentPage.value = totalPages.value

watch([search, rowsPerPage], () => { currentPage.value = 1 })

const resetFilters = () => {
  search.value = ''
  membershipTypeFilter.value = ''
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

// Exports: CSV, XLSX, PDF, DOCX
const exportCSV = async () => {
  const headersRow = visibleHeaders.value.map(h => h.text)
  const rows = filteredList.value.map(item => visibleHeaders.value.map(h => {
    const v = item[h.value]
    return (v === null || v === undefined) ? '' : (typeof v === 'object' ? JSON.stringify(v) : v)
  }))
  const csv = [headersRow, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Org_Membership_Renewals_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const exportXLSX = async () => {
  const flat = filteredList.value.map(item => {
    const out = {}
    visibleHeaders.value.forEach(h => {
      let val = item[h.value]
      if (val === null || val === undefined) val = ''
      if (typeof val === 'object') val = JSON.stringify(val)
      out[h.text] = val
    })
    return out
  })
  const ws = xlsxUtils.json_to_sheet(flat)
  const wb = xlsxUtils.book_new()
  xlsxUtils.book_append_sheet(wb, ws, 'Renewals')
  writeFileXLSX(wb, `Org_Membership_Renewals_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

const exportPDF = async () => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.setFontSize(12)
  doc.text('Organization Membership Renewals', 40, 40)
  const head = [visibleHeaders.value.map(h => h.text)]
  const body = filteredList.value.map(item => visibleHeaders.value.map(h => {
    const v = item[h.value]
    if (v === null || v === undefined) return ''
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  }))
  // autoTable
  // @ts-ignore
  doc.autoTable({
    startY: 60,
    head,
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [240, 240, 240] },
    margin: { left: 40, right: 40 }
  })
  doc.save(`Org_Membership_Renewals_${new Date().toISOString().slice(0, 10)}.pdf`)
}

const exportDOCX = async () => {
  const tableRows = [
    new TableRow({
      children: visibleHeaders.value.map(h => new TableCell({
        width: { size: Math.floor(100 / visibleHeaders.value.length), type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: h.text, bold: true })] })]
      }))
    }),
    ...filteredList.value.map(item => new TableRow({
      children: visibleHeaders.value.map(h => new TableCell({
        children: [new Paragraph({ children: [new TextRun(String(item[h.value] ?? ''))] })]
      }))
    }))
  ]

  const docx = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'Organization Membership Renewals', bold: true, size: 24 })] }),
        new Table({ rows: tableRows })
      ]
    }]
  })

  const blob = await Packer.toBlob(docx)
  saveAs(blob, `Org_Membership_Renewals_${new Date().toISOString().slice(0, 10)}.docx`)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchRenewals(), fetchMembershipType(), fetchIndividualTypes(), fetchRenewalCycles()])
})
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-6">

    <!-- Top Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h2 class="text-lg font-semibold text-gray-700">Org Membership Renewals</h2>

      <div class="flex flex-wrap gap-2">
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

        <button @click="exportDOCX"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          Word
        </button>

        <button @click="openModalForCreate"
          class="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm">
          Add Renewal
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search by name, invoice, payment id..."
          class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>

      <div>
        <label class="text-sm text-gray-600">Membership Type</label>
        <select v-model="membershipTypeFilter" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All Types</option>
          <option v-for="t in membershipTypes" :key="t.id" :value="t.name">{{ t.name }}</option>
        </select>
      </div>

      <div>
        <label class="text-sm text-gray-600">Renewal Status</label>
        <select v-model="statusFilter" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="completed">Renewed</option>
          <option value="">Not Renewed Yet</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="processing">Processing</option>
          <option value="scheduled">Scheduled</option>
          <option value="requires_action">Requires Action</option>
          <option value="cancelled">Cancelled</option>
          <option value="in_review">In Review</option>
          <option value="on_hold">On Hold</option>
          
        </select>
      </div>

      <div>
        <label class="text-sm text-gray-600">Date From</label>
        <input v-model="dateFrom" type="date" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>

      <div>
        <label class="text-sm text-gray-600">Date To</label>
        <input v-model="dateTo" type="date" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>

      <div class="flex items-end gap-2">
        <button @click="resetFilters" class="px-3 py-1.5 border rounded text-sm">Reset</button>
      </div>
    </div>

    <!-- Column view & visibility -->
    <div class="bg-gray-50 border rounded p-4 flex flex-col lg:flex-row gap-6 items-start">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Column Profile</label>
        <select v-model="selectedProfile" @change="applyProfile"
          class="border rounded px-3 py-1.5 text-xs sm:text-sm w-full sm:w-48">
          <option value="detailed">Detailed</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div class="flex-1">
        <label class="text-sm font-medium text-gray-700 mb-1 block">Visible Columns</label>
        <div class="flex flex-wrap gap-4">
          <div v-for="h in allHeaders" :key="h.value" class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="visibleColumns" :value="h.value" :id="'col_' + h.value"
              class="accent-blue-600" />
            <label :for="'col_' + h.value" class="text-gray-700">{{ h.text }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Data table -->
    <div class="overflow-x-auto">
      <EasyDataTable :headers="visibleHeaders" :items="paginatedItems" :rows-per-page="rowsPerPage"
        :rows-items="[5, 10, 20, 50, 100]" :search-value="search" :show-index="true" table-class="min-w-full text-sm"
        header-class="bg-gray-100" body-row-class="text-sm" v-model:page="currentPage">
        <!-- scoped slots for custom columns -->
        <template #item-image_url="{ image_url }">
          <img :src="image_url" class="h-9 w-9 rounded-full object-cover bg-gray-100" />
        </template>

        <template #item-full_name="{ full_name }">
          <span class="text-gray-700">{{ full_name || '--' }}</span>
        </template>

        <template #item-membership_type_before_termination="{ membership_type_before_termination }">
          <span>{{ membership_type_before_termination || '--' }}</span>
        </template>

        <template #item-amount_paid="{ amount_paid }">
          <span>{{ amount_paid ?? '--' }}</span>
        </template>

        <template #item-status="{ status }">
          <span :class="[
            'px-2 py-1 rounded-full text-xs font-semibold',
            status === 'pending' ? 'bg-yellow-100 text-yellow-800'
              : status === 'completed' ? 'bg-green-100 text-green-800'
                : status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          ]">
            {{ status || 'N/A' }}
          </span>
        </template>
        <template #item-renewed_at="{ renewed_at }">
          {{ formatDateTime(renewed_at) }}
        </template>
        <template #item-actions="{ id }">
          <div class="flex gap-2 justify-center">
            <button @click="viewRenewal(findById(id))" class="text-blue-600 hover:underline text-xs">View</button>
            <button @click="editRenewal(findById(id))" class="text-green-600 hover:underline text-xs">Edit</button>
            <button @click="deleteRenewal(id)" class="text-red-600 hover:underline text-xs">Delete</button>
          </div>
        </template>
      </EasyDataTable>
    </div>

    <!-- Pagination / status -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
      <div class="text-xs sm:text-sm text-gray-600 text-center md:text-left">
        Items {{ ((currentPage - 1) * rowsPerPage) + 1 }} -
        {{ Math.min(currentPage * rowsPerPage, filteredCount) }} of {{ filteredCount }} |
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm text-gray-600">Per page</span>
          <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-xs sm:text-sm">
            <option v-for="s in [5, 10, 20, 50, 100]" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="flex gap-1">
          <button @click="goToFirst" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-xs"
            :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">First</button>
          <button @click="goToPrev" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-xs"
            :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">Prev</button>
          <button @click="goToNext" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-xs"
            :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">Next</button>
          <button @click="goToLast" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-xs"
            :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">Last</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">{{ isEditMode ? 'Edit Renewal' : 'Add Renewal' }}</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form @submit.prevent="saveRenewal" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium">Individual</label>
              <select v-model="form.individual_type_user_id" class="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option v-for="i in individualTypes" :key="i.individual_type_user_id"
                  :value="i.individual_type_user_id">
                  {{ i.individual.first_name }} {{ i.individual.last_name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium">Membership Renewal Cycle</label>
              <select v-model="form.membership_renewal_cycle_id" class="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option v-for="c in renewalCycles" :key="c.member_renewal_cycle_id" :value="c.member_renewal_cycle_id">
                  {{ c.member_renewal_cycle.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium">Period Start</label>
              <input type="date" v-model="form.period_start" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm font-medium">Period End</label>
              <input type="date" v-model="form.period_end" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm font-medium">Amount Paid</label>
              <input type="number" v-model="form.amount_paid" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm font-medium">Status</label>
              <select v-model="form.status" class="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium">Initiated By</label>
              <select v-model="form.initiated_by" class="w-full border rounded-lg px-3 py-2">
                <option value="">Select</option>
                <option value="system">System</option>
                <option value="individual">Individual</option>
                <option value="organisation">Organisation</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium">Renewed At</label>
              <input type="datetime-local" v-model="form.renewed_at" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium">Org Notes</label>
              <textarea v-model="form.org_notes" class="w-full border rounded-lg px-3 py-2"></textarea>
            </div>
          </div>

          <div class="mt-4 flex justify-center gap-3">
            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
              Save
            </button>
            <button type="button" @click="closeModal" class="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="viewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">Renewal Details</h3>
          <button @click="closeViewModal" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div class="grid grid-cols-1 gap-y-4 text-sm text-gray-700">
          <div class="flex justify-between"><span class="font-medium text-gray-600">Member</span><span>{{
            selectedMemberView.full_name || '—' }}</span></div>
          <div class="flex justify-between"><span class="font-medium text-gray-600">Membership Type</span><span>{{
            selectedMemberView.membership_type_before_termination || '—' }}</span></div>
          <div class="flex justify-between"><span class="font-medium text-gray-600">Amount Paid</span><span>{{
            selectedMemberView.amount_paid ?? '—' }}</span></div>
          <div class="flex justify-between"><span class="font-medium text-gray-600">Status</span><span>{{
            selectedMemberView.status || '—' }}</span></div>
          <div class="flex justify-between"><span class="font-medium text-gray-600">Renewed At</span><span>{{
            formatDateTime(selectedMemberView.renewed_at) }}</span></div>
          <div class="flex justify-between"><span class="font-medium text-gray-600">Org Notes</span><span
              class="whitespace-pre-wrap">{{ selectedMemberView.org_notes || '—' }}</span></div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeViewModal"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* small style adjustments */
.easy-data-table {
  --easy-table-header-background-color: #f3f4f6;
  --easy-table-border-color: #e5e7eb;
  --easy-table-row-hover-background-color: #f8fafc;
}

/* ensure modals look good on mobile */
@media (max-width: 640px) {
  .max-w-3xl {
    max-width: 95% !important;
  }
}
</style>
