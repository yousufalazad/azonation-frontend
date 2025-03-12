<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = authStore;
const country_id = ref('');
const dialing_code = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedDialingCodeId = ref(null);
const dialingCodeList = ref([]);

const countryList = ref([]);
// Fetch CountryList
const getCountryList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/countries', {}, 'GET');
        countryList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        countryList.value = [];
    }
};

// Fetch dialingCodes
const getDialingCodes = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/dialing-codes', {}, 'GET');
        dialingCodeList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        dialingCodeList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    country_id.value = '';
    dialing_code.value = '';
    is_active.value = '1';
    selectedDialingCodeId.value = null;
    isEditMode.value = false;
};

// Add or update dialingCode
const submitForm = async () => {
    const payload = {
        country_id: country_id.value,
        dialing_code: dialing_code.value,
        is_active: is_active.value
    };

    try {
        let apiUrl = '/api/dialing-codes';
        let method = 'POST';

        if (isEditMode.value && selectedDialingCodeId.value) {
            apiUrl = `/api/dialing-codes/${selectedDialingCodeId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this dialing code?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `dialing code ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getDialingCodes();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save dialing code.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} dialing code:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} dialing code.`, 'error');
    }
};

// Edit dialingCode
const editDialingCode = (dialingCode) => {
    country_id.value = dialingCode.country_id;
    dialing_code.value = dialingCode.dialing_code;
    selectedDialingCodeId.value = dialingCode.id;
    is_active.value = dialingCode.is_active;
    isEditMode.value = true;
};

// Delete dialingCode
const deleteDialingCode = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this dialing code?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/dialing-codes/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'dialing code has been deleted.', 'success');
                getDialingCodes();
            } else {
                Swal.fire('Failed!', 'Failed to delete dialing code.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting dialing code:', error);
        Swal.fire('Error!', 'Failed to delete dialing code.', 'error');
    }
};

// Fetch Dialing Codes on mount
onMounted(() => {
    getDialingCodes();
    getCountryList();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Dialing Code</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                   
                    <!-- Country Country Name -->
                    <div class="col-span-6 mb-4">
                        <label for="country_id" class="block text-gray-700 font-semibold mb-2">Country Name</label>
                        <select v-model="country_id" id="country_id"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Country</option>
                            <option v-for="country in countryList" :key="country.id" :value="country.id">{{ country.name }}</option>
                        </select>
                    </div>
                    <!-- Dialing Code dropdown -->
                    <div class="col-span-2 mb-4">
                        <label for="dialing_code" class="block text-gray-700 font-semibold mb-2">Dialing Code</label>
                        <input v-model="dialing_code" id="dialing_code" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>

                     <!-- is_active -->
                     <div class="col-span-2 mb-4">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select is_active</option>
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

        <!-- country list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Dialing Code List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Country Name</th>
                        <th class="py-2 px-4 border border-gray-300">Dialing Code</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(dialingCode, index) in dialingCodeList" :key="dialingCode.id">
                        <td class="py-2 px-4 border" style="width: 20px;">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border" style="width: 300px;">{{ dialingCode.name }}</td>
                        <td class="py-2 px-4 border" style="width: 200px;">{{ dialingCode.dialing_code }}</td>
                        
                        <td class="py-2 px-4 border">
                            <span :class="dialingCode.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ dialingCode.is_active === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editDialingCode(dialingCode)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteDialingCode(dialingCode.id)"
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