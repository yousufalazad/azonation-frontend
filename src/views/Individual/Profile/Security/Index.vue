<script setup>
import { ref } from 'vue';
import { authStore } from '@/store/authStore';
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

<template>
    <!-- User Email Section -->
    <section class="mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">Email</h3>
                    <p class="text-sm text-gray-600 mt-1">
                        {{ email }}
                        <span class="ml-4 text-xs text-gray-500">Status: {{ getStatusMessage(statusPhone) }}</span>
                    </p>
                </div>
                <button @click="openEmailModal()" class="text-sm text-blue-600 hover:underline">Edit</button>
            </div>
        </div>

        <!-- Edit Email Modal -->
        <div v-if="modalVisibleUserEmail"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 class="text-xl font-semibold text-center text-gray-800 mb-4">Edit Email</h2>

                <div class="mb-4">
                    <label for="newEmail" class="text-sm text-gray-600">New Email</label>
                    <input v-model="newEmail" type="email" id="newEmail"
                        class="w-full mt-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p v-if="auth.errors?.newEmail" class="text-sm text-red-500 mt-1">{{ auth.errors?.newEmail[0] }}</p>
                </div>

                <div class="flex justify-end space-x-2">
                    <button @click="closeEmailModal"
                        class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                    <button @click="updateUserEmail"
                        class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
                </div>
            </div>
        </div>
    </section>

    <!-- Change Password Section -->
    <section>
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">Change password</h3>
                    <p class="text-sm text-gray-600 mt-1">********</p>
                </div>
                <button @click="openPasswordModal" class="text-sm text-blue-600 hover:underline">Change</button>
            </div>
        </div>

        <!-- Password Modal -->
        <div v-if="modalVisibleUserPassword"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 class="text-xl font-semibold text-center text-gray-800 mb-4">Update Password</h2>

                <!-- Old Password -->
                <div class="mb-4 relative">
                    <label for="oldPassword" class="text-sm text-gray-600">Current Password</label>
                    <input :type="showOldPassword ? 'text' : 'password'" v-model="oldPassword" id="oldPassword"
                        class="w-full mt-1 border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" @click="toggleShowOldPassword"
                        class="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-700">{{ showOldPassword ?
                        'Hide' : 'Show' }}</button>
                    <p v-if="auth.errors?.oldPassword" class="text-sm text-red-500 mt-1">{{ auth.errors?.oldPassword[0]
                        }}</p>
                </div>

                <!-- New Password -->
                <div class="mb-4 relative">
                    <label for="newPassword" class="text-sm text-gray-600">New Password</label>
                    <input :type="showNewPassword ? 'text' : 'password'" v-model="newPassword" id="newPassword"
                        class="w-full mt-1 border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="checkPasswordStrength" />
                    <button type="button" @click="toggleShowNewPassword"
                        class="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-700">{{ showNewPassword ?
                        'Hide' : 'Show' }}</button>
                    <p v-if="auth.errors?.newPassword" class="text-sm text-red-500 mt-1">{{ auth.errors?.newPassword[0]
                        }}</p>
                    <p class="text-xs mt-1" :class="passwordStrengthColor">{{ passwordStrengthMessage }}</p>
                    <ul class="text-xs mt-2 space-y-1">
                        <li :class="passwordRequirements.length ? 'text-green-600' : 'text-gray-400'">● At least 8
                            characters</li>
                        <li :class="passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-400'">● One uppercase
                            letter</li>
                        <li :class="passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-400'">● One lowercase
                            letter</li>
                        <li :class="passwordRequirements.number ? 'text-green-600' : 'text-gray-400'">● One number</li>
                        <li :class="passwordRequirements.special ? 'text-green-600' : 'text-gray-400'">● One special
                            character</li>
                    </ul>
                </div>

                <!-- Confirm Password -->
                <div class="mb-6 relative">
                    <label for="confirmPassword" class="text-sm text-gray-600">Confirm Password</label>
                    <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword"
                        id="confirmPassword"
                        class="w-full mt-1 border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" @click="toggleShowConfirmPassword"
                        class="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-700">{{ showConfirmPassword
                        ? 'Hide' : 'Show' }}</button>
                    <p v-if="confirmPasswordError" class="text-sm text-red-500 mt-1">{{ confirmPasswordError }}</p>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-2">
                    <button @click="closePasswordModal"
                        class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                    <button @click="updateUserPassword"
                        class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
