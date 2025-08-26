<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { authStore } from '../../../store/authStore'
import router from "../../../router/router"
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg'
import { utils, writeFileXLSX } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

// Extend dayjs with plugins
dayjs.extend(duration)
dayjs.extend(relativeTime)

const auth = authStore
const memberList = ref([])
const search = ref("")
const dateFrom = ref("")
const dateTo = ref("")
const loading = ref(false)

const columnVisibility = ref({
  image_url: true,
  'individual.name': true,
  existing_membership_id: true,
  membership_start_date: true,
  actions: true
})

const filteredMembers = computed(() => {
  let list = [...memberList.value]

  if (search.value.trim()) {
    list = list.filter(m =>
      m.individual.name?.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  if (dateFrom.value && dateTo.value) {
    const from = dayjs(dateFrom.value)
    const to = dayjs(dateTo.value)
    list = list.filter(m => {
      const d = dayjs(m.membership_start_date)
      return d.isAfter(from.subtract(1, 'day')) && d.isBefore(to.add(1, 'day'))
    })
  }

  return list
})

const calculateMembershipAge = (startDate) => {
  if (!startDate) return ''
  const start = dayjs(startDate)
  const now = dayjs()
  const diffYears = now.diff(start, 'year')
  const diffMonths = now.diff(start.add(diffYears, 'year'), 'month')
  const diffDays = now.diff(start.add(diffYears, 'year').add(diffMonths, 'month'), 'day')
  return `${diffYears}y ${diffMonths}m ${diffDays}d`
}

const headers = computed(() => [
  columnVisibility.value.image_url && { text: 'Image', value: 'image_url' },
  columnVisibility.value['individual.name'] && { text: 'Name', value: 'individual.name', sortable: true },
  columnVisibility.value.existing_membership_id && { text: 'Membership ID', value: 'existing_membership_id', sortable: true },
  columnVisibility.value.membership_start_date && { text: 'Membership Age', value: 'membership_start_date' },
  columnVisibility.value.actions && { text: 'Actions', value: 'actions' },
].filter(Boolean))

const fetchMemberList = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/org-members/', {}, 'GET')
    memberList.value = response.status ? response.data : []
  } catch (error) {
    console.error("Error fetching member list:", error)
    memberList.value = []
  } finally {
    loading.value = false
  }
}

const exportToExcel = () => {
  const data = filteredMembers.value.map(m => ({
    Name: m.individual.name,
    ID: m.existing_membership_id || '--',
    'Membership Age': calculateMembershipAge(m.membership_start_date)
  }))
  const ws = utils.json_to_sheet(data)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Members")
  writeFileXLSX(wb, "OrgMembers.xlsx")
}

const exportToCSV = () => {
  const data = filteredMembers.value.map(m => [
    m.individual.name,
    m.existing_membership_id || '--',
    calculateMembershipAge(m.membership_start_date)
  ])
  const ws = utils.aoa_to_sheet([
    ['Name', 'Membership ID', 'Membership Age'],
    ...data
  ])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Members")
  writeFileXLSX(wb, "OrgMembers.csv", { bookType: 'csv' })
}

const exportToPDF = () => {
  const doc = new jsPDF()
  const rows = filteredMembers.value.map(m => [
    m.individual.name,
    m.existing_membership_id || '--',
    calculateMembershipAge(m.membership_start_date)
  ])
  autoTable(doc, {
    head: [['Name', 'Membership ID', 'Membership Age']],
    body: rows,
  })
  doc.save("OrgMembers.pdf")
}

const viewMemberDetail = (memberId) => {
  Swal.fire({
    title: 'Member Details',
    html: `<div><strong>ID:</strong> ${memberId}</div>`,
    confirmButtonText: 'Close'
  })
}

onMounted(() => {
  fetchMemberList()
})
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-6">
    <!-- Top Bar -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-700">Organization Members</h2>
      <div class="flex gap-2">
        <button @click="exportToCSV" class="border border-gray-300 bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">CSV</button>
        <button @click="exportToExcel" class="border border-gray-300 bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">Excel</button>
        <button @click="exportToPDF" class="border border-gray-300 bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">PDF</button>
        <button @click="$router.push({ name: 'create-member' })" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ Add Member</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Start Date</label>
        <input v-model="dateFrom" type="date" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">End Date</label>
        <input v-model="dateTo" type="date" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
    </div>

    <!-- Column Visibility Toggles -->
    <div class="flex flex-wrap gap-4">
      <label v-for="(visible, key) in columnVisibility" :key="key" class="text-sm text-gray-600 flex gap-2 items-center">
        <input type="checkbox" v-model="columnVisibility[key]" class="accent-blue-600" />
        {{ key.replace('.', ' ').replace(/_/g, ' ').replace('individual name', 'Name').replace('image url', 'Image').replace('membership start date', 'Membership Age').replace('existing membership id', 'Membership ID').replace('actions', 'Actions') }}
      </label>
    </div>

    <!-- Data Table -->
    <EasyDataTable :headers="headers" :items="filteredMembers" :search-value="search" :loading="loading" show-index :theme-color="'#3b82f6'">
      <template #item-image_url="{ image_url }">
        <img :src="image_url || placeholderImage" class="h-10 w-10 rounded-full object-cover" />
      </template>

      <template #item-membership_start_date="{ membership_start_date }">
        <span class="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
          {{ calculateMembershipAge(membership_start_date) }}
        </span>
      </template>

      <template #item-actions="{ id }">
        <button @click="viewMemberDetail(id)" class="text-blue-600 hover:underline text-xs">Details</button>
      </template>
    </EasyDataTable>
  </div>
</template>
