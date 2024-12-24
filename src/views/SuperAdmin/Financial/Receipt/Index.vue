<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const receiptList = ref([]);

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const getReceipts = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-receipts`, {}, 'GET');
    console.log(response.data);

    receiptList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching receipts:', error);
  }
};

const deleteReceipt = async (receiptId) => {
  try {
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmed.isConfirmed) {
      const response = await auth.fetchProtectedApi(`/api/delete-receipt/${receiptId}`, {}, 'DELETE');
      if (response.status) {
        receiptList.value = receiptList.value.filter(receipt => receipt.id !== receiptId);
        Swal.fire('Deleted!', 'Receipt has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete receipt.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete receipt.', 'error');
  }
};

onMounted(() => getReceipts());
</script>

<template>
  <div class="max-w-7xl mx-auto w-10/12">
    <section>
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Receipt List</h5>
        <div>
          <button @click="$router.push({ name: 'super-admin-receipt-create' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
            Add Receipt
          </button>
        </div>
      </div>
      <div v-if="receiptList.length" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-2 px-4 border">Sl</th>
                <th class="py-2 px-4 border">Receipt Code</th>
                <th class="py-2 px-4 border">Invoice ID</th>
                <th class="py-2 px-4 border">User ID</th>
                <th class="py-2 px-4 border">Amount Received</th>
                <th class="py-2 px-4 border">Payment Method</th>
                <th class="py-2 px-4 border">Transaction Reference</th>
                <th class="py-2 px-4 border">Payment Date</th>
                <th class="py-2 px-4 border">Note</th>
                <th class="py-2 px-4 border">Status</th>
                <th class="py-2 px-4 border">Admin Note</th>
                <th class="py-2 px-4 border">Published</th>
                <th class="py-2 px-4 border">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(receipt, index) in receiptList" :key="receipt.id">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ receipt.receipt_code }}</td>
                <td class="py-2 px-4 border">{{ receipt.invoice_id }}</td>
                <td class="py-2 px-4 border">{{ receipt.user_id }}</td>
                <td class="py-2 px-4 border">{{ receipt.amount_received }}</td>
                <td class="py-2 px-4 border">{{ receipt.payment_method }}</td>
                <td class="py-2 px-4 border">{{ receipt.transaction_reference }}</td>
                <td class="py-2 px-4 border">{{ formatDate(receipt.payment_date) }}</td>
                <td class="py-2 px-4 border">{{ receipt.note }}</td>
                <td class="py-2 px-4 border">{{ receipt.status }}</td>
                <td class="py-2 px-4 border">{{ receipt.admin_note }}</td>
                <td class="py-2 px-4 border">{{ receipt.is_published ? 'Yes' : 'No' }}</td>
                <td class="py-2 px-4 border">
                  <button
                    @click="$router.push({ name: 'super-admin-receipt-edit', params: { id: receipt.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                  <button
                    @click="$router.push({ name: 'super-admin-receipt-view', params: { id: receipt.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                  <button @click="deleteReceipt(receipt.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-4">
        <p class="text-center text-gray-500">No receipts available. Click "Add Receipt" to create a new one.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  padding: 5px;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

td {
  border-bottom: 1px solid #ddd;
}

button {
  margin-right: 5px;
}
</style>
