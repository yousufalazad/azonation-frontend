<script setup>
import { ref, onMounted } from 'vue';
import Quill from 'quill';
import Swal from 'sweetalert2';
import DOMPurify from 'dompurify';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id;
const transaction_date = ref('');
const transaction_type = ref(''); // Default to "In"
const transaction_amount = ref(0);
const description = ref(''); // Managed by Quill 
const quillInstance = ref(null);
const isEditMode = ref(false);
const selectedTransactionId = ref(null);
const transactionList = ref([]);

// Fetch list of transactions
const getTransactions = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-transactions', {}, 'GET');
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

// Initialize Quill editor
const initializeQuill = () => {
    quillInstance.value = new Quill('#description-editor', {
        theme: 'snow',
        placeholder: 'Enter description...',
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link']
            ]
        }
    });

    quillInstance.value.on('text-change', () => {
        description.value = quillInstance.value.root.innerHTML;
    });
};

// Reset form fields
const resetForm = () => {
    transaction_date.value = '';
    transaction_type.value = '';
    transaction_amount.value = 0;
    quillInstance.value.root.innerHTML = '';
    isEditMode.value = false;
    selectedTransactionId.value = null;
};

// Add or update a transaction
const submitForm = async () => {
    const payload = {
        user_id: userId,
        transaction_date: transaction_date.value,
        transaction_type: transaction_type.value,
        transaction_amount: transaction_amount.value,
        description: description.value
    };

    try {
        let apiUrl = '/api/create-transaction';
        let method = 'POST';

        if (isEditMode.value && selectedTransactionId.value) {
            apiUrl = `/api/update-transaction/${selectedTransactionId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this transaction?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Transaction ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getTransactions();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save transaction.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} transaction:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} transaction.`, 'error');
    }
};

// Edit transaction
const editTransaction = (transaction) => {
    transaction_date.value = transaction.transaction_date;
    transaction_type.value = transaction.transaction_type;
    transaction_amount.value = transaction.transaction_amount;
    quillInstance.value.root.innerHTML = transaction.description;
    selectedTransactionId.value = transaction.id;
    isEditMode.value = true;
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
            const response = await auth.fetchProtectedApi(`/api/delete-transaction/${id}`, {}, 'DELETE');

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

// Sanitize the HTML content
const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'br', 'img'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    });
};

// Initialize Quill and fetch transactions on mount
onMounted(() => {
    initializeQuill();
    getTransactions();
});
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <div>
                    <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Transaction</h5>
                </div>
            </div>
            <form @submit.prevent="submitForm">
                <!-- Transaction Date -->
                <div class="mb-4">
                    <label for="transaction_date" class="block text-gray-700 font-semibold mb-2">Transaction Date</label>
                    <input v-model="transaction_date" type="date" id="transaction_date" class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                </div>

                <!-- Fund name dropdown -->
                <div class="mb-4">
                    <label for="transaction_type" class="block text-gray-700 font-semibold mb-2">From/To which fund</label>
                    <select v-model="transaction_type" id="transaction_type" class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="income">Overall</option>
                        <option value="expense">Fund name 1</option>
                        <option value="expense">Fund name 2</option>
                    </select>
                </div>

                <!-- Transaction Type dropdown -->
                <div class="mb-4">
                    <label for="transaction_type" class="block text-gray-700 font-semibold mb-2">Transaction Type</label>
                    <select v-model="transaction_type" id="transaction_type" class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="income">income</option>
                        <option value="expense">expense</option>
                    </select>
                </div>

                <!-- Transaction Amount input -->
                <div class="mb-4">
                    <label for="transaction_amount" class="block text-gray-700 font-semibold mb-2">Amount</label>
                    <input v-model="transaction_amount" type="number" id="transaction_amount" class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                </div>

                <!-- Description Quill editor -->
                <div class="mb-4">
                    <label for="description-editor" class="block text-gray-700 font-semibold mb-2">Description</label>
                    <div id="description-editor" class="w-full border border-gray-300 rounded-md" style="min-height: 150px;"></div>
                </div>

                <!-- Submit button -->
                <div>
                    <button type="submit" class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">{{ isEditMode ? 'Update' : 'Submit' }}</button>
                </div>
            </form>
        </section>

        <!-- Transaction list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Transaction List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Transaction ID</th>
                        <th class="py-2 px-4 border border-gray-300">Transaction Date</th>
                        <th class="py-2 px-4 border border-gray-300">Transaction Type</th>
                        <th class="py-2 px-4 border border-gray-300">Amount</th>
                        <th class="py-2 px-4 border border-gray-300">Description</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(transaction, index) in transactionList" :key="transaction.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ transaction.transaction_date }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ transaction.transaction_type }}</td>
                        <td class="py-2 px-4 border border-gray-300">{{ transaction.transaction_amount }}</td>
                        <td class="py-2 px-4 border border-gray-300" v-html="sanitize(transaction.description)"></td>
                        <td class="py-2 px-4 border border-gray-300">
                            <button @click="editTransaction(transaction)" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Edit</button>
                            <button @click="deleteTransaction(transaction.id)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style scoped>
.left-color-shade {
    border-left: 5px solid #4C51BF;
}
</style>
