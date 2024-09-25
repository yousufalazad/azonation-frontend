<template>
    <!-- Logo Section -->
    <section>
        <h2 class="text-lg font-bold mb-4 left-color-shade py-2">Logo</h2>
        <div class="mb-4 flex justify-between pb-9">
            <div v-if="logoPath">
                <img :src="`${baseURL}${logoPath}`" alt="Logo" class="rounded-lg h-[150px] ml-5">
            </div>
            <div>
                <label for="logo" class="block text-sm font-medium text-gray-700 mb-4">Upload new logo</label>
                <input type="file" id="logo" @change="handleImageUpload"
                    class="block w-full text-sm text-gray-500 mb-4">
                <button @click="profileImageUpdate" class="mt-2 bg-blue-500 text-white py-2 px-4 rounded">Save</button>
            </div>
        </div>
    </section>

    <!-- User name section -->
    <section>
        <div class="space-y-4">

            <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Name</h3>

            <p class="ml-5 pb-9">{{ name }}
                <button @click="openNameModal()" class="text-blue-500 pl-9">Edit</button>
            </p>
        </div>

        <!-- User name Modal -->
        <div v-if="modalVisibleName" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-center">
                    Edit Name
                </h2>

                <div class="mb-4">
                    <label for="newName" class="block text-sm font-medium text-gray-700">New Name</label>
                    <input v-model="newName" type="text" id="newName"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required />
                    <p v-if="auth.errors?.newName" class="text-red-500 text-sm mt-1">{{
                        auth.errors?.newName[0] }}</p>
                </div>


                <div class="flex justify-end">
                    <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                        @click="closeNameModal">
                        Close
                    </button>

                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" @click="updateName()">
                        Update
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Address Section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Address</h3>

            <p class="ml-5 pb-9"><span>{{ address_line_one }}</span>,{{ address_line_two }}, {{ city }}, {{
                state_or_region }}, {{
                    postal_code }}, {{ country_id }}
                <button @click="openAddressModal()" class="text-blue-500 pl-9">Edit</button>
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
    </section>

    <!-- Mobile number section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-4 left-color-shade py-2">Mobile number</h3>

            <div class="flex justify-between">
                <div>
                    <p class="ml-5 pb-9 flex">
                        <span>{{ dialing_code }}{{ phone_number }}</span>
                        <span class="ml-16">Type:
                            {{ phone_type === 1 ? 'Mobile' : phone_type === 2 ? 'Work' : phone_type === 3 ? 'Home' :
                            'Others' }}
                        </span>,
                        <span class="ml-16">{{ statusPhone }}</span>
                    </p>

                </div>

                <div>
                    <button @click="openPhoneModal()" class="text-blue-500 pl-9 ml-16">Edit</button>

                </div>
            </div>

        </div>

        <!-- Mobile number Modal -->
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
                    <label for="statusPhone" class="block text-sm font-medium text-gray-700">statusPhone
                        (boolean)</label>
                    <input v-model="statusPhone" type="boolean" id="statusPhone"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <p v-if="auth.errors?.statusPhone" class="text-red-500 text-sm mt-1">{{
                        auth.errors?.statusPhone[0] }}</p>
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
    </section>

    <!-- User email section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-2 left-color-shade py-2">User Email</h3>

            <div class="flex justify-between">
                <div>
                    <p class="ml-5 pb-9">{{ email }}
                    </p>
                </div>
                <div><button @click="openEmailModal()" class="text-blue-500 pl-9">Edit</button></div>
            </div>

        </div>

        <!-- User email Modal -->
        <div v-if="modalVisibleUserEmail"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-center">
                    Edit User Email
                </h2>

                <div class="mb-4">
                    <label for="newEmail" class="block text-sm font-medium text-gray-700">User email address</label>
                    <input v-model="newEmail" type="newEmail" id="newEmail"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required />
                    <p v-if="auth.errors?.newEmail" class="text-red-500 text-sm mt-1">{{
                        auth.errors?.newEmail[0] }}</p>
                </div>


                <div class="flex justify-end">
                    <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                        @click="closeEmailModal">
                        Close
                    </button>

                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        @click="updateUserEmail()">
                        Update
                    </button>
                </div>
            </div>
        </div>
    </section>


