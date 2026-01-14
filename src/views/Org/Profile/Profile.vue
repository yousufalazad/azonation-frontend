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
        const response = await auth.fetchProtectedApi(`/api/org-profile/logo`, {}, 'GET');
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

// const fetchOrgAddress = async () => {
//     try {
//         const res = await auth.fetchProtectedApi(`/api/addresses/`, {}, 'GET');
//         const data = res?.data;
//         const address = Array.isArray(data) ? data[0] : data;

//         if (res.status && address) {
//             addressId.value = address.id ?? null;
//             address_line_one.value = address.address_line_one ?? '';
//             address_line_two.value = address.address_line_two ?? '';
//             city.value = address.city ?? '';
//             state_or_region.value = address.state_or_region ?? '';
//             postal_code.value = address.postal_code ?? '';
//             address_user_id.value = address.user_id ?? null;
//             isEditMode.value = !!addressId.value; // true => Edit, false => Add
//         } else {
//             addressId.value = null;
//             isEditMode.value = false; // Add
//         }
//     } catch (e) {
//         console.error("Error fetching organization address:", e);
//         addressId.value = null;
//         isEditMode.value = false;
//     }
// };
const fetchOrgAddress = async () => {
    try {
        const res = await auth.fetchProtectedApi(`/api/addresses/`, {}, 'GET')
        const data = res?.data
        const address = Array.isArray(data) ? data[0] : data

        if (res.status && address) {
            addressId.value = address.id ?? null
            isEditMode.value = true

            // ✅ form data save
            addressForm.value = {
                line1: address.address_line_one ?? '',
                line2: address.address_line_two ?? '',
                city: address.city ?? '',
                region: address.state_or_region ?? '',
                postcode: address.postal_code ?? '',
            }
        } else {
            isEditMode.value = false
        }
    } catch (e) {
        isEditMode.value = false
    }
}


const fieldMap = {
    line1: 'address_line_one',
    line2: 'address_line_two',
    city: 'city',
    region: 'state_or_region',
    postcode: 'postal_code',
}

const saveAddress = async () => {
    try {
        // 1️⃣ Apply uppercase rules
        addressFormat.value.uppercase.forEach(field => {
            if (addressForm.value[field]) {
                addressForm.value[field] =
                    addressForm.value[field].toUpperCase()
            }
        })

        // 2️⃣ Build components object
        const components = {}
        Object.keys(fieldMap).forEach(key => {
            components[key] = addressForm.value[key] || null
        })

        // 3️⃣ Build API payload
        const payload = {
            components, // ✅ REQUIRED
        }

        // (optional) still send flat fields if needed elsewhere
        Object.keys(fieldMap).forEach(key => {
            payload[fieldMap[key]] = addressForm.value[key] || null
        })

        // 4️⃣ Create or Update
        const isUpdate = !!addressId.value
        alert(addressId.value);
        const url = isUpdate
            ? `/api/addresses/${addressId.value}`
            : `/api/addresses`

        const method = isUpdate ? 'PUT' : 'POST'

        // 5️⃣ API call
        const res = await auth.fetchProtectedApi(url, payload, method)

        if (res.status) {
            Swal.fire(
                'Success',
                isUpdate
                    ? 'Address updated successfully'
                    : 'Address created successfully',
                'success'
            )

            closeAddressModal()
            await fetchOrgAddress()
        } else {
            Swal.fire('Error', res.message || 'Failed to save address', 'error')
        }
    } catch (e) {
        console.error('Error saving address:', e)
        Swal.fire('Error', 'Failed to save address', 'error')
    }
}
//for Address
const modalVisibleAddress = ref(false)
const addressFormat = ref(null)
const addressForm = ref({})
const loadingFormat = ref(false)

// const openAddressModal = async () => {
//     modalVisibleAddress.value = true
//     loadingFormat.value = true
//     try {
//         const res = await auth.fetchProtectedApi("/api/addresses/address-format", {}, 'GET')
//         addressFormat.value = res.format
//         // Initialize form fields dynamically
//         addressForm.value = {}
//         res.format.fields.forEach(field => {
//             addressForm.value[field] = ''
//         })
//     } catch (e) {
//         console.error('Failed to load address format')
//     } finally {
//         loadingFormat.value = false
//     }
// }

const openAddressModal = async () => {
    modalVisibleAddress.value = true
    loadingFormat.value = true
    try {
        const res = await auth.fetchProtectedApi("/api/addresses/address-format", {}, 'GET')
        console.log(res, 'all');
        console.log(res.countryId), 'country id';
        console.log(res.group, 'group');
        console.log(res.group_alias, 'group alias');
        console.log(res.format, 'format');


        addressFormat.value = res.format
        // 🟢 Create mode → empty
        if (!isEditMode.value) {
            addressForm.value = {}
            res.format.fields.forEach(field => {
                addressForm.value[field] = ''
            })
        }
        // 🟢 Edit mode → fetchOrgAddress() already filled form
    } catch (e) {
        console.error('Failed to load address format')
    } finally {
        loadingFormat.value = false
    }
}

const closeAddressModal = () => {
    modalVisibleAddress.value = false;
};




// Suggest: 1 = Mobile, 2 = Work, 3 = Home, 4 = Other
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
                            <span v-if="addressForm.line1">{{ addressForm.line1 }}, </span>
                            <span v-if="addressForm.line2">{{ addressForm.line2 }}, </span>
                            <span v-if="addressForm.city">{{ addressForm.city }}, </span>
                            <span v-if="addressForm.region">{{ addressForm.region }}, </span>
                            <span v-if="addressForm.postcode">{{ addressForm.postcode }}, </span>
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
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">

                    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

                        <h2 class="text-xl font-semibold text-center mb-6">
                            {{ isEditMode ? 'Edit Address' : 'Create Address' }}
                        </h2>

                        <div v-if="loadingFormat" class="text-center py-10">
                            Loading address format...
                        </div>

                        <div v-else class="space-y-5">

                            <div v-for="field in addressFormat.fields" :key="field">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    {{ addressFormat.labels[field] }}
                                    <span v-if="addressFormat.required.includes(field)" class="text-red-500">*</span>
                                </label>

                                <input v-model="addressForm[field]" type="text"
                                    :required="addressFormat.required.includes(field)" class="w-full border border-gray-300 rounded-lg p-2.5 shadow-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition" />

                                <p v-if="auth.errors?.[field]" class="text-red-500 text-xs mt-2">
                                    {{ auth.errors[field][0] }}
                                </p>
                            </div>

                        </div>

                        <!-- Buttons -->
                        <div class="flex justify-end gap-3 mt-6">
                            <button @click="modalVisibleAddress = false"
                                class="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg">
                                Close
                            </button>
                            <!-- <button @click="submitAddress"
                                class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg">
                                {{ isEditMode ? 'Submit' : 'Update' }}
                            </button> -->

                            <button @click="saveAddress">
                                {{ addressId ? 'Update' : 'Submit' }}
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
