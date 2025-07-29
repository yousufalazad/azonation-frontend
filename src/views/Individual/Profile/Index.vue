<template>
    <div class="flex flex-col h-screen overflow-y-auto pb-7 pr-7">
        <!-- Logo Section -->
        <section>
            <h2 class="text-sm font-semibold text-gray-700 mb-4 py-2">Logo</h2>
            <div class="mb-4 flex justify-between pb-9">
                <div v-if="logoPath">
                    <img :src="`${baseURL}${logoPath}`" alt="Logo" class="rounded-lg w-[250px] ml-5">
                </div>
                <div v-else>
                    <img src="../../../assets/Logo/Your-logo-here.png" alt="Logo" class="rounded-lg w-[250px] ml-5">
                </div>
                <div>
                    <label for="logo" class="block text-sm font-medium text-gray-700 mb-4">Upload new logo</label>
                    <input type="file" id="logo" @change="handleImageUpload"
                        class="block w-full text-sm text-gray-500 mb-4">
                    <button @click="profileImageUpdate"
                        class="mt-2 bg-blue-500 text-white py-2 px-4 rounded">Save</button>
                </div>
            </div>
        </section>


        <section class="mt-5 pb-5 mb-5">
        </section>
    </div>
</template>

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
