<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';

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
const deleteTransaction = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this transaction?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/transactions/${id}`, {}, 'DELETE');
            if (response.status) {
                await Swal.fire('Deleted!', 'Transaction has been deleted.', 'success');
                getTransactions();
            } else {
                Swal.fire('Failed!', 'Failed to delete transaction.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        Swal.fire('Error!', 'Failed to delete transaction.', 'error');
    }
};

// Fetch transactions on mount
onMounted(() => {
    getFunds();
    getTransactions();
});

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


</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Transaction List</h5>
                <div>
                    <button @click="openModal(null)"
                        class="bg-blue-600 text-white rounded-md p-2 mx-4 hover:bg-blue-700">Add
                        Transaction</button>
                    <button @click="funds" class="bg-yellow-500 text-white rounded-md p-2 mx-4 hover:bg-yellow-600">Add
                        Fund</button>
                </div>

            </div>
            <div v-if="transactionModal"
                class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-lg w-2/4 h-auto max-h-[80%] overflow-y-auto p-5">

                    <div class="flex justify-between left-color-shade bg-blue-100 py-2 mt-3 mb-5">
                        <h5 class="text-md font-semibold my-2">{{ selectedTransactionId ? 'Edit' : 'Add' }} Transaction
                        </h5>
                    </div>
                    <form @submit.prevent="submitForm">

                        <!-- Input Fields Row -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">

                            <!-- Transaction Date -->
                            <div class="mb-4">
                                <label for="date" class="block text-gray-700 font-semibold mb-2">Date</label>
                                <input v-model="date" type="date" id="date"
                                    class="w-full border border-gray-300 rounded-md p-2" required
                                    :max="new Date().toISOString().split('T')[0]" />
                            </div>
                            <!-- transaction_title -->
                            <div class="mb-4">
                                <label for="transaction_title"
                                    class="block text-gray-700 font-semibold mb-2">Title</label>
                                <input v-model="transaction_title" id="transaction_title"
                                    class="w-full border border-gray-300 rounded-md p-2" />
                            </div>

                            <!-- Description -->
                            <div class="mb-4">
                                <label for="description"
                                    class="block text-gray-700 font-semibold mb-2">Description</label>
                                <input v-model="description" id="description"
                                    class="w-full border border-gray-300 rounded-md p-2" />
                            </div>

                            <!-- Fund dropdown -->
                            <div class="mb-4">
                                <label for="fund_id" class="block text-gray-700 font-semibold mb-2">Fund</label>
                                <select v-model="fund_id" id="fund_id"
                                    class="w-full border border-gray-300 rounded-md p-2" required>
                                    <option value="">Select Fund</option>
                                    <option v-for="fund in fundList" :key="fund.id" :value="fund.id">{{ fund.name }}
                                    </option>
                                </select>
                            </div>


                            <!-- Transaction Type dropdown -->
                            <div class="mb-4">
                                <label for="transaction_type" class="block text-gray-700 font-semibold mb-2">Transaction
                                    type</label>
                                <select v-model="transaction_type" id="transaction_type"
                                    class="w-full border border-gray-300 rounded-md p-2" required>
                                    <option value="">Select Type</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>

                            <!-- Transaction Amount input -->
                            <div class="mb-4">
                                <label for="amount" class="block text-gray-700 font-semibold mb-2">Amount</label>
                                <input v-model="amount" type="number" id="amount"
                                    class="w-full border border-gray-300 rounded-md p-2" min="0" required />
                            </div>
                        </div>

                        <!-- Images Upload -->
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Upload Images</label>
                            <div class="space-y-3">
                                <div v-for="(file, index) in images" :key="file.id" class="flex items-center gap-4">
                                    <input type="file" class="border border-gray-300 rounded-md py-2 px-4"
                                        accept="image/*" @change="event => handleFileChange(event, images, index)" />

                                    <div v-if="file.file && file.file.preview"
                                        class="w-16 h-16 border rounded-md overflow-hidden">
                                        <img :src="file.file.preview" alt="Preview"
                                            class="w-full h-full object-cover" />
                                    </div>

                                    <button type="button"
                                        class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                                        @click="removeFile(images, index)">X</button>
                                </div>
                            </div>
                            <button type="button"
                                class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                                @click="() => addMoreFiles(images)">
                                Add more image
                            </button>
                        </div>

                        <!-- Documents Upload -->
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Upload Documents</label>
                            <div class="space-y-3">
                                <div v-for="(file, index) in documents" :key="file.id" class="flex items-center gap-4">
                                    <input type="file" class="border border-gray-300 rounded-md py-2 px-4"
                                        accept=".pdf,.doc,.docx"
                                        @change="event => handleFileChange(event, documents, index)" />

                                    <span v-if="file.file" class="truncate w-32">{{ file.file.name }}</span>

                                    <button type="button"
                                        class="bg-red-500 text-white px-2 py-1 text-sm hover:bg-red-600"
                                        @click="removeFile(documents, index)">X</button>
                                </div>
                            </div>
                            <button type="button"
                                class="mt-3 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                                @click="() => addMoreFiles(documents)">
                                Add more document
                            </button>
                        </div>

                        <!-- Submit button -->
                        <div class="flex justify-center pt-5 pb-3">
                            <button type="submit" class="bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 mr-2">
                                {{ selectedTransactionId ? 'Update' : 'Submit' }}
                            </button>
                            <button type="button" @click="closeModal"
                                class="bg-red-600 text-white rounded-md p-2 hover:bg-red-700">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- Transaction list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Transaction List</h5>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="border px-4 py-2 min-w-[10px]">SL</th>
                            <th class="p-2 border border-gray-300 min-w-[100px]">Date</th>
                            <th class="p-2 border border-gray-300 min-w-[130px]">Transaction ID</th>
                            <th class="p-2 border border-gray-300 min-w-[100px]">Title</th>
                            <!-- <th class="p-2 border border-gray-300 min-w-[120px]">Description</th> -->
                            <th class="p-2 border border-gray-300 min-w-[100px]">Fund</th>
                            <th class="p-2 border border-gray-300 min-w-[100px]">Income</th>
                            <th class="p-2 border border-gray-300 min-w-[100px]">Expense</th>
                            <!-- <th class="p-2 border border-gray-300 min-w-[110px]">Balance</th> -->
                            <th class="p-2 border border-gray-300 min-w-[100px]">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="(transaction, index) in transactionList" :key="transaction.id">
                            <td class="p-2 border">{{ index + 1 }}</td>
                            <td class="p-2 border">{{ transaction.date }}</td>
                            <td class="p-2 border">{{ transaction.transaction_code }}</td>
                            <td class="p-2 border">{{ transaction.transaction_title }}</td>
                            <!-- <td class="p-2 border">{{ transaction.description }}</td> -->
                            <td class="p-2 border">{{ transaction.fund_name }}</td>
                            <td class="p-2 border" v-if="transaction.type === 'income'">
                                {{ transaction.amount }}
                            </td>
                            <td class="p-2 border" v-else></td>
                            <td class="p-2 border" v-if="transaction.type === 'expense'">
                                {{ transaction.amount }}
                            </td>
                            <td class="p-2 border" v-else></td>
                            <!-- <td class="p-2 border">{{ transaction.balance_after }}</td> -->

                            <td class="p-2 border flex gap-2">
                                <button @click="openModal(transaction)"
                                    class="bg-green-600 text-white rounded-md py-1 px-2 hover:bg-green-700">
                                    Edit
                                </button>
                                <button @click="deleteTransaction(transaction.id)"
                                    class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </section>

    </div>
</template>

<style scoped>
.left-color-shade {
    background-color: rgba(76, 175, 80, 0.1);
    /* Slightly green background */
}
</style>
