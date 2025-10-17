<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import { authStore } from "../../../store/authStore";
import EasyDataTable from "vue3-easy-data-table";
import { FileText, FileSpreadsheet, FileDown } from "lucide-vue-next";
import { csvExport } from "@/helpers/csvExport.js";
import { excelExport } from "@/helpers/excelExport.js";
import { pdfExport } from "@/helpers/pdfExport.js";
import "vue3-easy-data-table/dist/style.css";

const router = useRouter();
const auth = authStore;
const recordList = ref([]);
const loading = ref(false);
const search = ref("");
const quickFilter = ref("");
const startDate = ref("");
const endDate = ref("");
const selectedProfile = ref(localStorage.getItem("success_story_profile") || "detailed");
const visibleColumns = ref(
  JSON.parse(localStorage.getItem("success_story_columns")) ||
  ["title", "story", "privacy_name", "status_text", "actions"]
);

// Pagination
const currentPage = ref(1);
const rowsPerPage = ref(10);

const goToFirst = () => (currentPage.value = 1);
const goToPrev = () => { if (currentPage.value > 1) currentPage.value--; };
const goToNext = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const goToLast = () => (currentPage.value = totalPages.value);

watch(rowsPerPage, () => (currentPage.value = 1));

// Fetch success stories
const getRecords = async () => {
  loading.value = true;
  try {
    const response = await auth.fetchProtectedApi("/api/success-stories", {}, "GET");
    recordList.value = response.status
      ? response.data.map(r => ({
          id: r.id,
          title: r.title,
          story: r.story,
          privacy_name: r.privacy_name,
          status_text: r.status === 1 ? "Active" : "Disabled",
        }))
      : [];
      console.log(recordList.value);
  } catch (error) {
    console.error("Error fetching success stories:", error);
    recordList.value = [];
  } finally {
    loading.value = false;
  }
};

// Sanitize HTML safely
const sanitize = (html) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: ["p", "strong", "em", "br"] });

