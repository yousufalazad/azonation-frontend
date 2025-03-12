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
const billing_code = ref('');
const order_code = ref('');
const order_date = ref('');
const sub_total = ref('');
const discount_amount = ref('');
const shipping_cost = ref('');
const total_tax = ref('');
const credit_applied = ref('');
const total_amount = ref('');
const discount_title = ref('');
const tax_rate = ref('');
const currency_code = ref('');
const coupon_code = ref('');
const payment_method = ref('');
const billing_address = ref('');
const user_country = ref('');
const user_region = ref('');
const is_active = ref(true);

const shipping_address = ref('');
const shipping_status = ref('');
const shipping_method = ref('');
const shipping_note = ref('');
const customer_note = ref('');
const admin_note = ref('');
const tracking_number = ref('');
const delivery_date_expected = ref('');
const delivery_date_actual = ref('');
const order_status = ref('');
const cancelled_at = ref('');
const cancellation_reason = ref('');

// Order Items Data
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
    const response = await auth.fetchProtectedApi('/api/project-attendances/org-user-list', {}, 'GET');
    userList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching user list:', error);
    userList.value = [];
  }
}

// Fetch products for order
const productList = ref([]);
const getProducts = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/products`, {}, 'GET');
    console.log(response.data);

    productList.value = response.status ? response.data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Load existing order data for editing
const loadOrderData = async () => {
  try {
    const orderId = route.params.id;
    const response = await auth.fetchProtectedApi(`/api/orders/${orderId}`, {}, 'GET');
    if (response.status) {
      const order = response.data;
      user_id.value = order.user_id;
      user_name.value = order.user_name;
      billing_code.value = order.billing_code;
      order_code.value = order.order_code;
      order_date.value = order.order_date;
      sub_total.value = order.sub_total;
      discount_amount.value = order.discount_amount;
      shipping_cost.value = order.shipping_cost;
      total_tax.value = order.total_tax;
      credit_applied.value = order.credit_applied;
      total_amount.value = order.total_amount;
      discount_title.value = order.discount_title;
      tax_rate.value = order.tax_rate;
      coupon_code.value = order.coupon_code;
      currency_code.value = order.currency_code;
      payment_method.value = order.payment_method;
      billing_address.value = order.billing_address;
      user_country.value = order.user_country;
      user_region.value = order.user_region;
      is_active.value = order.is_active;

      shipping_status.value = order.order_detail.shipping_status;
      shipping_address.value = order.order_detail.shipping_address;
      shipping_method.value = order.order_detail.shipping_method;
      shipping_note.value = order.order_detail.shipping_note;
      customer_note.value = order.order_detail.customer_note;
      admin_note.value = order.order_detail.admin_note;
      tracking_number.value = order.order_detail.tracking_number;
      delivery_date_expected.value = order.order_detail.delivery_date_expected;
      delivery_date_actual.value = order.order_detail.delivery_date_actual;
      order_status.value = order.order_detail.order_status;
      cancelled_at.value = order.order_detail.cancelled_at;
      cancellation_reason.value = order.order_detail.cancellation_reason;      
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

// Add a new order item
const addOrderItem = () => {
  order_items.value.push({
    product_id: '',
    product_name: '',
    product_attributes: '',
    unit_price: '',
    quantity: '',
    total_price: '',
    discount_amount: '',
    note: '',
    is_active: true,
  });
};

// Remove an order item
const removeOrderItem = (index) => {
  order_items.value.splice(index, 1);
};

// Update product name based on selected product
const updateProductName = (index) => {
  const selectedProduct = productList.value.find(product => product.id === order_items.value[index].product_id);
  order_items.value[index].product_name = selectedProduct ? selectedProduct.name : '';
  order_items.value[index].unit_price = selectedProduct ? selectedProduct.price : '';
  order_items.value[index].total_price = order_items.value[index].quantity * order_items.value[index].unit_price;
};

// Watch for changes in quantity or unit price to update total price
watch(order_items, (newOrderItems) => {
  newOrderItems.forEach(item => {
    if (item.quantity && item.unit_price) {
      item.total_price = item.quantity * item.unit_price;
    }
  });
}, { deep: true });

// Reset the order form
const resetForm = () => {
  user_id.value = '';
  user_name.value = '';
  order_code.value = '';
  billing_code.value = '';
  total_amount.value = '';
  discount_amount.value = '';
  shipping_cost.value = '';
  total_tax.value = '';
  currency_code.value = '';
  payment_method.value = '';
  sub_total.value = '';
  billing_address.value = '';
  coupon_code.value = '';
  credit_applied.value = '';
  discount_title.value = '';
  tax_rate.value = '';
  order_date.value = '';
  user_country.value = '';
  user_region.value = '';
  is_active.value = true;

  shipping_status.value = '';
  shipping_address.value = '';
  shipping_method.value = '';
  shipping_note.value = '';
  customer_note.value = '';
  admin_note.value = '';
  tracking_number.value = '';
  delivery_date_expected.value = '';
  delivery_date_actual.value = '';
  order_status.value = '';
  cancelled_at.value = '';
  cancellation_reason.value = '';

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
  // if (!user_id.value || !order_code.value || !total_amount.value || !shipping_address.value || !billing_address.value || !status.value) {
  //   Swal.fire('Error!', 'Please fill in all fields.', 'error');
  //   return;
  // }

  const payload = {
    user_id: user_id.value,
    user_name: userList.value.find(user => user.id === user_id.value)?.name || 'Unknown',
    order_code: order_code.value,
    billing_code: billing_code.value,
    total_amount: total_amount.value,
    discount_amount: discount_amount.value,
    shipping_cost: shipping_cost.value,
    total_tax: total_tax.value,
    currency_code: currency_code.value,
    payment_method: payment_method.value,
    sub_total: sub_total.value,
    billing_address: billing_address.value,
    coupon_code: coupon_code.value,
    credit_applied: credit_applied.value,
    discount_title: discount_title.value,
    tax_rate: tax_rate.value,
    order_date: order_date.value,
    user_country: user_country.value,
    user_region: user_region.value,
    is_active: is_active.value,

    shipping_status: shipping_status.value,
    shipping_address: shipping_address.value,
    shipping_method: shipping_method.value,
    shipping_note: shipping_note.value,
    customer_note: customer_note.value,
    admin_note: admin_note.value,
    tracking_number: tracking_number.value,
    delivery_date_expected: delivery_date_expected.value,
    delivery_date_actual: delivery_date_actual.value,
    order_status: order_status.value,
    cancelled_at: cancelled_at.value,
    cancellation_reason: cancellation_reason.value,

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
      const { id } = route.params;
      // const orderId = route.params.id;
      
      const response = await auth.fetchProtectedApi(`/api/orders/${id}`, payload, 'PUT');
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
  loadOrderData();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Edit Order</h2>
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
          <label for="billing_code" class="block text-sm font-medium text-gray-700">Billing Number</label>
          <input v-model="billing_code" type="text" id="billing_code" class="input-field" />
        </div>
        <div>
          <label for="order_code" class="block text-sm font-medium text-gray-700">Order Code</label>
          <input v-model="order_code" type="text" id="order_code" class="input-field" />
        </div>
        <div>
          <label for="order_date" class="block text-sm font-medium text-gray-700">Order Date</label>
          <input v-model="order_date" type="date" id="order_date" class="input-field" />
        </div>
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
          <label for="currency_code" class="block text-sm font-medium text-gray-700">Currency Code</label>
          <input v-model="currency_code" type="text" id="currency_code" class="input-field" />
        </div>
        <div>
          <label for="payment_method" class="block text-sm font-medium text-gray-700">Payment Method</label>
          <select v-model="payment_method" id="payment_method"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full">
            <option value="">Select Payment Method</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div>
          <label for="sub_total" class="block text-sm font-medium text-gray-700">Sub Total</label>
          <input v-model="sub_total" type="number" id="sub_total" class="input-field" />
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
          <label for="credit_applied" class="block text-sm font-medium text-gray-700">Credit Applied</label>
          <input v-model="credit_applied" type="number" id="credit_applied" class="input-field" />
        </div>
        <div>
          <label for="discount_title" class="block text-sm font-medium text-gray-700">Discount Title</label>
          <input v-model="discount_title" type="text" id="discount_title" class="input-field" />
        </div>
        <div>
          <label for="tax_rate" class="block text-sm font-medium text-gray-700">Tax Rate</label>
          <input v-model="tax_rate" type="text" id="tax_rate" class="input-field" />
        </div>

        <div>
          <label for="user_region" class="block text-sm font-medium text-gray-700">User Region</label>
          <input v-model="user_region" type="text" id="user_region" class="input-field" />
        </div>
        <div>
          <label for="user_country" class="block text-sm font-medium text-gray-700"> User Country</label>
          <select v-model="user_country" id="user_country"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full">
            <option value="">Select User Country</option>
            <option value="BD">BD</option>
            <option value="UK">UK</option>
          </select>
        </div>
        <div>
          <label for="is_active" class="block text-sm font-medium text-gray-700">Is Active</label>
          <input type="checkbox" id="is_active" v-model="is_active"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
      </div>

      <h3 class="text-lg font-bold text-gray-800">Shipping Info</h3>

      <div>
        <label for="shipping_address" class="block text-sm font-medium text-gray-700">Shipping Address</label>
        <input v-model="shipping_address" type="text" id="shipping_address" class="input-field" />
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
        <label for="cancellation_reason" class="block text-sm font-medium text-gray-700">Cancelled Reason</label>
        <input v-model="cancellation_reason" type="text" id="cancellation_reason" class="input-field" />
      </div>
      <div>
        <label for="order_status" class="block text-sm font-medium text-gray-700">order_status</label>
        <select v-model="order_status" id="order_status"
          class="border mt-1 border-gray-300 rounded-md p-2 block w-full">
          <option value="">Select order_status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <!-- Order Items Section -->
      <div class="space-y-6">
        <!-- Order Items Section -->
        <div>
          <h3 class="text-lg font-bold text-gray-800 pb-4">Order Items</h3>

          <!-- Dynamic Order Items List -->
          <div v-for="(item, index) in order_items" :key="index" class="bg-white shadow rounded-lg p-6 mb-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <!-- Product Selection -->
              <div>
                <label for="product_id" class="block text-sm font-medium text-gray-700">Product</label>
                <select v-model="item.product_id" @change="updateProductName(index)" id="product_id"
                  class="w-full border p-2 rounded-md">
                  <option value="">Select Product</option>
                  <option v-for="product in productList" :key="product.id" :value="product.id">{{ product.name }}
                  </option>
                </select>
              </div>

              <!-- Product Name (Auto-filled when product is selected) -->
              <div>
                <label for="product_name" class="block text-sm font-medium text-gray-700">Product Name</label>
                <input v-model="item.product_name" type="text" id="product_name" class="w-full border p-2 rounded-md"
                  disabled />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <!-- Product Attributes -->
              <div>
                <label for="product_attributes" class="block text-sm font-medium text-gray-700">Product
                  Attributes</label>
                <input v-model="item.product_attributes" type="text" id="product_attributes"
                  class="w-full border p-2 rounded-md" />
              </div>

              <!-- Unit Price -->
              <div>
                <label for="unit_price" class="block text-sm font-medium text-gray-700">Unit Price</label>
                <input v-model="item.unit_price" type="number" id="unit_price" class="w-full border p-2 rounded-md" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <!-- Quantity -->
              <div>
                <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
                <input v-model="item.quantity" type="number" id="quantity" class="w-full border p-2 rounded-md" />
              </div>

              <!-- Total Price -->
              <div>
                <label for="total_price" class="block text-sm font-medium text-gray-700">Total Price</label>
                <input v-model="item.total_price" type="number" id="total_price" class="w-full border p-2 rounded-md"
                  disabled />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <!-- Discount Amount -->
              <div>
                <label for="discount_amount" class="block text-sm font-medium text-gray-700">Discount Amount</label>
                <input v-model="item.discount_amount" type="number" id="discount_amount"
                  class="w-full border p-2 rounded-md" />
              </div>

              <!-- Item Note -->
              <div>
                <label for="note" class="block text-sm font-medium text-gray-700">Note</label>
                <textarea v-model="item.note" id="note" rows="3" class="w-full border p-2 rounded-md"></textarea>
              </div>
            </div>

            <!-- Remove Item Button -->
            <div class="flex justify-end mt-4">
              <button type="button" @click="removeOrderItem(index)"
                class="bg-red-600 hover:bg-red-700 text-white py-1 px-3 text-sm rounded-md">
                Remove Item
              </button>
            </div>
          </div>

          <!-- Add New Item Button -->
          <div class="flex justify-end mt-6">
            <button type="button" @click="addOrderItem"
              class="bg-green-600 hover:bg-green-700 text-white py-1 px-3 text-sm rounded-md">
              Add New Item
            </button>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-center border-t border-gray-300 bg-gray-50 p-4">
        <button type="button" @click="resetForm"
          class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-lg shadow mr-3">
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
