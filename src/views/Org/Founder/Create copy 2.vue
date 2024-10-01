<!-- AddMember.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id; // Assuming the org ID is stored in the logged-in user

// Data properties
const founderList = ref([]);
const isEditModalOpen = ref(false); // Controls the display of the edit modal
const selectedFounder = ref({ id: null, name: '', designation: '' }); // Stores the selected founder's info

// Fetch founders list
const getFounders = async () => {
    try {
        const response = await authStore.fetchProtectedApi(`/api/get-founder/${userId}`, {}, 'GET');
        if (response.status) {
            founderList.value = response.data;
        } else {
            founderList.value = [];
        }
    } catch (error) {
        console.error("Error fetching founders list:", error);
        founderList.value = [];
    }
};

// Open edit modal
const openEditModal = (founder) => {
    selectedFounder.value = { ...founder }; // Clone founder's data
    isEditModalOpen.value = true;
};

// Close edit modal
const closeEditModal = () => {
    isEditModalOpen.value = false;
    selectedFounder.value = { id: null, name: '', designation: '' }; // Reset selected founder data
};

// Update founder's designation
const updateDesignation = async () => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to update this founder's designation?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            const response = await authStore.fetchProtectedApi(`/api/update-founder/${selectedFounder.value.id}`, {
                designation: selectedFounder.value.designation
            }, 'POST');

            if (response.status) {
                await Swal.fire('Updated!', 'Founder designation updated successfully.', 'success');
                // Update the founderList after successful edit
                const index = founderList.value.findIndex(f => f.id === selectedFounder.value.id);
                if (index !== -1) {
                    founderList.value[index].designation = selectedFounder.value.designation;
                }
                closeEditModal();
            } else {
                Swal.fire('Failed!', 'Failed to update designation.', 'error');
            }
        }
    } catch (error) {
        console.error("Error updating designation:", error);
        Swal.fire('Error!', 'Failed to update designation.', 'error');
    }
};

// Fetch founders when the component is mounted
onMounted(getFounders);
</script>



<template>
    <!-- Search and Add Founder section - initially hidden, toggled by the button -->
    <section v-if="showAddFounderSection" class="mb-5 md:mb-16">
        <!-- <section class="mt-[50px]">
            <hr>
        </section> -->
        <div class="add-member max-w-7xl mx-auto">
            <h2 class="text-center text-2xl text-gray-500">Search & add founder</h2>

            <!-- Search Input -->
            <div class="flex justify-center my-6">
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
                <p class="text-center text-gray-500">
                    Want to add founder manually, without link? click
                    <a href="#" @click="showForm = true"
                        class="hover:bg-gray-100 text-blue-600 hover:text-blue-800">here</a>
                </p>
            </div>

            <div v-if="showForm" class="flex flex-wrap ml-0 md:ml-[100px] mt-2 md:mt-6">
                <div class="w-full md:w-5/12 mr-2"><label for="name"
                        class="block text-gray-700 font-semibold mb-2">Founder
                        name <span class="text-red-500">*</span></label>
                    <input v-model="name" type="text" id="name"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Founder name" required>
                    <p v-if="auth.errors?.name" class="text-red-500 mt-2">{{ auth.errors?.name[0] }}</p>
                </div>
                <div class="w-full md:w-5/12 mr-2"><label for="designation"
                        class="block text-gray-700 font-semibold mb-2">Designation</label>
                    <input v-model="designation" type="text" id="designation"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional">
                    <p v-if="auth.errors?.designation" class="text-red-500 mt-2">{{ auth.errors?.designation[0] }}</p>
                </div>
                <div>
                    <button @click="addUnlinkFounder(name, designation)"
                        class="bg-blue-600 text-white rounded-md hover:bg-blue-700 py-2 px-4 mb-2 mt-2 md:mt-8">Submit</button>
                </div>
            </div>
        </div>
    </section>

    <!-- Founder list and options show -->
    <section>
        <div class="flex justify-between left-color-shade py-2 my-3">
            <div>
                <h5 class="text-md font-semibold mt-2">Member list</h5>
            </div>
            <div>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mr-2">
                        Full list
                    </button>
                </a>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
                        Print
                    </button>
                </a>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
                        PDF
                    </button>
                </a>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
                        Excel
                    </button>
                </a>
                <a href="/org-dashboard/add-member">
                    <button class="text-md text-white font-semibold bg-gray-400 p-2 rounded mx-2">
                        Settings
                    </button>
                </a>
                <!-- Add founder button to toggle the "Search & Add Founder" section -->
                <button @click="showAddFounderSection = !showAddFounderSection"
                    class="text-md text-white font-semibold bg-blue-600 p-2 rounded mx-2">
                    + Add Founder
                </button>
            </div>
        </div>

        <!-- <div v-if="founderList.length" class="bg-white">

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
        </div> -->

        <div v-if="founderList.length" class="bg-white">
            <table class="min-w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th class="border px-4 py-2">Sl</th>
                        <th class="border px-4 py-2">Name</th>
                        <th class="border px-4 py-2">Designation</th>
                        <th class="border px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="founder in founderList" :key="founder.id" class="hover:bg-gray-50">
                        <td class="border px-4 py-2">{{ founder.id }}</td>
                        <td class="border px-4 py-2">{{ founder.founders && founder.founders.name ?
                            founder.founders.name : founder.name }}</td>
                        <td class="border px-4 py-2">{{ founder.designation }}</td>
                        <td class="border px-4 py-2 text-right">
                            <button @click="openEditModal(founder)"
                                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                                Edit
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Edit Modal -->
            <div v-if="isEditModalOpen"
                class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div class="bg-white p-6 rounded shadow-lg w-1/3">
                    <h3 class="text-xl font-bold mb-4">Edit Designation</h3>
                    <form @submit.prevent="updateDesignation">
                        <div class="mb-4">
                            <label for="name" class="block text-sm font-bold mb-2">Name</label>
                            <input type="text" id="name" v-model="selectedFounder.name"
                                class="w-full border px-3 py-2 rounded" readonly />
                        </div>
                        <div class="mb-4">
                            <label for="designation" class="block text-sm font-bold mb-2">Designation</label>
                            <input type="text" id="designation" v-model="selectedFounder.designation"
                                class="w-full border px-3 py-2 rounded" />
                        </div>
                        <div class="flex justify-end">
                            <button type="button" @click="closeEditModal"
                                class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                                Cancel
                            </button>
                            <button type="submit"
                                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
