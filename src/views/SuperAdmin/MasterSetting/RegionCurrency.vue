<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = authStore;
const region_id = ref('');
const currency_id = ref('');
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

const regionCurrencyList = ref([]);
// Fetch getCountryRegionList
const getCountryRegionList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/region-currencies', {}, 'GET');
        regionCurrencyList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        regionCurrencyList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    region_id.value = '';
    currency_id.value = '';
    is_active.value = "1";
    selectedRegionCurrencyId.value = null;
    isEditMode.value = false;
};

// Add or update regionCurrency
const submitForm = async () => {
    const payload = {
        region_id: region_id.value,
        currency_id: currency_id.value,
        is_active: is_active.value
    };
    try {
        let apiUrl = '/api/regions-currency';
        let method = 'POST';
        if (isEditMode.value && selectedRegionCurrencyId.value) {
            apiUrl = `/api/regions-currency/${selectedRegionCurrencyId.value}`;
            method = 'PUT';
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this region currency?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `region currency ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getCountryRegionList();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save region currency.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} region currency:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} region currency.`, 'error');
    }
};

// Edit regionCurrency
const editRegionCurrency = (regionCurrency) => {
    region_id.value = regionCurrency.region_id;
    currency_id.value = regionCurrency.currency_id;
    is_active.value = regionCurrency.is_active;
    selectedRegionCurrencyId.value = regionCurrency.id;
    isEditMode.value = true;
};

// Delete regionCurrency
const deleteRegionCurrency = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this region currency?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/regions-currency/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'region currency has been deleted.', 'success');
                getCountryRegionList();
            } else {
                Swal.fire('Failed!', 'Failed to delete region currency.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting region currency:', error);
        Swal.fire('Error!', 'Failed to delete region currency.', 'error');
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
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Region Currency</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Region Currency Name -->
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
                        <label for="currency_id" class="block text-gray-700 font-semibold mb-2">Currency Name</label>
                        <select v-model="currency_id" id="currency_id"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Currency</option>
                            <option v-for="currency in currencyList" :key="currency.id" :value="currency.id">{{
                                currency.name }}</option>
                        </select>
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
        <!-- currency list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Region Currency List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Region</th>
                        <th class="py-2 px-4 border border-gray-300">Currency</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300 text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(regionCurrency, index) in regionCurrencyList" :key="regionCurrency.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ regionCurrency.region_name }}</td>
                        <td class="py-2 px-4 border">{{ regionCurrency.currency_name }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="regionCurrency.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ regionCurrency.is_active === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border gap-2 flex justify-end">
                            <button @click="editRegionCurrency(regionCurrency)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteRegionCurrency(regionCurrency.id)"
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