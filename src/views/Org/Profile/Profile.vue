<template>
    <div class="profile-data-show">
        <h2 class="text-xl font-bold mb-4">Org Profile</h2>

        <!-- Logo Section -->
        <div class="mb-4">
            <label for="logo" class="block text-sm font-medium text-gray-700">Logo</label>
            <input type="file" id="logo" @change="handleImageUpload" class="block w-full text-sm text-gray-500">
            <div v-if="logoPath" class="mt-3">
                <img :src="`${baseURL}${logoPath}`" alt="Organization Logo" class="rounded-lg max-w-xs">
            </div>
            <button @click="profileImageUpdate" class="mt-2 bg-blue-500 text-white py-2 px-4 rounded">Save Logo</button>
        </div>

        <!-- Organization Information Section with Update Buttons -->
        <div class="space-y-4">
            <p>Short Description: <span>{{ shortDescription }}</span> <button @click="openModal('shortDescription')"
                    class="text-blue-500">Edit</button></p>
            <p>Detail Description: <span>{{ detailDescription }}</span> <button @click="openModal('detailDescription')"
                    class="text-blue-500">Edit</button></p>
            <p>whoWeAre: <span>{{ whoWeAre }}</span> <button @click="openModal('whoWeAre')"
                    class="text-blue-500">Edit</button></p>
            <p>whatWeDo: <span>{{ whatWeDo }}</span> <button @click="openModal('whatWeDo')"
                    class="text-blue-500">Edit</button></p>
            <p>howWeDo: <span>{{ howWeDo }}</span> <button @click="openModal('howWeDo')"
                    class="text-blue-500">Edit</button></p>

            <p>Mission: <span>{{ mission }}</span> <button @click="openModal('mission')"
                    class="text-blue-500">Edit</button></p>
            <p>Vision: <span>{{ vision }}</span> <button @click="openModal('vision')"
                    class="text-blue-500">Edit</button></p>
            <p>Value: <span>{{ value }}</span> <button @click="openModal('value')" class="text-blue-500">Edit</button>
            </p>
            <p>Areas of Focus: <span>{{ areasOfFocus }}</span> <button @click="openModal('areasOfFocus')"
                    class="text-blue-500">Edit</button></p>
            <p>Causes: <span>{{ causes }}</span> <button @click="openModal('causes')"
                    class="text-blue-500">Edit</button></p>
            <p>Impact: <span>{{ impact }}</span> <button @click="openModal('impact')"
                    class="text-blue-500">Edit</button></p>
            <p>whyJoinUs: <span>{{ whyJoinUs }}</span> <button @click="openModal('whyJoinUs')"
                    class="text-blue-500">Edit</button></p>
            <p>Scope of Work: <span>{{ scopeOfWork }}</span> <button @click="openModal('scopeOfWork')"
                    class="text-blue-500">Edit</button></p>
            <p>Organising Date: <span>{{ organisingDate }}</span> <button @click="openModal('organisingDate')"
                    class="text-blue-500">Edit</button></p>
            <p>Foundation Date: <span>{{ foundationDate }}</span> <button @click="openModal('foundationDate')"
                    class="text-blue-500">Edit</button></p>
            <p>Status: <span>{{ status }}</span> <button @click="openModal('status')"
                    class="text-blue-500">Edit</button></p>
        </div>

        <!-- Address Section -->
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-2">Address</h3>

            <p><span>{{ address_line_one }}</span>,{{ address_line_two }}, {{ city }}, {{ state_or_region }}, {{
                postal_code }}, {{ country_id }}
                <button @click="openAddressModal()" class="text-blue-500">Edit</button>
            </p>
        </div>

        <!-- Modal -->
        <div v-if="modalVisibleAddress"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-center">
                    {{ isEditMode ? 'Create Address' : 'Edit Address' }}
                </h2>

                <div class="mb-4">
                    <label for="address_line_one" class="block text-sm font-medium text-gray-700">Address Line
                        One</label>
                    <input v-model="address_line_one" type="text" id="address_line_one"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required />
                    <p v-if="auth.errors?.address_line_one" class="text-red-500 text-sm mt-1">{{
                auth.errors?.address_line_one[0] }}</p>
                </div>

                <div class="mb-4">
                    <label for="address_line_two" class="block text-sm font-medium text-gray-700">Address Line
                        Two</label>
                    <input v-model="address_line_two" type="text" id="address_line_two"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <p v-if="auth.errors?.address_line_two" class="text-red-500 text-sm mt-1">{{
                auth.errors?.address_line_two[0] }}</p>
                </div>

                <div class="mb-4">
                    <label for="city" class="block text-sm font-medium text-gray-700">city</label>
                    <input v-model="city" type="text" id="city"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <p v-if="auth.errors?.city" class="text-red-500 text-sm mt-1">{{ auth.errors?.city[0] }}</p>
                </div>


                <div class="mb-4">
                    <label for="state_or_region" class="block text-sm font-medium text-gray-700">state_or_region</label>
                    <input v-model="state_or_region" type="text" id="state_or_region"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <p v-if="auth.errors?.state_or_region" class="text-red-500 text-sm mt-1">{{
                auth.errors?.state_or_region[0] }}</p>
                </div>

                <div class="mb-4">
                    <label for="postal_code" class="block text-sm font-medium text-gray-700">postal_code</label>
                    <textarea v-model="postal_code" id="postal_code"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                    <p v-if="auth.errors?.postal_code" class="text-red-500 text-sm mt-1">{{ auth.errors?.postal_code[0]
                        }}</p>
                </div>

                <div class="mb-4">
                    <label for="country_id" class="block text-sm font-medium text-gray-700">country</label>
                    <textarea v-model="country_id" id="country_id"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                    <p v-if="auth.errors?.country_id" class="text-red-500 text-sm mt-1">{{ auth.errors?.country_id[0] }}
                    </p>
                </div>

                <div class="flex justify-end">
                    <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                        @click="closeAddressModal">
                        Close
                    </button>

                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        @click="isEditMode ? createAddress() : updateAddress()">
                        {{ isEditMode ? 'Submit' : 'Update' }}

                        <!-- only update is working for create and update -->
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile number section -->
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-2">Mobile number</h3>

            <p>{{ dialing_code_id }},{{ phone_number }}, {{ phone_type }}, {{ status }}
                <button @click="openPhoneModal()" class="text-blue-500">Edit</button>
            </p>
        </div>

        <!-- Modal -->
        <div v-if="modalVisiblePhone"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-center">
                    {{ isEditModePhone ? 'Edit mobile number' : 'Add Mobile Number' }}
                </h2>

                <div class="mb-4">
                    <label for="dialing_code_id" class="block text-sm font-medium text-gray-700">dialing_code_id</label>
                    <input v-model="dialing_code_id" type="text" id="dialing_code_id"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required />
                    <p v-if="auth.errors?.dialing_code_id" class="text-red-500 text-sm mt-1">{{
                auth.errors?.dialing_code_id[0] }}</p>
                </div>

                <div class="mb-4">
                    <label for="phone_number" class="block text-sm font-medium text-gray-700">phone_number (number
                        only)</label>
                    <input v-model="phone_number" type="text" id="phone_number"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <p v-if="auth.errors?.phone_number" class="text-red-500 text-sm mt-1">{{
                auth.errors?.phone_number[0] }}</p>
                </div>

                <div class="mb-4">
                    <label for="phone_type" class="block text-sm font-medium text-gray-700">phone_type (0/1/2/3)</label>
                    <input v-model="phone_type" type="text" id="phone_type"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <p v-if="auth.errors?.phone_type" class="text-red-500 text-sm mt-1">{{ auth.errors?.phone_type[0] }}
                    </p>
                </div>


                <div class="mb-4">
                    <label for="status" class="block text-sm font-medium text-gray-700">status (boolean)</label>
                    <input v-model="status" type="boolean" id="status"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <p v-if="auth.errors?.status" class="text-red-500 text-sm mt-1">{{
                auth.errors?.status[0] }}</p>
                </div>



                <div class="flex justify-end">
                    <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                        @click="closePhoneModal">
                        Close
                    </button>

                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        @click="isEditModePhone ? updateOrgPhoneNumber() : updateOrgPhoneNumber()">
                        {{ isEditModePhone ? 'Update' : 'Submit' }}
                        <!-- only update is working for create and update -->
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

