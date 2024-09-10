<!-- ProfileUpdate.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";
import Modal from '../../../components/--Modal.vue'; // Import the modal component

// Org profile info
const shortDescription = ref('');
const detailDescription = ref('');
const mission = ref('');
const vision = ref('');
const value = ref('');
const areasOfFocus = ref('');
const causes = ref('');
const impact = ref('');
const scopeOfWork = ref('');
const organisingDate = ref('');
const foundationDate = ref('');
const status = ref('');

// Org logo
const logoPath = ref('');
const selectedImage = ref(null);

const auth = authStore;
const userId = auth.user.id;
const baseURL = 'http://localhost:8000';

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
            } else {
                Swal.fire('Error', 'Failed to update logo', 'error');
            }
        } catch (error) {
            console.error("Error updating logo:", error);
            Swal.fire('Error', 'Failed to update logo', 'error');
        }
    }
};

const updateSingleField = async (field, value) => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile-update/${userId}`, { [field]: value }, 'PUT');
        if (response.status) {
            Swal.fire('Success', `${field} updated successfully`, 'success');
        } else {
            Swal.fire('Error', `Failed to update ${field}`, 'error');
        }
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
        Swal.fire('Error', `Failed to update ${field}`, 'error');
    }
};

const fetchOrgProfileData = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile-data/${userId}`, {}, 'GET');
        if (response.status) {
            shortDescription.value = response.data.short_description;
            detailDescription.value = response.data.detail_description;
            mission.value = response.data.mission;
            vision.value = response.data.vision;
            value.value = response.data.value;
            areasOfFocus.value = response.data.areas_of_focus;
            causes.value = response.data.causes;
            impact.value = response.data.impact;
            scopeOfWork.value = response.data.scope_of_work;
            organisingDate.value = response.data.organising_date;
            foundationDate.value = response.data.foundation_date;
            status.value = response.data.status;
        } else {
            Swal.fire('Error', 'Failed to fetch organization details', 'error');
        }
    } catch (error) {
        console.error("Error fetching organization details:", error);
        Swal.fire('Error', 'Failed to fetch organization details', 'error');
    }
};

const handleImageUpload = (event) => {
    selectedImage.value = event.target.files[0];
};

onMounted(fetchOrgProfileData);
onMounted(fetchLogo);

</script>

<template>
    <div class="profile-data-show">
        <h2 class="text-xl font-bold mb-4">Org Profile</h2>

        <!-- Logo Section -->
        <div class="mb-4">
            <label for="logo" class="block text-sm font-medium text-gray-700">Logo</label>
            <input type="file" id="logo" @change="handleImageUpload" class="block w-full text-sm text-gray-500">
            <div v-if="logoPath" class="mt-3">
                <img :src="`${baseURL}${logoPath}`" alt="Organization Logo" class="rounded-lg max-w-xs">
            </div>
            <button @click="profileImageUpdate" class="mt-2 bg-blue-500 text-white py-2 px-4 rounded">Save Logo</button>
        </div>

        <!-- Organization Information Section with Update Buttons -->
        <div class="space-y-4">
            <p>Short Description: <span>{{ shortDescription }}</span> <button @click="$refs.shortDescriptionModal.show()" class="text-blue-500">Edit</button></p>
            <p>Detail Description: <span>{{ detailDescription }}</span> <button @click="$refs.detailDescriptionModal.show()" class="text-blue-500">Edit</button></p>
            <p>Mission: <span>{{ mission }}</span> <button @click="$refs.missionModal.show()" class="text-blue-500">Edit</button></p>
            <p>Vision: <span>{{ vision }}</span> <button @click="$refs.visionModal.show()" class="text-blue-500">Edit</button></p>
            <!-- Add other fields similarly -->
        </div>
    </div>

    <!-- Modal Components for Editing -->
    <Modal ref="shortDescriptionModal" title="Edit Short Description" @save="updateSingleField('short_description', shortDescription)">
        <textarea v-model="shortDescription" class="w-full h-32 p-2 border border-gray-300 rounded"></textarea>
    </Modal>

    <Modal ref="detailDescriptionModal" title="Edit Detail Description" @save="updateSingleField('detail_description', detailDescription)">
        <textarea v-model="detailDescription" class="w-full h-32 p-2 border border-gray-300 rounded"></textarea>
    </Modal>

    <Modal ref="missionModal" title="Edit Mission" @save="updateSingleField('mission', mission)">
        <input v-model="mission" type="text" class="w-full p-2 border border-gray-300 rounded">
    </Modal>

    <Modal ref="visionModal" title="Edit Vision" @save="updateSingleField('vision', vision)">
        <input v-model="vision" type="text" class="w-full p-2 border border-gray-300 rounded">
    </Modal>

    <!-- Add more modals for each field as needed -->
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
