<!-- Individual register page -->
<script setup>
import { ref } from 'vue'
import { authStore } from '../../../store/authStore';
const auth = authStore

const full_name = ref('')
const email = ref('')
const password = ref('')

</script>
<template>
  <div class="d-flex flex-column align-items-center justify-content-center mt-5 px-3">
    <div class="w-75 bg-white rounded-lg shadow-lg sm:max-w-md px-5">
      <div class="p-4 space-y-4"></div>
      <h1 class="text-xl fw-bold leading-tight text-center text-dark pb-4">Sign up to your account</h1>
      <div class="mb-3">
        <label for="full_name" class="form-label">Full Name</label>
        <input v-model="full_name" type="text" id="full_name" class="form-control" placeholder="Full Name" required>
        <p v-if="auth.errors?.full_name" class="text-danger mt-2">{{ auth.errors?.full_name[0] }}</p>
      </div>
      
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="email" id="email" class="form-control" placeholder="Email" required>
        <p v-if="auth.errors?.email" class="text-danger mt-2">{{ auth.errors?.email[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" type="password" id="password" class="form-control" placeholder="••••••••" required>
        <p v-if="auth.errors?.password" class="text-danger mt-2">{{ auth.errors?.password[0] }}</p>
      </div>

      <div class="d-flex justify-content-between mb-3">
        <router-link to="/" class="text-primary">Already have an account? Login</router-link>
      </div>
      <div class="text-end pb-4">
        <button @click="auth.individualRegister(full_name, email, password)" class="btn btn-primary">Sign Up</button>
      </div>
    </div>
  </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
