<!-- ProfileUpdate.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";


//Org profile info
const shortDescription = ref('');
const detailDescription = ref('');
const whoWeAre = ref('');
const whatWeDo = ref('');
const howWeDo = ref('');
const mission = ref('');
const vision = ref('');
const value = ref('');
const areasOfFocus = ref('');
const causes = ref('');
const impact = ref('');
const whyJoinOurOrganisation = ref('');
const scopeOfWork = ref('');
const organisingDate = ref('');
const foundationDate = ref('');
const status = ref('');



//Org logo
const logoPath = ref('');
const selectedImage = ref(null);

const auth = authStore;
const userId = auth.user.id;
const baseURL = 'http://localhost:8000';


const fetchLogo = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile/logo/${userId}`, {}, 'GET');
        if (response.status && response.data.image) {
            logoPath.value = response.data.image; // value assign
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
                Swal.fire('Success', 'Logo save successfully', 'success');
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

const updateOrgProfileData = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile-update/${userId}`, {
            short_description: shortDescription.value,
            detail_description: detailDescription.value,
            who_we_are: whoWeAre.value,
            what_we_do: whatWeDo.value,
            how_we_do: howWeDo.value,
            mission: mission.value,
            vision: vision.value,
            value: value.value,
            areas_of_focus: areasOfFocus.value,
            causes: causes.value,
            impact: impact.value,
            why_join_our_organisation: whyJoinOurOrganisation.value,
            scope_of_work: scopeOfWork.value,
            organising_date: organisingDate.value,
            foundation_date: foundationDate.value,
            status: status.value,
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Organization details updated successfully', 'success');
            //auth.getOrgData(userId) // update localStorage for updated org name when updated
        } else {
            Swal.fire('Error', 'Failed to update organization details', 'error');
        }
    } catch (error) {
        console.error("Error updating organization details:", error);
        Swal.fire('Error', 'Failed to update organization details', 'error');
    }
};

