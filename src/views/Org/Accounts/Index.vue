<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../../../store/authStore'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import { utils, writeFileXLSX } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const auth = authStore
const router = useRouter()

// ✅ Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// ✅ Currency
const currencies = ref([])
const selectedCurrency = ref('')
const selectedCurrencyId = ref(null) // ID from accounts_transaction_currencies table

// ✅ State
const transactionList = ref([])
const fundList = ref([])
const search = ref('')
const fund_id = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const loading = ref(false)

// ✅ Modal states
const transactionModal = ref(false)
const viewModal = ref(false)
const selectedTransaction = ref(null)
const selectedTransactionId = ref(null)

// ✅ Form fields
const date = ref('')
const transaction_title = ref('')
const amount = ref(0)
const transaction_type = ref('')
const description = ref('')
const fundId = ref('')

// ✅ File Upload (future ready, not used in API)
const images = ref([{ id: Date.now(), file: null }])
const documents = ref([{ id: Date.now(), file: null }])

// ✅ fetch currencies
const fetchCurrencies = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/currencies');
        currencies.value = response.status ? response.data : [];
    } catch (error) {
        errorMessage.value = 'Error loading currencies. Please try again later.';
    }
};

// ✅ Fetch Currencies
const fetchCurrencyPreference = async () => {
    try {
        const res = await auth.fetchProtectedApi('/api/accounts-transaction-currencies', {}, 'GET')
        if (res.status && res.data) {
            selectedCurrency.value = res.data.currency_id
            selectedCurrencyId.value = res.data.id
        }
    } catch (err) {
        console.error('Failed to fetch user currency preference', err)
    }
}

// ✅ Handle Currency Save or Change
const saveOrUpdateCurrency = async () => {
    if (!selectedCurrency.value) return

    const payload = {
        currency_id: selectedCurrency.value,
        is_active: true
    }

    try {
        let response

        if (selectedCurrencyId.value) {
            // Update
            response = await auth.fetchProtectedApi(
                `/api/accounts-transaction-currencies/${selectedCurrencyId.value}`,
                payload,
                'PUT'
            )
        } else {
            // Create
            response = await auth.fetchProtectedApi(
                '/api/accounts-transaction-currencies',
                payload,
                'POST'
            )
        }

        if (response.status) {
            Swal.fire('Success', 'Currency saved successfully', 'success')
            selectedCurrencyId.value = response.data.id
        } else {
            Swal.fire('Failed', response.message || 'Failed to save currency', 'error')
        }
    } catch (error) {
        Swal.fire('Error', 'An error occurred while saving currency', 'error')
    }
}

// ✅ handle currency change
const handleCurrencyChange = () => {
    saveOrUpdateCurrency()
}


const selectedCurrencyData = computed(() => {
  return currencies.value.find(c => c.id === selectedCurrency.value) || null
})



// ✅ Column Profiles
const columnProfiles = {
    minimal: ['date', 'title', 'fund', 'income', 'expense'],
    detailed: ['date', 'title', 'fund', 'income', 'expense', 'actions']
}
const selectedProfile = ref(localStorage.getItem('selected_account_profile') || 'detailed')
const visibleColumns = ref(
    JSON.parse(localStorage.getItem('visible_account_columns')) || columnProfiles[selectedProfile.value]
)

const allHeaders = [
    { text: 'Date', value: 'date' },
    { text: 'Title', value: 'title' },
    { text: 'Fund', value: 'fund' },
    { text: 'Income', value: 'income' },
    { text: 'Expense', value: 'expense' },
    { text: 'Actions', value: 'actions' }
]

// ✅ Watchers
watch([visibleColumns, selectedProfile], () => {
    localStorage.setItem('visible_account_columns', JSON.stringify(visibleColumns.value))
    localStorage.setItem('selected_account_profile', selectedProfile.value)
}, { deep: true })

