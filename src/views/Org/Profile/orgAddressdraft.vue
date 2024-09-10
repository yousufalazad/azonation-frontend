<template>
    <div class="profile-data-show">
        <!-- Other sections -->

        <!-- Address Section -->
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-2">Address</h3>
            <p>{{ orgAddressLine }}, {{ city }}, {{ stateOrRegion }}, {{ postalCode }}, {{ country }}
                <button @click="openModal('address')" class="text-blue-500">Edit</button>
            </p>
        </div>

        <!-- Modal Component -->
        <div v-if="isModalVisible" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="bg-white p-5 rounded-lg shadow-lg max-w-md w-full">
                <h3 class="text-lg font-bold mb-3">{{ modalTitle }}</h3>

                <!-- Address form inside modal -->
                <div v-if="isAddressModal">
                    <div class="mb-3">
                        <label for="orgAddressLine" class="block text-sm font-medium">Address Line</label>
                        <input v-model="orgAddressLine" type="text" id="orgAddressLine" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-3">
                        <label for="city" class="block text-sm font-medium">City</label>
                        <input v-model="city" type="text" id="city" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-3">
                        <label for="stateOrRegion" class="block text-sm font-medium">State or Region</label>
                        <input v-model="stateOrRegion" type="text" id="stateOrRegion" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-3">
                        <label for="postalCode" class="block text-sm font-medium">Postal Code</label>
                        <input v-model="postalCode" type="text" id="postalCode" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-3">
                        <label for="country" class="block text-sm font-medium">Country</label>
                        <input v-model="country" type="text" id="country" class="w-full p-2 border rounded">
                    </div>
                </div>

                <div class="flex justify-end mt-4">
                    <button @click="saveModal" class="bg-blue-500 text-white py-2 px-4 rounded mr-2">Save</button>
                    <button @click="closeModal" class="bg-gray-300 py-2 px-4 rounded">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

// Org profile info
const orgAddressLine = ref('');
const city = ref('');
const stateOrRegion = ref('');
const postalCode = ref('');
const country = ref('');

// Address Modal
const isAddressModal = ref(false);

// Fetch address on mount
const auth = authStore;
const userId = auth.user.id;

const fetchOrgAddress = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/organisation-address/${userId}`, {}, 'GET');
        if (response.status) {
            orgAddressLine.value = response.data.address_line;
            city.value = response.data.city;
            stateOrRegion.value = response.data.state_or_region;
            postalCode.value = response.data.postal_code;
            country.value = response.data.country_id;
        } else {
            Swal.fire('Error', 'Failed to fetch organization address', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization address:", error);
        Swal.fire('Error', 'Failed to fetch organization address', 'error');
    }
};

const updateOrgAddress = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/organisation-address/${userId}`, {
            address_line: orgAddressLine.value,
            city: city.value,
            state_or_region: stateOrRegion.value,
            postal_code: postalCode.value,
            country_id: country.value
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Address updated successfully', 'success');
        } else {
            Swal.fire('Error', 'Failed to update address', 'error');
        }
    } catch (error) {
        console.error("Error updating address:", error);
        Swal.fire('Error', 'Failed to update address', 'error');
    }
};

// Modal logic
const isModalVisible = ref(false);
const modalTitle = ref('');

const openModal = (field) => {
    if (field === 'address') {
        modalTitle.value = 'Edit Address';
        isAddressModal.value = true;
    }
    isModalVisible.value = true;
};

const closeModal = () => {
    isModalVisible.value = false;
    isAddressModal.value = false;
};

const saveModal = () => {
    if (isAddressModal.value) {
        updateOrgAddress();
    }
    closeModal();
};

onMounted(fetchOrgAddress);
</script>

<style scoped>
.profile-data-show {
    padding: 20px;
}

/* Modal styles */
.fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.bg-opacity-75 {
    background-color: rgba(0, 0, 0, 0.75);
}

.max-w-md {
    max-width: 28rem;
}
</style>
