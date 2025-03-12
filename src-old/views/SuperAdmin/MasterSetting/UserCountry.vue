<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = authStore;
const user_id = ref('');
const country_id = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedUserCountryId = ref(null);

const countryList = ref([]);
// Fetch CountryList
const getCountryList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-countries', {}, 'GET');
        countryList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        countryList.value = [];
    }
};

// Fetch userList
const userList = ref([]);
// Fetch userList
const getUserList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-user-list', {}, 'GET');
        userList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        userList.value = [];
    }
};

const userCountryList = ref([]);
// Fetch getUserCountryList
const getUserCountryList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-user-countries', {}, 'GET');
        userCountryList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching funds:', error);
        userCountryList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    user_id.value = '';
    country_id.value = '';
    is_active.value = '1';
    selectedUserCountryId.value = null;
    isEditMode.value = false;
};

// Add or update userCountry
const submitForm = async () => {
    const payload = {
        user_id: user_id.value,
        country_id: country_id.value,
        is_active: is_active.value
    };
    try {
        let apiUrl = '/api/create-user-country';
        let method = 'POST';
        if (isEditMode.value && selectedUserCountryId.value) {
            apiUrl = `/api/update-user-country/${selectedUserCountryId.value}`;
            method = 'PUT';
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this user country?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `user country ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getUserCountryList();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save user country.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} user country:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} user country.`, 'error');
    }
};

// Edit userCountry
const editUserCountry = (userCountry) => {
    user_id.value = userCountry.user_id;
    country_id.value = userCountry.country_id;
    is_active.value = userCountry.is_active;
    selectedUserCountryId.value = userCountry.id;
    isEditMode.value = true;
};

// Delete userCountry
const deleteUserCountry = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this user country?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-user-country/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'user country has been deleted.', 'success');
                getUserCountryList();
            } else {
                Swal.fire('Failed!', 'Failed to delete user country.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting user country:', error);
        Swal.fire('Error!', 'Failed to delete user country.', 'error');
    }
};

// Fetch Dialing Codes on mount
onMounted(() => {
    getUserList();
    getCountryList();
    getUserCountryList();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} User Country</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="user_id" class="block text-gray-700 font-semibold mb-2">User Name</label>
                        <select v-model="user_id" id="user_id" class="w-full border border-gray-300 rounded-md p-2"
                            required>
                            <option value="">Select User</option>
                            <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }}</option>
                        </select>
                    </div>
                    <!-- Country Country Name -->
                    <div class="col-span-4 mb-4">
                        <label for="country_id" class="block text-gray-700 font-semibold mb-2">Country Name</label>
                        <select v-model="country_id" id="country_id"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Country</option>
                            <option v-for="country in countryList" :key="country.id" :value="country.id">{{
                                country.name }}</option>
                        </select>
                    </div>
                    <!-- is_active -->
                    <div class="col-span-2 mb-4">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active" class="w-full border border-gray-300 rounded-md p-2"
                            required>
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
                <h5 class="text-md font-semibold mt-2">User Country List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">User</th>
                        <th class="py-2 px-4 border border-gray-300">Country</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(userCountry, index) in userCountryList" :key="userCountry.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ userCountry.user_name }}</td>
                        <td class="py-2 px-4 border">{{ userCountry.country_name }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="userCountry.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ userCountry.is_active === 0 ? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editUserCountry(userCountry)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteUserCountry(userCountry.id)"
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
