<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { authStore } from '../../../store/authStore'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { pdfExport } from '@/helpers/pdfExport.js'
import { excelExport } from '@/helpers/excelExport.js'
import { csvExport } from '@/helpers/csvExport.js'

const auth = authStore
const userId = authStore.user.id

/* ================= TOAST (non-blocking feedback) ================= */
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    didOpen: (t) => {
        t.addEventListener('mouseenter', Swal.stopTimer)
        t.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

/* ================= STATE ================= */
const committeeList = ref([])
const loading = ref(false)

const modalVisible = ref(false)
const viewModalVisible = ref(false)
const isEditMode = ref(false)
const selectedCommittee = ref({})
const isSavingCommittee = ref(false)
const deletingCommitteeId = ref(null)
const exportingType = ref(null) // 'csv' | 'xlsx' | 'pdf' | null

const newName = ref('')
const short_description = ref('')
const start_date = ref('')
const end_date = ref('')
const note = ref('')
const is_active = ref('1')

const search = ref('')
const startFilter = ref('')
const endFilter = ref('')
const quickDateFilter = ref('')

const rowsPerPage = ref(10)
const currentPage = ref(1)

/* ================= COLUMN VISIBILITY ================= */
const columnProfiles = {
    minimal: ['name', 'start_date', 'status_display', 'actions'],
    detailed: ['name', 'start_date', 'end_date', 'status_display', 'actions']
}
const selectedProfile = ref(localStorage.getItem('selected_committee_profile') || 'detailed')
const visibleColumns = ref(
    JSON.parse(localStorage.getItem('visible_committee_columns')) || columnProfiles[selectedProfile.value]
)

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

/* ================= FILTERING & PAGINATION ================= */
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
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / rowsPerPage.value)))
const paginatedCommittees = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value
    return filteredCommittees.value.slice(start, start + rowsPerPage.value)
})

watch(rowsPerPage, () => { currentPage.value = 1 })
watch([search, startFilter, endFilter], () => { currentPage.value = 1 })

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

/* ================= EXPORT ================= */
const runExport = async (type, exportFn) => {
    if (!filteredCommittees.value.length) {
        return Swal.fire({ icon: 'warning', title: 'Nothing to export', text: 'There are no committees matching the current filters.' })
    }
    exportingType.value = type
    try {
        await exportFn()
        Toast.fire({ icon: 'success', title: `Exported as ${type.toUpperCase()}` })
    } catch (error) {
        console.error(`Error exporting ${type}:`, error)
        Swal.fire({ icon: 'error', title: 'Export failed', text: 'Please try again.' })
    } finally {
        exportingType.value = null
    }
}

const exportCSV = () => runExport('csv', () => csvExport({
    headers: filteredHeaders.value,
    rows: filteredCommittees.value,
    title: 'Committee List',
    fileName: 'Committees.csv'
}))

const exportXLSX = () => runExport('xlsx', () => excelExport({
    headers: filteredHeaders.value,
    rows: filteredCommittees.value,
    title: 'Committee List',
    fileName: 'Committees.xlsx'
}))

const exportPDF = () => runExport('pdf', () => pdfExport({
    headers: filteredHeaders.value,
    rows: filteredCommittees.value,
    title: 'Committee List',
    fileName: 'Committees.pdf'
}))

/* ================= DATA FETCH ================= */
const fetchCommitteeList = async () => {
    loading.value = true
    try {
        const res = await auth.fetchProtectedApi('/api/committees', {}, 'GET')
        committeeList.value = res.status ? res.data.map(c => ({
            id: c.id,
            name: c.name,
            start_date: c.start_date,
            end_date: c.end_date,
            is_active: c.is_active,
            status_display: c.is_active == 1 ? 'Yes' : 'No',
            note: c.note,
            short_description: c.short_description
        })) : []
    } catch (error) {
        console.error('Error fetching committee list:', error)
        committeeList.value = []
        Toast.fire({ icon: 'error', title: 'Failed to load committees' })
    } finally {
        loading.value = false
    }
}