const applyProfile = () => {
    visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

// ✅ Fetch Data
const getFunds = async () => {
    const res = await auth.fetchProtectedApi('/api/funds', {}, 'GET')
    fundList.value = res.status ? res.data : []
}

const getTransactions = async () => {
    loading.value = true
    const res = await auth.fetchProtectedApi('/api/transactions', {}, 'GET')
    transactionList.value = res.status ? res.data : []
    loading.value = false
}

// ✅ Filtered Transactions
const filteredTransactions = computed(() => {
    let list = [...transactionList.value]
    const keyword = search.value.trim().toLowerCase()

    if (keyword) {
        list = list.filter(t => {
            return (
                t.transaction_title?.toLowerCase().includes(keyword) ||
                t.funds?.name?.toLowerCase().includes(keyword) ||
                t.amount.toString().includes(keyword) ||
                (t.date ? dayjs(t.date).format('YYYY-MM-DD').includes(keyword) : false)
            )
        })
    }

    if (fund_id.value) {
        list = list.filter(t => t.fund_id === fund_id.value)
    }

    if (dateFrom.value && dateTo.value) {
        const from = dayjs(dateFrom.value)
        const to = dayjs(dateTo.value)
        list = list.filter(t => {
            const d = dayjs(t.date)
            return d.isAfter(from.subtract(1, 'day')) && d.isBefore(to.add(1, 'day'))
        })
    }

    return list
})

// ✅ Sorting
const sortBy = ref('')
const sortDirection = ref('asc')

const sort = (column) => {
    if (sortBy.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortBy.value = column
        sortDirection.value = 'asc'
    }
}

const sortedTransactions = computed(() => {
    if (!sortBy.value) return filteredTransactions.value

    return [...filteredTransactions.value].sort((a, b) => {
        let aValue = a[sortBy.value]
        let bValue = b[sortBy.value]

        if (sortBy.value === 'fund') {
            aValue = a.funds?.name || ''
            bValue = b.funds?.name || ''
        }

        aValue = (aValue ?? '').toString().toLowerCase()
        bValue = (bValue ?? '').toString().toLowerCase()

        if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
        return 0
    })
})



// ✅ Paginated Transactions
const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return sortedTransactions.value.slice(start, end);
});

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredTransactions.value.length / itemsPerPage.value));
});

// ✅ Item Summary
const itemSummary = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value + 1;
    const end = Math.min(currentPage.value * itemsPerPage.value, filteredTransactions.value.length);
    const total = filteredTransactions.value.length;
    return `Items ${start}-${end} of ${total}`;
});



// ✅ Reset Pagination on Filter Change
watch([search, fund_id, dateFrom, dateTo, itemsPerPage], () => {
    currentPage.value = 1;
});



// ✅ Balance Calculation
const balance = computed(() => {
    return filteredTransactions.value.reduce((acc, trx) => {
        return trx.type === 'income'
            ? acc + Number(trx.amount)
            : acc - Number(trx.amount)
    }, 0)
})

// ✅ Export Functions
const exportToExcel = () => {
    const data = filteredTransactions.value.map(t => ({
        Date: t.date,
        Title: t.transaction_title,
        Fund: t.funds?.name,
        Type: t.type,
        Amount: t.amount
    }))
    const ws = utils.json_to_sheet(data)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Transactions')
    writeFileXLSX(wb, 'Transactions.xlsx')
}

const exportToCSV = () => {
    const data = filteredTransactions.value.map(t => [
        t.date,
        t.transaction_title,
        t.funds?.name,
        t.type,
        t.amount
    ])
    const ws = utils.aoa_to_sheet([
        ['Date', 'Title', 'Fund', 'Type', 'Amount'],
        ...data
    ])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Transactions')
    writeFileXLSX(wb, 'Transactions.csv', { bookType: 'csv' })
}

const exportToPDF = () => {
    const doc = new jsPDF()
    const rows = filteredTransactions.value.map(t => [
        t.date,
        t.transaction_title,
        t.funds?.name,
        t.type,
        t.amount
    ])
    autoTable(doc, {
        head: [['Date', 'Title', 'Fund', 'Type', 'Amount']],
        body: rows
    })
    doc.save('Transactions.pdf')
}

