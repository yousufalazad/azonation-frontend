<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

const auth = authStore;
const userId = auth.user.id;
const org_name = computed(() => auth.user?.org_name ?? '');
const email = computed(() => auth.user?.email ?? '');
const username = computed(() => auth.user?.username ?? '');
const baseURL = auth.apiBase;

// ---- Local user storage (professional & minimal) ----
const USER_KEY = 'azonation:user';

const pickUserFields = (u = {}) => ({
    id: u.id ?? auth.user?.id,
    org_name: u.org_name ?? auth.user?.org_name,
    email: u.email ?? auth.user?.email,
    username: u.username ?? auth.user?.username,
    country: u.country ?? u.userCountry ?? auth.user?.country, // map if needed
});

const readUserLS = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const writeUserLS = (partial = {}) => {
    const current = readUserLS() || pickUserFields(auth.user || {});
    const updated = pickUserFields({ ...current, ...partial });

    // keep auth.user reactive & in sync
    if (auth.user) Object.assign(auth.user, updated);

    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
};

// (optional) one-time hydrate from LS -> auth.user
const hydrateUserFromLS = () => {
    const saved = readUserLS();
    if (saved && auth.user) Object.assign(auth.user, saved);
};


// Org logo
const logoPath = ref('');
const selectedImage = ref(null);

// Org address
const addressId = ref(null);
const address_user_id = ref(null);
const address_line_one = ref('');
const address_line_two = ref('');
const city = ref('');
const state_or_region = ref('');
const postal_code = ref('');
const userCountry = ref('');
const modalVisibleAddress = ref(false);
const isEditMode = ref(false);

// Org Phone Number
const phoneId = ref(null);
const dialing_code = ref('');
const dialing_code_id = ref('');
const phone_number = ref('');
const phone_type = ref('');
const statusPhone = ref(''); //status defined in address
const modalVisiblePhone = ref(false);
const isEditModePhone = ref(false);

const allDialingCodes = ref([]);

const modalVisibleName = ref(false);
const orgName = ref('');

// Org username Change
const modalVisibleUsername = ref(false);
const newUsername = ref('');

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
                //window.location.reload();
            } else {
                Swal.fire('Error', 'Failed to update logo', 'error');
            }
        } catch (error) {
            console.error("Error updating logo:", error);
            Swal.fire('Error', 'Failed to update logo', 'error');
        }
    }
};

const updateOrgName = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-name/${userId}`, {
            org_name: orgName.value,
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', response.message || 'Name updated successfully', 'success');
            writeUserLS({ org_name: orgName.value });
            closeNameModal();
        }
        else {
            Swal.fire('Error', response.message || 'Failed to update name, please try again.', 'error');
        }

    } catch (error) {
        console.error("Error updating org_name:", error);
        Swal.fire('Error', error.response?.data?.message || 'An unexpected error occurred while updating the org_name', 'error');
    }
};

//Update username
const updateUsername = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-username/${userId}`, {
            username: newUsername.value,
        }, 'PUT');

        if (response.status) {
            Swal.fire('Success', response.message || 'Username updated successfully', 'success');
            writeUserLS({ username: newUsername.value });
            closeUsernameModal();
        } else {
            Swal.fire('Error', response.message || 'Failed to update username, please try again.', 'error');
        }

    } catch (error) {
        if (error.response?.status === 422) {
            const validationErrors = error.response.data.errors;
            if (validationErrors?.username) {
                Swal.fire('Validation Error', validationErrors.username[0], 'error');
            } else {
                Swal.fire('Validation Error', 'The provided data is invalid.', 'error');
            }
        } else {
            console.error("Error updating username:", error);
            Swal.fire('Error', error.response?.data?.message || 'An unexpected error occurred while updating the username', 'error');
        }
    }
};

