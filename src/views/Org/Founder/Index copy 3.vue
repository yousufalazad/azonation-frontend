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
const selectedFounder = ref({ id: null, full_name: '', designation: '', isNameEditable: false }); // Stores the selected founder's info
const searchQuery = ref('');
const searchResults = ref([]);
const baseURL = auth.apiBase; // Base URL for API requests
const addedFounder = ref([]);
const showAddFounderSection = ref(false); // controls the display of "Search and Add Founder" section
const showForm = ref(false);
// const showForm = ref(true);
const full_name = ref('');
const designation = ref('');
const email = ref('');
const mobile = ref('');
const address = ref('');
const note = ref('');
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

const isViewMode = ref(false);

const openEditModal = (founder, viewMode = false) => {
    isViewMode.value = viewMode;
    const isNameEditable = !(founder.founders && founder.founders.full_name);
    selectedFounder.value = {
        id: founder.id,
        full_name: isNameEditable ? founder.full_name : founder.founders.full_name,
        designation: founder.designation,
        email: founder.email || '',
        mobile: founder.mobile || '',
        address: founder.address || '',
        note: founder.note || '',
        isActive: founder.is_active,
        image_url: founder.image_url || null,
        isNameEditable
    };
    isEditModalOpen.value = true;
};

// Close edit modal
const closeEditModal = () => {
    isEditModalOpen.value = false;
    isViewMode.value = false;
    selectedFounder.value = { id: null, full_name: '', email: '', mobile: '', address: '', note: '', designation: '', isActive: '', isNameEditable: false }; // Reset selected founder data
};

