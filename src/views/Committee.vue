<!-- Individual register page -->
<script setup>
import { ref } from 'vue'
import { authStore } from '../store/authStore';
const auth = authStore

const name = ref('')
const short_description = ref('')
const start_date = ref('')
const end_date = ref('')
const note = ref('')
const status = ref('')
const orgId = authStore.org.id; // Assuming the org ID is stored in the logged-in user


</script>
<template>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <h1 class="h4 mb-4 fw-bold text-center">Create committee</h1>
      
      <div class="mb-3">
        <label for="name" class="form-label">Committee name</label>
        <input v-model="name" type="text" id="name" class="form-control" placeholder="Committee Name" required>
        <p v-if="auth.errors?.name" class="text-danger mt-2">{{ auth.errors?.name[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="short_description" class="form-label">Short description</label>
        <input v-model="short_description" type="text" id="short_description" class="form-control" placeholder="Short description" required>
        <p v-if="auth.errors?.short_description" class="text-danger mt-2">{{ auth.errors?.short_description[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="start_date" class="form-label">Committee start date</label>
        <input v-model="start_date" type="date" id="start_date" class="form-control" placeholder="Committee start date" required>
        <p v-if="auth.errors?.start_date" class="text-danger mt-2">{{ auth.errors?.start_date[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="end_date" class="form-label">Committee end date (Only for admin, member will not see this date)</label>
        <input v-model="end_date" type="date" id="end_date" class="form-control" placeholder="Committee end date" required>
        <p v-if="auth.errors?.end_date" class="text-danger mt-2">{{ auth.errors?.end_date[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="note" class="form-label">Note (only for admin)</label>
        <input v-model="note" type="text" id="note" class="form-control" placeholder="Committee note" required>
        <p v-if="auth.errors?.note" class="text-danger mt-2">{{ auth.errors?.note[0] }}</p>
      </div>

      <!-- <div class="mb-3">
        <label for="status" class="form-label">Committee status</label>
        <input v-model="status" type="dropdown" id="status" class="form-control" placeholder="Committee status" required>
        <p v-if="auth.errors?.status" class="text-danger mt-2">{{ auth.errors?.status[0] }}</p>
      </div> -->

      <div class="d-flex justify-content-between mb-3">
        <router-link to="/create-committee" class="text-primary">Already have committee? Edit existing committee</router-link>
      </div>
      <div class="text-end">
        <button @click="auth.createCommittee(orgId, name, short_description, start_date, end_date, note, status)" class="btn btn-primary">Create committee</button>
      </div>
    </div>
  </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
