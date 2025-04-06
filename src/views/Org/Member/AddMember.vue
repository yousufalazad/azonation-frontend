<!-- AddMember.vue -->
<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

const auth = authStore;
const searchQuery = ref('');
const searchResults = ref([]);
const selectedIndividual = ref(null);
const orgTypeUserId = auth.user.id; // Assuming the org ID is stored in the logged-in user
const baseURL = 'http://localhost:8000';

const searchIndividuals = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/org-members/search', { query: searchQuery.value }, 'POST');
    if (response.status) {
      searchResults.value = response.data;
      console.log(response.data);
    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error("Error searching individuals:", error);
    searchResults.value = [];
  }
};

const addMember = async (individualTypeUserId) => {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to add this member?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, add it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      const response = await auth.fetchProtectedApi('/api/org-members/create', { org_type_user_id: orgTypeUserId, individual_type_user_id: individualTypeUserId }, 'POST');
      if (response.status) {
        await Swal.fire(
          'Added!',
          'Member added successfully.',
          'success'
        );
        selectedIndividual.value = null;
        searchResults.value = [];
        searchQuery.value = '';
      } else {
        Swal.fire(
          'Failed!',
          'Failed to add member.',
          'error'
        );
      }
    }
  } catch (error) {
    console.error("Error adding member:", error);
    Swal.fire(
      'Error!',
      'Failed to add member.',
      'error'
    );
  }
};
</script>

<template>
  <div class="add-member max-w-7xl mx-auto p-8">
    <h2 class="mb-8 text-center text-2xl text-gray-500">Search  &  add member</h2>

    <!-- Search Input -->
    <div class="flex justify-center mb-6">
      <input type="text"
        class="form-input flex-1 max-w-lg px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        v-model="searchQuery" placeholder="Search by name, email, mobile, username or Azon Id"
        @input="searchIndividuals" />
      <button class="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 transition-all focus:outline-none"
        @click="searchIndividuals">
        Search
      </button>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length" class="bg-white shadow-lg rounded-lg p-6">
      <ul class="divide-y divide-gray-200">
        <li v-for="individualUser in searchResults" :key="individualUser.id" class="flex items-center py-4">
          <!-- Profile Image -->
          <img :src="`${baseURL}/storage/${individualUser.image}`" alt="Profile picture"
            class="w-20 h-20 rounded-full object-cover mr-4" />

          <!-- User Details -->
          <div class="flex-1">
            <p class="font-medium text-lg text-gray-700">{{ individualUser.name }}</p>
            <p class="text-sm text-gray-500">
              {{ individualUser.city }}, {{ individualUser.country_name }}
            </p>
            <!-- <p class="text-sm text-gray-500">
              {{ individualUser.email }} | {{ individualUser.dialing_code }}{{
                individualUser.phone_number }}
            </p> -->
            <p class="text-sm text-gray-500">
              Username: {{ individualUser.username }}
            </p>
            <p class="text-sm text-gray-500">
              Azon Id: {{ individualUser.azon_id }}
            </p>
          </div>

          <!-- Add Button -->
          <button class="ml-4 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded focus:outline-none"
            @click="addMember(individualUser.id)">
            Add
          </button>
        </li>
      </ul>
    </div>

    <!-- No Results Found -->
    <div v-else>
      <p class="text-center text-gray-500 mt-4"></p>
    </div>
  </div>
</template>

<style scoped></style>