const fetchOrgAddress = async () => {
    try {
        const res = await auth.fetchProtectedApi("/api/addresses/", {}, 'GET');

        // allow both object and array shapes
        const data = res?.data;
        const addr = Array.isArray(data) ? data[0] : data;

        if (res.status && addr) {
            addressId.value = addr.id ?? null;
            address_user_id.value = addr.user_id ?? null;
            address_line_one.value = addr.address_line_one ?? '';
            address_line_two.value = addr.address_line_two ?? '';
            city.value = addr.city ?? '';
            state_or_region.value = addr.state_or_region ?? '';
            postal_code.value = addr.postal_code ?? '';
            // choose mode automatically
            isEditMode.value = !addressId.value; // true => Create, false => Update
        } else {
            // No address yet — treat as empty, allow Create
            addressId.value = null;
            isEditMode.value = true;
        }
    } catch (e) {
        console.error("Error fetching organization address:", e);
        // Keep the form empty and allow Create instead of popping an error
        addressId.value = null;
        isEditMode.value = true;
    }
};

const createAddress = async () => {
    try {
        const res = await auth.fetchProtectedApi("/api/addresses/", {
            address_line_one: address_line_one.value,
            address_line_two: address_line_two.value,
            city: city.value,
            state_or_region: state_or_region.value,
            postal_code: postal_code.value
        }, 'POST');

        if (res.status) {
            Swal.fire('Success', 'Address created successfully', 'success');
            closeAddressModal();
            await fetchOrgAddress(); // refresh state, no full reload
        } else {
            Swal.fire('Error', res.message || 'Failed to create address', 'error');
        }
    } catch (e) {
        console.error("Error create address:", e);
        Swal.fire('Error', 'Failed to create address', 'error');
    }
};

const updateAddress = async () => {
    try {
        if (!addressId.value) {
            // No record yet — fall back to create
            return createAddress();
        }
        const res = await auth.fetchProtectedApi(`/api/addresses/${addressId.value}`, {
            address_line_one: address_line_one.value,
            address_line_two: address_line_two.value,
            city: city.value,
            state_or_region: state_or_region.value,
            postal_code: postal_code.value
        }, 'PUT');

        if (res.status) {
            Swal.fire('Success', 'Address updated successfully', 'success');
            closeAddressModal();
            await fetchOrgAddress();
        } else {
            Swal.fire('Error', res.message || 'Failed to update address', 'error');
        }
    } catch (e) {
        console.error("Error updating address:", e);
        Swal.fire('Error', 'Failed to update address', 'error');
    }
};

const phoneTypeLabel = (v) => ({ 1: 'Mobile', 2: 'Work', 3: 'Home', 4: 'Other' }[Number(v)] || 'Other');
// Suggest: 0 = Private, 1 = Public (or match your backend exactly)
const statusLabel = (v) => ({ 0: 'Private', 1: 'Public', 2: 'Connected Organisation', 3: 'Members Only' }[Number(v)] || 'Other');


const fetchOrgPhoneNumber = async () => {
    try {
        const res = await auth.fetchProtectedApi(`/api/phone-numbers/`, {}, 'GET');
        const data = res?.data;
        const phone = Array.isArray(data) ? data[0] : data;

        if (res.status && phone) {
            phoneId.value = phone.id ?? null;
            dialing_code_id.value = phone.dialing_code_id ?? ''; // keep id for update
            dialing_code.value = phone.dialing_code ?? '';       // string for display
            phone_number.value = phone.phone_number ?? '';
            phone_type.value = phone.phone_type ?? '';
            statusPhone.value = phone.status ?? '';
            isEditModePhone.value = !!phoneId.value; // true => Edit, false => Add
        } else {
            phoneId.value = null;
            isEditModePhone.value = false; // Add
        }
    } catch (e) {
        console.error("Error fetching organization Phone Number:", e);
        phoneId.value = null;
        isEditModePhone.value = false;
    }
};