const fetchOrgProfileData = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile-data/${userId}`, {}, 'GET');
        if (response.status) {
            userId.value = response.data.user_id;
            shortDescription.value = response.data.short_description;
            detailDescription.value = response.data.detail_description;
            whoWeAre.value = response.data.who_we_are;
            whatWeDo.value = response.data.what_we_do;
            howWeDo.value = response.data.how_we_do;
            mission.value = response.data.mission;
            vision.value = response.data.vision;
            value.value = response.data.value;
            areasOfFocus.value = response.data.areas_of_focus;
            causes.value = response.data.causes;
            impact.value = response.data.impact;
            whyJoinOurOrganisation.value = response.data.why_join_our_organisation;
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
onMounted(updateOrgProfileData);
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
        <button @click="profileImageUpdate" class="btn btn-primary">Save</button>
    </div>
    <br>
    <div>
        <h5>Organization profile information</h5>
        <br>
        <p>short description: <span>{{ shortDescription }}</span></p>
        <p>detail description: <span>{{ detailDescription }}</span></p>
        <p>whoWeAre: <span>{{ whoWeAre }}</span></p>
        <p>whatWeDo: <span>{{ whatWeDo }}</span></p>
        <p>whatWeDo: <span>{{ howWeDo }}</span></p>
        <p>mission: <span>{{ mission }}</span></p>
        <p>vision: <span>{{ vision }}</span></p>
        <p>value: <span>{{ value }}</span></p>
        <p>areasOfFocus: <span>{{ areasOfFocus }}</span></p>
        <p>causes: <span>{{ causes }}</span></p>
        <p>impact: <span>{{ impact }}</span></p>
        <p>whyJoinOurOrganisation: <span>{{ whyJoinOurOrganisation }}</span></p>
        <p>scopeOfWork: <span>{{ scopeOfWork }}</span></p>
        <p>organisingDate: <span>{{ organisingDate }}</span></p>
        <p>foundationDate: <span>{{ foundationDate }}</span></p>
        <p>status: <span>{{ status }}</span></p>
    </div>
  
    <div class="card shadow-sm">
        <div class="card-body p-4">
            <h1 class="h4 mb-4 fw-bold text-center">Update organization profile</h1>
            <div class="mb-3">
                <label for="shortDescription" class="form-label">short description</label>
                <!-- <input v-model="shortDescription" type="text" id="shortDescription" class="form-control" placeholder="Short Description"> -->
                <textarea id="shortDescription" v-model="shortDescription" class="form-control"
                    placeholder="Enter short description"></textarea>
            </div>
            <div class="mb-3">
                <label for="detailDescription" class="form-label">details description</label>
                <textarea id="detailDescription" v-model="detailDescription" class="form-control"
                    placeholder="Enter detail description"></textarea>
            </div>

            <div class="mb-3">
                <label for="whoWeAre" class="form-label">whoWeAre</label>
                <textarea id="whoWeAre" v-model="whoWeAre" class="form-control" placeholder="whoWeAre"></textarea>
            </div>

            <div class="mb-3">
                <label for="whatWeDo" class="form-label">whatWeDo</label>
                <textarea id="whatWeDo" v-model="whatWeDo" class="form-control" placeholder="whatWeDo"></textarea>
            </div>

            <div class="mb-3">
                <label for="howWeDo" class="form-label">howWeDo</label>
                <textarea id="howWeDo" v-model="howWeDo" class="form-control" placeholder="howWeDo"></textarea>
            </div>


            <div class="mb-4">
                <label for="mission" class="block text-sm font-medium text-gray-700">mission</label>
                <input v-model="mission" type="text" id="mission"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <p v-if="auth.errors?.mission" class="text-red-500 text-sm mt-1">{{
                    auth.errors?.mission[0] }}</p>
            </div>


            <div class="mb-4">
                <label for="vision" class="block text-sm font-medium text-gray-700">vision</label>
                <input v-model="vision" type="text" id="vision"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <p v-if="auth.errors?.vision" class="text-red-500 text-sm mt-1">{{
                    auth.errors?.vision[0] }}</p>
            </div>


            <div class="mb-4">
                <label for="value" class="block text-sm font-medium text-gray-700">value</label>
                <input v-model="value" type="text" id="value"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <p v-if="auth.errors?.value" class="text-red-500 text-sm mt-1">{{
                    auth.errors?.value[0] }}</p>
            </div>

            <div class="mb-4">
                <label for="areasOfFocus" class="block text-sm font-medium text-gray-700">areasOfFocus</label>
                <input v-model="areasOfFocus" type="text" id="areasOfFocus"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <p v-if="auth.errors?.areasOfFocus" class="text-red-500 text-sm mt-1">{{
                    auth.errors?.areasOfFocus[0] }}</p>
            </div>

            <div class="mb-3">
                <label for="causes" class="form-label">causes</label>
                <textarea id="causes" v-model="causes" class="form-control" placeholder="causes"></textarea>
            </div>

            <div class="mb-3">
                <label for="impact" class="form-label">impact</label>
                <textarea id="impact" v-model="impact" class="form-control" placeholder="impact"></textarea>
            </div>

            <div class="mb-3">
                <label for="whyJoinOurOrganisation" class="form-label">whyJoinOurOrganisation</label>
                <textarea id="whyJoinOurOrganisation" v-model="whyJoinOurOrganisation" class="form-control"
                    placeholder="whyJoinOurOrganisation"></textarea>
            </div>
            <div class="mb-3">
                <label for="scopeOfWork" class="form-label">scopeOfWork</label>
                <textarea id="scopeOfWork" v-model="scopeOfWork" class="form-control"
                    placeholder="scopeOfWork"></textarea>
            </div>

            <div class="mb-4">
                <label for="organisingDate" class="block text-sm font-medium text-gray-700">organisingDate</label>
                <input v-model="organisingDate" type="date" id="organisingDate"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <p v-if="auth.errors?.organisingDate" class="text-red-500 text-sm mt-1">{{
                    auth.errors?.organisingDate[0] }}</p>
            </div>

            <div class="mb-4">
                <label for="foundationDate" class="block text-sm font-medium text-gray-700">foundationDate</label>
                <input v-model="foundationDate" type="date" id="foundationDate"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <p v-if="auth.errors?.foundationDate" class="text-red-500 text-sm mt-1">{{
                    auth.errors?.foundationDate[0] }}</p>
            </div>

            <div class="mb-4">
                <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                <input v-model="status" type="text" id="status"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <p v-if="auth.errors?.status" class="text-red-500 text-sm mt-1">{{ auth.errors?.status[0] }}</p>
            </div>


            <div class="text-end">
                <button @click="updateOrgProfileData" class="btn btn-primary">Update profile</button>
            </div>
        </div>
    </div>
    <br>
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