</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

const auth = authStore;
const userId = auth.user.id;
const name = auth.user.name;
const email = auth.user.email;
const baseURL = 'http://localhost:8000';



// Org logo
const logoPath = ref('');
const selectedImage = ref(null);

// Org address
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
const dialing_code = ref('');
const dialing_code_id = ref('');
const phone_number = ref('');
const phone_type = ref('');
const statusPhone = ref(''); //status defined in address
const modalVisiblePhone = ref(false);
const isEditModePhone = ref(false);


// Org Name Change
const modalVisibleName = ref(false);
const newName = ref('');


// Org User Email Change
const modalVisibleUserEmail = ref(false);
const newEmail = ref('');


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
                window.location.reload();
            } else {
                Swal.fire('Error', 'Failed to update logo', 'error');
            }
        } catch (error) {
            console.error("Error updating logo:", error);
            Swal.fire('Error', 'Failed to update logo', 'error');
        }
    }
};

const updateName = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-name/${userId}`, {
            name: newName.value,
        }, 'PUT');
        if (response.status) {
            // Success handling
            Swal.fire('Success', response.message || 'Name updated successfully', 'success');

            // Close the modal after successful update
            closeNameModal();

            // Update the name in localStorage explicitly
            let user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.name = newName.value;
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Optionally, you can reload the page or update the UI without reloading
            window.location.reload();
        } else {
            // Display error message from server response
            Swal.fire('Error', response.message || 'Failed to update name, please try again.', 'error');
        }

    } catch (error) {
        // Catch block for any other errors
        console.error("Error updating name:", error);
        Swal.fire('Error', error.response?.data?.message || 'An unexpected error occurred while updating the name', 'error');
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
            dialing_code.value = response.data.dialing_code || '';
            phone_number.value = response.data.phone_number || '';
            phone_type.value = response.data.phone_type || '';
            statusPhone.value = response.data.status || '';
        } else {
            //Swal.fire('Error', 'Failed to fetch organization Phone Number', 'error');
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
            status: statusPhone.value,
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


const updateUserEmail = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-email/${userId}`, {
            email: newEmail.value,
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Email updated successfully', 'success');
            // Close the modal after successful update
            closeEmailModal();

            // Update the name in localStorage explicitly
            let user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.email = newEmail.value;
                localStorage.setItem('user', JSON.stringify(user));
            }
            // Now refresh the current page
            window.location.reload();
        } else {
            Swal.fire('Error', 'Failed to update email', 'error');
        }

    } catch (error) {
        console.error("Error updating email:", error);
        Swal.fire('Error', 'Failed to update email', 'error');
    }
};

const handleImageUpload = (event) => {
    selectedImage.value = event.target.files[0];
};


//for Address
const openAddressModal = () => {

    if (address_user_id.value === null) {
        //console.log('true', address_user_id);
        isEditMode.value = true; // createAddress() will work 
    } else {
        //console.log('false', address_user_id);
        isEditMode.value = false; // updateAddress() will work
    }
    //console.log('bahire', address_user_id)
    modalVisibleAddress.value = true;
};

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

const openNameModal = () => {
    modalVisibleName.value = true;
    newName.value = name;
};

const closeNameModal = () => {
    modalVisibleName.value = false;
};

//Email Address
const openEmailModal = () => {
    modalVisibleUserEmail.value = true;
    newEmail.value = email;
};

const closeEmailModal = () => {
    modalVisibleUserEmail.value = false;
};

onMounted(fetchOrgAddress);
onMounted(fetchOrgPhoneNumber);
onMounted(fetchLogo);

</script>

<style scoped>
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