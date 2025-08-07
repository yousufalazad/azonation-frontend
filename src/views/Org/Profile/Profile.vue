<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";
import functions from "../../../global/cookie";


const auth = authStore;
const userId = auth.user.id;
const name = auth.user.name;
const email = auth.user.email;
const username = auth.user.username;
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


// Org Name Change
const modalVisibleName = ref(false);
const newName = ref('');

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

            // Update the name in sessionStorage explicitly
            let user = JSON.parse(functions.getCookie('user'));
            if (user) {
                user.name = newName.value;
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
        console.error("Error updating name:", error);
        Swal.fire('Error', error.response?.data?.message || 'An unexpected error occurred while updating the name', 'error');
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

            // Update the name in sessionStorage explicitly
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
            //Swal.fire('Error', 'Failed to fetch organization Phone Number', 'error');
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
        const response = await auth.fetchProtectedApi("/api/phone-numbers/dialing-codes/", {}, 'GET');
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

            // Update the name in sessionStorage explicitly
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

//             // Update the name in sessionStorage explicitly
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
    newName.value = name;
};

const closeNameModal = () => {
    modalVisibleName.value = false;
    newName.value = {};
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
  <h2 class="text-sm font-semibold text-gray-700 mb-4 py-2">Logo</h2>
  <div class="mb-4 flex flex-col md:flex-row md:justify-between gap-6 pb-9">
    
    <!-- Image Display -->
    <div v-if="logoPath" class="flex justify-center md:justify-start">
      <img :src="`${baseURL}${logoPath}`" alt="Logo" class="rounded-lg w-full max-w-[250px]">
    </div>
    <div v-else class="flex justify-center md:justify-start">
      <img src="../../../assets/Logo/Your-logo-here.png" alt="Logo" class="rounded-lg w-full max-w-[250px]">
    </div>

    <!-- Upload Section -->
    <div class="w-full md:w-auto mt-4 md:mt-0">
      <label for="logo" class="block text-sm font-medium text-gray-700 mb-4">Upload new logo</label>
      <input type="file" id="logo" @change="handleImageUpload"
        class="block w-full text-sm text-gray-500 mb-4">
      <button @click="profileImageUpdate"
        class="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
        Save
      </button>
    </div>

  </div>
</section>


        <!-- Org name section -->
        <section>
            <div class="space-y-2">
                <div class="flex items-center justify-between border-b pb-2">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700">Name</h3>
                        <p class="text-gray-900 mt-1">{{ name }}</p>
                    </div>
                    <button @click="openNameModal()" class="text-sm text-primary hover:underline">
                        Edit
                    </button>
                </div>
            </div>

            <!-- Org name Modal -->
            <div v-if="modalVisibleName"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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

                        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            @click="updateName()">
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Username section -->
        <section>
            <div class="space-y-2 mt-5">
                <div class="flex items-center justify-between border-b pb-2">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700">Username</h3>
                        <p class="text-gray-900 mt-1">{{ username }}</p>
                    </div>
                    <button @click="openUsernameModal()" class="text-sm text-primary hover:underline">
                        Edit
                    </button>
                </div>
            </div>


            <!-- Username Modal -->
            <div v-if="modalVisibleUsername"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                    <h2 class="text-2xl font-bold mb-4 text-center">
                        Edit Name
                    </h2>

                    <div class="mb-4">
                        <label for="newUsername" class="block text-sm font-medium text-gray-700">New Name</label>
                        <input v-model="newUsername" type="text" id="newUsername"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required />
                        <p v-if="auth.errors?.newUsername" class="text-red-500 text-sm mt-1">{{
                            auth.errors?.newUsername[0] }}</p>
                    </div>


                    <div class="flex justify-end">
                        <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                            @click="closeUsernameModal">
                            Close
                        </button>

                        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            @click="updateUsername()">
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Address Section -->
        <section>
            <div class="space-y-2 mt-5">
                <div class="flex items-start justify-between border-b pb-2">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700">Address</h3>
                        <p class="text-gray-900 mt-1 leading-relaxed">
                            <span>{{ address_line_one }}</span>,
                            <span>{{ address_line_two }}</span>,
                            <span>{{ city }}</span>,
                            <span>{{ state_or_region }}</span>,
                            <span>{{ postal_code }}</span>,
                            <span>{{ userCountry }}</span>
                        </p>
                    </div>
                    <button @click="openAddressModal()"
                        class="text-sm text-primary hover:underline whitespace-nowrap ml-4">
                        Edit
                    </button>
                </div>
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
                        <label for="state_or_region"
                            class="block text-sm font-medium text-gray-700">state_or_region</label>
                        <input v-model="state_or_region" type="text" id="state_or_region"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        <p v-if="auth.errors?.state_or_region" class="text-red-500 text-sm mt-1">{{
                            auth.errors?.state_or_region[0] }}</p>
                    </div>

                    <div class="mb-4">
                        <label for="postal_code" class="block text-sm font-medium text-gray-700">postal_code</label>
                        <textarea v-model="postal_code" id="postal_code"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                        <p v-if="auth.errors?.postal_code" class="text-red-500 text-sm mt-1">{{
                            auth.errors?.postal_code[0]
                            }}</p>
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
            <div class="space-y-2 mt-5">
                <div class="flex items-start justify-between border-b pb-2">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700">Mobile Number</h3>
                        <p class="text-gray-900 mt-1 leading-relaxed">
                            <span>{{ dialing_code }}{{ phone_number }}</span>
                            <span class="ml-6">Type:
                                {{ phone_type === 1 ? 'Mobile' : phone_type === 2 ? 'Work' : phone_type === 3 ? 'Home' :
                                    'Others' }}
                            </span>
                            <span class="ml-6">Status:
                                {{ statusPhone === 1 ? 'Private' : statusPhone === 2 ? 'Connected Organisation' :
                                    statusPhone === 3 ? 'Public' : 'Others' }}
                            </span>
                        </p>
                    </div>
                    <button @click="openPhoneModal()"
                        class="text-sm text-primary hover:underline ml-4 whitespace-nowrap">
                        Edit
                    </button>
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
                        <label for="dialing_code_id" class="block text-sm font-medium text-gray-700 required">Dialing
                            Code</label>
                        <select v-model="dialing_code_id" id="dialing_code_id"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required>
                            <option value="">Select</option>
                            <option v-for="dialing_code in allDialingCodes" :key="dialing_code.id"
                                :value="dialing_code.id">
                                {{ dialing_code.dialing_code }} - ({{ dialing_code.country_name }})
                            </option>
                        </select>
                        <p v-if="auth.errors?.dialing_code_id" class="text-red-500 text-sm mt-1">
                            {{ auth.errors?.dialing_code_id[0] }}
                        </p>
                    </div>


                    <div class="mb-4">
                        <label for="phone_number" class="block text-sm font-medium text-gray-700">phone_number (number
                            only)</label>

                        <input v-model="phone_number" type="text" id="phone_number"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            @input="phone_number = phone_number.replace(/\D/g, '')" required />

                        <p v-if="auth.errors?.phone_number" class="text-red-500 text-sm mt-1">{{
                            auth.errors?.phone_number[0] }}</p>
                    </div>

                    <div class="mb-4">
                        <label for="phone_type" class="block text-sm font-medium text-gray-700">phone_type
                            (0/1/2/3)</label>

                        <select v-model="phone_type" id="phone_type"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required>
                            <option disabled value="">Select</option>
                            <option value="1">Mobile</option>
                            <option value="2">Work</option>
                            <option value="3">Home</option>
                            <option value="4">Other</option>

                        </select>


                        <p v-if="auth.errors?.phone_type" class="text-red-500 text-sm mt-1">{{
                            auth.errors?.phone_type[0] }}
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
            <div class="space-y-2 mt-5">
                <div class="flex items-start justify-between border-b pb-2">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700">User Email</h3>
                        <p class="text-gray-900 mt-1 leading-relaxed">
                            {{ email }}
                            <span class="ml-6">Status:
                                {{ statusPhone === 1 ? 'Private' : statusPhone === 2 ? 'Connected Organisation' :
                                    statusPhone === 3 ? 'Public' : 'Others' }}
                            </span>
                        </p>
                    </div>
                    <button @click="openEmailModal()"
                        class="text-sm text-primary hover:underline ml-4 whitespace-nowrap">
                        Edit
                    </button>
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

        <!-- country section -->
        <section>
            <div class="space-y-4 mt-5 pb-5 mb-5">
                <div class="flex items-start justify-between border-b pb-2">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-700">Country</h3>
                        <p class="text-gray-900 mt-1 leading-relaxed">
                            {{ userCountry }}
                        </p>
                    </div>
                    <button @click="openCountryModal()"
                        class="text-sm text-primary hover:underline ml-4 whitespace-nowrap">
                        Edit
                    </button>
                </div>
            </div>


            <!-- Country Modal -->
            <div v-if="modalOpenCountry"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                    <h2 class="text-2xl font-bold mb-4 text-center">
                        Change your country
                    </h2>

                    <div class="mb-4">
                        <label for="countryChangeRequest" class="block text-sm font-medium text-gray-700">Country change
                            request</label>
                        <p class="text-sm text-gray-500 mb-2">Please provide a country name and a reason for change
                            request</p>
                        <input v-model="countryChangeRequest" type="textarea" id="countryChangeRequest"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required />
                        <p v-if="auth.errors?.countryChangeRequest" class="text-red-500 text-sm mt-1">{{
                            auth.errors?.countryChangeRequest[0] }}</p>
                    </div>


                    <div class="flex justify-end">
                        <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                            @click="closeCountryModal">
                            Close
                        </button>

                        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            @click="updateCountry()">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section class="mt-5 pb-5 mb-5">
        </section>
    </div>
</template>


