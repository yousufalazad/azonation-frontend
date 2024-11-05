<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const auth = authStore;
const userId = auth.user.id;
const date = ref('');
const type = ref('');
const transaction_title = ref('');
const amount = ref(0);
const description = ref('');
const selectedTransactionId = ref(null);
const transactionList = ref([]);
const showModal = ref(false);
const isEditMode = ref(false);


// Fetch transactions
const getTransactions = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-transactions', {}, 'GET');
        transactionList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        transactionList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    date.value = '';
    type.value = '';
    transaction_title.value = '';
    description.value = '';
    amount.value = 0;
    selectedTransactionId.value = null;
};

// Add or update transaction
const submitForm = async () => {
    const payload = {
        user_id: userId,
        date: date.value,
        transaction_title: transaction_title.value,
        description: description.value,
        type: type.value,
        amount: amount.value
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
                showModal.value = false; // Close the modal after submission
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
    date.value = transaction.date;
    transaction_title.value = transaction.transaction_title;
    description.value = transaction.description;
    type.value = transaction.type;
    amount.value = transaction.amount;
    selectedTransactionId.value = transaction.id;
    isEditMode.value = true;
    showModal.value = true; // Open modal for editing
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

// Fetch transactions on mount
onMounted(() => {
    getTransactions();
});

// Navigate to add form
const funds = () => {
    router.push({ name: 'accounts-fund' });
};
</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Transaction List</h5>
                <div>
                    <button @click="showModal = true"
                        class="bg-blue-600 text-white rounded-md py-2 px-4 mx-4 hover:bg-blue-700">{{ isEditMode ?
                        'Edit' : 'Add' }} Transaction</button>

                    <button @click="funds"
                        class="bg-yellow-500 text-white rounded-md py-2 px-4 mx-4 hover:bg-yellow-600">Add
                        Found</button>
                </div>

            </div>

            <!-- Transaction Modal -->
            <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-lg w-2/4 h-auto max-h-[80%] overflow-y-auto p-5">

                    <div class="flex justify-between left-color-shade bg-blue-100 py-2 mt-3 mb-5">
                        <h5 class="text-md font-semibold my-2">{{ isEditMode ? 'Edit' : 'Add' }} Transaction</h5>
                    </div>
                    <form @submit.prevent="submitForm">

                        <!-- Input Fields Row -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">

                            <!-- Transaction Date -->
                            <div>
                                <label for="date" class="block text-gray-700 font-semibold mb-2">Transaction
                                    date</label>
                                <input v-model="date" type="date" id="date"
                                    class="w-full border border-gray-300 rounded-md py-1 px-4"
                                    :max="new Date().toISOString().split('T')[0]" required />
                            </div>
                            
                            <!-- Title -->
                            <div>
                                <label for="transaction_title" class="block text-gray-700 font-semibold mb-2">Title</label>
                                <input v-model="transaction_title" id="transaction_title" type="text"
                                    class="w-full border border-gray-300 rounded-md py-1 px-4" min="0" required />
                            </div>

                            <!-- Description -->
                            <div>
                                <label for="description" class="block text-gray-700 font-semibold mb-2">Note</label>
                                <input v-model="description" id="description" type="text"
                                    class="w-full border border-gray-300 rounded-md py-1 px-4" min="0" required />
                            </div>

                            <!-- Fund dropdown -->
                            <div>
                                <label for="transaction_type"
                                    class="block text-gray-700 font-semibold mb-2">Fund</label>
                                <select v-model="transaction_type" id="transaction_type"
                                    class="w-full border border-gray-300 rounded-md py-1 px-4">
                                    <option value="">Select fund</option>
                                    <option value="1">Fund name 1</option>
                                    <option value="2">Fund name 2</option>
                                </select>
                            </div>

                            <!-- Transaction Type dropdown -->
                            <div>
                                <label for="type" class="block text-gray-700 font-semibold mb-2">Transaction
                                    type</label>
                                <select v-model="type" id="type"
                                    class="w-full border border-gray-300 rounded-md py-1 px-4">
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>

                            <!-- Transaction Amount input -->
                            <div>
                                <label for="amount"
                                    class="block text-gray-700 font-semibold mb-2">Amount</label>
                                <input v-model="amount" type="number" id="amount"
                                    class="w-full border border-gray-300 rounded-md py-1 px-4" min="0" required />
                            </div>
                        </div>

                        <!-- Submit button -->
                        <div class="flex justify-center pt-5 pb-3">
                            <button type="submit"
                                class="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 mr-2">
                                {{ isEditMode ? 'Update' : 'Submit' }}
                            </button>
                            <button type="button" @click="showModal = false"
                                class="bg-red-600 text-white rounded-md py-2 px-4 hover:bg-red-700">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Transaction ID</th>
                        <th class="py-2 px-4 border border-gray-300">Date</th>
                        <th class="py-2 px-4 border border-gray-300">Title</th>
                        <th class="py-2 px-4 border border-gray-300">Description</th>
                        <th class="py-2 px-4 border border-gray-300">Fund</th>
                        <th class="py-2 px-4 border border-gray-300">Type</th>
                        <th class="py-2 px-4 border border-gray-300">Amount</th>
                        <th class="py-2 px-4 border border-gray-300">Balance</th>
                        <th class="py-2 px-4 border border-gray-300">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(transaction, index) in transactionList" :key="transaction.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="border px-4 py-2">{{ transaction.transaction_code }}</td>
                        <td class="border px-4 py-2">{{ transaction.date }}</td>
                        <td class="border px-4 py-2">{{ transaction.transaction_title }}</td>
                        <td class="border px-4 py-2">{{ transaction.description }}</td>
                        <td class="border px-4 py-2">{{ transaction.fund_id }}</td>
                        <td class="border px-4 py-2">{{ transaction.type }}</td>
                        <td class="border px-4 py-2">{{ transaction.amount }}</td>
                        <td class="border px-4 py-2">{{ transaction.balance_after }}</td>
                        <td class="border px-4 py-2">
                            <button @click="editTransaction(transaction)"
                                class="text-yellow-600 hover:text-yellow-800">Edit</button>
                            <button @click="deleteTransaction(transaction.id)"
                                class="text-red-600 hover:text-red-800 ml-2">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style scoped>
/* Add styles as needed */
</style>
