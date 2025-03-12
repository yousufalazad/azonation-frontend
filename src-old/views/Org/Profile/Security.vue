<template>
    <!-- User Email Section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-2 left-color-shade py-2">User Email</h3>
            <div class="flex justify-between">
                <div>
                    <p class="ml-5 pb-9">{{ email }}
                        <span class="ml-16">Status: {{ getStatusMessage(statusPhone) }}</span>
                    </p>
                </div>
                <div><button @click="openEmailModal()" class="text-blue-500 pl-9 pr-2">Edit Email</button></div>
            </div>
        </div>

        <!-- User Email Modal -->
        <div v-if="modalVisibleUserEmail"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-center">Edit User Email</h2>

                <!-- Email Input -->
                <div class="mb-4">
                    <label for="newEmail" class="block text-sm font-medium text-gray-700">User email address</label>
                    <input v-model="newEmail" type="email" id="newEmail"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required />
                    <p v-if="auth.errors?.newEmail" class="text-red-500 text-sm mt-1">{{ auth.errors?.newEmail[0] }}</p>
                </div>

                <!-- Modal Buttons -->
                <div class="flex justify-end">
                    <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                        @click="closeEmailModal">
                        Close
                    </button>
                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" @click="updateUserEmail">
                        Update
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- User Password Section -->
    <section>
        <div class="space-y-4">
            <h3 class="text-lg font-bold mb-2 left-color-shade py-2">Change Password</h3>
            <div class="flex justify-between">
                <div>
                    <p class="ml-5 pb-9">********</p>
                </div>
                <div>
                    <button @click="openPasswordModal" class="text-blue-500 pl-9 pr-2">Change Password</button>
                </div>
            </div>
        </div>

        <!-- Change Password Modal -->
        <div v-if="modalVisibleUserPassword"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-center">Change Password</h2>

                <!-- Old Password -->
                <div class="mb-4 relative">
                    <label for="oldPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
                    <input :type="showOldPassword ? 'text' : 'password'" v-model="oldPassword" id="oldPassword"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" style="min-height: 40px;"
                        required />
                    <!-- Show/Hide Password Button -->
                    <button type="button" @click="toggleShowOldPassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                        <span v-if="showOldPassword" class="text-gray-600">Hide</span>
                        <span v-else class="text-gray-600">Show</span>
                    </button>
                    <p v-if="auth.errors?.oldPassword" class="text-red-500 text-sm mt-1">{{ auth.errors?.oldPassword[0]
                        }}</p>
                </div>


                <!-- New Password -->
                <div class="mb-4 relative">
                    <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
                    <input :type="showNewPassword ? 'text' : 'password'" v-model="newPassword" id="newPassword"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" style="min-height: 40px;"
                        required @input="checkPasswordStrength" />
                    <!-- Show/Hide Password Button -->
                    <button type="button" @click="toggleShowNewPassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                        <span v-if="showNewPassword" class="text-gray-600">Hide</span>
                        <span v-else class="text-gray-600">Show</span>
                    </button>
                    <p v-if="auth.errors?.newPassword" class="text-red-500 text-sm mt-1">{{ auth.errors?.newPassword[0]
                        }}</p>

                    <!-- Password Strength -->
                    <p class="text-sm mt-1" :class="passwordStrengthColor">{{ passwordStrengthMessage }}</p>

                    <!-- Password Requirements -->
                    <ul class="text-sm mt-2 space-y-1">
                        <li :class="passwordRequirements.length ? 'text-green-500' : 'text-gray-500'">At least 8
                            characters</li>
                        <li :class="passwordRequirements.uppercase ? 'text-green-500' : 'text-gray-500'">At least 1
                            uppercase letter</li>
                        <li :class="passwordRequirements.lowercase ? 'text-green-500' : 'text-gray-500'">At least 1
                            lowercase letter</li>
                        <li :class="passwordRequirements.number ? 'text-green-500' : 'text-gray-500'">At least 1 number
                        </li>
                        <li :class="passwordRequirements.special ? 'text-green-500' : 'text-gray-500'">At least 1
                            special character</li>
                    </ul>
                </div>

                <!-- Confirm Password -->
                <div class="mb-4 relative">
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New
                        Password</label>
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword"
                        id="confirmPassword"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" style="min-height: 40px;"
                        required />
                    <!-- Show/Hide Password Button -->
                    <button type="button" @click="toggleShowConfirmPassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                        <span v-if="showConfirmPassword" class="text-gray-600">Hide</span>
                        <span v-else class="text-gray-600">Show</span>
                    </button>
                    <p v-if="confirmPasswordError" class="text-red-500 text-sm mt-1">{{ confirmPasswordError }}</p>
                </div>

                <!-- Modal Buttons -->
                <div class="flex justify-end">
                    <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                        @click="closePasswordModal">
                        Close
                    </button>
                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        @click="updateUserPassword">
                        Update
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from "sweetalert2";