// ✅ Modal Handlers
const openModal = (transaction = null) => {
    if (transaction) {
        date.value = transaction.date
        transaction_title.value = transaction.transaction_title
        amount.value = transaction.amount
        transaction_type.value = transaction.type
        fundId.value = transaction.fund_id
        description.value = transaction.description
        selectedTransactionId.value = transaction.id
    } else {
        resetForm()
    }
    transactionModal.value = true
}

const closeModal = () => {
    transactionModal.value = false
    resetForm()
}

const openViewModal = (transaction) => {
    selectedTransaction.value = transaction
    viewModal.value = true
}

// ✅ Reset Form
const resetForm = () => {
    date.value = ''
    transaction_title.value = ''
    amount.value = 0
    transaction_type.value = ''
    fundId.value = ''
    description.value = ''
    selectedTransactionId.value = null
}

// ✅ Submit Transaction
const submitForm = async () => {
    try {
        const payload = {
            date: date.value,
            transaction_title: transaction_title.value,
            amount: amount.value,
            type: transaction_type.value,
            fund_id: fundId.value,
            description: description.value
        }

        let url = '/api/transactions'
        let method = 'POST'

        if (selectedTransactionId.value) {
            url = `/api/transactions/${selectedTransactionId.value}`
            method = 'PUT'
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${selectedTransactionId.value ? 'update' : 'add'} this transaction?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        })

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(url, payload, method)

            if (response.status) {
                Swal.fire('Success', 'Transaction saved successfully', 'success')
                getTransactions()
                closeModal()
            } else {
                Swal.fire('Failed', response.message || 'Failed to save', 'error')
            }
        }
    } catch (err) {
        Swal.fire('Error', 'An unexpected error occurred', 'error')
    }
}

// ✅ Lifecycle
onMounted(() => {
    fetchCurrencies()
    fetchCurrencyPreference()
    getFunds()
    getTransactions()
})
</script>