//Update Founder data, full_name update when full_name is unlink, designation update allow always
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

            const formData = new FormData();
            // Append the necessary fields to the FormData object   
            formData.append('user_id', userId);
            formData.append('full_name', selectedFounder.value.full_name);
            formData.append('email', selectedFounder.value.email);
            formData.append('mobile', selectedFounder.value.mobile);
            formData.append('address', selectedFounder.value.address || '');
            formData.append('note', selectedFounder.value.note || '');
            formData.append('designation', selectedFounder.value.designation || '');
            formData.append('is_active', selectedFounder.value.isActive ? '1' : '0');
            // If profile image is selected, append it to the FormData object   
            if (profile_image.value) {
                formData.append('profile_image', profile_image.value);
            }

            const response = await authStore.uploadProtectedApi(`/api/founders/${selectedFounder.value.id}`, formData, 'POST', {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status) {
                console.log(response.data);
                await Swal.fire('Updated!', 'Founder details updated successfully.', 'success');
                // Update the founderList after successful edit
                const index = founderList.value.findIndex(f => f.id === selectedFounder.value.id);
                if (index !== -1) {
                    // Update only if the full_name is editable
                    if (selectedFounder.value.isNameEditable) {
                        founderList.value[index].full_name = selectedFounder.value.full_name;
                    }
                    founderList.value[index].email = selectedFounder.value.email;
                    founderList.value[index].mobile = selectedFounder.value.mobile;
                    founderList.value[index].address = selectedFounder.value.address;
                    founderList.value[index].note = selectedFounder.value.note;
                    founderList.value[index].designation = selectedFounder.value.designation;

                    founderList.value[index].is_active = selectedFounder.value.isActive;
                }
                closeEditModal();
                getFounders();
            } else {
                Swal.fire('Failed!', 'Failed to update details.', 'error');
            }
        }
    } catch (error) {
        console.error("Error updating founder details:", error);
        Swal.fire('Error!', 'Failed to update details.', 'error');
    }
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
        formData.append('full_name', full_name.value);
        formData.append('email', email.value);
        formData.append('mobile', mobile.value);
        formData.append('address', address.value || '');
        formData.append('note', note.value || '');
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
                    v-model="searchQuery" placeholder="Search by full_name, email, mobile, userfull_name or Azon Id"
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
                            <p class="font-medium text-lg text-gray-700">{{ individualUser.first_name }} {{
                                individualUser.last_name }}</p>
                            <p class="text-sm text-gray-500">{{ individualUser.city }}, {{
                                individualUser.country_name }}</p>
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
            <!-- No Results Found -->
            <div v-else>
                <p class="text-center text-gray-500">
                    Want to add founder manually, without link? click
                    <a href="#" @click.prevent="showForm = true"
                        class="hover:bg-gray-100 text-blue-600 hover:text-blue-800">here</a>
                </p>
            </div>

            <!-- Founder Form Modal -->
            <div v-if="showForm" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div class="bg-white p-6 rounded shadow-lg w-1/3 max-h-[90vh] overflow-y-auto">

                    <!-- <div v-if="showForm" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"> -->
                    <!-- <div class="bg-white p-6 rounded shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"> -->
                    <h3 class="text-xl font-bold mb-4">Add Founder Manually</h3>
                    <div class="">
                        <!-- Founder Form Fields -->
                        <div class="mb-4">
                            <label for="name" class="block text-gray-700 font-semibold mb-2">Founder name <span
                                    class="text-red-500">*</span></label>
                            <input v-model="full_name" type="text" id="full_name"
                                class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Founder full_name" required />
                            <p v-if="auth.errors?.full_name" class="text-red-500 mt-2">{{ auth.errors?.full_name[0] }}
                            </p>
                        </div>
                        <div class="mb-4">
                            <label for="designation" class="block text-gray-700 font-semibold mb-2">Designation</label>
                            <input v-model="designation" type="text" id="designation"
                                class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Optional" />
                            <p v-if="auth.errors?.designation" class="text-red-500 mt-2">{{ auth.errors?.designation[0]
                                }}</p>
                        </div>
                        <div class="mb-4">
                            <label for="email" class="block text-gray-700 font-semibold mb-2">Email</label>
                            <input v-model="email" type="text" id="email"
                                class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Email" />
                            <p v-if="auth.errors?.email" class="text-red-500 mt-2">{{ auth.errors?.email[0] }}</p>
                        </div>
                        <div class="mb-4">
                            <label for="mobile" class="block text-gray-700 font-semibold mb-2">Mobile</label>
                            <input v-model="mobile" type="text" id="mobile"
                                class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Mobile" />
                            <p v-if="auth.errors?.mobile" class="text-red-500 mt-2">{{ auth.errors?.mobile[0] }}</p>
                        </div>
                        <div class="mb-4">
                            <label for="address" class="block text-gray-700 font-semibold mb-2">Address</label>
                            <textarea v-model="address" id="address"
                                class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Address"></textarea>
                            <p v-if="auth.errors?.address" class="text-red-500 mt-2">{{ auth.errors?.address[0] }}</p>
                        </div>
                        <div class="mb-4">
                            <label for="note" class="block text-gray-700 font-semibold mb-2">Note</label>
                            <textarea v-model="note" id="note"
                                class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Note"></textarea>
                            <p v-if="auth.errors?.note" class="text-red-500 mt-2">{{ auth.errors?.note[0] }}</p>
                        </div>
                        <div class="mb-4">
                            <label for="profile_image" class="block text-gray-700 font-semibold mb-2">Profile
                                Image</label>
                            <input type="file" id="profile_image" @change="handleFileChange"
                                class="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <p v-if="auth.errors?.profile_image" class="text-red-500 mt-2">{{
                                auth.errors?.profile_image[0] }}</p>
                        </div>
                        <div class="flex justify-end w-full mt-4">
                            <button @click="showForm = false" type="button"
                                class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                                Cancel
                            </button>
                            <button @click="addUnlinkFounder" type="button"
                                class="bg-blue-600 text-white rounded-md hover:bg-blue-700 py-2 px-6">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>


    <!-- Founder list and options show -->
    <section>
        <div class="flex justify-between items-center border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">Founders</h2>
            <div class="flex flex-wrap gap-2">
                <button
                    class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">Print</button>
                <button
                    class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">PDF</button>
                <button
                    class="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">Excel</button>
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
                        <td class="px-4 py-3">{{ index + 1 }}</td>
                        <td class="px-4 py-3">
                            <img v-if="founder.image_url" :src="founder.image_url" alt="Founder Image"
                                class="h-10 w-10 rounded-full object-cover">
                            <span v-else class="text-gray-400 italic">No Image</span>
                        </td>
                        <td class="px-4 py-3">{{ founder.founders?.first_name || founder.full_name }}</td>
                        <td class="px-4 py-3">{{ founder.designation }}</td>
                        <td class="px-4 py-3">
                            <span :class="founder.is_active ? 'text-green-600' : 'text-red-500'" class="text-sm">
                                {{ founder.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-right space-x-2">
                            <button @click="openEditModal(founder)" class="text-blue-600 hover:underline">Edit</button>
                            <button @click="openEditModal(founder, true)"
                                class="text-gray-600 hover:underline">View</button>
                            <button @click="deleteFounderMember(founder.id)"
                                class="text-red-500 hover:underline">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- //View and Edit Modal -->
    <section>
        <div v-if="isEditModalOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div class="bg-white p-6 rounded shadow-lg w-1/3 max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-bold mb-4">{{ isViewMode ? 'View Founder' : 'Edit Founder' }}</h3>
                <form @submit.prevent="updateFounder">
                    <div class="mb-4">
                        <label for="full_name" class="block text-sm font-bold mb-2">Name</label>
                        <input type="text" id="full_name" v-model="selectedFounder.full_name"
                            class="w-full border px-3 py-2 rounded"
                            :readonly="isViewMode || !selectedFounder.isNameEditable" />
                        <p v-if="!selectedFounder.isNameEditable" class="text-sm text-gray-500 mt-1">
                            Name cannot be edited as it comes from a linked founder record.
                        </p>
                    </div>
                    <div class="mb-4">
                        <label for="designation" class="block text-sm font-bold mb-2">Designation</label>
                        <input type="text" id="designation" v-model="selectedFounder.designation"
                            class="w-full border px-3 py-2 rounded" :readonly="isViewMode" />
                    </div>
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-bold mb-2">Email</label>
                        <input type="email" id="email" v-model="selectedFounder.email"
                            class="w-full border px-3 py-2 rounded" :readonly="isViewMode" />
                        <p v-if="auth.errors?.email" class="text-red-500 mt-2">{{ auth.errors?.email[0] }}</p>
                    </div>
                    <div class="mb-4">
                        <label for="mobile" class="block text-sm font-bold mb-2">Mobile</label>
                        <input type="text" id="mobile" v-model="selectedFounder.mobile"
                            class="w-full border px-3 py-2 rounded" :readonly="isViewMode" />
                        <p v-if="auth.errors?.mobile" class="text-red-500 mt-2">{{ auth.errors?.mobile[0] }}</p>
                    </div>
                    <div class="mb-4">
                        <label for="address" class="block text-sm font-bold mb-2">Address</label>
                        <textarea id="address" v-model="selectedFounder.address" class="w-full border px-3 py-2 rounded"
                            :readonly="isViewMode" placeholder="Address"></textarea>
                        <p v-if="auth.errors?.address" class="text-red-500 mt-2">{{ auth.errors?.address[0] }}</p>
                    </div>
                    <div class="mb-4">
                        <label for="note" class="block text-sm font-bold mb-2">Note</label>
                        <textarea id="note" v-model="selectedFounder.note" class="w-full border px-3 py-2 rounded"
                            :readonly="isViewMode" placeholder="Note"></textarea>
                        <p v-if="auth.errors?.note" class="text-red-500 mt-2">{{ auth.errors?.note[0] }}</p>
                    </div>
                    
                    <div class="mb-4" v-if="!isViewMode">
                        <label for="profile_image" class="block text-sm font-bold mb-2">Profile Image</label>
                        <input type="file" id="profile_image" @change="handleFileChange"
                            class="w-full border px-3 py-2 rounded" />
                    </div>
                    <div class="mb-4">
                        <img v-if="selectedFounder.image_url" :src="selectedFounder.image_url" alt="Profile Image"
                            class="h-20 w-20 rounded-full object-cover mb-2">
                        <p v-if="!selectedFounder.image_url" class="text-gray-500">No image uploaded</p>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="closeEditModal"
                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                            {{ isViewMode ? 'Close' : 'Cancel' }}
                        </button>
                        <button v-if="!isViewMode" type="submit"
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </section>

</template>