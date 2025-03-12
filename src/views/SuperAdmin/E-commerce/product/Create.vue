<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { authStore } from '../../../../store/authStore';

const router = useRouter();
const auth = authStore;

// Form fields
const business_type_id = ref('');
const category_id = ref('');
const sub_category_id = ref('');
const sub_sub_category_id = ref('');
const brand_id = ref('');
const sku = ref('');
const name = ref('');
const slug = ref('');
const short_description = ref('');
const invoice_description = ref('');
const description = ref('');
const base_price = ref('');
const on_sale = ref(false);
const discount_percentage = ref('');
const sale_price = ref('');
const sale_start_date = ref('');
const sale_end_date = ref('');
const is_downloadable = ref(false);
const download_link = ref('');
const is_gift_card = ref(false);
const is_refundable = ref(false);
const is_customizable = ref(false);
const is_backorderable = ref(false);
const is_sold_individually = ref(false);
const meta_title = ref('');
const meta_keywords = ref('');
const meta_description = ref('');
const stock_quantity = ref('');
const is_featured = ref(false);
const is_new = ref(false);
const feature_image = ref(null);
const attributes = ref('');
const weight = ref('');
const dimensions = ref('');
const additional_information = ref('');
const is_in_stock = ref(false);
const sold_quantity = ref('');
const additional_shipping_info = ref('');
const shipping_rules = ref('');
const tags = ref('');
const warranty_period = ref('');
const is_active = ref(false);

const business_types = ref([]);
const fetchBusinessType = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/business-types');
    business_types.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading business_types. Please try again later.';
  }
};

const categories = ref([]);
const fetchCategories = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/categories');
    categories.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading categories. Please try again later.';
  }
};

const subCategories = ref([]);
const fetchSubCategories = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/sub-categories');
    subCategories.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading subCategories. Please try again later.';
  }
};

const subSubCategories = ref([]);
const fetchSubSubCategories = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/sub-sub-categories');
    subSubCategories.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading subSubCategories. Please try again later.';
  }
};

const brands = ref([]);
const fetchBrands = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/brands');
    brands.value = response.status ? response.data : [];
  } catch (error) {
    errorMessage.value = 'Error loading brands. Please try again later.';
  }
};


// Reset form
const resetForm = () => {
  business_type_id.value = '';
  category_id.value = '';
  sub_category_id.value = '';
  sub_sub_category_id.value = '';
  brand_id.value = '';
  sku.value = '';
  name.value = '';
  slug.value = '';
  short_description.value = '';
  invoice_description.value = '';
  description.value = '';
  base_price.value = '';
  on_sale.value = false;
  discount_percentage.value = '';
  sale_price.value = '';
  sale_start_date.value = '';
  sale_end_date.value = '';
  is_downloadable.value = false;
  download_link.value = '';
  is_gift_card.value = false;
  is_refundable.value = false;
  is_customizable.value = false;
  is_backorderable.value = false;
  is_sold_individually.value = false;
  meta_title.value = '';
  meta_keywords.value = '';
  meta_description.value = '';
  stock_quantity.value = '';
  is_featured.value = false;
  is_new.value = false;
  feature_image.value = null;
  attributes.value = '';
  weight.value = '';
  dimensions.value = '';
  additional_information.value = '';
  is_in_stock.value = false;
  sold_quantity.value = '';
  additional_shipping_info.value = '';
  shipping_rules.value = '';
  tags.value = '';
  warranty_period.value = '';
  is_active.value = false;
};

// Submit form
const submitForm = async () => {
  if (!name.value || !business_type_id.value || !category_id.value || !sku.value) {
    Swal.fire('Error!', 'Please fill in all  fields.', 'error');
    return;
  }

  const payload = {
    business_type_id: business_type_id.value,
    category_id: category_id.value,
    sub_category_id: sub_category_id.value,
    sub_sub_category_id: sub_sub_category_id.value,
    brand_id: brand_id.value,
    sku: sku.value,
    name: name.value,
    slug: slug.value,
    short_description: short_description.value,
    invoice_description: invoice_description.value,
    description: description.value,
    base_price: base_price.value,
    on_sale: on_sale.value,
    discount_percentage: discount_percentage.value,
    sale_price: sale_price.value,
    sale_start_date: sale_start_date.value,
    sale_end_date: sale_end_date.value,
    is_downloadable: is_downloadable.value,
    download_link: download_link.value,
    is_gift_card: is_gift_card.value,
    is_refundable: is_refundable.value,
    is_customizable: is_customizable.value,
    is_backorderable: is_backorderable.value,
    is_sold_individually: is_sold_individually.value,
    meta_title: meta_title.value,
    meta_keywords: meta_keywords.value,
    meta_description: meta_description.value,
    stock_quantity: stock_quantity.value,
    is_featured: is_featured.value,
    is_new: is_new.value,
    feature_image: feature_image.value,
    attributes: attributes.value,
    weight: weight.value,
    dimensions: dimensions.value,
    additional_information: additional_information.value,
    is_in_stock: is_in_stock.value,
    sold_quantity: sold_quantity.value,
    additional_shipping_info: additional_shipping_info.value,
    shipping_rules: shipping_rules.value,
    tags: tags.value,
    warranty_period: warranty_period.value,
    is_active: is_active.value,
  };

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi('/api/products', payload, 'POST');
      if (response.status) {
        Swal.fire('Success!', 'Product created successfully.', 'success').then(() => {
          resetForm();
          router.push({ name: 'products-list' }); // Adjust route name
        });
      } else {
        Swal.fire('Failed!', 'Failed to create the product.', 'error');
      }
    }
  } catch (error) {
    console.error('Error creating product:', error);
    Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
  }
};

