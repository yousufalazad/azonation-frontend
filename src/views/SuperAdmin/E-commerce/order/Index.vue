<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const orderList = ref([]);

const getOrders = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-orders`, {}, 'GET');
    console.log(response.data);

    orderList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

const deleteOrder = async (orderId) => {
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
      const response = await auth.fetchProtectedApi(`/api/delete-order/${orderId}`, {}, 'DELETE');
      if (response.status) {
        orderList.value = orderList.value.filter(order => order.id !== orderId);
        Swal.fire('Deleted!', 'Order has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete order.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete order.', 'error');
  }
};

onMounted(() => getOrders());
</script>

<template>
  <div class="max-w-7xl mx-auto w-10/12">
    <section>
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Order List</h5>
        <div>
          <button @click="$router.push({ name: 'order-create' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
            Add Order
          </button>
        </div>
      </div>
      <div v-if="orderList.length" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-2 px-4 border">Sl</th>
                <th class="py-2 px-4 border">Order Number</th>
                <th class="py-2 px-4 border">User Name</th>
                <th class="py-2 px-4 border">Total Amount</th>
                <th class="py-2 px-4 border">Discount</th>
                <th class="py-2 px-4 border">Shipping Status</th>
                <th class="py-2 px-4 border">Order Date</th>
                <th class="py-2 px-4 border">Status</th>
                <th class="py-2 px-4 border">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(order, index) in orderList" :key="order.id">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ order.order_number }}</td>
                <td class="py-2 px-4 border">{{ order.user_name }}</td>
                <td class="py-2 px-4 border">{{ order.total_amount }}</td>
                <td class="py-2 px-4 border">{{ order.discount_amount }}</td>
                <td class="py-2 px-4 border">{{ order.shipping_status }}</td>
                <td class="py-2 px-4 border">{{ order.order_date }}</td>
                <td class="py-2 px-4 border">{{ order.is_active ? 'Active' : 'Inactive' }}</td>
                <td class="py-2 px-4 border">
                  <button
                    @click="$router.push({ name: 'order-edit', params: { id: order.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                  <button
                    @click="$router.push({ name: 'order-view', params: { id: order.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                  <button @click="deleteOrder(order.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-4">
        <p class="text-center text-gray-500">No orders available. Click "Add Order" to create a new one.</p>
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