/* ================= DELETE ================= */
const deleteCommittee = async (id) => {
    const res = await Swal.fire({
        title: 'Delete committee?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#9ca3af',
        reverseButtons: true
    })
    if (!res.isConfirmed) return

    deletingCommitteeId.value = id
    try {
        const response = await auth.fetchProtectedApi(`/api/committees/${id}`, {}, 'DELETE')
        if (response.status) {
            Toast.fire({ icon: 'success', title: 'Committee deleted' })
            await fetchCommitteeList()
        } else {
            Swal.fire({ icon: 'error', title: 'Delete failed', text: 'Could not delete this committee.' })
        }
    } catch (error) {
        console.error('Error deleting committee:', error)
        Swal.fire({ icon: 'error', title: 'Delete failed', text: 'Something went wrong. Please try again.' })
    } finally {
        deletingCommitteeId.value = null
    }
}

/* ================= CREATE / EDIT MODAL ================= */
const openModal = (c) => {
    isEditMode.value = !!c
    selectedCommittee.value = c || {}
    newName.value = c?.name || ''
    short_description.value = c?.short_description || ''
    start_date.value = c?.start_date || ''
    end_date.value = c?.end_date || ''
    note.value = c?.note || ''
    is_active.value = String(c?.is_active ?? 1)
    modalVisible.value = true
}

const closeModal = () => { modalVisible.value = false }

const openViewModal = (c) => { selectedCommittee.value = c; viewModalVisible.value = true }
const closeViewModal = () => { viewModalVisible.value = false }

/* ================= SAVE (create or update) ================= */
const saveCommittee = async () => {
    if (!newName.value.trim()) {
        return Swal.fire({ icon: 'warning', title: 'Committee name required', text: 'Please enter a name for the committee.' })
    }
    if (start_date.value && end_date.value && start_date.value > end_date.value) {
        return Swal.fire({ icon: 'warning', title: 'Invalid date range', text: 'Start date cannot be after end date.' })
    }

    const payload = {
        user_id: userId,
        name: newName.value,
        short_description: short_description.value,
        start_date: start_date.value,
        end_date: end_date.value,
        note: note.value,
        is_active: is_active.value
    }

    const apiUrl = isEditMode.value ? `/api/committees/${selectedCommittee.value.id}` : '/api/committees'
    const method = isEditMode.value ? 'PUT' : 'POST'

    isSavingCommittee.value = true
    try {
        const response = await auth.fetchProtectedApi(apiUrl, payload, method)
        if (response.status === false) {
            throw new Error(response.message || 'Request failed')
        }

        Toast.fire({ icon: 'success', title: isEditMode.value ? 'Committee updated' : 'Committee created' })
        closeModal()
        await fetchCommitteeList()
    } catch (error) {
        console.error('Error saving committee:', error)
        Swal.fire({ icon: 'error', title: 'Something went wrong', text: 'Could not save the committee. Please try again.' })
    } finally {
        isSavingCommittee.value = false
    }
}

/* ================= VIEW MODAL HELPERS ================= */
const formatDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

const viewFields = computed(() => [
    {
        label: 'Short Description',
        value: selectedCommittee.value.short_description,
        span: true,
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
        label: 'Start Date',
        value: formatDate(selectedCommittee.value.start_date),
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
        label: 'End Date',
        value: formatDate(selectedCommittee.value.end_date),
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
        label: 'Note',
        value: selectedCommittee.value.note,
        span: true,
        icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z'
    }
])

onMounted(fetchCommitteeList)
</script>

