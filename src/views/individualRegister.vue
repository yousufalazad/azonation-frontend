<!-- Individual register page -->
<script setup>
import { ref } from 'vue'
import { individualAuthStore } from '../store/individualStore';
const individualAuth = individualAuthStore

import router from '../router/router'

const full_name = ref('')
const email = ref('')
const password = ref('')

</script>
<template>
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h1 class="h4 mb-4 font-weight-bold text-center">Sign up to your account</h1>
            
            <div class="mb-3">
              <label for="org_name" class="form-label">Full Name</label>
              <input v-model="full_name" type="text" id="full_name" class="form-control" placeholder="full_name" required>
              <p v-if="individualAuth.errors?.full_name" class="text-danger mt-2">{{ individualAuth.errors?.full_name[0] }}</p>
            </div>
            
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input v-model="email" type="email" id="email" class="form-control" placeholder="Email" required>
              <p v-if="individualAuth.errors?.email" class="text-danger mt-2">{{ individualAuth.errors?.email[0] }}</p>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input v-model="password" type="password" id="password" class="form-control" placeholder="••••••••" required>
              <p v-if="individualAuth.errors?.password" class="text-danger mt-2">{{ individualAuth.errors?.password[0] }}</p>
            </div>

            <div class="d-flex justify-content-between mb-3">
              <router-link to="/login" class="text-primary">Already have an account? Login</router-link>
            </div>
            <div class="text-right">
              <button @click="individualAuth.individualRegister(full_name, email, password)" class="btn btn-primary">Sign Up</button>
            </div>
          </div>
        </div>
      
</template>

<style></style>