<template>
    <div class="p-6 bg-white rounded-lg shadow space-y-6">

        <!-- ✅ Top Bar -->
        <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-700">Accounts Transactions</h2>
            <div class="flex gap-2">
                <!-- Currency Dropdown or Selected Display -->
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-gray-600">Currency:</span>
                        <select v-model="selectedCurrency" @change="handleCurrencyChange"
                            class="px-3 py-2 gap-1 text-sm border border-gray-300 rounded text-gray-700 bg-white hover:border-gray-400">
                            <option value="">Select</option>
                            <option v-for="currency in currencies" :key="currency.id" :value="currency.id">
                                {{ currency.currency_code }}
                            </option>
                        </select>
                    </div>
                </div>

                <button @click="exportToCSV"
                    class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
                    <i class="ri-file-text-line"></i> CSV
                </button>
                <button @click="exportToExcel"
                    class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
                    <i class="ri-file-excel-2-line"></i> Excel
                </button>
                <button @click="exportToPDF"
                    class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
                    <i class="ri-file-pdf-2-line"></i> PDF
                </button>
                <button @click="exportToPDF"
                    class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
                    <i class="ri-file-pdf-2-line"></i> Fund
                </button>
                <!-- <button @click="exportToWord"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <i class="ri-file-word-2-line"></i> Word
        </button> -->
                <button @click="openModal(null)"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    + Add Transaction
                </button>
            </div>
        </div>

        <!-- ✅ Filters -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="text-sm text-gray-600">Search</label>
                <input v-model="search" type="text" placeholder="Search..."
                    class="w-full border rounded px-3 py-1.5 text-sm" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Fund</label>
                <select v-model="fund_id" class="w-full border rounded px-3 py-1.5 text-sm">
                    <option value="">All Funds</option>
                    <option v-for="fund in fundList" :key="fund.id" :value="fund.id">{{ fund.name }}</option>
                </select>
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

        <!-- ✅ Column View Settings -->
        <div class="bg-gray-50 border rounded p-4 flex flex-wrap gap-8 items-start">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
                <select v-model="selectedProfile" @change="applyProfile"
                    class="border rounded px-3 py-1.5 text-sm w-48">
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

        <!-- ✅ Balance with Dynamic Colour -->
        <div v-if="filteredTransactions.length > 0" :class="[
            'border rounded-md px-4 py-2 text-sm',
            balance >= 0
                ? 'text-green-700 bg-green-50 border-green-300'
                : 'text-red-700 bg-red-50 border-red-300'
        ]">
            Current Balance:
            <span class="font-semibold">
                <!-- {{ selectedCurrencyData?.currency_symbol || '' }}  -->
                {{ selectedCurrencyData?.currency_code || '' }}
                {{ balance >= 0 ? '+' : '' }}{{ balance }}

            </span>
        </div>


        <!-- ✅ Transaction Table -->
        <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-3 py-2 text-left font-bold text-gray-700">#</th>
                        <th v-if="visibleColumns.includes('date')" @click="sort('date')"
                            class="cursor-pointer px-3 py-2 text-left font-bold text-gray-700 hover:text-blue-600">
                            Date
                            <span v-if="sortBy === 'date'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>

                        <th v-if="visibleColumns.includes('title')" @click="sort('transaction_title')"
                            class="cursor-pointer px-3 py-2 text-left font-bold text-gray-700 hover:text-blue-600">
                            Title
                            <span v-if="sortBy === 'transaction_title'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>

                        <th v-if="visibleColumns.includes('fund')" @click="sort('fund')"
                            class="cursor-pointer px-3 py-2 text-left font-bold text-gray-700 hover:text-blue-600">
                            Fund
                            <span v-if="sortBy === 'fund'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>

                        <th v-if="visibleColumns.includes('income')" @click="sort('amount')"
                            class="cursor-pointer px-3 py-2 text-left font-bold text-gray-700 hover:text-blue-600">
                            Income ({{ selectedCurrencyData?.currency_symbol || '' }})
                            <span v-if="sortBy === 'amount'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>

                        <th v-if="visibleColumns.includes('expense')" @click="sort('amount')"
                            class="cursor-pointer px-3 py-2 text-left font-bold text-gray-700 hover:text-blue-600">
                            Expense ({{ selectedCurrencyData?.currency_symbol || '' }})
                            <span v-if="sortBy === 'amount'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th v-if="visibleColumns.includes('actions')" class="px-3 py-2 text-left">Action</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                    <!-- <tr v-for="(transaction, index) in filteredTransactions" :key="transaction.id"> -->
                    <tr v-for="(transaction, index) in paginatedTransactions" :key="transaction.id">
                        <td class="px-3 py-2">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                        <td v-if="visibleColumns.includes('date')" class="px-3 py-2">{{ transaction.date }}</td>
                        <td v-if="visibleColumns.includes('title')" class="px-3 py-2">{{ transaction.transaction_title
                        }}</td>
                        <td v-if="visibleColumns.includes('fund')" class="px-3 py-2">{{ transaction.funds?.name }}</td>
                        <td v-if="visibleColumns.includes('income')" class="px-3 py-2 text-green-600 font-medium">
                            <span v-if="transaction.type === 'income'">{{ transaction.amount }}</span>
                        </td>
                        <td v-if="visibleColumns.includes('expense')" class="px-3 py-2 text-red-600 font-medium">
                            <span v-if="transaction.type === 'expense'">{{ transaction.amount }}</span>
                        </td>
                        <td v-if="visibleColumns.includes('actions')" class="px-3 py-2">
                            <div class="flex gap-2">
                                <button @click="openModal(transaction)"
                                    class="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                                    Edit
                                </button>
                                <button @click="openViewModal(transaction)"
                                    class="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600">
                                    View
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ✅ Pagination -->
        <div v-if="filteredTransactions.length > 0" class="flex justify-between items-center mt-4">
            <div class="text-sm text-gray-600">
                {{ itemSummary }} | Page {{ currentPage }} of {{ totalPages }}
            </div>

            <div class="flex items-center gap-4">
                <div class="items-center gap-2">
                    <label class="text-sm">Items per page: </label>
                    <select v-model="itemsPerPage" class="border rounded px-2 py-1 text-sm">
                        <option :value="5">5</option>
                        <option :value="10">10</option>
                        <option :value="20">20</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                        <option :value="250">250</option>
                        <option :value="500">500</option>
                        <option :value="1000">1000</option>
                    </select>
                </div>

                <div class="flex gap-2">
                    <button @click="currentPage = 1" :disabled="currentPage === 1"
                        class="px-3 py-1 border rounded text-sm"
                        :class="currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'">
                        First
                    </button>
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="px-3 py-1 border rounded text-sm"
                        :class="currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'">
                        Prev
                    </button>
                    <button @click="currentPage++" :disabled="currentPage === totalPages"
                        class="px-3 py-1 border rounded text-sm"
                        :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'">
                        Next
                    </button>
                    <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
                        class="px-3 py-1 border rounded text-sm"
                        :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'">
                        Last
                    </button>
                </div>
            </div>
        </div>

        <div v-if="!filteredTransactions.length" class="text-center text-gray-500 text-sm mt-4">
            No transactions found.
        </div>

        <!-- ✅ View Modal -->
        <div v-if="viewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
                <button @click="viewModal = false" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    ✕
                </button>
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">Transaction Details</h2>
                <div class="space-y-4 text-base text-gray-700">
                    <div class="flex justify-between">
                        <span class="text-gray-500 font-medium">Date:</span>
                        <span>{{ selectedTransaction.date }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 font-medium">Title:</span>
                        <span>{{ selectedTransaction.transaction_title }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 font-medium">Type:</span>
                        <span>{{ selectedTransaction.type }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 font-medium">Fund:</span>
                        <span>{{ selectedTransaction.funds?.name || 'N/A' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 font-medium">Amount:</span>
                        <span>{{ selectedTransaction.amount }}</span>
                    </div>
                    <div>
                        <span class="text-gray-500 font-medium">Description:</span>
                        <p class="mt-1 text-gray-800 whitespace-pre-line">
                            {{ selectedTransaction.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ✅ Add/Edit Modal -->
        <div v-if="transactionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
                <button @click="closeModal" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    ✕
                </button>
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">
                    {{ selectedTransactionId ? 'Edit' : 'Add' }} Transaction
                </h2>
                <form @submit.prevent="submitForm" class="space-y-4">
                    <div>
                        <label class="block mb-1 text-sm">Date</label>
                        <input type="date" v-model="date" class="w-full border rounded px-3 py-1.5 text-sm" required />
                    </div>
                    <div>
                        <label class="block mb-1 text-sm">Title</label>
                        <input type="text" v-model="transaction_title" class="w-full border rounded px-3 py-1.5 text-sm"
                            required />
                    </div>
                    <div>
                        <label class="block mb-1 text-sm">Description</label>
                        <input type="text" v-model="description" class="w-full border rounded px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                        <label class="block mb-1 text-sm">Fund</label>
                        <select v-model="fundId" class="w-full border rounded px-3 py-1.5 text-sm" required>
                            <option value="">Select Fund</option>
                            <option v-for="fund in fundList" :key="fund.id" :value="fund.id">{{ fund.name }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 text-sm">Transaction Type</label>
                        <select v-model="transaction_type" class="w-full border rounded px-3 py-1.5 text-sm" required>
                            <option value="">Select Type</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label class="block mb-1 text-sm">Amount</label>
                        <input type="number" v-model="amount" class="w-full border rounded px-3 py-1.5 text-sm"
                            required />
                    </div>
                    <div class="flex justify-end gap-3 mt-4">
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            {{ selectedTransactionId ? 'Update' : 'Submit' }}
                        </button>
                        <button type="button" @click="closeModal"
                            class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</template>
