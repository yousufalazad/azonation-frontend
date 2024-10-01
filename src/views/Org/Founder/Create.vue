<!-- Founder add and update -->
<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const userId = auth.user.id; // Assuming the org ID is stored in the logged-in user

// Data properties
const founderList = ref([]);
const isEditModalOpen = ref(false); // Controls the display of the edit modal
const selectedFounder = ref({ id: null, name: '', designation: '', isNameEditable: false }); // Stores the selected founder's info

const searchQuery = ref('');
const searchResults = ref([]);

const baseURL = 'http://localhost:8000';

const addedFounder = ref([]);
const name = ref('');
const designation = ref('');

const showForm = ref(false); // initially, the form is hidden
const showAddFounderSection = ref(false); // controls the display of "Search and Add Founder" section

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

// Open edit modal and show name for all
// const openEditModal = (founder) => {
//     const isNameEditable = !founder.founders || !founder.founders.name; // Name is editable if it's not from founders table
//     selectedFounder.value = {
//         id: founder.id,
//         name: isNameEditable ? founder.name : founder.founders.name,
//         designation: founder.designation,
//         isNameEditable: isNameEditable
//     }; // Set founder's name and designation
//     isEditModalOpen.value = true;
// };

// Open edit modal and allow name editing conditionally
const openEditModal = (founder) => {
    // If the founder has a name in the relational table, don't allow editing
    const isNameEditable = !(founder.founders && founder.founders.name);
    
    // Set founder details for editing
    selectedFounder.value = {
        id: founder.id,
        name: isNameEditable ? founder.name : founder.founders.name,
        designation: founder.designation,
        isNameEditable: isNameEditable
    };
    isEditModalOpen.value = true;
};

//Update Founder data, name update when name is unlink, designation update allow always
const updateFounder = async () => {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to update this founder's details?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            // Prepare the payload, conditionally including the name
            const payload = {
                designation: selectedFounder.value.designation // Always send designation
            };
            // Include name only if it's editable
            if (selectedFounder.value.isNameEditable) {
                payload.name = selectedFounder.value.name;
            }

            const response = await authStore.fetchProtectedApi(`/api/update-founder/${selectedFounder.value.id}`, payload, 'PUT');

            if (response.status) {
                console.log(response.data);
                await Swal.fire('Updated!', 'Founder details updated successfully.', 'success');
                // Update the founderList after successful edit
                const index = founderList.value.findIndex(f => f.id === selectedFounder.value.id);
                if (index !== -1) {
                    // Update only if the name is editable
                    if (selectedFounder.value.isNameEditable) {
                        founderList.value[index].name = selectedFounder.value.name;
                    }
                    founderList.value[index].designation = selectedFounder.value.designation;
                }
                closeEditModal();
            } else {
                Swal.fire('Failed!', 'Failed to update details.', 'error');
            }
        }
    } catch (error) {
        console.error("Error updating founder details:", error);
        Swal.fire('Error!', 'Failed to update details.', 'error');
    }
};

// Close edit modal
const closeEditModal = () => {
    isEditModalOpen.value = false;
    selectedFounder.value = { id: null, name: '', designation: '', isNameEditable: false }; // Reset selected founder data
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

// Get founders when the component is mounted
onMounted(getFounders);

</script>





<template>
    <!-- Search and Add Founder section - initially hidden, toggled by the button -->
    <section v-if="showAddFounderSection" class="mb-5 md:mb-16">
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
        </div>
    </section>
    
    <section>
    <!-- Edit Modal -->
<div v-if="isEditModalOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded shadow-lg w-1/3">
        <h3 class="text-xl font-bold mb-4">Edit Founder</h3>
        <form @submit.prevent="updateFounder">
            <!-- Conditionally allow name editing -->
            <div class="mb-4">
                <label for="name" class="block text-sm font-bold mb-2">Name</label>
                <input 
                    type="text" 
                    id="name" 
                    v-model="selectedFounder.name" 
                    class="w-full border px-3 py-2 rounded" 
                    :readonly="!selectedFounder.isNameEditable" 
                />
                <!-- Show a tooltip or message if the name is not editable -->
                <p v-if="!selectedFounder.isNameEditable" class="text-sm text-gray-500 mt-1">
                    Name cannot be edited as it comes from a linked founder record.
                </p>
            </div>
            <div class="mb-4">
                <label for="designation" class="block text-sm font-bold mb-2">Designation</label>
                <input 
                    type="text" 
                    id="designation" 
                    v-model="selectedFounder.designation" 
                    class="w-full border px-3 py-2 rounded" 
                />
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

    </section>
</template>

<style scoped></style>