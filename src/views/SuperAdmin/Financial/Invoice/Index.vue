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
    const response = await auth.fetchProtectedApi(`/api/all-invoices`, {}, 'GET');
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
      const response = await auth.fetchProtectedApi(`/api/delete-invoice/${invoiceId}`, {}, 'DELETE');
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
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-2 px-4 border">Sl</th>
                <th class="py-2 px-4 border">Invoice Code</th>
                <th class="py-2 px-4 border">User ID</th>
                <th class="py-2 px-4 border">Billing ID</th>
                <th class="py-2 px-4 border">Item Name</th>
                <th class="py-2 px-4 border">Item Description</th>
                <th class="py-2 px-4 border">Generated At</th>
                <th class="py-2 px-4 border">Issued At</th>
                <th class="py-2 px-4 border">Due At</th>
                <th class="py-2 px-4 border">Subtotal Amount</th>
                <th class="py-2 px-4 border">Discount Description</th>
                <th class="py-2 px-4 border">Discount Value</th>
                <th class="py-2 px-4 border">Tax Amount</th>
                <th class="py-2 px-4 border">Credit Applied</th>
                <th class="py-2 px-4 border">Total Amount Due</th>
                <th class="py-2 px-4 border">Additional Note</th>
                <th class="py-2 px-4 border">Is Published</th>
                <th class="py-2 px-4 border">Payment Status</th>
                <th class="py-2 px-4 border">Status Reason</th>
                <th class="py-2 px-4 border">Admin Note</th>
                <th class="py-2 px-4 border">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(invoice, index) in invoiceList" :key="invoice.id">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ invoice.invoice_code }}</td>
                <td class="py-2 px-4 border">{{ invoice.user_id }}</td>
                <td class="py-2 px-4 border">{{ invoice.billing_id }}</td>
                <td class="py-2 px-4 border">{{ invoice.item_name }}</td>
                <td class="py-2 px-4 border">{{ invoice.item_description }}</td>
                <td class="py-2 px-4 border">{{ formatDate(invoice.generated_at) }}</td>
                <td class="py-2 px-4 border">{{ formatDate(invoice.issued_at) }}</td>
                <td class="py-2 px-4 border">{{ formatDate(invoice.due_at) }}</td>
                <td class="py-2 px-4 border">{{ invoice.subtotal_amount }}</td>
                <td class="py-2 px-4 border">{{ invoice.discount_description }}</td>
                <td class="py-2 px-4 border">{{ invoice.discount_value }}</td>
                <td class="py-2 px-4 border">{{ invoice.tax_amount }}</td>
                <td class="py-2 px-4 border">{{ invoice.credit_applied }}</td>
                <td class="py-2 px-4 border">{{ invoice.total_amount_due }}</td>
                <td class="py-2 px-4 border">{{ invoice.additional_note }}</td>
                <td class="py-2 px-4 border">{{ invoice.is_published }}</td>
                <td class="py-2 px-4 border">{{ invoice.payment_status }}</td>
                <td class="py-2 px-4 border">{{ invoice.status_reason }}</td>
                <td class="py-2 px-4 border">{{ invoice.admin_note }}</td>
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