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
const baseURL = auth.apiBase; // Base URL for API requests
const addedFounder = ref([]);
const showAddFounderSection = ref(false); // controls the display of "Search and Add Founder" section
const showForm = ref(false);
// const showForm = ref(true);
const name = ref('');
const designation = ref('');
const profile_image = ref(null);
const isActive = ref(true); // default status, can be controlled as needed

const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) profile_image.value = file
}

// Fetch founders list
const getFounders = async () => {
    try {
        const response = await authStore.fetchProtectedApi(`/api/founders`, {}, 'GET');
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
        isActive: founder.is_active,
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
                designation: selectedFounder.value.designation, // Always send designation
                is_active: selectedFounder.value.isActive // Always send is_active status for now, may be updated in future
            };
            // Include name only if it's editable
            if (selectedFounder.value.isNameEditable) {
                payload.name = selectedFounder.value.name;
            }

            const response = await authStore.fetchProtectedApi(`/api/founders/${selectedFounder.value.id}`, payload, 'PUT');

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
                    founderList.value[index].is_active = selectedFounder.value.isActive;
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
    selectedFounder.value = { id: null, name: '', designation: '', isActive: '', isNameEditable: false }; // Reset selected founder data
};

const searchIndividuals = async () => {
    try {
        const response = await auth.fetchProtectedApi('/api/org-members/search', { query: searchQuery.value }, 'POST');
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
            const response = await auth.fetchProtectedApi('/api/founders', { user_id: userId, founder_user_id: individualTypeUserId }, 'POST');
            if (response.status) {
                await Swal.fire(
                    'Added!',
                    'Founder added successfully.',
                    'success'
                );
                getFounders();

                // window.location.reload();
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
            text: 'Do you want to add as a founder?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'No, cancel!',
        });

        if (!result.isConfirmed) return;

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('name', name.value);
        formData.append('designation', designation.value || '');
        formData.append('is_active', isActive.value ? '1' : '0');
        if (profile_image.value) {
            formData.append('profile_image', profile_image.value);
        }

        const response = await authStore.uploadProtectedApi('/api/founders', formData, 'POST', {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status && response.data) {
            addedFounder.value = response.data;

            await Swal.fire(
                'Added!',
                'Founder added successfully.',
                'success'
            );
            getFounders();
            // window.location.reload();
        } else {
            addedFounder.value = [];
            Swal.fire(
                'Failed!',
                'Failed to add founder.',
                'error'
            );
        }
    } catch (error) {
        console.error('Error adding founder:', error);
        addedFounder.value = [];
        Swal.fire(
            'Error!',
            'An error occurred. Please try again.',
            'error'
        );
    }
};

// const addUnlinkFounder = async () => {
//     try {
//         const result = await Swal.fire({
//             title: 'Are you sure?',
//             text: "Do you want to add as a founder?",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Yes, add it!',
//             cancelButtonText: 'No, cancel!'
//         });
//         if (result.isConfirmed) {
//             // console.log(name.value, designation.value, isActive.value, profile_image.value);
//             const response = await authStore.fetchProtectedApi('/api/founders', {
//                 user_id: userId,
//                 name: name.value,
//                 designation: designation.value,
//                 is_active: isActive.value,
//                 // profile_image: profile_image.value
//             }, 'POST');
//             if (response.status && response.data) {
//                 addedFounder.value = response.data;
//                 //console.log(addedFounder);
//                 await Swal.fire(
//                     'Added!',
//                     // addedFounder.name - addedFounder.designation,
//                     'Founder added successfully.',
//                     'success'
//                 );
//                 window.location.reload();

//             } else {
//                 addedFounder.value = [];
//                 Swal.fire(
//                     'Failed!',
//                     'Failed to add founder.',
//                     'error'
//                 );
//             }
//         }
//     } catch (error) {
//         console.error("Error fetching member list:", error);
//         addedFounder.value = [];
//     }
// };

const deleteFounderMember = async (id) => {
    const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'This Founder Member will be deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
        const res = await auth.fetchProtectedApi(`/api/founders/${id}`, {}, 'DELETE');
        if (res.status) {
            Swal.fire('Deleted!', 'Founder Member deleted.', 'success');
            getFounders();
        } else {
            Swal.fire('Error!', 'Failed to delete.', 'error');
        }
    }
};
// Get founders when the component is mounted
onMounted(getFounders);

</script>

