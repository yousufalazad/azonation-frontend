<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { authStore } from '../../../../store/authStore';

const route = useRoute();
const router = useRouter();
const auth = authStore;

// Form fields for Order
const user_id = ref('');
const user_name = ref('');
const order_number = ref('');
const total_amount = ref('');
const discount_amount = ref('');
const shipping_cost = ref('');
const total_tax = ref('');
const currency = ref('');
const shipping_status = ref('');
const shipping_address = ref('');
const billing_address = ref('');
const coupon_code = ref('');
const shipping_method = ref('');
const shipping_note = ref('');
const customer_note = ref('');
const admin_note = ref('');
const tracking_number = ref('');
const order_date = ref('');
const delivery_date_expected = ref('');
const delivery_date_actual = ref('');
const status = ref('');
const cancelled_at = ref('');
const is_active = ref(true);

// Order Items Data
const order_items = ref([]);

// Fetch user list for order (No editing needed)
const userList = ref([]);
const getUserList = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/get-org-user-list', {}, 'GET');
    userList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching user list:', error);
    userList.value = [];
  }
};

// Fetch products for order (Not necessary for view)
const productList = ref([]);
const getProducts = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-products`, {}, 'GET');
    productList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Load existing order data for viewing
const loadOrderData = async () => {
  try {
    const orderId = route.params.id;
    const response = await auth.fetchProtectedApi(`/api/get-order/${orderId}`, {}, 'GET');
    if (response.status) {
      const order = response.data;
      user_id.value = order.user_id;
      user_name.value = order.user_name;
      order_number.value = order.order_number;
      total_amount.value = order.total_amount;
      discount_amount.value = order.discount_amount;
      shipping_cost.value = order.shipping_cost;
      total_tax.value = order.total_tax;
      currency.value = order.currency;
      shipping_status.value = order.shipping_status;
      shipping_address.value = order.shipping_address;
      billing_address.value = order.billing_address;
      coupon_code.value = order.coupon_code;
      shipping_method.value = order.shipping_method;
      shipping_note.value = order.shipping_note;
      customer_note.value = order.customer_note;
      admin_note.value = order.admin_note;
      tracking_number.value = order.tracking_number;
      order_date.value = order.order_date;
      delivery_date_expected.value = order.delivery_date_expected;
      delivery_date_actual.value = order.delivery_date_actual;
      status.value = order.status;
      cancelled_at.value = order.cancelled_at;
      is_active.value = order.is_active;
      order_items.value = order.order_items || [];
    } else {
      Swal.fire('Error!', 'Failed to load order data.', 'error').then(() => {
        router.push({ name: 'orders-list' });
      });
    }
  } catch (error) {
    console.error('Error loading order data:', error);
    Swal.fire('Error!', 'An error occurred while loading order data.', 'error').then(() => {
      router.push({ name: 'orders-list' });
    });
  }
};

// Fetch data on mounted
onMounted(() => {
  getUserList();
  getProducts();
  loadOrderData();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">View Order</h2>
      <button @click="$router.push({ name: 'orders-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Order List
      </button>
    </div>

    <!-- Order Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="user_id" class="block text-sm font-medium text-gray-700">User ID</label>
        <input v-model="user_id" type="text" id="user_id" class="input-field" disabled />
      </div>
      <div>
        <label for="order_number" class="block text-sm font-medium text-gray-700">Order Number</label>
        <input v-model="order_number" type="text" id="order_number" class="input-field" disabled />
      </div>
    </div>

    <!-- Payment & Shipping Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="total_amount" class="block text-sm font-medium text-gray-700">Total Amount</label>
        <input v-model="total_amount" type="number" id="total_amount" class="input-field" disabled />
      </div>
      <div>
        <label for="discount_amount" class="block text-sm font-medium text-gray-700">Discount Amount</label>
        <input v-model="discount_amount" type="number" id="discount_amount" class="input-field" disabled />
      </div>
      <div>
        <label for="shipping_cost" class="block text-sm font-medium text-gray-700">Shipping Cost</label>
        <input v-model="shipping_cost" type="number" id="shipping_cost" class="input-field" disabled />
      </div>
      <div>
        <label for="total_tax" class="block text-sm font-medium text-gray-700">Total Tax</label>
        <input v-model="total_tax" type="number" id="total_tax" class="input-field" disabled />
      </div>
      <div>
        <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
        <input v-model="currency" type="text" id="currency" class="input-field" disabled />
      </div>
      <div>
        <label for="shipping_status" class="block text-sm font-medium text-gray-700">Shipping Status</label>
        <input v-model="shipping_status" type="text" id="shipping_status" class="input-field" disabled />
      </div>
      <div>
        <label for="shipping_method" class="block text-sm font-medium text-gray-700">Shipping Method</label>
        <input v-model="shipping_method" type="text" id="shipping_method" class="input-field" disabled />
      </div>
      <div>
        <label for="shipping_address" class="block text-sm font-medium text-gray-700">Shipping Address</label>
        <input v-model="shipping_address" type="text" id="shipping_address" class="input-field" disabled />
      </div>
      <div>
        <label for="billing_address" class="block text-sm font-medium text-gray-700">Billing Address</label>
        <input v-model="billing_address" type="text" id="billing_address" class="input-field" disabled />
      </div>
      <div>
        <label for="coupon_code" class="block text-sm font-medium text-gray-700">Coupon Code</label>
        <input v-model="coupon_code" type="text" id="coupon_code" class="input-field" disabled />
      </div>
    </div>

    <!-- Order Items -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold text-gray-700 mb-4">Order Items</h3>
      <div v-for="(item, index) in order_items" :key="index" class="border p-4 mb-4">
        <p><strong>Product Name:</strong> {{ item.product_name }}</p>
        <p><strong>Quantity:</strong> {{ item.quantity }}</p>
        <p><strong>Unit Price:</strong> {{ item.unit_price }}</p>
        <p><strong>Total Price:</strong> {{ item.total_price }}</p>
      </div>
    </div>
  </div>
</template>
