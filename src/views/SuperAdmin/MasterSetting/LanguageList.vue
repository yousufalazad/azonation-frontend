<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = authStore;
const language_name = ref('');
const language_code = ref('');
const is_default = ref('1');
const is_active = ref('1');
const isEditMode = ref(false);
const selectedLanguageListId = ref(null);
const languageList = ref([]);


// Fetch language
const getLanguageList = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/get-languages', {}, 'GET');
        languageList.value = response.status ? response.data : [];
    } catch (error) {
        console.error('Error fetching countries:', error);
        languageList.value = [];
    }
};

// Reset form fields
const resetForm = () => {
    language_name.value = '';
    language_code.value = '';
    is_default.value = '1';
    is_active.value = '1';
    selectedLanguageListId.value = null;
    isEditMode.value = false;
};

// Add or update language
const submitForm = async () => {
    const payload = {
        language_name: language_name.value,
        language_code: language_code.value,
        default: is_default.value,
        is_active: is_active.value,
    };

    try {
        let apiUrl = '/api/create-language';
        let method = 'POST';

        if (isEditMode.value && selectedLanguageListId.value) {
            apiUrl = `/api/update-language/${selectedLanguageListId.value}`;
            method = 'PUT';
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${isEditMode.value ? 'update' : 'add'} this language?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(apiUrl, payload, method);

            if (response.status) {
                await Swal.fire('Success!', `language ${isEditMode.value ? 'updated' : 'added'} successfully.`, 'success');
                getLanguageList();
                resetForm();
            } else {
                Swal.fire('Failed!', 'Failed to save language.', 'error');
            }
        }
    } catch (error) {
        console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} language:`, error);
        Swal.fire('Error!', `Failed to ${isEditMode.value ? 'update' : 'add'} language.`, 'error');
    }
};

// Edit language
const editLanguageList = (language) => {
    language_name.value = language.language_name;
    language_code.value = language.language_code;
    is_default.value = language.default;
    is_active.value = language.is_active;
    selectedLanguageListId.value = language.id;
    isEditMode.value = true;
};

// Delete language
const deleteLanguageList = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this language?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi(`/api/delete-language/${id}`, {}, 'DELETE');

            if (response.status) {
                await Swal.fire('Deleted!', 'language has been deleted.', 'success');
                getLanguageList();
            } else {
                Swal.fire('Failed!', 'Failed to delete language.', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting language:', error);
        Swal.fire('Error!', 'Failed to delete language.', 'error');
    }
};

// Fetch Dialing Codes on mount
onMounted(() => {
    getLanguageList();
});

</script>

<template>
    <div class="max-w-7xl mx-auto w-10/12">
        <section class="mb-5">
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">{{ isEditMode ? 'Edit' : 'Add' }} Language</h5>
            </div>
            <form @submit.prevent="submitForm">
                <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                     <!-- language_name -->
                     <div class="col-span-4 mb-4">
                        <label for="language_name" class="block text-gray-700 font-semibold mb-2">Language Name</label>
                        <input v-model="language_name" id="language_name" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                     <!-- language_code -->
                     <div class="col-span-2 mb-4">
                        <label for="language_code" class="block text-gray-700 font-semibold mb-2">Language Code </label>
                        <input v-model="language_code" id="language_code" type="text"
                            class="w-full border border-gray-300 rounded-md py-2 px-4" required />
                    </div>
                    
                    <!-- is_default -->
                    <div class="col-span-2 mb-4">
                        <label for="is_default" class="block text-gray-700 font-semibold mb-2">Default</label>
                        <select v-model="is_default" id="is_default"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Default</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>

                    <!-- is_active -->
                    <div class="col-span-2 mb-4">
                        <label for="is_active" class="block text-gray-700 font-semibold mb-2">Active</label>
                        <select v-model="is_active" id="is_active"
                            class="w-full border border-gray-300 rounded-md p-2" required>
                            <option value="">Select Active</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                    <!-- Submit button -->
                    <div class="col-span-2 mb-4 flex items-end">
                        <button type="submit" class="bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-500">
                            {{ isEditMode ? 'Update' : 'Add' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="bg-blue-600 text-white rounded-md py-2 px-4 mx-4 hover:bg-blue-700">
                            Reset
                        </button>
                    </div>
                </div>
            </form>
        </section>

        <!-- country list -->
        <section>
            <div class="flex justify-between left-color-shade py-2 my-3">
                <h5 class="text-md font-semibold mt-2">Language List</h5>
            </div>
            <table class="min-w-full table-auto border-collapse border border-gray-300 text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-4 py-2">SL</th>
                        <th class="py-2 px-4 border border-gray-300">Language Name</th>
                        <th class="py-2 px-4 border border-gray-300">Language Code</th>
                        <th class="py-2 px-4 border border-gray-300">Default</th>
                        <th class="py-2 px-4 border border-gray-300">Active</th>
                        <th class="py-2 px-4 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(language, index) in languageList" :key="language.id">
                        <td class="py-2 px-4 border">{{ index + 1 }}</td>
                        <td class="py-2 px-4 border">{{ language.language_name }}</td>
                        <td class="py-2 px-4 border">{{ language.language_code }}</td>
                        <td class="py-2 px-4 border">
                            <span :class="language.default === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ language.default === 0? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border">
                            <span :class="language.is_active === 0 ? 'text-red-500' : 'text-green-500'">
                                {{ language.is_active === 0? "No" : "Yes" }}
                            </span>
                        </td>
                        <td class="py-2 px-4 border flex gap-2">
                            <button @click="editLanguageList(language)"
                                class="bg-yellow-400 text-white rounded-md py-1 px-2 hover:bg-yellow-500">Edit</button>
                            <button @click="deleteLanguageList(language.id)"
                                class="bg-red-600 text-white rounded-md py-1 px-2 hover:bg-red-700">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
</template>

<style scoped>
.left-color-shade {
    background-color: rgba(76, 175, 80, 0.1);
    /* Slightly green background */
}
</style>