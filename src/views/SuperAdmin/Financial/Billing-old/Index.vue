<!-- Billing Index.vue -->
<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const billingList = ref([]);

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const getRecords = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/management-and-storage-billings`, {}, 'GET');
    console.log(response.data);

    billingList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Delete a meeting
const deleteRecord = async (billingId) => {
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
      const response = await auth.fetchProtectedApi(`/api/management-and-storage-billings/${billingId}`, {}, 'DELETE');
      if (response.status) {
        billingList.value = billingList.value.filter(record => record.id !== billingId);
        Swal.fire('Deleted!', 'Billing has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete meeting.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete meeting.', 'error');
  }
};

onMounted(() => getRecords());
</script>

<template>
  <div class="max-w-7xl mx-auto w-10/12">
    <section>
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Billing List</h5>
        <div>
          <button @click="$router.push({ name: 'super-admin-billing-create' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
            Add Billing
          </button>
        </div>
      </div>
      <!-- Table container inside the card body -->
      <div v-if="billingList.length" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-2 px-4 border">Sl</th>
                <th class="py-2 px-4 border">Billing ID</th>
                <th class="py-2 px-4 border">Item</th>
                <th class="py-2 px-4 border">period_start</th>
                <th class="py-2 px-4 border">period_end</th>
                <th class="py-2 px-4 border">service_month</th>
                <th class="py-2 px-4 border">billing_month</th>
                <th class="py-2 px-4 border">active_member_count</th>
                <th class="py-2 px-4 border">billable_active_member_count</th>
                <th class="py-2 px-4 border">member_daily_rate</th>
                <th class="py-2 px-4 border">total_bill_amount</th>
                <th class="py-2 px-4 border">status</th>
                <th class="py-2 px-4 border">is_active</th>
                <th class="py-2 px-4 border">admin_notes</th>
                <th class="border px-1 py-3 text-left" style="width:300px">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(bill, index) in billingList" :key="bill.id">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ bill.billing_code }}</td>
                <td class="py-2 px-4 border">{{ bill.item_name }}</td>
                <td class="py-2 px-4 border">{{ formatDate(bill.period_start) }}</td>
                <td class="py-2 px-4 border">{{ formatDate(bill.period_end) }}</td>
                <td class="py-2 px-4 border">{{ bill.service_month }}</td>
                <td class="py-2 px-4 border">{{ bill.billing_month }}</td>
                <td class="py-2 px-4 border">{{ bill.active_member_count }}</td>
                <td class="py-2 px-4 border">{{ bill.billable_active_member_count }}</td>
                <td class="py-2 px-4 border">{{ bill.member_daily_rate }}</td>
                <td class="py-2 px-4 border">{{ bill.total_bill_amount }}</td>
                <td class="py-2 px-4 border">{{ bill.status }}</td>
                <td class="py-2 px-4 border">{{ bill.is_active }}</td>
                <td class="py-2 px-4 border">{{ bill.admin_notes }}</td>
                <td class="py-2 px-4 border">
                  <button @click="$router.push({ name: 'super-admin-billing-edit', params: { id: bill.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                  <button @click="$router.push({ name: 'super-admin-billing-view', params: { id: bill.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                  <button @click="deleteRecord(bill.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-4">
        <p class="text-center text-gray-500">No billings available. Click "Create Billing" to add a new one.</p>
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