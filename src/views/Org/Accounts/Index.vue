<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const auth = authStore;

// References and reactive states
const userId = auth.user.id;
const date = ref('');
const transaction_title = ref('');
const amount = ref(0);
const fund_id = ref("");
const transaction_type = ref("");
const description = ref('');

const images = ref([{ id: Date.now(), file: null }]);
const documents = ref([{ id: Date.now(), file: null }]);

const selectedTransactionId = ref(null);
const transactionList = ref([]);
const fundList = ref([]);
const transactionModal = ref(false);

const viewModal = ref(false);
const selectedTransaction = ref(null);

const openViewModal = (transaction) => {
    selectedTransaction.value = transaction;
    viewModal.value = true;
};


// Fetch funds
const getFunds = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/funds', {}, 'GET');
        fundList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        fundList.value = [];
    }
};

// Fetch transactions
const getTransactions = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/transactions', {}, 'GET');

        if (response.status) {
            //need for logic purposes
            const transactions = response.data;

            // Update the transaction list
            transactionList.value = transactions;

            // Process images and documents for each transaction
            images.value = [];
            documents.value = [];

            transactions.forEach((transaction) => {
                // Extract and process images
                if (transaction.images && transaction.images.length) {
                    images.value.push(
                        ...transaction.images.map((image) => ({
                            id: image.id,
                            file: {
                                preview: image.image_url || '', // Ensure `image_url` contains the correct URL
                                name: image.file_name || '',
                            },
                        }))
                    );
                }

                // Extract and process documents
                if (transaction.documents && transaction.documents.length) {
                    documents.value.push(
                        ...transaction.documents.map((doc) => ({
                            id: doc.id,
                            file: {
                                preview: doc.document_url || '', // Ensure `document_url` contains the correct URL
                                name: doc.file_name || '',
                            },
                        }))
                    );
                }
            });
        } else {
            transactionList.value = [];
            images.value = [];
            documents.value = [];
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        transactionList.value = [];
        images.value = [];
        documents.value = [];
    }
};

// Delete transaction
// const deleteTransaction = async (id) => {
//     try {
//         const result = await Swal.fire({
//             title: 'Are you sure?',
//             text: 'Do you want to delete this transaction?',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Yes, delete it!',
//             cancelButtonText: 'No, cancel!'
//         });

//         if (result.isConfirmed) {
//             const response = await auth.fetchProtectedApi(`/api/transactions/${id}`, {}, 'DELETE');
//             if (response.status) {
//                 await Swal.fire('Deleted!', 'Transaction has been deleted.', 'success');
//                 getTransactions();
//             } else {
//                 Swal.fire('Failed!', 'Failed to delete transaction.', 'error');
//             }
//         }
//     } catch (error) {
//         console.error('Error deleting transaction:', error);
//         Swal.fire('Error!', 'Failed to delete transaction.', 'error');
//     }
// };




// Navigation and modal handling
const funds = () => {
    router.push({ name: 'accounts-fund' });
};

const closeModal = () => {
    transactionModal.value = false;
    resetForm();
};