// Delete record
const deleteRecord = async (id) => {
  try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/success-stories/${id}`, {}, "DELETE");
      if (response.status) {
        Swal.fire("Deleted!", "Record has been deleted.", "success");
        getRecords();
      } else {
        Swal.fire("Failed!", "Failed to delete the record.", "error");
      }
    }
  } catch (error) {
    console.error("Error deleting record:", error);
    Swal.fire("Error!", "Failed to delete the record.", "error");
  }
};

// Table headers
const headers = [
  { text: "Title", value: "title", sortable: true },
  { text: "Story", value: "story", sortable: false },
  { text: "Privacy", value: "privacy_name", sortable: true },
  { text: "Status", value: "status_text", sortable: true },
  { text: "Actions", value: "actions", sortable: false },
];

// Column profiles
const columnProfiles = {
  minimal: ["title", "status_text", "actions"],
  detailed: ["title", "story", "privacy_name", "status_text", "actions"],
};

const filteredHeaders = computed(() =>
  headers.filter((h) => visibleColumns.value.includes(h.value))
);

watch([selectedProfile, visibleColumns], () => {
  localStorage.setItem("success_story_profile", selectedProfile.value);
  localStorage.setItem("success_story_columns", JSON.stringify(visibleColumns.value));
});

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]];
};

// Filtering logic
const filteredRecords = computed(() =>
  recordList.value.filter((record) => {
    const matchSearch =
      search.value === "" ||
      record.title.toLowerCase().includes(search.value.toLowerCase()) ||
      record.story.toLowerCase().includes(search.value.toLowerCase());
    const matchQuick =
      quickFilter.value === "" || record.status_text === quickFilter.value;
    const matchStart =
      startDate.value === "" ||
      (record.created_at && record.created_at >= startDate.value);
    const matchEnd =
      endDate.value === "" ||
      (record.created_at && record.created_at <= endDate.value);
    return matchSearch && matchQuick && matchStart && matchEnd;
  })
);

// Pagination
const totalItems = computed(() => filteredRecords.value.length);
const totalPages = computed(() =>
  Math.ceil(totalItems.value / rowsPerPage.value)
);
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredRecords.value.slice(start, start + rowsPerPage.value);
});

// Export buttons
const exportCSV = async () =>
  csvExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: "Success Story List",
    fileName: "SuccessStories.csv",
  });

const exportXLSX = async () =>
  excelExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: "Success Story List",
    fileName: "SuccessStories.xlsx",
  });

const exportPDF = async () =>
  pdfExport({
    headers: filteredHeaders.value,
    rows: filteredRecords.value,
    title: "Success Story List",
    fileName: "SuccessStories.pdf",
  });

onMounted(() => getRecords());
</script>

<template>
  <div class="p-4 md:p-6 space-y-6 bg-white shadow rounded-lg">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <h2 class="text-lg font-semibold text-gray-700">Success Story List</h2>
      <div class="flex flex-wrap gap-2">
        <button @click="exportCSV" class="flex items-center gap-1 border bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">
          <FileText class="w-4 h-4" /> CSV
        </button>
        <button @click="exportXLSX" class="flex items-center gap-1 border bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">
          <FileSpreadsheet class="w-4 h-4" /> Excel
        </button>
        <button @click="exportPDF" class="flex items-center gap-1 border bg-white px-3 py-1.5 text-sm rounded hover:bg-gray-100">
          <FileDown class="w-4 h-4" /> PDF
        </button>
        <button @click="router.push({ name: 'create-success-story' })" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
          + Add Success Story
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search title or story..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Status</label>
        <select v-model="quickFilter" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Disabled">Disabled</option>
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
      <div class="flex flex-col">
        <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
        <select v-model="selectedProfile" @change="applyProfile" class="border rounded px-3 py-1.5 text-sm w-full md:w-48">
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

        <template #item-actions="{ id }">
          <div class="flex justify-end flex-wrap gap-2">
            <button @click="router.push({ name: 'view-success-story', params: { id } })" class="bg-white text-gray-700 hover:bg-gray-100 border rounded-md py-1 px-3">
              View
            </button>
            <button @click="router.push({ name: 'edit-success-story', params: { id } })" class="bg-white text-gray-700 hover:bg-gray-100 border rounded-md py-1 px-3">
              Edit
            </button>
            <button @click="deleteRecord(id)" class="bg-white text-gray-700 hover:bg-gray-100 border rounded-md py-1 px-3">
              Delete
            </button>
          </div>
        </template>

        <template #item-status_text="{ status_text }">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium"
            :class="status_text === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'">
            {{ status_text }}
          </span>
        </template>
      </EasyDataTable>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
      <div class="text-sm text-gray-600 text-center md:text-left">
        Items {{ (currentPage - 1) * rowsPerPage + 1 }} -
        {{ Math.min(currentPage * rowsPerPage, totalItems) }} of
        {{ totalItems }} | Page {{ currentPage }} of {{ totalPages }}
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="flex items-center gap-1">
          <span class="text-sm text-gray-600">Items per page:</span>
          <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-sm">
            <option v-for="size in [5, 10, 50, 100, 250]" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="flex gap-1">
          <button @click="goToFirst" :disabled="currentPage === 1"
            class="border rounded px-3 py-1 text-sm"
            :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">First</button>
          <button @click="goToPrev" :disabled="currentPage === 1"
            class="border rounded px-3 py-1 text-sm"
            :class="currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-100'">Prev</button>
          <button @click="goToNext" :disabled="currentPage === totalPages"
            class="border rounded px-3 py-1 text-sm"
            :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">Next</button>
          <button @click="goToLast" :disabled="currentPage === totalPages"
            class="border rounded px-3 py-1 text-sm"
            :class="currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-100'">Last</button>
        </div>
      </div>
    </div>
  </div>
</template>