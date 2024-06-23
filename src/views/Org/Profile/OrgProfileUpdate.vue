<!-- ProfileUpdate.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

//Org profile info
const orgName = ref('');
const shortDescription = ref('');
const primaryId = ref('');
const userId = ref('');
const azonId = ref('');
const status = ref('');

//org address
const orgAddressLine = ref('');
const city = ref('');
const stateOrRegion = ref('');
const postalCode = ref('');
const country = ref('');

//org phone number
const dialingCodeId = ref('');
const phoneNumber = ref('');
const phoneType = ref('');
const orgPhoneNumberStatus = ref('');

//Org logo
const logoPath = ref('');
const selectedImage = ref(null);

const auth = authStore;
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user
const orgUsername = auth.user.email; // Assuming the user email address is stored in the logged-in user
const baseURL = 'http://localhost:8000';


const fetchLogo = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/organisation/logo/${orgId}`, {}, 'GET');
        if (response.status && response.data.image) {
            logoPath.value = response.data.image;
        }
    } catch (error) {
        console.error("Error fetching logo:", error);
    }
};

const fetchOrgDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/organisation/${orgId}`, {}, 'GET');
        if (response.status) {
            orgName.value = response.data.org_name;
            shortDescription.value = response.data.short_description;
            primaryId.value = response.data.id;
            userId.value = response.data.user_id;
            azonId.value = response.data.azon_id;
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
        const response = await auth.fetchProtectedApi(`/api/organisation-address/${orgId}`, {}, 'GET');
        if (response.status) {
            console.log(response)
            orgAddressLine.value = response.data.address_line;
            city.value = response.data.city;
            stateOrRegion.value = response.data.state_or_region;
            postalCode.value = response.data.postal_code;
            country.value = response.data.country_id;
        } else {
            Swal.fire('Error', 'Failed to fetch organization details', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization details:", error);
        Swal.fire('Error', 'Failed to fetch organization details', 'error');
    }
};

const fetchOrgPhoneNumber = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-phone-number/${orgId}`, {}, 'GET');
        if (response.status) {
            console.log(response)
            dialingCodeId.value = response.data.dialing_code_id;
            phoneNumber.value = response.data.phone_number;
            phoneType.value = response.data.phone_type;
            orgPhoneNumberStatus.value = response.data.status;
        } else {
            Swal.fire('Error', 'Failed to fetch organization phone number', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization phone number:", error);
        Swal.fire('Error', 'Failed to fetch organization phone number', 'error');
    }
};

const updateOrgDetails = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/organisation/${orgId}`, {
            org_name: orgName.value,
            short_description: shortDescription.value
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Organization details updated successfully', 'success');
            
        } else {
            Swal.fire('Error', 'Failed to update organization details', 'error');
        }
    } catch (error) {
        console.error("Error updating organization details:", error);
        Swal.fire('Error', 'Failed to update organization details', 'error');
    }
};

const updateOrgAddress = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/organisation-address/${orgId}`, {
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

const updateOrgPhoneNumber = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-phone-number/${orgId}`, {
            dialing_code_id: dialingCodeId.value,
            phone_number: phoneNumber.value,
            phone_type: phoneType.value,
            status: orgPhoneNumberStatus.value,
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Phone number updated successfully', 'success');
            
        } else {
            Swal.fire('Error', 'Failed to update phone number', 'error');
        }
    } catch (error) {
        console.error("Error updating phone number:", error);
        Swal.fire('Error', 'Failed to update phone number', 'error');
    }
};

const handleImageUpload = (event) => {
    selectedImage.value = event.target.files[0];
};

const orgLogoUpdate = async () => {
    if (selectedImage.value) {
        const formData = new FormData();
        formData.append('image', selectedImage.value);
        try {
            const logoResponse = await auth.uploadProtectedApi(`/api/organisation/logo/${orgId}`, formData);
            if (logoResponse.status) {
                Swal.fire('Success', 'Logo save successfully', 'success');
                logoPath.value = logoResponse.data.image;
            } else {
                Swal.fire('Error', 'Failed to update logo', 'error');
            }
        } catch (error) {
            console.error("Error updating logo:", error);
            Swal.fire('Error', 'Failed to update logo', 'error');
        }
    }
};

onMounted(fetchOrgDetails);
onMounted(fetchOrgAddress);
onMounted(fetchOrgPhoneNumber);
onMounted(fetchLogo);
</script>