const updateOrgPhoneNumber = async () => {
    try {
        const payload = {
            dialing_code_id: dialing_code_id.value,
            phone_number: phone_number.value,
            phone_type: phone_type.value,
            status: statusPhone.value,
        };

        const res = phoneId.value
            ? await auth.fetchProtectedApi(`/api/phone-numbers/${phoneId.value}`, payload, 'PUT')
            : await auth.fetchProtectedApi(`/api/phone-numbers/`, payload, 'POST');

        if (res.status) {
            Swal.fire('Success', phoneId.value ? 'Phone Number updated successfully' : 'Phone Number added successfully', 'success');
            closePhoneModal();
            await fetchOrgPhoneNumber();
        } else {
            Swal.fire('Error', res.message || 'Failed to save Phone Number', 'error');
        }
    } catch (e) {
        console.error("Error updating Phone Number:", e);
        Swal.fire('Error', 'Failed to save Phone Number', 'error');
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
            writeUserLS({ email: newEmail.value });
            closeEmailModal();
        } else {
            Swal.fire('Error', 'Failed to update email', 'error');
        }

    } catch (error) {
        console.error("Error updating email:", error);
        Swal.fire('Error', 'Failed to update email', 'error');
    }
};

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
// const openAddressModal = () => {

//     if (address_user_id.value === null) {
//         //console.log('true', address_user_id);
//         isEditMode.value = true; // createAddress() will work 
//     } else {
//         //console.log('false', address_user_id);
//         isEditMode.value = false; // updateAddress() will work
//     }
//     //console.log('bahire', address_user_id)
//     modalVisibleAddress.value = true;
// };

const openAddressModal = () => {
    // Mode is already inferred in fetchOrgAddress()
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
    orgName.value = org_name.value;
};

const closeNameModal = () => {
    modalVisibleName.value = false;
    orgName.value = '';
};

const openUsernameModal = () => {
    modalVisibleUsername.value = true;
    newUsername.value = username.value;
};

const closeUsernameModal = () => {
    modalVisibleUsername.value = false;
};

//Email Address
const openEmailModal = () => {
    modalVisibleUserEmail.value = true;
    newEmail.value = email.value;
};

const closeEmailModal = () => {
    modalVisibleUserEmail.value = false;
};

onMounted(() => {
    hydrateUserFromLS();
    fetchLogo();
    fetchDialingCode();
    fetchOrgAddress();
    fetchOrgPhoneNumber();
    fetchOrgCountry();
});
</script>

<template>
    <div class="flex flex-col pb-7 pr-7">
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


        <!--  org_name section -->
        <section>
            <div class="bg-white shadow rounded-lg p-6 mt-5">
                <!-- Card Header -->
                <h2 class="text-lg font-semibold text-gray-800 mb-6">Org Name</h2>

                <!-- Name Display -->
                <div class="flex items-center justify-between pb-4">
                    <div>
                        <p class="text-gray-900 font-medium">{{ org_name }}</p>
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
                            <label for="orgName" class="block text-sm font-medium text-gray-700 mb-2">First
                                Name</label>
                            <input v-model="orgName" type="text" id="orgName" class="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 shadow-sm 
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" required />
                            <p v-if="auth.errors?.orgName" class="text-red-500 text-xs mt-2">
                                {{ auth.errors?.orgName[0] }}
                            </p>
                        </div>
                        <!-- Action Buttons -->
                        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button @click="closeNameModal"
                                class="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow transition">
                                Close
                            </button>
                            <button @click="updateOrgName"
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
                                <label for="postal_code" class="block text-sm font-medium text-gray-700 mb-1">
                                    Postal Code
                                </label>
                                <input v-model="postal_code" type="text" id="postal_code" autocomplete="postal-code"
                                    inputmode="text" class="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm
           focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" />
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
                                Type: {{ phoneTypeLabel(phone_type) }}
                            </span>
                            <span class="ml-6">
                                Status: {{ statusLabel(statusPhone) }}
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
                                    <option value="0">Private</option>
                                    <option value="1">Public</option>
                                    <option value="2">Connected Organisation</option>
                                    <option value="3">Members Only</option>
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
                </div>
            </div>
        </section>
    </div>
</template>