const openModal = (transaction = null) => {
    if (transaction) {
        date.value = transaction.date;
        transaction_title.value = transaction.transaction_title;
        description.value = transaction.description;
        transaction_type.value = transaction.type;
        fund_id.value = transaction.fund_id;
        amount.value = transaction.amount;
        selectedTransactionId.value = transaction.id;
    } else {
        resetForm();
    }
    transactionModal.value = true;
};
// Reset form fields
const resetForm = () => {
    date.value = '';
    transaction_title.value = '';
    description.value = '';
    fund_id.value = "";
    transaction_type.value = "";
    amount.value = 0;
    selectedTransactionId.value = null;

    images.value = [{ id: Date.now(), file: null }];
    documents.value = [{ id: Date.now(), file: null }];
};

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

    // Add basic transaction data
    formData.append('user_id', userId);
    formData.append('date', date.value);
    formData.append('transaction_title', transaction_title.value);
    formData.append('description', description.value);
    formData.append('type', transaction_type.value);
    formData.append('fund_id', fund_id.value);
    formData.append('amount', amount.value);

    // Add images to FormData
    images.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`images[${index}]`, fileData.file.file);
        }
    });

    // Add documents to FormData
    documents.value.forEach((fileData, index) => {
        if (fileData.file) {
            formData.append(`documents[${index}]`, fileData.file.file);
        }
    });

    try {
        let apiUrl = '/api/transactions';
        let method = 'POST';

        // If updating a transaction, add `_method` to mimic a PUT request
        if (selectedTransactionId.value) {
            apiUrl = `/api/transactions/${selectedTransactionId.value}`;
            formData.append('_method', 'PUT'); // Tell Laravel to treat this as a PUT request
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${selectedTransactionId.value ? 'update' : 'add'} this transaction?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.uploadProtectedApi(apiUrl, formData, method, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status) {
                await Swal.fire('Success!', `Transaction ${selectedTransactionId.value ? 'updated' : 'added'} successfully.`, 'success');
                getTransactions();
                resetForm();
                closeModal();
            } else {
                Swal.fire('Failed!', 'Failed to save transaction.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${selectedTransactionId.value ? 'updating' : 'adding'} transaction:`, error);
        Swal.fire('Error!', `Failed to ${selectedTransactionId.value ? 'update' : 'add'} transaction.`, 'error');
    }
};

const balance = computed(() => {
    return transactionList.value.reduce((acc, trx) => {
        return trx.type === 'income'
            ? acc + Number(trx.amount)
            : acc - Number(trx.amount);
    }, 0);
});
onMounted(() => {
    getFunds();
    getTransactions();
});
</script>

<template>
    <!-- Header & Actions -->
    <section>
        <div>
            <div class="flex justify-end gap-3">
                <div v-if="transactionList.length > 0"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                    Balance: {{ balance }}
                </div>
                <button @click="openModal(null)"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    + Add New Transaction
                </button>
                <button @click="funds"
                    class="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600">
                    Fund Types
                </button>
            </div>
        </div>
    </section>

    <!-- Table Section -->
    <section>
        <div class="border-b border-gray-200 py-1 mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Transactions</h2>
        </div>

        <div class="overflow-x-auto">
  <table class="min-w-full table-fixed border border-gray-200 text-sm">
    <thead class="bg-gray-50">
      <tr>
        <th class="w-10 px-3 py-2 text-left font-medium text-gray-700">#</th>
        <th class="w-52 px-3 py-2 text-left font-medium text-gray-700">Transaction ID</th>
        <th class="w-32 px-3 py-2 text-left font-medium text-gray-700">Date</th>
        <th class="w-40 px-3 py-2 text-left font-medium text-gray-700">Title</th>
        <th class="w-40 px-3 py-2 text-left font-medium text-gray-700">Fund</th>
        <th class="w-24 px-3 py-2 text-left font-medium text-gray-700">Income</th>
        <th class="w-24 px-3 py-2 text-left font-medium text-gray-700">Expense</th>
        <th class="w-40 px-3 py-2 text-left font-medium text-gray-700">Actions</th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-100">
      <tr v-for="(transaction, index) in transactionList" :key="transaction.id">
        <td class="w-10 px-3 py-2">{{ index + 1 }}</td>
        <td class="w-52 px-3 py-2 truncate" :title="transaction.transaction_code">
          {{ transaction.transaction_code }}
        </td>
        <td class="w-32 px-3 py-2">{{ transaction.date }}</td>
        <td class="w-40 px-3 py-2">{{ transaction.transaction_title }}</td>
        <td class="w-40 px-3 py-2">{{ transaction.funds.name }}</td>
        <td class="w-24 px-3 py-2 text-green-600 font-medium" v-if="transaction.type === 'income'">
          {{ transaction.amount }}
        </td>
        <td class="w-24 px-3 py-2" v-else></td>
        <td class="w-24 px-3 py-2 text-red-600 font-medium" v-if="transaction.type === 'expense'">
          {{ transaction.amount }}
        </td>
        <td class="w-24 px-3 py-2" v-else></td>
        <td class="w-40 px-3 py-2">
          <div class="flex gap-2">
            <button @click="openModal(transaction)" class="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">Edit</button>
            <button @click="openViewModal(transaction)" class="px-2 py-1 text-xs text-white bg-gray-500 rounded hover:bg-gray-600">View</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
    </section>

    <!-- Add/Edit transaction Modal -->
    <section>
        <!-- Transaction Modal -->
        <div v-if="transactionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-8 space-y-6">
                <!-- Modal Header -->
                <div class="border-b border-gray-200 pb-4">
                    <h3 class="text-2xl font-semibold text-gray-800">
                        {{ selectedTransactionId ? 'Edit' : 'Add' }} Transaction
                    </h3>
                </div>

                <!-- Form -->
                <form @submit.prevent="submitForm" class="space-y-6">
                    <!-- Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input v-model="date" type="date"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                            :max="new Date().toISOString().split('T')[0]" required />
                    </div>

                    <!-- Title -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input v-model="transaction_title" type="text"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500" />
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input v-model="description" type="text"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500" />
                    </div>

                    <!-- Fund -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Fund</label>
                        <select v-model="fund_id"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                            required>
                            <option value="">Select Fund</option>
                            <option v-for="fund in fundList" :key="fund.id" :value="fund.id">{{ fund.name }}</option>
                        </select>
                    </div>

                    <!-- Transaction Type -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                        <select v-model="transaction_type"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                            required>
                            <option value="">Select Type</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    <!-- Amount -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input v-model="amount" type="number" min="0"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                            required />
                    </div>

                    <!-- Image Upload -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                        <div class="space-y-3">
                            <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
                                <input type="file" accept="image/*"
                                    @change="event => handleFileChange(event, images, index)"
                                    class="w-full border border-gray-300 rounded-md px-3 py-2" />
                                <div v-if="file.file && file.file.preview" class="w-16 h-16 rounded overflow-hidden">
                                    <img :src="file.file.preview" class="w-full h-full object-cover" />
                                </div>
                                <button type="button" @click="removeFile(images, index)"
                                    class="text-red-600 hover:underline text-sm">Remove</button>
                            </div>
                            <button type="button" @click="() => addMoreFiles(images)"
                                class="text-blue-600 hover:underline text-sm">
                                + Add more image
                            </button>
                        </div>
                    </div>

                    <!-- Document Upload -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Upload Documents</label>
                        <div class="space-y-3">
                            <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
                                <input type="file" accept=".pdf,.doc,.docx"
                                    @change="event => handleFileChange(event, documents, index)"
                                    class="w-full border border-gray-300 rounded-md px-3 py-2" />
                                <span v-if="file.file" class="text-sm truncate w-32">{{ file.file.name }}</span>
                                <button type="button" @click="removeFile(documents, index)"
                                    class="text-red-600 hover:underline text-sm">Remove</button>
                            </div>
                            <button type="button" @click="() => addMoreFiles(documents)"
                                class="text-blue-600 hover:underline text-sm">
                                + Add more document
                            </button>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="flex justify-end gap-3">
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {{ selectedTransactionId ? 'Update' : 'Submit' }}
                        </button>
                        <button type="button" @click="closeModal"
                            class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                            Cancel
                        </button>
                    </div>
                </form>


            </div>
        </div>

    </section>

    <!-- View Transaction Modal -->
    <div v-if="viewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
            <!-- Close button -->
            <button @click="viewModal = false"
                class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Transaction Details</h2>

            <div class="space-y-4 text-base text-gray-700">
                <div class="flex justify-between">
                    <span class="text-gray-500 font-medium">Date:</span>
                    <span>{{ selectedTransaction.date }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500 font-medium">Transaction Code:</span>
                    <span>{{ selectedTransaction.transaction_code }}</span>
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
                    <p class="mt-1 text-gray-800 whitespace-pre-line">{{ selectedTransaction.description }}</p>
                </div>
            </div>

            <div class="border-t mt-6 pt-4">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Attached Images</h3>
                <div class="flex flex-wrap gap-2">
                    <img v-for="img in selectedTransaction.images" :key="img.id" :src="img.image_url"
                        class="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm" />
                </div>
            </div>

            <div class="border-t mt-6 pt-4">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Attached Documents</h3>
                <ul class="list-disc list-inside space-y-1 text-blue-600 text-base">
                    <li v-for="doc in selectedTransaction.documents" :key="doc.id">
                        <a :href="doc.document_url" target="_blank" class="hover:underline">{{ doc.file_name }}</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
