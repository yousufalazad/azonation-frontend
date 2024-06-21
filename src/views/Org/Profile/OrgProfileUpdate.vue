<!-- ProfileUpdate.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

const orgName = ref('');
const shortDescription = ref('');
const primaryId = ref('');
const userId = ref('');
const azonId = ref('');
const status = ref('');


const logoPath = ref('');
const selectedImage = ref(null);

const auth = authStore;
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user
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
    <div>

        <p>Org name: <span>{{ orgName }}</span></p>
        <p>Org short description: <span>{{ shortDescription }}</span></p>
        <p>Org primary ID: <span>{{ primaryId }}</span></p>
        <p>Org user ID: <span>{{ userId }}</span></p>
        <p>Org Azon ID: <span>{{ azonId }}</span></p>
        <p>Org status: <span>{{ status }}</span></p>
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
                <button @click="updateOrgDetails" class="btn btn-primary">Update</button>
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