const auth = authStore;
const userId = auth.user.id;
const baseURL = 'http://localhost:8000';

// Org profile info
const shortDescription = ref('');
const detailDescription = ref('');
const whoWeAre = ref('');
const whatWeDo = ref('');
const howWeDo = ref('');
const mission = ref('');
const vision = ref('');
const value = ref('');
const areasOfFocus = ref('');
const causes = ref('');
const impact = ref('');
const whyJoinUs = ref('');
const scopeOfWork = ref('');
const organisingDate = ref('');
const foundationDate = ref('');
const status = ref('');

// Org logo
const logoPath = ref('');
const selectedImage = ref(null);

// Org profile info
const address_user_id = ref(null);
const address_line_one = ref('');
const address_line_two = ref('');
const city = ref('');
const state_or_region = ref('');
const postal_code = ref('');
const country_id = ref('');
const modalVisibleAddress = ref(false);
const isEditMode = ref('');

// Org Phone Number
const dialing_code_id = ref('');
const phone_number = ref('');
const phone_type = ref('');
// const status = ref(''); //defined in address
const modalVisiblePhone = ref(false);
const isEditModePhone = ref(false);


// Modal logic
const isModalVisible = ref(false);
const modalTitle = ref('');
const modalModel = ref('');
const isTextarea = ref(false);
const fieldToUpdate = ref('');



