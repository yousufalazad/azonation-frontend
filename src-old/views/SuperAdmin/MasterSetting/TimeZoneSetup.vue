<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = authStore;
const time_zone = ref('');
const offset = ref('');
const description = ref('');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedTimeZoneSetupId = ref(null);
const timeZoneSetupList = ref([]);


// Fetch Time Zone Setups
const getTimeZoneSetup = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-time-zone-setups', {}, 'GET');
        timeZoneSetupList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        timeZoneSetupList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    time_zone.value = '';
    offset.value = '';
    description.value = '';
    is_active.value = '1';
    selectedTimeZoneSetupId.value = null;
    isEditMode.value = false;
};

// Add or update Time Zone Setups
const submitForm = async () => {
    const payload = {
        time_zone: time_zone.value,
        offset: offset.value,
        description: description.value,
        is_active: is_active.value,
    };

    try {
        let apiUrl = '/api/create-time-zone-setup';
        let method = 'POST';

        if (isEditMode.value && selectedTimeZoneSetupId.value) {
            apiUrl = `/api/update-time-zone-setup/${selectedTimeZoneSetupId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this Time Zone Setups?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `Time Zone Setups ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getTimeZoneSetup();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save Time Zone Setups.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} Time Zone Setups:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} Time Zone Setups.`, 'error');
    }
};

// Edit Time Zone Setups
const editTimeZoneSetup = (timeZoneSetup) => {
    time_zone.value = timeZoneSetup.time_zone;
    offset.value = timeZoneSetup.offset;
    description.value = timeZoneSetup.description;
    is_active.value = timeZoneSetup.is_active;
    selectedTimeZoneSetupId.value = timeZoneSetup.id;
    isEditMode.value = true;
};

// Delete Time Zone Setups
const deleteTimeZoneSetup = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this Time Zone Setups?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-time-zone-setup/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'Time Zone Setup has been deleted.', 'success');
                getTimeZoneSetup();
            } else {
                Swal.fire('Failed!', 'Failed to delete Time Zone Setup.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting Time Zone Setup:', error);
        Swal.fire('Error!', 'Failed to delete Time Zone Setup.', 'error');
    }
};

// Fetch Dialing Codes on mount
onMounted(() => {
    getTimeZoneSetup();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Time Zone Setup</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                     <!-- time_zone -->
                     <div class="col-span-4 mb-4">
                        <label for="time_zone" class="block text-gray-700 font-semibold mb-2">Time Zone</label>
                        <input v-model="time_zone" id="time_zone" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                     <!-- offset -->
                     <div class="col-span-2 mb-4">
                        <label for="offset" class="block text-gray-700 font-semibold mb-2">Offset </label>
                        <input v-model="offset" id="offset" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    
                    <!-- description -->
                    <div class="col-span-2 mb-4">
                        <label for="description" class="block text-gray-700 font-semibold mb-2">Description</label>
                        <input v-model="description" id="description" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>

                    <!-- is_active -->
                    <div class="col-span-2 mb-4">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Active</option>
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
                <h5 class="text-md font-semibold mt-2">Time Zone Setup List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Time Zone</th>
                        <th class="py-2 px-4 border border-gray-300">Offset</th>
                        <th class="py-2 px-4 border border-gray-300">Description</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(timeZoneSetup, index) in timeZoneSetupList" :key="timeZoneSetup.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ timeZoneSetup.time_zone }}</td>
                        <td class="py-2 px-4 border">{{ timeZoneSetup.offset }}</td>
                        <td class="py-2 px-4 border">{{ timeZoneSetup.description }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="timeZoneSetup.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ timeZoneSetup.is_active === 0? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editTimeZoneSetup(timeZoneSetup)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteTimeZoneSetup(timeZoneSetup.id)"
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