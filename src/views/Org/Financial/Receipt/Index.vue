<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Receipts</h1>

    <!-- Error State -->
    <div v-if="errorMessage" class="text-red-500 text-center py-8">
      {{ errorMessage }}
    </div>

    <!-- No Receipts Found -->
    <div v-else-if="receipts.length === 0" class="text-gray-500 text-center py-8">
      No receipts found.
    </div>

    <!-- Receipts Table -->
    <table v-else class="min-w-full bg-white border rounded shadow-sm">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="py-2 px-4 border">Sl</th>
          <th class="py-2 px-4 border">Receipt Code</th>
          <th class="py-2 px-4 border">Invoice ID</th>
          <th class="py-2 px-4 border">Amount Received</th>
          <th class="py-2 px-4 border">Currency</th>
          <th class="py-2 px-4 border">Payment Method</th>
          <th class="py-2 px-4 border">Payment Date</th>
          <th class="py-2 px-4 border">Status</th>
          <th class="py-2 px-4 border">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(receipt, index) in receipts" :key="receipt.id" class="hover:bg-gray-50 transition">
          <td class="py-2 px-4 border">{{ index + 1 }}</td>
          <td class="py-2 px-4 border">{{ receipt.receipt_code }}</td>
          <td class="py-2 px-4 border">{{ receipt.invoice_id }}</td>
          <td class="py-2 px-4 border">{{ receipt.amount_received }}</td>
          <td class="py-2 px-4 border">{{ receipt.currency_code }}</td>
          <td class="py-2 px-4 border">{{ receipt.payment_method }}</td>
          <td class="py-2 px-4 border">{{ formatDate(receipt.payment_date) }}</td>
          <td class="py-2 px-4 border">
            <span :class="statusClass(receipt.status)" class="capitalize font-medium">
              {{ receipt.status }}
            </span>
          </td>
          <td class="py-2 px-4 border">
            <button @click="openModal(receipt)" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Receipt Modal -->
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative font-mono print:font-sans">
      <!-- Close Button -->
      <button @click="closeModal"
        class="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl font-bold print:hidden">
        &times;
      </button>

      <!-- Receipt Container with dotted border -->
      <div class="border border-dotted border-gray-400 p-6 rounded-md">
        <!-- Header -->
        <div class="text-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800 uppercase tracking-wide">
            Payment Receipt
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Receipt Code:
            <span class="font-semibold">{{ selectedReceipt.receipt_code }}</span>
          </p>
        </div>

        <!-- Dashed Separator -->
        <hr class="border-t border-dashed border-gray-400 my-4" />

        <!-- Info Table -->
        <div class="grid grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-800">
          <div>
            <span class="font-semibold">Invoice ID:</span>
            {{ selectedReceipt.invoice_id }}
          </div>
          <div>
            <span class="font-semibold">Payment Date:</span>
            {{ formatDate(selectedReceipt.payment_date) }}
          </div>
          <div>
            <span class="font-semibold">Amount Received:</span>
            {{ selectedReceipt.amount_received }} {{ selectedReceipt.currency_code }}
          </div>
          <div>
            <span class="font-semibold">Payment Method:</span>
            {{ selectedReceipt.payment_method }}
          </div>
          <div>
            <span class="font-semibold">Transaction Reference:</span>
            {{ selectedReceipt.transaction_reference || 'N/A' }}
          </div>
          <div>
            <span class="font-semibold">Status:</span>
            <span :class="statusClass(selectedReceipt.status)">
              {{ selectedReceipt.status }}
            </span>
          </div>
          <div class="col-span-2">
            <span class="font-semibold">Note:</span>
            {{ selectedReceipt.note || 'N/A' }}
          </div>
          <div class="col-span-2">
            <span class="font-semibold">Admin Note:</span>
            {{ selectedReceipt.admin_note || 'N/A' }}
          </div>
        </div>

        <!-- Dashed Separator -->
        <hr class="border-t border-dashed border-gray-400 my-4" />

        <!-- Footer -->
        <div class="text-right text-xs text-gray-500 mt-4">
          Printed on: {{ formatDate(new Date()) }}
        </div>
      </div>

      <!-- Download PDF -->
      <!-- Footer Buttons -->
      <div class="mt-6 flex justify-between print:hidden">
        <!-- Download PDF Button -->
        <button @click="downloadPDF" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Download PDF
        </button>

        <!-- Close Button -->
        <button @click="closeModal" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
          Close
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'
import { authStore } from '../../../../store/authStore'

const auth = authStore
const receipts = ref([])
const errorMessage = ref(null)

const showModal = ref(false)
const selectedReceipt = ref({})

// Open modal with selected receipt
const openModal = (receipt) => {
  selectedReceipt.value = receipt
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedReceipt.value = {}
}

const statusClass = (status) => {
  switch (status) {
    case 'processed':
      return 'text-green-600 font-semibold'
    case 'refunded':
      return 'text-red-500 font-semibold'
    case 'pending':
      return 'text-yellow-600 font-semibold'
    default:
      return ''
  }
}

const downloadPDF = () => {
  const element = document.querySelector('.max-w-2xl')
  html2pdf()
    .from(element)
    .set({
      margin: 0.5,
      filename: `${selectedReceipt.value.receipt_code || 'receipt'}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    })
    .save()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateStr).toLocaleDateString('en-GB', options)
}

const fetchReceipts = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/receipts/org-receipts')
    receipts.value = response.status ? response.data : []
  } catch (error) {
    console.error('Error fetching receipts:', error)
    errorMessage.value = 'Error loading receipts. Please try again later.'
    receipts.value = []
  }
}

onMounted(fetchReceipts)
</script>

<style scoped></style>
