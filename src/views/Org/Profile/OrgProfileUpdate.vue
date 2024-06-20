<!-- ProfileUpdate.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

const orgName = ref('');
const short_description = ref('');

const auth = authStore;
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user
const baseURL = 'http://localhost:8000';
const OrgUserName = computed(() => auth.org?.org_name);
const OrgUserId = computed(() => auth.org?.user_id);
const OrgAzonId = computed(() => auth.org?.azon_id);
const OrgStatus = computed(() => auth.org?.status);
const OrgShortDescription = computed(() => auth.org?.short_description);


const logoPath = ref('');
const selectedImage = ref(null);



orgName.value =  OrgUserName;


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

onMounted(fetchLogo);
</script>

<template>
    <div class="profile-update">
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
        <p>Org name: <span>{{ OrgUserName }}</span></p>
        <p>Org User ID: <span>{{ OrgUserId }}</span></p>
        <p>Org Azon ID: <span>{{ OrgAzonId }}</span></p>
        <p>Org Status: <span>{{ OrgStatus }}</span></p>
        <p>Org Short Description: <span>{{ OrgShortDescription }}</span></p>
    </div>

    <div class="card shadow-sm">
        <div class="card-body p-4">
            <h1 class="h4 mb-4 fw-bold text-center">Update your profile</h1>
            <div class="mb-3">
                <label for="org_name" class="form-label">Org Name</label>
                <input v-model="org_name" type="text" id="orgName" class="form-control" placeholder="Name" required>
                <p v-if="auth.errors?.org_name" class="text-danger mt-2">{{ auth.errors?.org_name[0] }}</p>
            </div>

            <div class="mb-3">
                <label for="short_description" class="form-label">short_description</label>
                <input v-model="short_description" type="text" id="short_description" class="form-control" placeholder="short_description">
                <p v-if="auth.errors?.short_description" class="text-danger mt-2">{{ auth.errors?.short_description[0] }}</p>
            </div>

            <div class="mb-3">
                <label for="status" class="form-label">status</label>
                <input v-model="status" type="text" id="status" class="form-control" placeholder="status">
                <p v-if="auth.errors?.status" class="text-danger mt-2">{{ auth.errors?.status[0] }}</p>
            </div>
            
            <div class="text-end">
                <button @click="auth.orgProfileUpdate(org_name, short_description, status)" class="btn btn-primary">Update</button>
            </div>
        </div>
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