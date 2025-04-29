<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../../store/authStore'
// import axios from "axios"; // Uncomment if not globally injected

const auth = authStore


const code = ref("")
const message = ref("")
const error = ref("")
const router = useRouter()

const email = localStorage.getItem('reset_email')

const submitVerifyCode = async () => {
    message.value = ""
    error.value = ""

    try {
        const response = await authStore.fetchProtectedApi('/api/verify-code', { email, code: code.value }, 'POST')
        message.value = response.data.message || "Code verified!"

        // Go to Reset Password page
        router.push('/reset-password')
    } catch (err) {
        error.value = err.response?.data?.message || "Invalid code. Please try again."
    }
}
</script>

<template>
    <header class="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
        <div class="container mx-auto flex justify-between items-center py-4 px-6">
            <div>
                <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-40">
            </div>
            <div class="hidden md:flex">
                <ul class="flex space-x-6">
                    <li>
                        <router-link class="text-gray-600 hover:text-blue-600 font-medium" to="/individual-register">
                            Individual Register
                        </router-link>
                    </li>
                    <li>
                        <router-link class="text-gray-600 hover:text-blue-600 font-medium" to="/org-register">
                            Organization Register
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
    </header>

    <main class="flex items-center justify-center pt-24 bg-gray-50">
        <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold text-center mb-6">Verify Code</h2>
            <form @submit.prevent="submitVerifyCode" class="space-y-5">
                <div>
                    <label class="block mb-1 text-sm font-semibold text-gray-700">Enter Code</label>
                    <input 
                        type="text" 
                        v-model="code" 
                        required 
                        maxlength="6"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                        placeholder="Enter 6-digit code"
                    />
                </div>

                <button 
                    type="submit"
                    class="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-300"
                >
                    Verify Code
                </button>

                <div v-if="message" class="text-green-600 text-center text-sm">{{ message }}</div>
                <div v-if="error" class="text-red-600 text-center text-sm">{{ error }}</div>
            </form>
        </div>
    </main>

    <footer class="bg-white border-t mt-12 py-6">
        <div class="container mx-auto text-center space-y-3 text-sm text-gray-600">
            <p>
                By signing in, you agree to our 
                <router-link to="/terms" class="text-blue-600 hover:text-blue-500">Terms of Service</router-link> 
                and 
                <router-link to="/privacy" class="text-blue-600 hover:text-blue-500">Privacy Policy</router-link>.
            </p>
            <p>
                Need help? 
                <router-link to="/help" class="text-blue-600 hover:text-blue-500">Contact us</router-link>.
            </p>
            <p>
                Azonation is a product of 
                <router-link to="/terms" class="text-gray-600 hover:text-blue-500">Azon Group Ltd</router-link><br>
                © 2025 Azonation. All rights reserved.
            </p>
        </div>
    </footer>
</template>