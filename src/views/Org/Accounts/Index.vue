<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../../../store/authStore'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
// import { utils, writeFileXLSX } from 'xlsx'
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
import { pdfExport } from "@/helpers/pdfExport.js";
import { excelExport } from "@/helpers/excelExport.js";
import { csvExport } from "@/helpers/csvExport.js";

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
const accounts_fund_id = ref('')
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

const modalImages = ref([{ id: Date.now(), file: null }])
const modalDocuments = ref([{ id: Date.now(), file: null }])


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

// Get transaction with images and files
const getTransactions = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/transactions', {}, 'GET');

        if (response.status) {
            transactionList.value = response.data;
        } else {
            transactionList.value = [];
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        transactionList.value = [];
    }
};


// ✅ Filtered Transactions
const filteredTransactions = computed(() => {
    let list = [...transactionList.value]
    const keyword = search.value.trim().toLowerCase()

    if (keyword) {
        list = list.filter(t => {
            return (
                t.transaction_title?.toLowerCase().includes(keyword) ||
                (t.funds?.name || '').toLowerCase().includes(keyword) ||
                t.amount.toString().includes(keyword) ||
                (t.date ? dayjs(t.date).format('YYYY-MM-DD').includes(keyword) : false)
            )
        })
    }

    if (accounts_fund_id.value) {
        list = list.filter(t => t.accounts_fund_id === accounts_fund_id.value)
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
watch([search, accounts_fund_id, dateFrom, dateTo, itemsPerPage], () => {
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
// const exportXLSX = () => {
//     const data = filteredTransactions.value.map(t => ({
//         Date: t.date,
//         Title: t.transaction_title,
//         Fund: t.funds?.name,
//         Type: t.type,
//         Amount: t.amount
//     }))
//     const ws = utils.json_to_sheet(data)
//     const wb = utils.book_new()
//     utils.book_append_sheet(wb, ws, 'Transactions')
//     writeFileXLSX(wb, 'Transactions.xlsx')
// }

// const exportCSV = () => {
//     const data = filteredTransactions.value.map(t => [
//         t.date,
//         t.transaction_title,
//         t.funds?.name,
//         t.type,
//         t.amount
//     ])
//     const ws = utils.aoa_to_sheet([
//         ['Date', 'Title', 'Fund', 'Type', 'Amount'],
//         ...data
//     ])
//     const wb = utils.book_new()
//     utils.book_append_sheet(wb, ws, 'Transactions')
//     writeFileXLSX(wb, 'Transactions.csv', { bookType: 'csv' })
// }

// const exportPDF = () => {
//     const doc = new jsPDF()
//     const rows = filteredTransactions.value.map(t => [
//         t.date,
//         t.transaction_title,
//         t.funds?.name,
//         t.type,
//         t.amount
//     ])
//     autoTable(doc, {
//         head: [['Date', 'Title', 'Fund', 'Type', 'Amount']],
//         body: rows
//     })
//     doc.save('Transactions.pdf')
// }

const exportHeaders = [
  { text: "Date", value: "date" },
  { text: "Title", value: "transaction_title" },
  { text: "Fund", value: "fund" },
  { text: "Type", value: "type" },
  { text: "Amount", value: "amount" },
];

const exportRows = computed(() => {
  return filteredTransactions.value.map(t => ({
    date: t.date || "",
    transaction_title: t.transaction_title || "",
    fund: t.funds?.name || "",
    type: t.type || "",
    amount: t.amount || "",
  }));
});

// Export CSV
const exportCSV = async () => {
  await csvExport({
    headers: exportHeaders,
    rows: exportRows.value,
    title: "Transaction List",
    fileName: "Transactions.csv",
  });
};

// Export Excel
const exportXLSX = async () => {
  await excelExport({
    headers: exportHeaders,
    rows: exportRows.value,
    title: "Transaction List",
    fileName: "Transactions.xlsx",
  });
};

// Export PDF
const exportPDF = async () => {
  await pdfExport({
    headers: exportHeaders,
    rows: exportRows.value,
    title: "Transaction List",
    fileName: "Transactions.pdf",
  });
};


// ✅ Modal Handlers
const openModal = (transaction = null) => {
    if (transaction) {
        date.value = transaction.date;
        transaction_title.value = transaction.transaction_title;
        amount.value = transaction.amount;
        transaction_type.value = transaction.type;
        fundId.value = transaction.accounts_fund_id;
        description.value = transaction.description;
        selectedTransactionId.value = transaction.id;

        modalImages.value = transaction.images?.map(img => ({
            id: img.id,
            file: {
                preview: img.image_url || '',
                name: img.file_name || '',
            },
        })) || [{ id: Date.now(), file: null }];

        modalDocuments.value = transaction.documents?.map(doc => ({
            id: doc.id,
            file: {
                preview: doc.document_url || '',
                name: doc.file_name || '',
            },
        })) || [{ id: Date.now(), file: null }];
    } else {
        resetForm();
    }
    transactionModal.value = true;
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
    modalImages.value = [{ id: Date.now(), file: null }];
    modalDocuments.value = [{ id: Date.now(), file: null }];
}

const handleFileChange = (event, fileList, index) => {
    const file = event.target.files[0];
    if (file) {
        fileList[index].file = {
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        };
    }
};

const addMoreFiles = (fileList) => {
    fileList.push({ id: Date.now(), file: null });
};

const removeFile = (fileList, index) => {
    if (fileList[index].file && fileList[index].file.preview) {
        URL.revokeObjectURL(fileList[index].file.preview); // Release memory
    }
    fileList.splice(index, 1);
};

// Add or update transaction
const submitForm = async () => {
    const formData = new FormData();

    formData.append('date', date.value);
    formData.append('transaction_title', transaction_title.value);
    formData.append('amount', parseFloat(amount.value).toFixed(2));
    formData.append('type', transaction_type.value);
    formData.append('accounts_fund_id', fundId.value);
    formData.append('description', description.value);

    modalImages.value.forEach((fileData, index) => {
        if (fileData.file && fileData.file.file) {
            formData.append(`images[${index}]`, fileData.file.file);
        }
    });

    modalDocuments.value.forEach((fileData, index) => {
        if (fileData.file && fileData.file.file) {
            formData.append(`documents[${index}]`, fileData.file.file);
        }
    });

    let url = '/api/transactions';
    let method = 'POST';

    if (selectedTransactionId.value) {
        url = `/api/transactions/${selectedTransactionId.value}`;
        formData.append('_method', 'PUT');
    }

    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to ${selectedTransactionId.value ? 'update' : 'add'} this transaction?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        const response = await auth.uploadProtectedApi(url, formData, method, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.status) {
            Swal.fire('Success', 'Transaction saved successfully', 'success');
            getTransactions();
            closeModal();
        } else {
            Swal.fire('Failed', response.message || 'Failed to save transaction', 'error');
        }
    }
};


// ✅ Lifecycle
onMounted(() => {
    fetchCurrencies()
    fetchCurrencyPreference()
    getFunds()
    getTransactions()
})
</script>


<template>
    <div class="p-4 sm:p-6 space-y-6 bg-white shadow rounded-lg">

        <!-- ✅ Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-800 text-center sm:text-left">
                Accounts Transactions</h2>
            <div class="flex flex-wrap justify-center sm:justify-end gap-2">
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

                <button @click="exportCSV"
                    class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
                    <i class="ri-file-text-line"></i> CSV
                </button>
                <button @click="exportXLSX"
                    class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
                    <i class="ri-file-excel-2-line"></i> Excel
                </button>
                <button @click="exportPDF"
                    class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
                    <i class="ri-file-pdf-2-line"></i> PDF
                </button>
                <router-link :to="{ name: 'accounts-fund' }"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    <i class="ri-file-pdf-2-line"></i> Fund
                </router-link>

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
                <select v-model="accounts_fund_id" class="w-full border rounded px-3 py-1.5 text-sm">
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
        <div class="bg-gray-50 border rounded p-4 flex flex-col lg:flex-row gap-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
                <select v-model="selectedProfile" @change="applyProfile"
                    class="border rounded px-3 py-1.5 text-xs sm:text-sm w-full sm:w-48">
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
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    Edit
                                </button>
                                <button @click="openViewModal(transaction)"
                                    class="bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md py-1 px-3">
                                    View
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ✅ Pagination -->
        <div v-if="filteredTransactions.length > 0"
            class="flex flex-col md:flex-row justify-between items-center mt-4 gap-3 md:gap-0">
            <!-- Info -->
            <div class="text-sm text-gray-600 text-center md:text-left w-full md:w-auto">
                {{ itemSummary }} | Page {{ currentPage }} of {{ totalPages }}
            </div>

            <!-- Controls -->
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-center">
                <!-- Items per page -->
                <div class="flex items-center gap-2">
                    <label class="text-sm">Items per page:</label>
                    <select v-model="itemsPerPage" class="border rounded px-2 py-1 text-sm">
                        <option v-for="size in [5, 10, 20, 50, 100, 250, 500, 1000]" :key="size" :value="size">{{ size }}
                        </option>
                    </select>
                </div>

                <!-- Navigation buttons -->
                <div class="flex flex-wrap gap-2 justify-center">
                    <button @click="currentPage = 1" :disabled="currentPage === 1"
                        class="px-3 py-1 border rounded text-sm"
                        :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                        First
                    </button>
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="px-3 py-1 border rounded text-sm"
                        :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                        Prev
                    </button>
                    <button @click="currentPage++" :disabled="currentPage === totalPages"
                        class="px-3 py-1 border rounded text-sm"
                        :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                        Next
                    </button>
                    <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
                        class="px-3 py-1 border rounded text-sm"
                        :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
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
                <button @click="viewModal = false"
                    class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
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

                    <!-- ✅ Attached Images -->
                    <div v-if="selectedTransaction.images?.length" class="border-t mt-6 pt-4">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Attached Images</h3>
                        <div class="flex flex-wrap gap-2">
                            <img v-for="img in selectedTransaction.images" :key="img.id" :src="img.image_url"
                                class="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm" />
                        </div>
                    </div>

                    <!-- ✅ Attached Documents -->
                    <div v-if="selectedTransaction.documents?.length" class="border-t mt-6 pt-4">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Attached Documents</h3>
                        <ul class="list-disc list-inside space-y-1 text-blue-600 text-base">
                            <li v-for="doc in selectedTransaction.documents" :key="doc.id">
                                <a :href="doc.document_url" target="_blank" class="hover:underline">{{ doc.file_name
                                    }}</a>
                            </li>
                        </ul>
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
                        <input type="number" v-model="amount" step="0.01" min="0"
                            class="w-full border rounded px-3 py-1.5 text-sm" required />
                    </div>

                    <!-- Image Upload -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                        <div class="space-y-3">
                            <div v-for="(file, index) in modalImages" :key="file.id" class="flex items-center gap-4">
                                <input type="file" accept="image/*"
                                    @change="event => handleFileChange(event, modalImages, index)"
                                    class="w-full border border-gray-300 rounded-md px-3 py-2" />
                                <div v-if="file.file && file.file.preview" class="w-16 h-16 rounded overflow-hidden">
                                    <img :src="file.file.preview" class="w-full h-full object-cover" />
                                </div>
                                <button type="button" @click="removeFile(modalImages, index)"
                                    class="text-red-600 hover:underline text-sm">Remove</button>
                            </div>
                            <button type="button" @click="() => addMoreFiles(modalImages)"
                                class="text-blue-600 hover:underline text-sm">
                                + Add more image
                            </button>
                        </div>
                    </div>

                    <!-- Document Upload -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Upload Documents</label>
                        <div class="space-y-3">
                            <div v-for="(file, index) in modalDocuments" :key="file.id" class="flex items-center gap-4">
                                <input type="file" accept=".pdf,.doc,.docx"
                                    @change="event => handleFileChange(event, modalDocuments, index)"
                                    class="w-full border border-gray-300 rounded-md px-3 py-2" />
                                <span v-if="file.file" class="text-sm truncate w-32">{{ file.file.name }}</span>
                                <button type="button" @click="removeFile(modalDocuments, index)"
                                    class="text-red-600 hover:underline text-sm">Remove</button>
                            </div>
                            <button type="button" @click="() => addMoreFiles(modalDocuments)"
                                class="text-blue-600 hover:underline text-sm">
                                + Add more document
                            </button>
                        </div>
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