const fetchLogo = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile/logo/${userId}`, {}, 'GET');
        if (response.status && response.data.image) {
            logoPath.value = response.data.image;
        }
    } catch (error) {
        console.error("Error fetching logo:", error);
    }
};

const profileImageUpdate = async () => {
    if (selectedImage.value) {
        const formData = new FormData();
        formData.append('image', selectedImage.value);
        try {
            const imageResponse = await auth.uploadProtectedApi(`/api/org-profile/logo/${userId}`, formData);
            if (imageResponse.status) {
                Swal.fire('Success', 'Logo saved successfully', 'success');
                logoPath.value = imageResponse.data.image;
            } else {
                Swal.fire('Error', 'Failed to update logo', 'error');
            }
        } catch (error) {
            console.error("Error updating logo:", error);
            Swal.fire('Error', 'Failed to update logo', 'error');
        }
    }
};
// Convert camel case field names to snake case
const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const updateSingleField = async (field, value) => {
    const snakeCaseField = camelToSnake(field);
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile-update/${userId}`, { [snakeCaseField]: value }, 'PUT');
        if (response.status) {
            Swal.fire('Success', `${field} updated successfully`, 'success');
        } else {
            Swal.fire('Error', `Failed to update ${field}`, 'error');
        }
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
        Swal.fire('Error', `Failed to update ${field}`, 'error');
    }
};

const fetchOrgProfileData = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile-data/${userId}`, {}, 'GET');
        if (response.status) {
            shortDescription.value = response.data.short_description;
            detailDescription.value = response.data.detail_description;
            whoWeAre.value = response.data.who_we_are;
            whatWeDo.value = response.data.what_we_do;
            howWeDo.value = response.data.how_we_do;
            mission.value = response.data.mission;
            vision.value = response.data.vision;
            value.value = response.data.value;
            areasOfFocus.value = response.data.areas_of_focus;
            causes.value = response.data.causes;
            impact.value = response.data.impact;
            whyJoinUs.value = response.data.why_join_us;
            scopeOfWork.value = response.data.scope_of_work;
            organisingDate.value = response.data.organising_date;
            foundationDate.value = response.data.foundation_date;
            status.value = response.data.status;
        } else {
            Swal.fire('Error', 'Failed to fetch organization details', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization details:", error);
        Swal.fire('Error', 'Failed to fetch organization details', 'error');
    }
};

const fetchOrgAddress = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/address/${userId}`, {}, 'GET');

        // Ensure the response status is true and data exists
        if (response.status && response.data) {
            address_user_id.value = response.data.user_id;
            address_line_one.value = response.data.address_line_one || '';  // Use default values if data is missing
            address_line_two.value = response.data.address_line_two || '';
            city.value = response.data.city || '';
            state_or_region.value = response.data.state_or_region || '';
            postal_code.value = response.data.postal_code || '';
            country_id.value = response.data.country_id || '';
        } else {
            Swal.fire('Error', 'Failed to fetch organization address', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization address:", error);
        Swal.fire('Error', 'Failed to fetch organization address', 'error');
    }
};

