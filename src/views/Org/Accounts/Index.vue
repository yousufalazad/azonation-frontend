<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id;
const transaction_date = ref('');
const transaction_type = ref('');
const title = ref('');
const transaction_amount = ref(0);
const description = ref(''); 
const isEditMode = ref(false);
const selectedTransactionId = ref(null);
const transactionList = ref([]);

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
    transaction_date.value = '';
    transaction_type.value = '';
    title.value = '';
    description.value = '';
    transaction_amount.value = 0;
    // isEditMode.value = false;
    selectedTransactionId.value = null;
};

// Add or update transaction
const submitForm = async () => {
    const payload = {
        user_id: userId,
        transaction_date: transaction_date.value,
        title: title.value,
        description: description.value,
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
    title.value = transaction.title;
    description.value = transaction.description;
    transaction_type.value = transaction.transaction_type;
    transaction_amount.value = transaction.transaction_amount;
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

//fetch transactions on mount
onMounted(() => {
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
                    <label for="transaction_date" class="block text-gray-700 font-semibold mb-2">Transaction date</label>
                    <input v-model="transaction_date" type="date" id="transaction_date" class="w-full border border-gray-300 rounded-md py-2 px-4" :max="new Date().toISOString().split('T')[0]" required />
                </div>

                <!-- Title -->
                <div class="mb-4">
                    <label for="title" class="block text-gray-700 font-semibold mb-2">Title</label>
                    <input v-model="title"  id="title" type="text" class="w-full border border-gray-300 rounded-md" style="min-height: 50px;"></input>
                </div>

                <!-- Description -->
                <div class="mb-4">
                    <label for="description" class="block text-gray-700 font-semibold mb-2">Note</label>
                    <input v-model="description"  id="description" type="text" class="w-full border border-gray-300 rounded-md" style="min-height: 50px;"></input>
                </div>

                <!-- Fund dropdown -->
                <div class="mb-4">
                    <label for="transaction_type" class="block text-gray-700 font-semibold mb-2">Fund</label>
                    <select v-model="transaction_type" id="transaction_type" class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="">Select fund</option>
                        <option value="1">Fund name 1</option>
                        <option value="2">Fund name 2</option>
                    </select>
                </div>

                <!-- Transaction Type dropdown -->
                <div class="mb-4">
                    <label for="transaction_type" class="block text-gray-700 font-semibold mb-2">Transaction type</label>
                    <select v-model="transaction_type" id="transaction_type" class="w-full border border-gray-300 rounded-md py-2 px-4">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                <!-- Transaction Amount input -->
                <div class="mb-4">
                    <label for="transaction_amount" class="block text-gray-700 font-semibold mb-2">Amount</label>
                    <input v-model="transaction_amount" type="number" id="transaction_amount" class="w-full border border-gray-300 rounded-md py-2 px-4" min="0" required />
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
                <th class="py-2 px-4 border border-gray-300">Date</th>
                <th class="py-2 px-4 border border-gray-300">Transaction ID</th>
                <th class="py-2 px-4 border border-gray-300">Title</th>
                <th class="py-2 px-4 border border-gray-300">Note</th>
                <th class="py-2 px-4 border border-gray-300">Income</th>
                <th class="py-2 px-4 border border-gray-300">Expense</th>
                <th class="py-2 px-4 border border-gray-300">Balance</th>
                <th class="py-2 px-4 border border-gray-300">Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(transaction, index) in transactionList" :key="transaction.id">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ transaction.transaction_date }}</td>
                <td class="py-2 px-4 border">{{ transaction.transaction_id }}</td>
                <td class="py-2 px-4 border">{{ transaction.title }}</td>
                <td class="py-2 px-4 border">{{ transaction.description }}</td>
                <td class="py-2 px-4 border" v-if="transaction.transaction_type === 'income'">
                    {{ transaction.transaction_amount }}
                </td>
                <td class="py-2 px-4 border" v-else></td>
                <td class="py-2 px-4 border" v-if="transaction.transaction_type === 'expense'">
                    {{ transaction.transaction_amount }}
                </td>
                <td class="py-2 px-4 border" v-else></td>
                <td class="py-2 px-4 border">{{ transaction.balance }}</td>

                <td class="py-2 px-4 border flex gap-2">
                    <button @click="editTransaction(transaction)" class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                    <button @click="deleteTransaction(transaction.id)" class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
</section>

    </div>
</template>

<style scoped>
.left-color-shade {
    background-color: rgba(76, 175, 80, 0.1); /* Slightly green background */
}
</style>
