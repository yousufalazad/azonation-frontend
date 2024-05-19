<!-- Org register page -->
<script setup>
import { ref } from 'vue'
import { orgAuthStore } from '../store/orgStore';
const orgAuth = orgAuthStore

import router from '../router/router'

const org_name = ref('')
const email = ref('')
const password = ref('')

</script>
<template>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <h1 class="h4 mb-4 fw-bold text-center">Sign up to your account</h1>
      <div class="mb-3">
        <label for="org_name" class="form-label">Org Name</label>
        <input v-model="org_name" type="text" id="org_name" class="form-control" placeholder="Name" required>
        <p v-if="orgAuth.errors?.org_name" class="text-danger mt-2">{{ orgAuth.errors?.org_name[0] }}</p>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="email" id="email" class="form-control" placeholder="Email" required>
        <p v-if="orgAuth.errors?.email" class="text-danger mt-2">{{ orgAuth.errors?.email[0] }}</p>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" type="password" id="password" class="form-control" placeholder="••••••••" required>
        <p v-if="orgAuth.errors?.password" class="text-danger mt-2">{{ orgAuth.errors?.password[0] }}</p>
      </div>
      <div class="d-flex justify-content-between mb-3">
        <router-link to="/login" class="text-primary">Already have an account? Login</router-link>
      </div>
      <div class="text-end">
        <button @click="orgAuth.orgRegister(org_name, email, password)" class="btn btn-primary">Sign Up</button>
      </div>
    </div>
  </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
