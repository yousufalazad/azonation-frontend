<!-- ProfileUpdate.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { loginAuthStore } from "../store/loginLogoutStore";
import Swal from 'sweetalert2';

const individualId = loginAuthStore.individual.id; // Assuming the Individual ID is stored in the logged-in user
const profileImagePath = ref('');
const selectedImage = ref(null);
// Base URL of the Laravel backend server
const baseURL = 'http://localhost:8000';
const fetchProfileImage = async () => {
    try {
        const response = await loginAuthStore.fetchProtectedApi(`/api/profileimage/${individualId}`, {}, 'GET');
        if (response.status && response.data.image) {
          profileImagePath.value = response.data.image;
        }
    } catch (error) {
        console.error("Error fetching logo:", error);
    }
};

const handleImageUpload = (event) => {
    selectedImage.value = event.target.files[0];
};

const profileImageUpdate = async () => {
    if (selectedImage.value) {
        const formData = new FormData();
        formData.append('image', selectedImage.value);
        try {
            const profileImageResponse = await loginAuthStore.uploadProtectedApi(`/api/profileimage/${individualId}`, formData);
            if (profileImageResponse.status) {
                Swal.fire('Success', 'Profile picture save successfully', 'success');
                profileImagePath.value = profileImageResponse.data.image;
            } else {
                Swal.fire('Error', 'Failed to update profile picture', 'error');
            }
        } catch (error) {
            console.error("Error updating profile picture:", error);
            Swal.fire('Error', 'Failed to update profile picture', 'error');
        }
    }
};

onMounted(fetchProfileImage);
</script>

<template>
    <div class="profile-update">
        <h2>Profile Picture Update</h2>
        <div class="mb-3">
            <label for="Profile picture" class="form-label">Logo</label>
            <input type="file" id="profile_picture" @change="handleImageUpload" class="form-control">
        </div>
        <div class="mb-3" v-if="profileImagePath">
            <img :src="`${baseURL}${profileImagePath}`" alt="Organization Logo" class="img-thumbnail">
        </div>
        <button @click="profileImageUpdate" class="btn btn-primary">Save</button>
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
