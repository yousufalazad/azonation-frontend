<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = authStore;
const region_id = ref('');
const tax_rate = ref('');
const is_active = ref("1");
const isEditMode = ref(false);
const selectedRegionCurrencyId = ref(null);

const currencyList = ref([]);
// Fetch CountryList
const getCountryList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/currencies', {}, 'GET');
        currencyList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        currencyList.value = [];
    }
};

// Fetch regionList
const regionList = ref([]);
// Fetch regionList
const getRegionList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/regions', {}, 'GET');
        regionList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        regionList.value = [];
    }
};

const regionTaxRateList = ref([]);
// Fetch getCountryRegionList
const getCountryRegionList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/regional-tax-rates', {}, 'GET');
        regionTaxRateList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        regionTaxRateList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    region_id.value = '';
    tax_rate.value = '';
    is_active.value = "1";
    selectedRegionCurrencyId.value = null;
    isEditMode.value = false;
};

// Add or update regionTaxRate
const submitForm = async () => {
    const payload = {
        region_id: region_id.value,
        tax_rate: tax_rate.value,
        is_active: is_active.value
    };
    try {
        let apiUrl = '/api/regional-tax-rates';
        let method = 'POST';
        if (isEditMode.value && selectedRegionCurrencyId.value) {
            apiUrl = `/api/regional-tax-rates/${selectedRegionCurrencyId.value}`;
            method = 'PUT';
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this region tax-rate?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `region tax-rate ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getCountryRegionList();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save region tax-rate.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} region tax-rate:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} region tax-rate.`, 'error');
    }
};

// Edit regionTaxRate
const editRegionCurrency = (regionTaxRate) => {
    region_id.value = regionTaxRate.region_id;
    tax_rate.value = regionTaxRate.tax_rate;
    is_active.value = regionTaxRate.is_active;
    selectedRegionCurrencyId.value = regionTaxRate.id;
    isEditMode.value = true;
};

// Delete regionTaxRate
const deleteRegionCurrency = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this region tax-rate?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/regional-tax-rates/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'region tax-rate has been deleted.', 'success');
                getCountryRegionList();
            } else {
                Swal.fire('Failed!', 'Failed to delete region tax-rate.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting region tax-rate:', error);
        Swal.fire('Error!', 'Failed to delete region tax-rate.', 'error');
    }
};

// Fetch Dialing Codes on mount
onMounted(() => {
    getCountryList();
    getRegionList();
    getCountryRegionList();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Region Tax Rate</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Region Name -->
                    <div class="col-span-4 mb-4">
                        <label for="region_id" class="block text-gray-700 font-semibold mb-2">Region Name</label>
                        <select v-model="region_id" id="region_id" class="w-full border border-gray-300 rounded-md p-2"
                            required>
                            <option value="">Select Region</option>
                            <option v-for="region in regionList" :key="region.id" :value="region.id">{{ region.name }}
                            </option>
                        </select>
                    </div>
                    <!-- Currency Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="tax_rate" class="block text-gray-700 font-semibold mb-2">Tax Rate</label>
                        <input type="decimal" v-model="tax_rate" id="tax_rate"  class="w-full border border-gray-300 rounded-md p-2" required>
                        <!-- <select v-model="tax_rate" id="tax_rate"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Currency</option>
                            <option v-for="currency in currencyList" :key="currency.id" :value="currency.id">{{
                                currency.name }}</option>
                        </select> -->
                    </div>
                    <!-- is_active -->
                    <div class="col-span-2 mb-4">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active" class="w-full border border-gray-300 rounded-md p-2"
                            required>
                            <option value="">Select is Active</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                    <!-- Submit button -->
                    <div class="col-span-2 mb-4 flex items-end">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-blue-600 text-white rounded-md py-2 px-4 mx-4 hover:bg-blue-700">
                            Reset
                        </button>
                    </div>
                </div>
            </form>
        </section>
        <!-- tax-rate list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Region Tax Rate List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Region</th>
                        <th class="py-2 px-4 border border-gray-300">Tax Rate</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300 text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(regionTaxRate, index) in regionTaxRateList" :key="regionTaxRate.id">
                        <td class="py-2 px-4 border" style="width: 20px;">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border" style="width: 300px;">{{ regionTaxRate.region_name }}</td>
                        <td class="py-2 px-4 border">{{ regionTaxRate.tax_rate }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="regionTaxRate.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ regionTaxRate.is_active === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border gap-2 flex justify-end">
                            <button @click="editRegionCurrency(regionTaxRate)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteRegionCurrency(regionTaxRate.id)"
                                class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style scoped>
.left-color-shade {
    background-color: rgba(76, 175, 80, 0.1);
    /* Slightly green background */
}
</style>