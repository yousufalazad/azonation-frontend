<script setup>
import { ref, watch, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';
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

// Form fields for Order Items
const order_items = ref([{
  product_id: '',
  product_name: '',
  product_attributes: '',
  unit_price: '',
  quantity: '',
  total_price: '',
  discount_amount: '',
  note: '',
  is_active: true,
}]);

// Fetch user list for order
const userList = ref([]);
const getUserList = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/get-org-user-list', {}, 'GET');
    userList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching user list:', error);
    userList.value = [];
  }
}
// Fetch user list for order
const productList = ref([]);
const getProducts = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/get-products`, {}, 'GET');
    console.log(response.data);

    productList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Reset the order form
const resetForm = () => {
  user_id.value = '';
  user_name.value = '';
  order_number.value = '';
  total_amount.value = '';
  discount_amount.value = '';
  shipping_cost.value = '';
  total_tax.value = '';
  currency.value = '';
  shipping_status.value = '';
  shipping_address.value = '';
  billing_address.value = '';
  coupon_code.value = '';
  shipping_method.value = '';
  shipping_note.value = '';
  customer_note.value = '';
  admin_note.value = '';
  tracking_number.value = '';
  order_date.value = '';
  delivery_date_expected.value = '';
  delivery_date_actual.value = '';
  status.value = '';
  cancelled_at.value = '';
  is_active.value = true;
  order_items.value = [{
    product_id: '',
    product_name: '',
    product_attributes: '',
    unit_price: '',
    quantity: '',
    total_price: '',
    discount_amount: '',
    note: '',
    is_active: true,
  }];
};

// Submit form
const submitForm = async () => {
  if (!user_id.value || !order_number.value || !total_amount.value || !shipping_address.value || !billing_address.value || !status.value) {
    Swal.fire('Error!', 'Please fill in all  fields.', 'error');
    return;
  }

  // Find user name based on user_id
  // const user_name = userList.value.find(user => user.id === user_id.value)?.name || 'Unknown';

  // Watch each order item and update the product_name when product_id changes
  watch(order_items, (newOrderItems) => {
    newOrderItems.forEach(item => {
      if (item.product_id) {
        const selectedProduct = productList.value.find(product => product.id === item.product_id);
        item.product_name = selectedProduct ? selectedProduct.name : 'Unknown'; // Ensure product_name is set
      }
    });
  }, { deep: true });


  const payload = {
    user_id: user_id.value,
    user_name: userList.value.find(user => user.id === user_id.value)?.name || 'Unknown',
    order_number: order_number.value,
    total_amount: total_amount.value,
    discount_amount: discount_amount.value,
    shipping_cost: shipping_cost.value,
    total_tax: total_tax.value,
    currency: currency.value,
    shipping_status: shipping_status.value,
    shipping_address: shipping_address.value,
    billing_address: billing_address.value,
    coupon_code: coupon_code.value,
    shipping_method: shipping_method.value,
    shipping_note: shipping_note.value,
    customer_note: customer_note.value,
    admin_note: admin_note.value,
    tracking_number: tracking_number.value,
    order_date: order_date.value,
    delivery_date_expected: delivery_date_expected.value,
    delivery_date_actual: delivery_date_actual.value,
    status: status.value,
    cancelled_at: cancelled_at.value,
    is_active: is_active.value,
    order_items: order_items.value,  // Use the updated order_items with product_name

  };

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi('/api/create-order', payload, 'POST');
      if (response.status) {
        Swal.fire('Success!', 'Order created successfully.', 'success').then(() => {
          resetForm();
          router.push({ name: 'orders-list' }); // Adjust route name to order list
        });
      } else {
        Swal.fire('Failed!', 'Failed to create the order.', 'error');
      }
    }
  } catch (error) {
    console.error('Error creating order:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

// Fetch data on mounted
onMounted(() => {
  getUserList();
  getProducts();
  resetForm();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Add New Order</h2>
      <button @click="$router.push({ name: 'orders-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Order List
      </button>
    </div>

    <!-- Order Form -->
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Order Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="user_id" class="block text-sm font-medium text-gray-700">User ID</label>
          <select v-model="user_id" id="user_id" class="w-full border border-gray-300 rounded-md p-2">
            <option value="">Select User</option>
            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }}</option>
          </select>
        </div>
        <div>
          <label for="order_number" class="block text-sm font-medium text-gray-700">Order Number</label>
          <input v-model="order_number" type="text" id="order_number" class="input-field" />
        </div>
      </div>

      <!-- Payment & Shipping Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="total_amount" class="block text-sm font-medium text-gray-700">Total Amount</label>
          <input v-model="total_amount" type="number" id="total_amount" class="input-field" />
        </div>


        <div>
          <label for="discount_amount" class="block text-sm font-medium text-gray-700">Discount Amount</label>
          <input v-model="discount_amount" type="number" id="discount_amount" class="input-field" />
        </div>
        <div>
          <label for="shipping_cost" class="block text-sm font-medium text-gray-700">Shipping Cost</label>
          <input v-model="shipping_cost" type="number" id="shipping_cost" class="input-field" />
        </div>
        <div>
          <label for="total_tax" class="block text-sm font-medium text-gray-700">Total Tax</label>
          <input v-model="total_tax" type="number" id="total_tax" class="input-field" />
        </div>

        <div>
          <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
          <input v-model="currency" type="text" id="currency" class="input-field" />
        </div>
        <div>
          <label for="shipping_status" class="block text-sm font-medium text-gray-700">Shipping Status</label>
          <select v-model="shipping_status" id="shipping_status"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full">
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div>
          <label for="shipping_method" class="block text-sm font-medium text-gray-700">Shipping Method</label>
          <select v-model="shipping_method" id="shipping_method"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full">
            <option value="">Select Method</option>
            <option value="Standard Shipping">Standard Shipping</option>
            <option value="Express Shipping">Express Shipping</option>
            <option value="Free Shipping">Free Shipping</option>
          </select>
        </div>
        <div>
          <label for="shipping_address" class="block text-sm font-medium text-gray-700">Shipping Address</label>
          <input v-model="shipping_address" type="text" id="shipping_address" class="input-field" />
        </div>
        <div>
          <label for="billing_address" class="block text-sm font-medium text-gray-700">Billing Address</label>
          <input v-model="billing_address" type="text" id="billing_address" class="input-field" />
        </div>
        <div>
          <label for="coupon_code" class="block text-sm font-medium text-gray-700">Coupon Code</label>
          <input v-model="coupon_code" type="text" id="coupon_code" class="input-field" />
        </div>
        <div>
          <label for="shipping_note" class="block text-sm font-medium text-gray-700">Shipping Note</label>
          <textarea v-model="shipping_note" id="shipping_note" class="input-field"></textarea>
        </div>
        <div>
          <label for="customer_note" class="block text-sm font-medium text-gray-700">Customer Note</label>
          <textarea v-model="customer_note" id="customer_note" class="input-field"></textarea>
        </div>
        <div>
          <label for="admin_note" class="block text-sm font-medium text-gray-700">Admin Note</label>
          <input v-model="admin_note" type="text" id="admin_note" class="input-field" />
        </div>
        <div>
          <label for="tracking_number" class="block text-sm font-medium text-gray-700">Tracking Number</label>
          <input v-model="tracking_number" type="text" id="tracking_number" class="input-field" />
        </div>
        <div>
          <label for="order_date" class="block text-sm font-medium text-gray-700">Order Date</label>
          <input v-model="order_date" type="date" id="order_date" class="input-field" />
        </div>
        <div>
          <label for="delivery_date_expected" class="block text-sm font-medium text-gray-700">Delivery Date
            Expected</label>
          <input v-model="delivery_date_expected" type="date" id="delivery_date_expected" class="input-field" />
        </div>
        <div>
          <label for="delivery_date_actual" class="block text-sm font-medium text-gray-700">Delivery Date Actual</label>
          <input v-model="delivery_date_actual" type="date" id="delivery_date_actual" class="input-field" />
        </div>
        <div>
          <label for="cancelled_at" class="block text-sm font-medium text-gray-700">Cancelled Date</label>
          <input v-model="cancelled_at" type="date" id="cancelled_at" class="input-field" />
        </div>
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="status" id="status" class="border mt-1 border-gray-300 rounded-md p-2 block w-full">
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label for="is_active" class="block text-sm font-medium text-gray-700">Is Active</label>
          <input type="checkbox" id="is_active" v-model="is_active"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
      </div>

      <!-- Order Items Section -->
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-700">Order Items</h3>
        <div v-for="(item, index) in order_items" :key="index" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="product_id" class="block text-sm font-medium text-gray-700">Product</label>
            <select v-model="item.product_id" id="product_id" class="w-full border border-gray-300 rounded-md p-2">
              <option value="">Select Product</option>
              <option v-for="product in productList" :key="product.id" :value="product.id">{{ product.name }}</option>
            </select>
          </div>

          <!-- Dynamically display product_name -->
          <div>
            <label for="product_name" class="block text-sm font-medium text-gray-700">Product Name</label>
            <input v-model="item.product_name" type="text" class="input-field" readonly />
          </div>
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
            <input v-model="item.quantity" type="number" class="input-field" />
          </div>
          <div>
            <label for="unit_price" class="block text-sm font-medium text-gray-700">Unit Price</label>
            <input v-model="item.unit_price" type="number" class="input-field" />
          </div>
          <div>
            <label for="total_price" class="block text-sm font-medium text-gray-700">Total Price</label>
            <input v-model="item.total_price" type="number" class="input-field" />
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between">
        <button type="button" @click="resetForm"
          class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-lg shadow">
          Reset
        </button>
        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
          Submit
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
}
</style>