const auth = authStore;
const userId = auth.user.id;
const email = auth.user.email;
const statusPhone = ref(1); // Placeholder: Replace with your actual logic

const modalVisibleUserEmail = ref(false);
const newEmail = ref('');

//for password change
const newPassword = ref('');
const confirmPassword = ref('');
const confirmPasswordError = ref('');
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const oldPassword = ref('');
const showOldPassword = ref(false);
const oldPasswordError = ref(''); // Add a new state for the old password error


const modalVisibleUserPassword = ref(false);

// Password strength logic
const passwordStrengthMessage = ref('');
const passwordStrengthColor = ref('');
const passwordRequirements = ref({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
});

const checkPasswordStrength = () => {
    const password = newPassword.value;
    passwordRequirements.value.length = password.length >= 8;
    passwordRequirements.value.uppercase = /[A-Z]/.test(password);
    passwordRequirements.value.lowercase = /[a-z]/.test(password);
    passwordRequirements.value.number = /\d/.test(password);
    passwordRequirements.value.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const metRequirements = Object.values(passwordRequirements.value).filter(Boolean).length;

    if (metRequirements <= 2) {
        passwordStrengthMessage.value = 'Weak';
        passwordStrengthColor.value = 'text-red-500';
    } else if (metRequirements === 3 || metRequirements === 4) {
        passwordStrengthMessage.value = 'Moderate';
        passwordStrengthColor.value = 'text-yellow-500';
    } else if (metRequirements === 5) {
        passwordStrengthMessage.value = 'Strong';
        passwordStrengthColor.value = 'text-green-500';
    }
};

// Email update logic
const updateUserEmail = async () => {
    try {
        const response = await auth.fetchProtectedApi(`/api/update-email/${userId}`, {
            email: newEmail.value,
        }, 'PUT');
        if (response.status) {
            Swal.fire('Success', 'Email updated successfully', 'success');
            closeEmailModal();
            let user = JSON.parse(sessionStorage.getItem('user'));
            if (user) {
                user.email = newEmail.value;
                sessionStorage.setItem('user', JSON.stringify(user));
            }
            window.location.reload();
        }
    } catch (error) {
        console.log(error);
        Swal.fire('Error', 'Failed to update email', 'error');
    }
};

