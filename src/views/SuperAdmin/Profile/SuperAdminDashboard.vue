
<!-- SuperAdminDashboard.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
//const superAdminId = auth.superAdmin.id;

</script>

<template>
    <div class="profile-update">
        <h2>Super Admin Dashboard !!!</h2>
        
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
</style>../store/authStore
