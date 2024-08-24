<!-- Home Component -->
<script setup>
import { ref } from 'vue'
import { authStore } from '../../store/authStore';
const auth = authStore
const username = ref('')
const password = ref('')

</script>
<template>
  <header class="navbar navbar-expand-md navbar-light bg-light fixed-top navbar-width">
    <div class="container-fluid">
      <li class="nav-item azonation-logo">
        <img src="../../assets/Logo/Azonation.png" alt="Azonation" width="175px">
      </li>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/individual-register">Individual Register</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/org-register">Org Register</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/superAdmin-register">SuperAdmin Register</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>

  <div class="container">
    <div class="row">
      <div class="col-md-3">
      </div>
      <div class="col-md-6">
        <div class="d-flex flex-column align-items-center justify-content-center mt-5 px-3">
          <div class="w-100 bg-white rounded-lg shadow-lg sm:max-w-md p-4">
            <div class="p-4 space-y-4">
              <h1 class="text-xl fw-bold leading-tight text-center text-dark">
                Sign in to your account
              </h1>
              <div class="space-y-4">
                <div>
                  <label for="username" class="form-label">Email</label>
                  <input v-model="username" id="username" type="text" class="form-control" placeholder="Username"
                    required>
                </div>
                <div>
                  <label for="password" class="form-label">Password</label>
                  <input v-model="password" type="password" id="password" class="form-control" placeholder="••••••••"
                    required>
                </div>
                <div class="">
                  <div class="form-check">
                    <input id="remember" type="checkbox" class="form-check-input" required>
                    <label for="remember" class="form-check-label">Remember me</label>
                  </div>
                </div>
                <div class="text-center">
                  <router-link to="/org-register" class="text-primary fw-bold text-decoration-underline">Create new
                    account</router-link>
                  <br><br>
                  <button @click="auth.authenticate(username, password)" class="btn btn-primary">
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        
      </div>
    </div>
  </div>
</template>

<style>

</style>