onMounted(() => {
  fetchBusinessType();
  fetchCategories();
  fetchSubCategories();
  fetchSubSubCategories();
  fetchBrands();
  resetForm();
});
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-8 bg-white rounded-lg shadow-lg mt-12">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Add New Product</h2>
      <button @click="$router.push({ name: 'products-list' })"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow focus:ring-2 focus:ring-blue-300">
        Back to Product List
      </button>
    </div>
    <form @submit.prevent="submitForm">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="business_type_id" class="block text-sm font-medium text-gray-700">Business Type</label>
          <select v-model="business_type_id"
            class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
            required>
            <option value="">Select Business Type</option>
            <option v-for="business_type in business_types" :key="business_type.id" :value="business_type.id">
              {{ business_type.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="category_id" class="block text-sm font-medium text-gray-700">Category</label>
          <select v-model="category_id"
            class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
            required>
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

        </div>
        <div>
          <label for="sub_category_id" class="block text-sm font-medium text-gray-700">Sub Category</label>
          <select v-model="sub_category_id"
            class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
            >
            <option value="">Select Sub Category</option>
            <option v-for="subCategory in subCategories" :key="subCategory.id" :value="subCategory.id">
              {{ subCategory.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="sub_sub_category_id" class="block text-sm font-medium text-gray-700">Sub Sub Category</label>
          <select v-model="sub_sub_category_id"
            class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
            >
            <option value="">Select Sub Sub Category</option>
            <option v-for="subSubCategory in subSubCategories" :key="subSubCategory.id" :value="subSubCategory.id">
              {{ subSubCategory.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="brand_id" class="block text-sm font-medium text-gray-700">Brand</label>
          <select v-model="brand_id"
            class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2"
            >
            <option value="">Select Brand</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="sku" class="block text-sm font-medium text-gray-700">SKU</label>
          <input type="text" id="sku" v-model="sku" class="border mt-1 border-gray-300 rounded-md p-2 block w-full"
          required/>
        </div>
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="name" v-model="name" class="border mt-1 border-gray-300 rounded-md p-2 block w-full"
          required/>
        </div>
        <div>
          <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
          <input type="text" id="slug" v-model="slug" class="border mt-1 border-gray-300 rounded-md p-2 block w-full"
          />
        </div>
        <div>
          <label for="short_description" class="block text-sm font-medium text-gray-700">Short Description</label>
          <textarea id="short_description" v-model="short_description"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" ></textarea>
        </div>
        <div>
          <label for="invoice_description" class="block text-sm font-medium text-gray-700">Invoice Description</label>
          <textarea id="invoice_description" v-model="invoice_description"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" ></textarea>
        </div>
        <div class="md:col-span-2">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" v-model="description"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" ></textarea>
        </div>
        <div>
          <label for="base_price" class="block text-sm font-medium text-gray-700">Base Price</label>
          <input type="number" id="base_price" v-model="base_price"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"/>
        </div>
        
        <div>
          <label for="discount_percentage" class="block text-sm font-medium text-gray-700">Discount Percentage</label>
          <input type="number" id="discount_percentage" v-model="discount_percentage"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"  />
        </div>
        <div>
          <label for="on_sale" class="block text-sm font-medium text-gray-700">On Sale</label>
          <input type="checkbox" id="on_sale" v-model="on_sale" class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="sale_price" class="block text-sm font-medium text-gray-700">Sale Price</label>
          <input type="number" id="sale_price" v-model="sale_price"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"  />
        </div>
        <div>
          <label for="sale_start_date" class="block text-sm font-medium text-gray-700">Sale Start Date</label>
          <input type="date" id="sale_start_date" v-model="sale_start_date"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"  />
        </div>
        <div>
          <label for="sale_end_date" class="block text-sm font-medium text-gray-700">Sale End Date</label>
          <input type="date" id="sale_end_date" v-model="sale_end_date"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"  />
        </div>
        <div>
          <label for="is_downloadable" class="block text-sm font-medium text-gray-700">Is Downloadable</label>
          <input type="checkbox" id="is_downloadable" v-model="is_downloadable"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="download_link" class="block text-sm font-medium text-gray-700">Download Link</label>
          <input type="url" id="download_link" v-model="download_link"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" />
        </div>
        <div>
          <label for="meta_title" class="block text-sm font-medium text-gray-700">Meta Title</label>
          <input type="text" id="meta_title" v-model="meta_title"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" />
        </div>
        <div>
          <label for="meta_keywords" class="block text-sm font-medium text-gray-700">Meta Keywords</label>
          <input type="text" id="meta_keywords" v-model="meta_keywords"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" />
        </div>
        <div>
          <label for="meta_description" class="block text-sm font-medium text-gray-700">Meta Description</label>
          <textarea id="meta_description" v-model="meta_description"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"></textarea>
        </div>
        <div>
          <label for="attributes" class="block text-sm font-medium text-gray-700">Attributes</label>
          <textarea id="attributes" v-model="attributes"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"></textarea>
        </div>
        <div>
          <label for="weight" class="block text-sm font-medium text-gray-700">Weight</label>
          <input type="number" id="weight" v-model="weight"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" />
        </div>
        <div>
          <label for="dimensions" class="block text-sm font-medium text-gray-700">Dimensions</label>
          <input type="text" id="dimensions" v-model="dimensions"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" />
        </div>
        <div>
          <label for="additional_information" class="block text-sm font-medium text-gray-700">Additional
            Information</label>
          <textarea id="additional_information" v-model="additional_information"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"></textarea>
        </div>
        <div>
          <label for="additional_shipping_info" class="block text-sm font-medium text-gray-700">Additional Shipping
            Info</label>
          <textarea id="additional_shipping_info" v-model="additional_shipping_info"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"></textarea>
        </div>
        <div>
          <label for="shipping_rules" class="block text-sm font-medium text-gray-700">Shipping Rules</label>
          <textarea id="shipping_rules" v-model="shipping_rules"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"></textarea>
        </div>
        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700">Tags</label>
          <textarea id="tags" v-model="tags" class="border mt-1 border-gray-300 rounded-md p-2 block w-full"></textarea>
        </div>
        <div>
          <label for="stock_quantity" class="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input type="number" id="stock_quantity" v-model="stock_quantity"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full"  />
        </div>
        <div>
          <label for="sold_quantity" class="block text-sm font-medium text-gray-700">Sold Quantity</label>
          <input type="number" id="sold_quantity" v-model="sold_quantity"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" />
        </div>
        <div>
          <label for="warranty_period" class="block text-sm font-medium text-gray-700">Warranty Period</label>
          <input type="number" id="warranty_period" v-model="warranty_period"
            class="border mt-1 border-gray-300 rounded-md p-2 block w-full" />
        </div>
        <div>
          <label for="is_gift_card" class="block text-sm font-medium text-gray-700">Is Gift Card</label>
          <input type="checkbox" id="is_gift_card" v-model="is_gift_card"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="is_refundable" class="block text-sm font-medium text-gray-700">Is Refundable</label>
          <input type="checkbox" id="is_refundable" v-model="is_refundable"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="is_customizable" class="block text-sm font-medium text-gray-700">Is Customizable</label>
          <input type="checkbox" id="is_customizable" v-model="is_customizable"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="is_backorderable" class="block text-sm font-medium text-gray-700">Is Backorderable</label>
          <input type="checkbox" id="is_backorderable" v-model="is_backorderable"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="is_sold_individually" class="block text-sm font-medium text-gray-700">Is Sold Individually</label>
          <input type="checkbox" id="is_sold_individually" v-model="is_sold_individually"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="is_featured" class="block text-sm font-medium text-gray-700">Is Featured</label>
          <input type="checkbox" id="is_featured" v-model="is_featured"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="is_new" class="block text-sm font-medium text-gray-700">Is New</label>
          <input type="checkbox" id="is_new" v-model="is_new" class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="is_in_stock" class="block text-sm font-medium text-gray-700">Is In Stock</label>
          <input type="checkbox" id="is_in_stock" v-model="is_in_stock"
            class="border mt-1 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <label for="is_active" class="block text-sm font-medium text-gray-700">Is Active</label>
          <input type="checkbox" id="is_active" v-model="is_active"
            class="border mt-1 border-gray-300 rounded-md p-2" />
          <!-- <select v-model="is_active" id="is_active" class="border mt-1 border-gray-300 rounded-md p-2 block w-full" >
            <option value="">Select is_active</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select> -->
        </div>

        <!-- <div>
          <label for="feature_image" class="block text-sm font-medium text-gray-700">Feature Image</label>
          <input type="file" id="feature_image" v-model="feature_image" class="border mt-1 border-gray-300 rounded-md p-2 block w-full" />
        </div> -->
      </div>

      <button type="submit" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Submit</button>
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
</style>
