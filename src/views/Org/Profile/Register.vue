<!-- Org register page -->
<script setup>
import { ref } from 'vue'
import { authStore } from '../../../store/authStore';
const auth = authStore

const org_name = ref('')
const email = ref('')
const password = ref('')

</script>
<template>
  <header class="navbar navbar-expand-md navbar-light bg-light fixed-top navbar-width">
      <div class="container-fluid">
        <li class="nav-item azonation-logo">
        <img src="../../../assets/Logo/Azonation.png" alt="Azonation" width="175px">
      </li>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
           
            <li class="nav-item">
              <router-link class="nav-link" to="/individual-register">Individual Register</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/">Login</router-link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  <div class="d-flex flex-column align-items-center justify-content-center mt-5 px-3">
    <div class="w-75 bg-white rounded-lg shadow-lg sm:max-w-md px-5">
      <div class="p-4 space-y-4"></div>
      <h1 class="text-xl fw-bold leading-tight text-center text-dark pb-4">Sign up to your account</h1>
      <div class="mb-3">
        <label for="org_name" class="form-label">Org Name</label>
        <input v-model="org_name" type="text" id="org_name" class="form-control" placeholder="Name" required>
        <p v-if="auth.errors?.org_name" class="text-danger mt-2">{{ auth.errors?.org_name[0] }}</p>
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
        <button @click="auth.orgRegister(org_name, email, password)" class="btn btn-primary">Sign Up</button>
      </div>
    </div>
  </div>
</template>

<style>
/* Add any custom styles here if necessary */
</style>