const createAddress = async () => {
    try {
        const response = await auth.fetchProtectedApi("/api/address/", {
            user_id: userId,
            address_line_one: address_line_one.value,
            address_line_two: address_line_two.value,
            city: city.value,
            state_or_region: state_or_region.value,
            postal_code: postal_code.value,
            country_id: country_id.value,
        }, 'POST');
        if (response.status) {
            Swal.fire('Success', 'Address created successfully', 'success');
        } else {
            Swal.fire('Error', 'Failed to created address', 'error');
        }
        closeAddressModal();
        //fetchOrgAddress();
    } catch (error) {
        console.error("Error create address:", error);
        Swal.fire('Error', 'Failed to create address', 'error');
    }
};

const updateAddress = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/address/${userId}`, {
            address_line_one: address_line_one.value,
            address_line_two: address_line_two.value,
            city: city.value,
            state_or_region: state_or_region.value,
            postal_code: postal_code.value,
            country_id: country_id.value,
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Address updated successfully', 'success');
        } else {
            Swal.fire('Error', 'Failed to update address', 'error');
        }
        closeAddressModal();
        fetchOrgAddress();
    } catch (error) {
        console.error("Error updating address:", error);
        Swal.fire('Error', 'Failed to update address', 'error');
    }
};

const fetchOrgPhoneNumber = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/phone-number/${userId}`, {}, 'GET');
        // Ensure the response status is true and data exists
        if (response.status && response.data) {
            dialing_code_id.value = response.data.dialing_code_id || '';
            phone_number.value = response.data.phone_number || '';
            phone_type.value = response.data.phone_type || '';
            status.value = response.data.status || '';
        } else {
            Swal.fire('Error', 'Failed to fetch organization Phone Number', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization Phone Number:", error);
        Swal.fire('Error', 'Failed to fetch organization Phone Number', 'error');
    }
};

const updateOrgPhoneNumber = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/phone-number/${userId}`, {
            dialing_code_id: dialing_code_id.value,
            phone_number: phone_number.value,
            phone_type: phone_type.value,
            status: status.value,
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Phone Number updated successfully', 'success');
        } else {
            Swal.fire('Error', 'Failed to update Phone Number', 'error');
        }
        closePhoneModal();
        fetchOrgPhoneNumber();
    } catch (error) {
        console.error("Error updating Phone Number:", error);
        Swal.fire('Error', 'Failed to update Phone Number', 'error');
    }
};

const handleImageUpload = (event) => {
    selectedImage.value = event.target.files[0];
};


//For Org Info
const openModal = (field) => {
    fieldToUpdate.value = field;
    modalModel.value = eval(field).value;
    modalTitle.value = `Edit ${field.replace(/([A-Z])/g, ' $1')}`.replace(/^./, str => str.toUpperCase());
    isTextarea.value = (field === 'shortDescription' || field === 'detailDescription' || field === `whoWeAre` || field === `whatWeDo`
        || field === 'howWeDo' || field === 'mission' || field === 'vision' || field === 'value' || field === 'areasOfFocus' || field === 'causes' || field === 'impact' || field === 'whyJoinUs');

    isModalVisible.value = true;
};

const closeModal = () => {
    isModalVisible.value = false;
};

const saveModal = () => {
    eval(fieldToUpdate.value).value = modalModel.value;
    updateSingleField(fieldToUpdate.value, modalModel.value);
    closeModal();
};

//for Address

const openAddressModal = () => {

    if (address_user_id.value === null) {
        console.log('true', address_user_id);
        isEditMode.value = true; // createAddress() will work 
    } else {
        console.log('false', address_user_id);
        isEditMode.value = false; // updateAddress() will work
    }
    console.log('bahire', address_user_id)
    modalVisibleAddress.value = true;
};

// const openAddressModal = () => {
//     isEditMode.value = true; //updateAddress() will work 
//     modalVisibleAddress.value = true;
// };

const closeAddressModal = () => {
    modalVisibleAddress.value = false;
};

//for Phone Number
const openPhoneModal = () => {
    isEditModePhone.value = true; //updateAddress() will work 
    modalVisiblePhone.value = true;
};

const closePhoneModal = () => {
    modalVisiblePhone.value = false;
};

onMounted(fetchOrgProfileData);
onMounted(fetchOrgAddress);
onMounted(fetchOrgPhoneNumber);
onMounted(fetchLogo);

</script>

<style scoped>
.profile-data-show {
    padding: 20px;
}

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

.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.flex {
    display: flex;
}

.justify-end {
    justify-content: flex-end;
}
</style>