const updateUserPassword = async () => {
    if (!oldPassword.value) {
        Swal.fire('Error', 'Current password is required.', 'error');
        return;
    }

    // Check if all conditions are met for the new password
    if (!passwordRequirements.value.length || !passwordRequirements.value.uppercase ||
        !passwordRequirements.value.lowercase || !passwordRequirements.value.number ||
        !passwordRequirements.value.special) {
        Swal.fire('Error', 'New password must meet all requirements.', 'error');
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        confirmPasswordError.value = 'Passwords do not match.';
        return;
    }

    confirmPasswordError.value = '';

    try {
        const response = await auth.fetchProtectedApi(`/api/update-password/${userId}`, {
            old_password: oldPassword.value,  // Pass old password for validation
            password: newPassword.value,       // New password
            password_confirmation: confirmPassword.value,  // Pass password confirmation
        }, 'PUT');

        if (response.status) {
            Swal.fire('Success', 'Password updated successfully', 'success');
            closePasswordModal();
        }
    } catch (error) {
        //Handle old password mismatch
        if (error.response && error.response.status === 422 && error.response.data.errors?.oldPassword) {
            Swal.fire('Error', error.response.data.errors.oldPassword[0], 'error');
        } else {
            Swal.fire('Error', 'Failed to update password', 'error');
        }

        // In the catch block
        // if (error.response && error.response.status === 422 && error.response.data.errors?.oldPassword) {
        //     oldPasswordError.value = error.response.data.errors.oldPassword[0];
        // } else {
        //     oldPasswordError.value = 'Failed to update password'; // Default error message
        // }
    }
};


//------------Working -------------------------
// const updateUserPassword = async () => {
//     if (!oldPassword.value) {
//         Swal.fire('Error', 'Current password is required.', 'error');
//         return;
//     }

//     // Check if all conditions are met for the new password
//     if (!passwordRequirements.value.length || !passwordRequirements.value.uppercase ||
//         !passwordRequirements.value.lowercase || !passwordRequirements.value.number ||
//         !passwordRequirements.value.special) {
//         Swal.fire('Error', 'New password must meet all requirements.', 'error');
//         return;
//     }

//     if (newPassword.value !== confirmPassword.value) {
//         confirmPasswordError.value = 'Passwords do not match.';
//         return;
//     }

//     confirmPasswordError.value = '';

//     try {
//         const response = await auth.fetchProtectedApi(`/api/update-password/${userId}`, {
//             old_password: oldPassword.value,  // Pass old password for validation
//             password: newPassword.value,       // New password
//             password_confirmation: confirmPassword.value,  // Pass password confirmation
//         }, 'PUT');

//         if (response.status) {
//             Swal.fire('Success', 'Password updated successfully', 'success');
//             closePasswordModal();
//         }
//     } catch (error) {
//         console.log(error);
//         Swal.fire('Error', 'Failed to update password', 'error');
//     }
// };

//--


// const updateUserPassword = async () => {
//     // Check if all conditions are met
//     if (!passwordRequirements.value.length || !passwordRequirements.value.uppercase ||
//         !passwordRequirements.value.lowercase || !passwordRequirements.value.number ||
//         !passwordRequirements.value.special) {
//         Swal.fire('Error', 'Password must meet all requirements.', 'error');
//         return;
//     }

//     if (newPassword.value !== confirmPassword.value) {
//         confirmPasswordError.value = 'Passwords do not match.';
//         return;
//     }

//     confirmPasswordError.value = '';

//     try {
//         const response = await auth.fetchProtectedApi(`/api/update-password/${userId}`, {
//             password: newPassword.value,
//         }, 'PUT');
//         if (response.status) {
//             Swal.fire('Success', 'Password updated successfully', 'success');
//             closePasswordModal();
//         }
//     } catch (error) {
//         console.log(error);
//         Swal.fire('Error', 'Failed to update password', 'error');
//     }
// };

// Toggle function for showing/hiding the old password
const toggleShowOldPassword = () => {
    showOldPassword.value = !showOldPassword.value;
};

const toggleShowNewPassword = () => {
    showNewPassword.value = !showNewPassword.value;
};

const toggleShowConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
};

const openPasswordModal = () => {
    modalVisibleUserPassword.value = true;
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    oldPasswordError.value = '';
};

const closePasswordModal = () => {
    modalVisibleUserPassword.value = false;
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    oldPasswordError.value = ''; // Reset errors on close
};

// Status Message for email (replace with actual logic dynamically)
const getStatusMessage = (status) => {
    return status === 1 ? 'Verified' : 'Not Verified';
};

const openEmailModal = () => {
    modalVisibleUserEmail.value = true;
};

const closeEmailModal = () => {
    modalVisibleUserEmail.value = false;
};
</script>

<style scoped></style>
