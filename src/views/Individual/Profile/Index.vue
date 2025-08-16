<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";
import functions from "../../../global/cookie";


const auth = authStore;
const userId = auth.user.id;
const first_name = auth.user.first_name;
const last_name = auth.user.last_name;
const email = auth.user.email;
const username = auth.user.username;
// lastName.value = last_name;
const baseURL = auth.apiBase;


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
const userCountry = ref('');
const country_id = ref('');
const country_name = ref('');
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

const allDialingCodes = ref([]);


// First Name Change
const modalVisibleName = ref(false);
const firstName = ref('');
// Last Name Change
const modalVisibleLastName = ref(false);
const lastName = ref('');
// Org username Change
const modalVisibleUsername = ref(false);
const newUsername = ref('');


// Org User Email Change
const modalVisibleUserEmail = ref(false);
const newEmail = ref('');

// Org Country Change
const modalOpenCountry = ref(false);
const countryChangeRequest = ref('');



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

const updateFirstLastName = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-first-last-name/${userId}`, {
            first_name: firstName.value,
            last_name: lastName.value,
        }, 'PUT');
        if (response.status) {
            // Success handling
            Swal.fire('Success', response.message || 'Name updated successfully', 'success');

            // Close the modal after successful update
            closeNameModal();

            // Update the first_name in sessionStorage explicitly
            let user = JSON.parse(functions.getCookie('user'));
            if (user) {
                user.first_name = firstName.value;
                user.last_name = lastName.value;
                functions.setCookie('user', JSON.stringify(user));
            }

            // Optionally, you can reload the page or update the UI without reloading
            window.location.reload();
        } else {
            // Display error message from server response
            Swal.fire('Error', response.message || 'Failed to update name, please try again.', 'error');
        }

    } catch (error) {
        // Catch block for any other errors
        console.error("Error updating first_name:", error);
        Swal.fire('Error', error.response?.data?.message || 'An unexpected error occurred while updating the first_name', 'error');
    }
};
const updateLastName = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-last-name/${userId}`, {
            last_name: lastName.value,
        }, 'PUT');
        if (response.status) {
            // Success handling
            Swal.fire('Success', response.message || 'Last Name updated successfully', 'success');

            // Close the modal after successful update
            closeLastNameModal();

            // Update the last_name in sessionStorage explicitly
            let user = JSON.parse(functions.getCookie('user'));
            if (user) {
                user.last_name = lastName.value;
                functions.setCookie('user', JSON.stringify(user));
            }

            // Optionally, you can reload the page or update the UI without reloading
            window.location.reload();
        } else {
            // Display error message from server response
            Swal.fire('Error', response.message || 'Failed to update last_name, please try again.', 'error');
        }

    } catch (error) {
        // Catch block for any other errors
        console.error("Error updating last_name:", error);
        Swal.fire('Error', error.response?.data?.message || 'An unexpected error occurred while updating the last_name', 'error');
    }
};
//Update username
const updateUsername = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-username/${userId}`, {
            username: newUsername.value,
        }, 'PUT');

        if (response.status) {
            // Success handling
            Swal.fire('Success', response.message || 'Username updated successfully', 'success');

            // Close the modal after successful update
            closeUsernameModal();

            // Update the last_name in sessionStorage explicitly
            let user = JSON.parse(sessionStorage.getItem('user'));
            if (user) {
                user.username = newUsername.value;
                sessionStorage.setItem('user', JSON.stringify(user));
            }

            // Optionally, you can reload the page or update the UI without reloading
            window.location.reload();
        } else {
            // Handle other non-validation-related errors
            Swal.fire('Error', response.message || 'Failed to update username, please try again.', 'error');
        }

    } catch (error) {
        // Check for validation errors
        if (error.response?.status === 422) {
            const validationErrors = error.response.data.errors;
            if (validationErrors?.username) {
                // Display validation error specific to the username field
                Swal.fire('Validation Error', validationErrors.username[0], 'error');
            } else {
                // General validation error message
                Swal.fire('Validation Error', 'The provided data is invalid.', 'error');
            }
        } else {
            // Handle any other errors
            console.error("Error updating username:", error);
            Swal.fire('Error', error.response?.data?.message || 'An unexpected error occurred while updating the username', 'error');
        }
    }
};

const fetchOrgAddress = async () => {
    try {
        const response = await auth.fetchProtectedApi("/api/addresses/", {}, 'GET');

        // Ensure the response status is true and data exists
        if (response.status && response.data) {
            console.log(response.data);
            address_line_one.value = response.data.address_line_one || '';  // Use default values if data is missing
            address_line_two.value = response.data.address_line_two || '';
            city.value = response.data.city || '';
            state_or_region.value = response.data.state_or_region || '';
            postal_code.value = response.data.postal_code || '';
        } else {
            Swal.fire('Error', 'Failed to fetch organization address try-else', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization address:", error);
        Swal.fire('Error', 'Failed to fetch organization address catch', 'error');
    }
};

const createAddress = async () => {
    try {
        const response = await auth.fetchProtectedApi("/api/addresses/", {
            address_line_one: address_line_one.value,
            address_line_two: address_line_two.value,
            city: city.value,
            state_or_region: state_or_region.value,
            postal_code: postal_code.value
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
        const response = await auth.fetchProtectedApi(`/api/addresses/${userId}`, {
            address_line_one: address_line_one.value,
            address_line_two: address_line_two.value,
            city: city.value,
            state_or_region: state_or_region.value,
            postal_code: postal_code.value
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
        const response = await auth.fetchProtectedApi(`/api/phone-numbers/${userId}`, {}, 'GET');
        // Ensure the response status is true and data exists
        if (response.status && response.data) {
            dialing_code.value = response.data.dialing_code || '';
            phone_number.value = response.data.phone_number || '';
            phone_type.value = response.data.phone_type || '';
            statusPhone.value = response.data.status || '';
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
        const response = await auth.fetchProtectedApi(`/api/phone-numbers/${userId}`, {
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

const fetchDialingCode = async () => {
    try {
        // const response = await auth.fetchProtectedApi("/api/phone-numbers/dialing-codes/", {}, 'GET');
        const response = await auth.fetchProtectedApi("/api/dialing-codes/", {}, 'GET');

        // Ensure the response status is true and data exists
        if (response.status && response.data) {
            allDialingCodes.value = response.data;
            console.log(allDialingCodes);
            // country_id.value = response.data.country_id || '';
            // dialing_code.value = response.data.dialing_code || '';
        } else {
            //Swal.fire('Error', 'Failed to fetch dialing code', 'error');
        }
    } catch (error) {
        console.error("Error fetching dialing code:", error);
        Swal.fire('Error', 'Failed to fetch dialing code', 'error');
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

            // Update the email in sessionStorage explicitly
            let user = JSON.parse(sessionStorage.getItem('user'));
            if (user) {
                user.email = newEmail.value;
                sessionStorage.setItem('user', JSON.stringify(user));
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

// const updateCountry = async () => {
//     try {
//         const response = await auth.fetchProtectedApi("/api/update-country/", {
//             country_name: newCountry.value,
//         }, 'PUT');
//         if (response.status) {
//             Swal.fire('Success', 'Country updated successfully', 'success');
//             // Close the modal after successful update
//             closeCountryModal();

//             // Update the first_name in sessionStorage explicitly
//             let user = JSON.parse(sessionStorage.getItem('user'));
//             if (user) {
//                 user.country_name = newCountry.value;
//                 sessionStorage.setItem('user', JSON.stringify(user));
//             }
//             // Now refresh the current page
//             window.location.reload();
//         } else {
//             Swal.fire('Error', 'Failed to update country', 'error');
//         }

//     } catch (error) {
//         console.error("Error updating country:", error);
//         Swal.fire('Error', 'Failed to update country', 'error');
//     }
// };


const fetchOrgCountry = async () => {
    try {
        const response = await auth.fetchProtectedApi("/api/user-countries/country-name/", {}, 'GET');
        console.log(response.data);

        if (response.status && response.data) {
            userCountry.value = response.data.user_country_name.name || '';
        } else {
            //Swal.fire('Error', 'Failed to fetch organization country', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization country:", error);
        Swal.fire('Error', 'Failed to fetch organization country', 'error');
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
    firstName.value = first_name;
    lastName.value = last_name;
};

const closeNameModal = () => {
    modalVisibleName.value = false;
    firstName.value = {};
    lastName.value = {};
};

const openUsernameModal = () => {
    modalVisibleUsername.value = true;
    newUsername.value = username;
};

const closeUsernameModal = () => {
    modalVisibleUsername.value = false;
};

//Email Address
const openEmailModal = () => {
    modalVisibleUserEmail.value = true;
    newEmail.value = email;
};

const closeEmailModal = () => {
    modalVisibleUserEmail.value = false;
};

//Country
const openCountryModal = () => {
    modalOpenCountry.value = true;
    countryChangeRequest.value = userCountry.value;
};

const closeCountryModal = () => {
    modalOpenCountry.value = false;
};

onMounted(() => {
    fetchLogo();
    fetchDialingCode();
    fetchOrgAddress();
    fetchOrgPhoneNumber();
    fetchOrgCountry();
});
</script>

<template>
    <div class="flex flex-col h-screen overflow-y-auto pb-7 pr-7">
        <!-- Logo Section -->
        <section>
            <div class="bg-white shadow rounded-lg p-6">
                <!-- Card Header -->
                <h2 class="text-lg font-semibold text-gray-800 mb-6">Logo</h2>

                <!-- Card Content -->
                <div class="flex flex-col md:flex-row md:justify-between gap-6">

                    <!-- Image Display -->
                    <div class="flex justify-center md:justify-start">
                        <img v-if="logoPath" :src="`${baseURL}${logoPath}`" alt="Logo"
                            class="rounded-lg w-full max-w-[250px]">
                        <img v-else src="../../../assets/Logo/Your-logo-here.png" alt="Logo"
                            class="rounded-lg w-full max-w-[250px]">
                    </div>

                    <!-- Upload Section -->
                    <div class="w-full md:w-auto flex flex-col justify-center mt-4 md:mt-0">
                        <label for="logo" class="block text-sm font-medium text-gray-700 mb-2">
                            Upload new logo
                        </label>
                        <input type="file" id="logo" @change="handleImageUpload"
                            class="block w-full text-sm text-gray-500 mb-4">
                        <button @click="profileImageUpdate"
                            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
                            Save
                        </button>
                    </div>

                </div>
            </div>
        </section>


        <!-- first first_name section -->
        <section>
            <div class="bg-white shadow rounded-lg p-6 mt-5">
                <!-- Card Header -->
                <h2 class="text-lg font-semibold text-gray-800 mb-6">Name Update</h2>

                <!-- Name Display -->
                <div class="flex items-center justify-between pb-4">
                    <div>
                        <p class="text-gray-900 font-medium">{{ first_name }} {{ last_name }}</p>
                    </div>
                    <button @click="openNameModal()" class="text-sm text-blue-600 hover:underline">
                        Edit
                    </button>
                </div>

                <!-- Modal -->
                <div v-if="modalVisibleName"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <!-- Modal Title -->
                        <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">
                            Edit Name
                        </h2>

                        <!-- First Name -->
                        <div class="mb-5">
                            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First
                                Name</label>
                            <input v-model="firstName" type="text" id="firstName" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 shadow-sm 
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" required />
                            <p v-if="auth.errors?.firstName" class="text-red-500 text-xs mt-2">
                                {{ auth.errors?.firstName[0] }}
                            </p>
                        </div>

                        <!-- Last Name -->
                        <div class="mb-5">
                            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input v-model="lastName" type="text" id="lastName" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 shadow-sm 
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" required />
                            <p v-if="auth.errors?.lastName" class="text-red-500 text-xs mt-2">
                                {{ auth.errors?.lastName[0] }}
                            </p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button @click="closeNameModal"
                                class="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow transition">
                                Close
                            </button>
                            <button @click="updateFirstLastName"
                                class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition">
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <!-- Username section -->
        <section>
            <div class="bg-white shadow rounded-lg p-6 mt-5">
                <!-- Card Header -->
                <h2 class="text-lg font-semibold text-gray-800 mb-6">Username</h2>

                <!-- Username Display -->
                <div class="flex items-center justify-between pb-4">
                    <div>
                        <p class="text-gray-900 font-medium">{{ username }}</p>
                    </div>
                    <button @click="openUsernameModal()" class="text-sm text-blue-600 hover:underline">
                        Edit
                    </button>
                </div>

                <!-- Username Modal -->
                <div v-if="modalVisibleUsername"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <!-- Modal Title -->
                        <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">
                            Edit Username
                        </h2>

                        <!-- Input Field -->
                        <div class="mb-5">
                            <label for="newUsername" class="block text-sm font-medium text-gray-700 mb-2">
                                New Username
                            </label>
                            <input v-model="newUsername" type="text" id="newUsername" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 shadow-sm 
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" required />
                            <p v-if="auth.errors?.newUsername" class="text-red-500 text-xs mt-2">
                                {{ auth.errors?.newUsername[0] }}
                            </p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button @click="closeUsernameModal"
                                class="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow transition">
                                Close
                            </button>
                            <button @click="updateUsername"
                                class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition">
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <!-- Address Section -->
        <section>
            <div class="bg-white shadow rounded-lg p-6 mt-5">
                <!-- Card Header -->
                <h2 class="text-lg font-semibold text-gray-800 mb-6">Address</h2>

                <!-- Address Display -->
                <div class="flex items-start justify-between pb-4">
                    <div>
                        <p class="text-gray-900 mt-1 leading-relaxed">
                            <span v-if="address_line_one">{{ address_line_one }}, </span>
                            <span v-if="address_line_two">{{ address_line_two }}, </span>
                            <span v-if="city">{{ city }}, </span>
                            <span v-if="state_or_region">{{ state_or_region }}, </span>
                            <span v-if="postal_code">{{ postal_code }}, </span>
                            <span v-if="userCountry">{{ userCountry }}</span>
                        </p>
                    </div>
                    <button @click="openAddressModal()"
                        class="text-sm text-blue-600 hover:underline whitespace-nowrap ml-4">
                        Edit
                    </button>
                </div>

                <!-- Address Modal -->
                <div v-if="modalVisibleAddress"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <!-- Modal Title -->
                        <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">
                            {{ isEditMode ? 'Create Address' : 'Edit Address' }}
                        </h2>

                        <!-- Form Fields -->
                        <div class="space-y-5">
                            <!-- Address Line One -->
                            <div>
                                <label for="address_line_one" class="block text-sm font-medium text-gray-700 mb-1">
                                    Address Line One
                                </label>
                                <input v-model="address_line_one" type="text" id="address_line_one" class="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" required />
                                <p v-if="auth.errors?.address_line_one" class="text-red-500 text-xs mt-2">
                                    {{ auth.errors?.address_line_one[0] }}
                                </p>
                            </div>

                            <!-- Address Line Two -->
                            <div>
                                <label for="address_line_two" class="block text-sm font-medium text-gray-700 mb-1">
                                    Address Line Two
                                </label>
                                <input v-model="address_line_two" type="text" id="address_line_two" class="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" />
                                <p v-if="auth.errors?.address_line_two" class="text-red-500 text-xs mt-2">
                                    {{ auth.errors?.address_line_two[0] }}
                                </p>
                            </div>

                            <!-- City -->
                            <div>
                                <label for="city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input v-model="city" type="text" id="city" class="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" />
                                <p v-if="auth.errors?.city" class="text-red-500 text-xs mt-2">{{ auth.errors?.city[0] }}
                                </p>
                            </div>

                            <!-- State or Region -->
                            <div>
                                <label for="state_or_region" class="block text-sm font-medium text-gray-700 mb-1">
                                    State or Region
                                </label>
                                <input v-model="state_or_region" type="text" id="state_or_region" class="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" />
                                <p v-if="auth.errors?.state_or_region" class="text-red-500 text-xs mt-2">
                                    {{ auth.errors?.state_or_region[0] }}
                                </p>
                            </div>

                            <!-- Postal Code -->
                            <div>
                                <label for="postal_code" class="block text-sm font-medium text-gray-700 mb-1">Postal
                                    Code</label>
                                <textarea v-model="postal_code" id="postal_code" class="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm resize-none
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"></textarea>
                                <p v-if="auth.errors?.postal_code" class="text-red-500 text-xs mt-2">
                                    {{ auth.errors?.postal_code[0] }}
                                </p>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                            <button @click="closeAddressModal"
                                class="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow transition">
                                Close
                            </button>
                            <button @click="isEditMode ? createAddress() : updateAddress()"
                                class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition">
                                {{ isEditMode ? 'Submit' : 'Update' }}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </section>


        <!-- Mobile number section -->
        <section>
            <div class="bg-white shadow rounded-lg p-6 mt-5">
                <!-- Card Header -->
                <h2 class="text-lg font-semibold text-gray-800 mb-6">Mobile Number</h2>

                <!-- Mobile Number Display -->
                <div class="flex items-start justify-between pb-4">
                    <div>
                        <p class="text-gray-900 mt-1 leading-relaxed">
                            <span>{{ dialing_code }} {{ phone_number }}</span>
                            <span class="ml-6">
                                Type: {{ phone_type === 1 ? 'Mobile' : phone_type === 2 ? 'Work' : phone_type === 3 ?
                                    'Home' : 'Others' }}
                            </span>
                            <span class="ml-6">
                                Status: {{ statusPhone === 1 ? 'Private' : statusPhone === 2 ? 'Connected Organisation'
                                    : statusPhone === 3 ? 'Public' : 'Others' }}
                            </span>
                        </p>
                    </div>
                    <button @click="openPhoneModal()"
                        class="text-sm text-blue-600 hover:underline ml-4 whitespace-nowrap">
                        Edit
                    </button>
                </div>

                <!-- Mobile Number Modal -->
                <div v-if="modalVisiblePhone"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <!-- Modal Header -->
                        <h2 class="text-xl font-semibold text-gray-800 text-center mb-6">
                            {{ isEditModePhone ? 'Edit Mobile Number' : 'Add Mobile Number' }}
                        </h2>

                        <div class="space-y-4">
                            <!-- Dialing Code -->
                            <div>
                                <label for="dialing_code_id" class="block text-sm font-medium text-gray-700 mb-1">
                                    Dialing Code <span class="text-red-500">*</span>
                                </label>
                                <select v-model="dialing_code_id" id="dialing_code_id"
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required>
                                    <option value="">Select</option>
                                    <option v-for="dialing_code in allDialingCodes" :key="dialing_code.id"
                                        :value="dialing_code.id">
                                        {{ dialing_code.dialing_code }} - ({{ dialing_code.name }})
                                    </option>
                                </select>
                                <p v-if="auth.errors?.dialing_code_id" class="text-red-500 text-xs mt-1">
                                    {{ auth.errors?.dialing_code_id[0] }}
                                </p>
                            </div>

                            <!-- Phone Number -->
                            <div>
                                <label for="phone_number" class="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span class="text-gray-500">(Numbers only)</span>
                                </label>
                                <input v-model="phone_number" type="text" id="phone_number"
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    @input="phone_number = phone_number.replace(/\D/g, '')" required />
                                <p v-if="auth.errors?.phone_number" class="text-red-500 text-xs mt-1">
                                    {{ auth.errors?.phone_number[0] }}
                                </p>
                            </div>

                            <!-- Phone Type -->
                            <div>
                                <label for="phone_type" class="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Type
                                </label>
                                <select v-model="phone_type" id="phone_type"
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required>
                                    <option disabled value="">Select</option>
                                    <option value="1">Mobile</option>
                                    <option value="2">Work</option>
                                    <option value="3">Home</option>
                                    <option value="4">Other</option>
                                </select>
                                <p v-if="auth.errors?.phone_type" class="text-red-500 text-xs mt-1">
                                    {{ auth.errors?.phone_type[0] }}
                                </p>
                            </div>

                            <!-- Status -->
                            <div>
                                <label for="statusPhone" class="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select v-model="statusPhone" id="statusPhone"
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="1">Public</option>
                                    <option value="0">Private</option>
                                </select>
                                <p v-if="auth.errors?.statusPhone" class="text-red-500 text-xs mt-1">
                                    {{ auth.errors?.statusPhone[0] }}
                                </p>
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="flex justify-end gap-3 mt-6">
                            <button @click="closePhoneModal"
                                class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                                Cancel
                            </button>
                            <button @click="isEditModePhone ? updateOrgPhoneNumber() : updateOrgPhoneNumber()"
                                class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                                {{ isEditModePhone ? 'Update' : 'Submit' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <!-- User email section -->
        <section>
            <div class="bg-white shadow rounded-lg p-6 mt-5">
                <!-- Card Header -->
                <h2 class="text-lg font-semibold text-gray-800 mb-6">User Email</h2>

                <!-- Email Display -->
                <div class="flex items-start justify-between pb-4">
                    <div>
                        <p class="text-gray-900 mt-1 leading-relaxed">
                            {{ email }}
                            <span class="ml-6">
                                Status: {{ statusPhone === 1 ? 'Private' : statusPhone === 2 ? 'Connected Organisation'
                                    : statusPhone === 3 ? 'Public' : 'Others' }}
                            </span>
                        </p>
                    </div>
                    <button @click="openEmailModal()"
                        class="text-sm text-blue-600 hover:underline ml-4 whitespace-nowrap">
                        Edit
                    </button>
                </div>

                <!-- Email Modal -->
                <div v-if="modalVisibleUserEmail"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <!-- Modal Title -->
                        <h2 class="text-xl font-semibold text-gray-800 text-center mb-6">Edit User Email</h2>

                        <!-- Input Field -->
                        <div class="mb-4">
                            <label for="newEmail" class="block text-sm font-medium text-gray-700">User Email
                                Address</label>
                            <input v-model="newEmail" type="email" id="newEmail" class="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-2.5
                        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition" required />
                            <p v-if="auth.errors?.newEmail" class="text-red-500 text-xs mt-1">
                                {{ auth.errors?.newEmail[0] }}
                            </p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end gap-3 mt-4">
                            <button @click="closeEmailModal"
                                class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                                Close
                            </button>
                            <button @click="updateUserEmail()"
                                class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <!-- country section -->
        <section>
            <div class="bg-white shadow rounded-lg p-6 mt-5">
                <!-- Card Header -->
                <h2 class="text-lg font-semibold text-gray-800 mb-6">Country</h2>

                <!-- Country Display -->
                <div class="flex items-start justify-between pb-4">
                    <div>
                        <p class="text-gray-900 mt-1 leading-relaxed">
                            {{ userCountry }}
                        </p>
                    </div>
                    <!-- Edit button commented out
      <button @click="openCountryModal()" class="text-sm text-blue-600 hover:underline ml-4 whitespace-nowrap">
        Edit
      </button>
      -->
                </div>

                <!-- Country Modal (commented out) -->
                <!--
    <div v-if="modalOpenCountry" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <h2 class="text-xl font-semibold text-gray-800 text-center mb-6">Change your country</h2>

        <div class="mb-4">
          <label for="countryChangeRequest" class="block text-sm font-medium text-gray-700">Country change request</label>
          <p class="text-sm text-gray-500 mb-2">Please provide a country and a reason for change request</p>
          <input v-model="countryChangeRequest" type="text" id="countryChangeRequest"
                 class="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-2.5
                        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition" required />
          <p v-if="auth.errors?.countryChangeRequest" class="text-red-500 text-xs mt-1">
            {{ auth.errors?.countryChangeRequest[0] }}
          </p>
        </div>

        <div class="flex justify-end gap-3 mt-4">
          <button @click="closeCountryModal"
                  class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
            Close
          </button>
          <button @click="updateCountry()"
                  class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            Submit
          </button>
        </div>
      </div>
    </div>
    -->
            </div>
        </section>

    </div>
</template>