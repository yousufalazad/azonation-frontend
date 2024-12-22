<script setup>
import { onMounted, ref } from 'vue';
import { authStore } from '../../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};
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

const deleteProduct = async (productId) => {
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
      const response = await auth.fetchProtectedApi(`/api/delete-product/${productId}`, {}, 'DELETE');
      if (response.status) {
        productList.value = productList.value.filter(product => product.id !== productId);
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete product.', 'error');
      }
    }
  } catch (error) {
    Swal.fire('Error!', 'Failed to delete product.', 'error');
  }
};

onMounted(() => getProducts());
</script>

<template>
  <div class="max-w-7xl mx-auto w-10/12">
    <section>
      <div class="flex justify-between left-color-shade py-2 my-3">
        <h5 class="text-md font-semibold mt-2">Product List</h5>
        <div>
          <button @click="$router.push({ name: 'product-create' })"
            class="bg-blue-500 text-white font-semibold py-2 px-2 mx-3 rounded-md">
            Add Product
          </button>
        </div>
      </div>
      <div v-if="productList.length" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-2 px-4 border">Sl</th>
                <th class="py-2 px-4 border">Name</th>
                <th class="py-2 px-4 border">SKU</th>
                <!-- <th class="py-2 px-4 border">Category</th> -->
                <th class="py-2 px-4 border">Base Price</th>
                <th class="py-2 px-4 border">Sale Price</th>
                <th class="py-2 px-4 border">Stock Quantity</th>
                <th class="py-2 px-4 border">Status</th>
                <th class="py-2 px-4 border">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(product, index) in productList" :key="product.id">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ product.name }}</td>
                <td class="py-2 px-4 border">{{ product.sku }}</td>
                <!-- <td class="py-2 px-4 border">{{ product.category.name }}</td> -->
                <td class="py-2 px-4 border">{{ product.base_price }}</td>
                <td class="py-2 px-4 border">{{ product.sale_price }}</td>
                <td class="py-2 px-4 border">{{ product.stock_quantity }}</td>
                <td class="py-2 px-4 border">{{ product.is_active ? 'Active' : 'Inactive' }}</td>
                <td class="py-2 px-4 border">
                  <button
                    @click="$router.push({ name: 'product-edit', params: { id: product.id } })"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 m-2 rounded">Edit</button>
                  <button
                    @click="$router.push({ name: 'product-view', params: { id: product.id } })"
                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 m-2 rounded">View</button>
                  <button @click="deleteProduct(product.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-4">
        <p class="text-center text-gray-500">No products available. Click "Add Product" to create a new one.</p>
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