<!-- AddMember.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const searchQuery = ref('');
const searchResults = ref([]);
const selectedIndividual = ref(null);
const userId = auth.user.id; // Assuming the org ID is stored in the logged-in user
const baseURL = 'http://localhost:8000';

const founderList = ref([]);
const addedFounder = ref([]);
const name = ref('');
const designation = ref('');

const showForm = ref(false); // initially, the form is hidden
const showAddFounderSection = ref(false); // controls the display of "Search and Add Founder" section

const getFounders = async () => {
    try {
        const response = await authStore.fetchProtectedApi(`/api/get-founder/${userId}`, {}, 'GET');
        if (response.status) {
            founderList.value = response.data;
        } else {
            founderList.value = [];
        }
    } catch (error) {
        console.error("Error fetching member list:", error);
        founderList.value = [];
    }
};

const searchIndividuals = async () => {
    try {
        const response = await auth.fetchPublicApi('/api/search_individual', { query: searchQuery.value }, 'POST');
        if (response.status) {
            searchResults.value = response.data;
            //console.log(response.data);
        } else {
            searchResults.value = [];
        }
    } catch (error) {
        console.error("Error searching individuals:", error);
        searchResults.value = [];
    }
};

const addFounder = async (individualTypeUserId) => {
    //console.log('Founder user id:', individualTypeUserId);
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to add as a founder?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await auth.fetchProtectedApi('/api/create-founder', { user_id: userId, founder_user_id: individualTypeUserId }, 'POST');
            if (response.status) {
                await Swal.fire(
                    'Added!',
                    'Founder added successfully.',
                    'success'
                );
                window.location.reload();
            } else {
                Swal.fire(
                    'Failed!',
                    'Failed to add founder.',
                    'error'
                );
            }
        }
    } catch (error) {
        console.error("Error adding founder:", error);
        Swal.fire(
            'Error!',
            'Failed to add founder.',
            'error'
        );
    }
};

const addUnlinkFounder = async () => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to add as a founder?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'No, cancel!'
        });
        if (result.isConfirmed) {
            const response = await authStore.fetchProtectedApi('/api/create-founder', { user_id: userId, name: name.value, designation: designation.value }, 'POST');
            if (response.status && response.data) {
                addedFounder.value = response.data;
                //console.log(addedFounder);
                await Swal.fire(
                    'Added!',
                    // addedFounder.name - addedFounder.designation,
                    'Founder added successfully.',
                    'success'
                );
                window.location.reload();

            } else {
                addedFounder.value = [];
                Swal.fire(
                    'Failed!',
                    'Failed to add founder.',
                    'error'
                );
            }
        }
    } catch (error) {
        console.error("Error fetching member list:", error);
        addedFounder.value = [];
    }
};

onMounted(getFounders);

</script>

<template>
    <!-- Founder list and options show -->
    <section>
        <div class="flex justify-between mb-4 left-color-shade py-2">
            <div>
                <h5 class="text-md font-semibold mt-2">Member list</h5>
            </div>
            <div>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-blue-600 p-2 rounded mr-2">
                        Full list
                    </button>
                </a>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-blue-600 p-2 rounded mx-2">
                        Print
                    </button>
                </a>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-blue-600 p-2 rounded mx-2">
                        PDF
                    </button>
                </a>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-blue-600 p-2 rounded mx-2">
                        Excel
                    </button>
                </a>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-blue-600 p-2 rounded mx-2">
                        Settings
                    </button>
                </a>
                <!-- Add founder button to toggle the "Search & Add Founder" section -->
                <button @click="showAddFounderSection = !showAddFounderSection"
                    class="text-md text-white font-semibold bg-blue-600 p-2 rounded mx-2">
                    + Add founder
                </button>
            </div>
        </div>

        <div v-if="founderList.length" class="bg-white">
            <table class="min-w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th class="border px-4 py-2">Sl</th>
                        <th class="border px-4 py-2">Name</th>
                        <th class="border px-4 py-2">Designation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="founder in founderList" :key="founder.id" class="hover:bg-gray-50">
                        <td class="border px-4 py-2">{{ founder.id }}</td>
                        <td class="border px-4 py-2">{{ founder.founders && founder.founders.name ?
                            founder.founders.name : founder.name }}</td>
                        <td class="border px-4 py-2">{{ founder.designation }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>


    <!-- Search and Add Founder section - initially hidden, toggled by the button -->
    <section v-if="showAddFounderSection">
        <!-- <section class="mt-[50px]">
            <hr>
        </section> -->
        <div class="add-member max-w-7xl mx-auto p-8">
            <h2 class="mb-8 text-center text-2xl text-gray-500">Search & add founder</h2>

            <!-- Search Input -->
            <div class="flex justify-center mb-6">
                <input type="text"
                    class="form-input flex-1 max-w-lg px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    v-model="searchQuery" placeholder="Search by name, email, mobile, username or Azon Id"
                    @input="searchIndividuals" />
                <button
                    class="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 transition-all focus:outline-none"
                    @click="searchIndividuals">
                    Search
                </button>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.length" class="bg-white shadow-lg rounded-lg p-6">
                <ul class="divide-y divide-gray-200">
                    <li v-for="individualUser in searchResults" :key="individualUser.id" class="flex items-center py-4">
                        <img :src="`${baseURL}/storage/${individualUser.image}`" alt="Profile picture"
                            class="w-20 h-20 rounded-full object-cover mr-4" />
                        <div class="flex-1">
                            <p class="font-medium text-lg text-gray-700">{{ individualUser.name }}</p>
                            <p class="text-sm text-gray-500">{{ individualUser.city }}, {{ individualUser.country_name
                                }}</p>
                            <p class="text-sm text-gray-500">Username: {{ individualUser.username }}</p>
                            <p class="text-sm text-gray-500">Azon Id: {{ individualUser.azon_id }}</p>
                        </div>
                        <button
                            class="ml-4 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded focus:outline-none"
                            @click="addFounder(individualUser.id)">
                            Add
                        </button>
                    </li>
                </ul>
            </div>

            <!-- No Results Found // Founder add without user table data link -->
            <div v-else>
                <p class="text-center text-gray-500 mt-4">
                    Want to add founder manually, without link? click
                    <a href="#" @click="showForm = true"
                        class="hover:bg-gray-100 text-blue-600 hover:text-blue-800">here</a>
                </p>
            </div>

            <!-- Form will only show if showForm is true -->
            <div v-if="showForm">
                <div class="mb-4">
                    <label for="name" class="block text-gray-700 font-semibold mb-2">Founder name <span
                            class="text-red-500">*</span></label>
                    <input v-model="name" type="text" id="name"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Founder name" required>
                    <p v-if="auth.errors?.name" class="text-red-500 mt-2">{{ auth.errors?.name[0] }}</p>
                </div>

                <div class="mb-4">
                    <label for="designation" class="block text-gray-700 font-semibold mb-2">Designation</label>
                    <input v-model="designation" type="text" id="designation"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional">
                    <p v-if="auth.errors?.designation" class="text-red-500 mt-2">{{ auth.errors?.designation[0] }}</p>
                </div>

                <div class="text-right">
                    <button @click="addUnlinkFounder(name, designation)"
                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Submit</button>
                </div>
            </div>
        </div>
    </section>

</template>

<style scoped></style>
