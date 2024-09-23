<template>
    <div class="profile-data-show">
        <h2 class="text-xl font-bold mb-4">Fundamental Info</h2>

        <!-- User Information Section with Update Buttons -->
        <div class="space-y-4">
            <p>Short Description: <span>{{ shortDescription }}</span> <button @click="openModal('shortDescription')"
                    class="text-blue-500">Edit</button></p>
            <p>Detail Description: <span>{{ detailDescription }}</span> <button @click="openModal('detailDescription')"
                    class="text-blue-500">Edit</button></p>
            <p>whoWeAre: <span>{{ whoWeAre }}</span> <button @click="openModal('whoWeAre')"
                    class="text-blue-500">Edit</button></p>
            <p>whatWeDo: <span>{{ whatWeDo }}</span> <button @click="openModal('whatWeDo')"
                    class="text-blue-500">Edit</button></p>
            <p>howWeDo: <span>{{ howWeDo }}</span> <button @click="openModal('howWeDo')"
                    class="text-blue-500">Edit</button></p>

            <p>Mission: <span>{{ mission }}</span> <button @click="openModal('mission')"
                    class="text-blue-500">Edit</button></p>
            <p>Vision: <span>{{ vision }}</span> <button @click="openModal('vision')"
                    class="text-blue-500">Edit</button></p>
            <p>Value: <span>{{ value }}</span> <button @click="openModal('value')" class="text-blue-500">Edit</button>
            </p>
            <p>Areas of Focus: <span>{{ areasOfFocus }}</span> <button @click="openModal('areasOfFocus')"
                    class="text-blue-500">Edit</button></p>
            <p>Causes: <span>{{ causes }}</span> <button @click="openModal('causes')"
                    class="text-blue-500">Edit</button></p>
            <p>Impact: <span>{{ impact }}</span> <button @click="openModal('impact')"
                    class="text-blue-500">Edit</button></p>
            <p>whyJoinUs: <span>{{ whyJoinUs }}</span> <button @click="openModal('whyJoinUs')"
                    class="text-blue-500">Edit</button></p>
            <p>Scope of Work: <span>{{ scopeOfWork }}</span> <button @click="openModal('scopeOfWork')"
                    class="text-blue-500">Edit</button></p>
            <p>Organising Date: <span>{{ organisingDate }}</span> <button @click="openModal('organisingDate')"
                    class="text-blue-500">Edit</button></p>
            <p>Foundation Date: <span>{{ foundationDate }}</span> <button @click="openModal('foundationDate')"
                    class="text-blue-500">Edit</button></p>
            <p>Status: <span>{{ status }}</span> <button @click="openModal('status')"
                    class="text-blue-500">Edit</button></p>
        </div>

        <!-- Modal Component -->
        <div v-if="isModalVisible" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div class="bg-white p-5 rounded-lg shadow-lg max-w-md w-full">
                <h3 class="text-lg font-bold mb-3">{{ modalTitle }}</h3>
                <textarea v-if="isTextarea" v-model="modalModel"
                    class="w-full h-32 p-2 border border-gray-300 rounded"></textarea>
                <input v-else type="text" v-model="modalModel" class="w-full p-2 border border-gray-300 rounded">
                <div class="flex justify-end mt-4">
                    <button @click="saveModal" class="bg-blue-500 text-white py-2 px-4 rounded mr-2">Save</button>
                    <button @click="closeModal" class="bg-gray-300 py-2 px-4 rounded">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div class="py-6 my-6">

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

const auth = authStore;
const userId = auth.user.id;



// profile info
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
const whyJoinUs = ref('');
const scopeOfWork = ref('');
const organisingDate = ref('');
const foundationDate = ref('');
const status = ref('');

// Modal logic
const isModalVisible = ref(false);
const modalTitle = ref('');
const modalModel = ref('');
const isTextarea = ref(false);
const fieldToUpdate = ref('');


// Convert camel case field names to snake case
const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const updateSingleField = async (field, value) => {
    const snakeCaseField = camelToSnake(field);
    try {
        const response = await auth.fetchProtectedApi(`/api/org-profile-update/${userId}`, { [snakeCaseField]: value }, 'PUT');
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


//For Org Info
const openModal = (field) => {
    fieldToUpdate.value = field;
    modalModel.value = eval(field).value;
    modalTitle.value = `Edit ${field.replace(/([A-Z])/g, ' $1')}`.replace(/^./, str => str.toUpperCase());
    isTextarea.value = (field === 'shortDescription' || field === 'detailDescription' || field === `whoWeAre` || field === `whatWeDo` || field === 'howWeDo' || field === 'mission' || field === 'vision' || field === 'value' || field === 'areasOfFocus' || field === 'causes' || field === 'impact' || field === 'whyJoinUs');

    isModalVisible.value = true;
};

const closeModal = () => {
    isModalVisible.value = false;
};

const saveModal = () => {
    eval(fieldToUpdate.value).value = modalModel.value;
    updateSingleField(fieldToUpdate.value, modalModel.value);
    closeModal();
};

</script>

<style scoped>
.profile-data-show {
    padding: 20px;
}

.fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.bg-opacity-75 {
    background-color: rgba(0, 0, 0, 0.75);
}

.max-w-md {
    max-width: 28rem;
}

.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.flex {
    display: flex;
}

.justify-end {
    justify-content: flex-end;
}
</style>