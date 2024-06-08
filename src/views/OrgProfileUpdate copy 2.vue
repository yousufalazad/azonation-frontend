<!-- ProfileUpdate.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { loginAuthStore } from "../store/loginLogoutStore";
import Swal from 'sweetalert2';

const orgId = loginAuthStore.org.id; // Assuming the org ID is stored in the logged-in user
const logoPath = ref('');
const selectedImage = ref(null);
// Base URL of the Laravel backend server
const baseURL = 'http://localhost:8000';
const fetchLogo = async () => {
    try {
        const response = await loginAuthStore.fetchProtectedApi(`/api/organisation/logo/${orgId}`, {}, 'GET');
        if (response.status && response.data.image) {
            logoPath.value = response.data.image;
        }
    } catch (error) {
        console.error("Error fetching logo:", error);
    }
};

const handleImageUpload = (event) => {
    selectedImage.value = event.target.files[0];
};

const updateOrganisationDetails = async () => {
    if (selectedImage.value) {
        const formData = new FormData();
        formData.append('image', selectedImage.value);

        try {
            const logoResponse = await loginAuthStore.uploadProtectedApi(`/api/org_logo/${orgId}`, formData);
            if (logoResponse.status) {
                Swal.fire('Success', 'Logo updated successfully', 'success');
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

onMounted(fetchLogo);
</script>

<template>
    <div class="profile-update">
        <h2>Profile Update</h2>
        <div class="mb-3">
            <label for="logo" class="form-label">Logo</label>
            <input type="file" id="logo" @change="handleImageUpload" class="form-control">
        </div>
        <div class="mb-3" v-if="logoPath">
            <!-- <img :src="logoPath" alt="Organization Logo" class="img-thumbnail"> -->
            <img :src="`${baseURL}${logoPath}`" alt="Organization Logo" class="img-thumbnail">

        </div>
        <button @click="updateOrganisationDetails" class="btn btn-primary">Update</button>
    </div>
</template>

<style scoped>
.profile-update {
    padding: 20px;
}
.img-thumbnail {
    max-width: 200px;
    margin-top: 10px;
}
</style>
