<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const invoiceList = ref([]);

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const getRecords = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/invoices/all`, {}, 'GET');
    console.log(response.data);

    invoiceList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
  }
};

const deleteRecord = async (invoiceId) => {
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
      const response = await auth.fetchProtectedApi(`/api/invoices/${invoiceId}`, {}, 'DELETE');
      if (response.status) {
        invoiceList.value = invoiceList.value.filter(record => record.id !== invoiceId);
        Swal.fire('Deleted!', 'Invoice has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete invoice.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete invoice.', 'error');
  }
};

onMounted(() => getRecords());
</script>

<template>
  <div class="max-w-7xl mx-auto w-10/12">
    <section>
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Invoice List</h5>
        <div>
          <button @click="$router.push({ name: 'super-admin-invoice-create' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
            Add Invoice
          </button>
        </div>
      </div>
      <div v-if="invoiceList.length" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white shadow-md rounded-lg border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Invoice Code</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Billing Code</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Order Code</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Order ID</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">User ID</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">User Name</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Description</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Total Amount</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Amount Paid</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Balance Due</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Currency Code</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Generate Date</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Issue Date</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Due Date</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Terms</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Invoice Note</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Published</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Invoice Status</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Payment Status</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Admin Note</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Active</th>
                <th class="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(invoice, index) in invoiceList" :key="invoice.id">
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.invoice_code }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.billing_code }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.order_code }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.order_id }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.user_id }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.user_name }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.description }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.total_amount }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.amount_paid }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.balance_due }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.currency_code }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.generate_date }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.issue_date }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.due_date }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.terms }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.invoice_note }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.is_published ? 'Yes' : 'No' }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.invoice_status }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.payment_status }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.admin_note }}</td>
                <td class="px-4 py-2 border-b text-sm text-gray-700">{{ invoice.is_active ? 'Active' : 'Inactive' }}
                </td>
                <td class="py-2 px-4 border">
                  <button @click="$router.push({ name: 'super-admin-invoice-edit', params: { id: invoice.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                  <button @click="$router.push({ name: 'super-admin-invoice-view', params: { id: invoice.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                  <button @click="deleteRecord(invoice.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-4">
        <p class="text-center text-gray-500">No invoices available. Click "Create Invoice" to add a new one.</p>
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