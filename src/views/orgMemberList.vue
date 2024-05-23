<!-- Org register page -->
<script setup>
import { ref } from 'vue'
import { orgMemberListAuthStore } from '../store/orgMemberList';

const orgMemberListAuth = orgMemberListAuthStore

const org_id = ref('')
const individual_id = ref('')

</script>
<template>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <h1 class="h4 mb-4 fw-bold text-center">Sign up to your account</h1>
      <div class="mb-3">
        <label for="org_id" class="form-label">Org Id</label>
        <input v-model="org_id" type="number" id="org_id" class="form-control" placeholder="org_id" required>
        <p v-if="orgMemberListAuth.errors?.org_id" class="text-danger mt-2">{{ orgMemberListAuth.errors?.org_id[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="individual_id" class="form-label">individual_id</label>
        <input v-model="individual_id" type="number" id="individual_id" class="form-control" placeholder="individual_id" required>
        <p v-if="orgMemberListAuth.errors?.individual_id" class="text-danger mt-2">{{ orgMemberListAuth.errors?.individual_id[0] }}</p>
      </div>
      
      <div class="d-flex justify-content-between mb-3">
        <router-link to="/login" class="text-primary">Click to See how to add member</router-link>
      </div>
      <div class="text-end">
        <button @click="orgMemberListAuth.orgMemberListAdd(org_id, individual_id)" class="btn btn-primary">Add Member</button>
      </div>
    </div>
  </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
