//create home component
<script setup>
import { ref } from 'vue'
import { loginAuthStore } from '../store/loginLogoutStore';
const loginAuth = loginAuthStore

import router from '../router/router'

const username = ref('')
const password = ref('')

</script>
<template>
    <p class="mt-10">
    <section class="">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
            <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                        Sign in to your account
                    </h1>
                    <div class="space-y-4 md:space-y-6" action="#">
                        <div>
                            <label class="block mb-2 text-sm font-medium text-gray-900 ">Email</label>
                            <input v-model="username"
                                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="username" required="">
                        </div>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 ">Password</label>
                            <input v-model="password" type="password" name="password" id="password"
                                placeholder="••••••••"
                                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                required="">
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-start">
                                <div class="flex items-center h-5">
                                    <input id="remember" aria-describedby="remember" type="checkbox"
                                        class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                                        required="">
                                </div>
                                <div class="ml-3 text-sm">
                                    <label for="remember" class="text-gray-500 ">Remember me</label>
                                </div>
                            </div>
                            <router-link to="/register" class="text-sm font-medium text-primary-600 hover:underline">Create new account</router-link>
                        </div>
                        <p class="text-right">
                            <button @click="loginAuth.authenticate(username, password)"
                                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                <span>Login</span>
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    </p>
</template>

<style></style>