<template>
    <div class="profile-data-show">
        <h2>Org Profile</h2>
        <div class="mb-3">
            <label for="logo" class="form-label">Logo</label>
            <input type="file" id="logo" @change="handleImageUpload" class="form-control">
        </div>

        <div class="mb-3" v-if="logoPath">
            <img :src="`${baseURL}${logoPath}`" alt="Organization Logo" class="img-thumbnail">
        </div>
        <button @click="orgLogoUpdate" class="btn btn-primary">Save</button>
    </div>
    <br>
    <div>
        <h5>Organization profile information</h5>
        <br>
        <p>Org name: <span>{{ orgName }}</span></p>
        <p>Org short description: <span>{{ shortDescription }}</span></p>
        <p>Org primary ID: <span>{{ primaryId }}</span></p>
        <p>Org user ID: <span>{{ userId }}</span></p>
        <p>Org Azon ID: <span>{{ azonId }}</span></p>
        <p>Org status: <span>{{ status }}</span></p>
    </div>
    <div>
        <br>
        <h5>User email address (username)</h5>
        <p><span>{{ orgUsername }}</span></p>
        <br>
    </div>
    <div>
        <br>
        <h5>Address</h5>
        <p><span>{{ orgAddressLine }}, {{ city }}, {{ stateOrRegion }}, {{ postalCode }}, {{ country }}</span></p>
        <br>
    </div>
    <div>
        <br>
        <h5>Phone</h5>
        <p><span>{{ dialingCodeId }}, {{ phoneNumber }}, {{ phoneType }}, {{ orgPhoneNumberStatus }}</span></p>
        <br>
    </div>

    <div class="card shadow-sm">
        <div class="card-body p-4">
            <h1 class="h4 mb-4 fw-bold text-center">Update organization profile</h1>
            <div class="mb-3">
                <label for="orgName" class="form-label">Org Name</label>
                <input v-model="orgName" type="text" id="orgName" class="form-control" placeholder="Org name" required>
            </div>
            
            <div class="mb-3">
                <label for="shortDescription" class="form-label">short description</label>
                <!-- <input v-model="shortDescription" type="text" id="shortDescription" class="form-control" placeholder="Short Description"> -->
                <textarea id="shortDescription" v-model="shortDescription" class="form-control" placeholder="Enter short description"></textarea>
            </div>
            
            <div class="text-end">
                <button @click="updateOrgDetails" class="btn btn-primary">Update profile</button>
            </div>
        </div>
    </div>
<br>
    <div class="card shadow-sm">
        <div class="card-body p-4">
            <h1 class="h4 mb-4 fw-bold text-center">Update address</h1>
            <div class="mb-3">
                <label for="orgAddressLine" class="form-label">Address line</label>
                <input v-model="orgAddressLine" type="text" id="orgAddressLine" class="form-control" placeholder="Address line" required>
            </div>
            <div class="mb-3">
                <label for="city" class="form-label">city</label>
                <input v-model="city" type="text" id="city" class="form-control" placeholder="city" required>
            </div>
            <div class="mb-3">
                <label for="stateOrRegion" class="form-label">State or Region</label>
                <input v-model="stateOrRegion" type="text" id="stateOrRegion" class="form-control" placeholder="State Or Region">
            </div>
            <div class="mb-3">
                <label for="postalCode" class="form-label">Post Code</label>
                <input v-model="postalCode" type="text" id="postalCode" class="form-control" placeholder="Post Code" required>
            </div>
            <div class="mb-3">
                <label for="country" class="form-label">Country</label>
                <input v-model="country" type="text" id="country" class="form-control" placeholder="Country" required>
            </div>
            
            <div class="text-end">
                <button @click="updateOrgAddress" class="btn btn-primary">Update address</button>
            </div>
        </div>
    </div>
    <br>
    <div class="card shadow-sm">
        <div class="card-body p-4">
            <h1 class="h4 mb-4 fw-bold text-center">Update phone number</h1>

            <div class="mb-3">
                <label for="dialingCodeId" class="form-label">Dialing code</label>
                <input v-model="dialingCodeId" type="text" id="dialingCodeId" class="form-control" placeholder="Dialing code" required>
            </div>
            <div class="mb-3">
                <label for="phoneNumber" class="form-label">Phone number</label>
                <input v-model="phoneNumber" type="text" id="phoneNumber" class="form-control" placeholder="Phone Number" required>
            </div>
            <div class="mb-3">
                <label for="phoneType" class="form-label">Phone type</label>
                <input v-model="phoneType" type="text" id="phoneType" class="form-control" placeholder="Phone Type">
            </div>
            <div class="mb-3">
                <label for="orgPhoneNumberStatus" class="form-label">Status (by system)</label>
                <input v-model="orgPhoneNumberStatus" type="text" id="orgPhoneNumberStatus" class="form-control" placeholder="orgPhoneNumberStatus" required>
            </div>
            <div class="text-end">
                <button @click="updateOrgPhoneNumber" class="btn btn-primary">Update address</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-data-show {
    padding: 20px;
}

.img-thumbnail {
    max-width: 200px;
    margin-top: 10px;
}
</style>