<template>
    <!-- Search and Add Founder section - initially hidden, toggled by the button -->
    <section v-if="showAddFounderSection" class="mb-5 md:mb-16">
        <div class="add-member">
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
                            <p class="font-medium text-lg text-gray-700">{{ individualUser.first_name }} {{ individualUser.last_name }}</p>
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
                <!-- Founder Name -->
                <div class="w-full md:w-3/12 mr-2">
                    <label for="name" class="block text-gray-700 font-semibold mb-2">
                        Founder name <span class="text-red-500">*</span>
                    </label>
                    <input v-model="name" type="text" id="name"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Founder name" required />
                    <p v-if="auth.errors?.name" class="text-red-500 mt-2">{{ auth.errors?.name[0] }}</p>
                </div>

                <!-- Designation -->
                <div class="w-full md:w-3/12 mr-2">
                    <label for="designation" class="block text-gray-700 font-semibold mb-2">Designation</label>
                    <input v-model="designation" type="text" id="designation"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional" />
                    <p v-if="auth.errors?.designation" class="text-red-500 mt-2">{{ auth.errors?.designation[0] }}</p>
                </div>

                <!-- Profile Image -->
                <div class="w-full md:w-3/12 mr-2">
                    <label for="profile_image" class="block text-gray-700 font-semibold mb-2">Profile Image</label>
                    <input type="file" id="profile_image" @change="handleFileChange"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p v-if="auth.errors?.profile_image" class="text-red-500 mt-2">{{ auth.errors?.profile_image[0] }}
                    </p>
                </div>

                <!-- Submit Button -->
                <div class="mt-2 md:mt-8">
                    <button @click="addUnlinkFounder"
                        class="bg-blue-600 text-white rounded-md hover:bg-blue-700 py-2 px-6">
                        Submit
                    </button>
                </div>
            </div>

            <!-- Add Founder Form -->
            <!-- <div v-if="showForm" class="flex flex-wrap ml-0 md:ml-[100px] mt-2 md:mt-6">
                <div class="w-full md:w-3/12 mr-2"><label for="name"
                        class="block text-gray-700 font-semibold mb-2">Founder
                        name <span class="text-red-500">*</span></label>
                    <input v-model="name" type="text" id="name"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Founder name" required>
                    <p v-if="auth.errors?.name" class="text-red-500 mt-2">{{ auth.errors?.name[0] }}</p>
                </div>
                <div class="w-full md:w-3/12 mr-2"><label for="designation"
                        class="block text-gray-700 font-semibold mb-2">Designation</label>
                    <input v-model="designation" type="text" id="designation"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional">
                    <p v-if="auth.errors?.designation" class="text-red-500 mt-2">{{ auth.errors?.designation[0] }}</p>
                </div>
                <div class="w-full md:w-3/12 mr-2"><label for="profile_image"
                        class="block text-gray-700 font-semibold mb-2">Profile Image</label>
                    <input type="file" id="profile_image"
                        class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional">
                    <p v-if="auth.errors?.profile_image" class="text-red-500 mt-2">{{ auth.errors?.profile_image[0] }}
                    </p>
                </div>
                <div>
                    <button @click="addUnlinkFounder(name, designation, isActive, profile_image)"
                        class="bg-blue-600 text-white rounded-md hover:bg-blue-700 py-2 px-4 mb-2 mt-2 md:mt-8">Submit</button>
                </div>
            </div> -->
        </div>
    </section>

    <!-- Founder list and options show -->
    <section>

        <div class="flex justify-between items-center border-gray-200">
            <!-- Title -->
            <h2 class="text-lg font-semibold text-gray-800">Founders</h2>

            <!-- Actions -->
            <div class="flex flex-wrap gap-2">
                <!-- Export Buttons -->
                <button class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
                    Print
                </button>
                <button class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
                    PDF
                </button>
                <button class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
                    Excel
                </button>

                <!-- Add Founder Button -->
                <button @click="showAddFounderSection = !showAddFounderSection"
                    class="px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                    + Add Founder
                </button>
            </div>
        </div>

        <div v-if="founderList.length" class="bg-white shadow-sm rounded-md overflow-hidden">
            <table class="min-w-full table-auto text-sm text-gray-700">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left font-medium">#</th>
                        <th class="px-4 py-3 text-left font-medium">Image</th>
                        <th class="px-4 py-3 text-left font-medium">Name</th>
                        <th class="px-4 py-3 text-left font-medium">Designation</th>
                        <th class="px-4 py-3 text-left font-medium">Status</th>
                        <th class="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(founder, index) in founderList" :key="founder.id" class="hover:bg-gray-50 transition">
                        <td class="px-4 py-3">
                            {{ index + 1 }}
                        </td>
                        <!-- Image -->
                        <td class="px-4 py-3">
                            <img v-if="founder.image_url" :src="founder.image_url" alt="Founder Image"
                                class="h-10 w-10 rounded-full object-cover">
                            <span v-else class="text-gray-400 italic">No Image</span>
                        </td>

                        <!-- Name -->
                        <td class="px-4 py-3">
                            {{ founder.founders?.first_name || founder.name }}
                        </td>

                        <!-- Designation -->
                        <td class="px-4 py-3">
                            {{ founder.designation }}
                        </td>

                        <!-- Status -->
                        <td class="px-4 py-3">
                            <span :class="founder.is_active ? 'text-green-600' : 'text-red-500'" class="text-sm">
                                {{ founder.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>

                        <!-- Actions -->
                        <td class="px-4 py-3 text-right space-x-2">
                            <button @click="openEditModal(founder)" class="text-blue-600 hover:underline">
                                Edit
                            </button>
                            <button @click="deleteFounderMember(founder.id)" class="text-red-500 hover:underline">
                                Delete
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
                        <input type="text" id="name" v-model="selectedFounder.name"
                            class="w-full border px-3 py-2 rounded" :readonly="!selectedFounder.isNameEditable" />
                        <!-- Show a tooltip or message if the name is not editable -->
                        <p v-if="!selectedFounder.isNameEditable" class="text-sm text-gray-500 mt-1">
                            Name cannot be edited as it comes from a linked founder record.
                        </p>
                    </div>
                    <div class="mb-4">
                        <label for="designation" class="block text-sm font-bold mb-2">Designation</label>
                        <input type="text" id="designation" v-model="selectedFounder.designation"
                            class="w-full border px-3 py-2 rounded" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Active</label>
                        <select v-model="selectedFounder.is_active"
                            class="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2">
                            <option :value="true">Yes</option>
                            <option :value="false">No</option>
                        </select>
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