<template>
    <div class="p-4 sm:p-6 bg-white shadow rounded-lg space-y-6">

        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a3 3 0 00-.356-1.857m0 0a5.002 5.002 0 00-9.288 0M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h2 class="text-lg sm:text-xl font-semibold text-gray-800">Committees</h2>
            </div>

            <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                <!-- CSV -->
                <button @click="exportCSV" :disabled="exportingType === 'csv'"
                    class="flex items-center gap-1.5 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100 transition disabled:opacity-60">
                    <svg v-if="exportingType === 'csv'" class="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                </button>

                <!-- Excel -->
                <button @click="exportXLSX" :disabled="exportingType === 'xlsx'"
                    class="flex items-center gap-1.5 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100 transition disabled:opacity-60">
                    <svg v-if="exportingType === 'xlsx'" class="w-4 h-4 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                    </svg>
                    Excel
                </button>

                <!-- PDF -->
                <button @click="exportPDF" :disabled="exportingType === 'pdf'"
                    class="flex items-center gap-1.5 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100 transition disabled:opacity-60">
                    <svg v-if="exportingType === 'pdf'" class="w-4 h-4 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z M9 13h1.5a1.5 1.5 0 010 3H9v-3zm0 3v2 M13.5 13H15a1 1 0 011 1v3a1 1 0 01-1 1h-1.5v-5z" />
                    </svg>
                    PDF
                </button>

                <!-- Add Committee -->
                <button @click="openModal()"
                    class="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 active:bg-blue-800 transition">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Committee
                </button>
            </div>
        </div>

        <!-- FILTERS -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="text-sm text-gray-600">Start Date</label>
                <input type="date" v-model="startFilter" class="w-full border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
                <label class="text-sm text-gray-600">End Date</label>
                <input type="date" v-model="endFilter" class="w-full border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Quick Filter</label>
                <select v-model="quickDateFilter" @change="applyQuickDateFilter"
                    class="w-full border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="">All</option>
                    <option value="last7">Last 7 Days</option>
                    <option value="thisMonth">This Month</option>
                </select>
            </div>
            <div>
                <label class="text-sm text-gray-600">Search</label>
                <input v-model="search" type="text" placeholder="Search by name..."
                    class="w-full border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
        </div>

        <!-- COLUMN SETTINGS -->
        <div class="bg-gray-50 border rounded p-4 flex flex-col lg:flex-row gap-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Column View</label>
                <select v-model="selectedProfile" @change="applyProfile"
                    class="border rounded px-3 py-1.5 text-xs sm:text-sm w-full sm:w-48 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="minimal">Minimal</option>
                    <option value="detailed">Detailed</option>
                </select>
            </div>
            <div class="w-full md:flex-1">
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

        <!-- TABLE -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
            <EasyDataTable :headers="filteredHeaders" :items="paginatedCommittees" :loading="loading" show-index hide-footer
                table-class="min-w-full text-sm" header-class="bg-gray-100" body-row-class="text-sm" :theme-color="'#3b82f6'">
                <template #item-status_display="{ status_display }">
                    <span :class="[
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                        status_display === 'Yes' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    ]">
                        {{ status_display === 'Yes' ? 'Active' : 'Inactive' }}
                    </span>
                </template>
                <template #header-actions>
                    <div class="text-right w-full pr-2">Actions</div>
                </template>
                <template #item-actions="{ id }">
                    <div class="flex flex-wrap justify-end gap-2">
                        <button v-if="auth.hasPermission('committee-member.read')"
                            @click="$router.push({ name: 'index-committee-member', params: { committeeId: id } })"
                            class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3 text-sm transition">
                            Members
                        </button>
                        <button @click="openViewModal(committeeList.find(c => c.id === id))"
                            class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3 text-sm transition">
                            View
                        </button>
                        <button @click="openModal(committeeList.find(c => c.id === id))"
                            class="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 rounded-md py-1 px-3 text-sm transition">
                            Edit
                        </button>
                        <button @click="deleteCommittee(id)" :disabled="deletingCommitteeId === id"
                            class="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-md py-1 px-3 text-sm transition disabled:opacity-60">
                            {{ deletingCommitteeId === id ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </template>
            </EasyDataTable>
        </div>

        <!-- FOOTER / PAGINATION -->
        <div class="flex flex-col md:flex-row justify-between items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
            <div class="text-sm text-gray-600 text-center md:text-left">
                <template v-if="totalItems">
                    Items {{ (currentPage - 1) * rowsPerPage + 1 }} -
                    {{ Math.min(currentPage * rowsPerPage, totalItems) }} of {{ totalItems }} |
                    Page {{ currentPage }} of {{ totalPages }}
                </template>
                <template v-else>No committees to show</template>
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-3">
                <div class="flex items-center gap-1">
                    <span class="text-sm text-gray-600">Items per page:</span>
                    <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-sm">
                        <option v-for="size in [5, 10, 50, 100, 250, 500, 1000]" :key="size" :value="size">
                            {{ size }}
                        </option>
                    </select>
                </div>
                <div class="flex flex-wrap justify-center gap-1">
                    <button @click="goToFirst" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm transition"
                        :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">
                        First
                    </button>
                    <button @click="goToPrev" :disabled="currentPage === 1" class="border rounded px-3 py-1 text-sm transition"
                        :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">
                        Prev
                    </button>
                    <button @click="goToNext" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm transition"
                        :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">
                        Next
                    </button>
                    <button @click="goToLast" :disabled="currentPage === totalPages" class="border rounded px-3 py-1 text-sm transition"
                        :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">
                        Last
                    </button>
                </div>
            </div>
        </div>

        <!-- CREATE / EDIT MODAL -->
        <div v-if="modalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-auto overflow-hidden">

                <!-- Modal header -->
                <div :class="['px-6 md:px-8 py-5 flex items-center gap-3', isEditMode ? 'bg-amber-50' : 'bg-blue-50']">
                    <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0', isEditMode ? 'bg-amber-100' : 'bg-blue-100']">
                        <svg v-if="isEditMode" class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <svg v-else class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-lg font-semibold text-gray-800 leading-tight">
                            {{ isEditMode ? 'Edit Committee' : 'Create Committee' }}
                        </h2>
                        <p class="text-xs text-gray-500 mt-0.5">
                            {{ isEditMode ? 'Update the committee details below' : 'Fill in the details to create a new committee' }}
                        </p>
                    </div>
                </div>

                <!-- Form -->
                <div class="max-h-[28rem] overflow-y-auto space-y-4 px-6 md:px-8 py-6">
                    <div>
                        <label for="newName" class="block text-sm font-medium text-gray-700 mb-1">Committee Name</label>
                        <input v-model="newName" id="newName" type="text" placeholder="e.g. Finance Committee"
                            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label for="short_description" class="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                        <input v-model="short_description" id="short_description" type="text"
                            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

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

                    <div>
                        <label for="note" class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <textarea v-model="note" id="note" rows="3"
                            class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div class="flex gap-2">
                            <button type="button" @click="is_active = '1'"
                                :class="[
                                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-1.5',
                                    is_active === '1' ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-green-400'
                                ]">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Active
                            </button>
                            <button type="button" @click="is_active = '0'"
                                :class="[
                                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-1.5',
                                    is_active === '0' ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-red-400'
                                ]">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-end gap-3 px-6 md:px-8 py-4 bg-gray-50 border-t">
                    <button @click="closeModal" :disabled="isSavingCommittee"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-60">
                        Cancel
                    </button>
                    <button @click="saveCommittee" :disabled="isSavingCommittee"
                        class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60">
                        <svg v-if="isSavingCommittee" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        {{ isEditMode ? 'Update' : 'Submit' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- VIEW MODAL -->
        <div v-if="viewModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-auto overflow-hidden">

                <!-- Profile-style header -->
                <div class="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 md:px-8 py-6">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a3 3 0 00-.356-1.857m0 0a5.002 5.002 0 00-9.288 0M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <h2 class="text-lg md:text-xl font-semibold text-white truncate">
                                {{ selectedCommittee.name || 'Committee' }}
                            </h2>
                            <span :class="[
                                'inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                                selectedCommittee.is_active == '1' ? 'bg-green-400/20 text-green-50' : 'bg-red-400/20 text-red-50'
                            ]">
                                {{ selectedCommittee.is_active == '1' ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Info grid -->
                <div class="max-h-[28rem] overflow-y-auto px-6 md:px-8 py-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div v-for="field in viewFields" :key="field.label"
                            :class="['bg-gray-50 border border-gray-100 rounded-xl p-4', field.span ? 'sm:col-span-2' : '']">
                            <div class="flex items-center gap-2 mb-1.5">
                                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="field.icon" />
                                </svg>
                                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ field.label }}</span>
                            </div>
                            <p class="text-sm text-gray-800 break-words">{{ field.value || '--' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="text-right px-6 md:px-8 py-4 bg-gray-50 border-t">
                    <button @click="closeViewModal"
                        class="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>