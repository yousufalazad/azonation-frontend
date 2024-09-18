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

const searchIndividuals = async () => {
  try {
    const response = await auth.fetchPublicApi('/api/search_individual', { query: searchQuery.value }, 'POST');
    if (response.status) {
      searchResults.value = response.data;
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
      const response = await auth.fetchProtectedApi('/api/add_member', { org_type_user_id: orgTypeUserId, individual_type_user_id: individualTypeUserId }, 'POST');
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
  <div class="add-member container mx-auto p-6">
    <h2 class="mb-4 text-center text-2xl font-semibold">Search and Add Member</h2>
    <div class="input-group-container">
      <div class="flex mb-3">
        <input type="text" class="form-control flex-1 px-3 py-2 border border-gray-300 rounded-l-md" v-model="searchQuery" placeholder="Search by Email, User ID, Azon ID, or Full Name" @input="searchIndividuals">
        <button class="bg-gray-200 hover:bg-gray-300 px-4 py-2 border border-gray-300 rounded-r-md" type="button" @click="searchIndividuals">Search</button>
      </div>
      <div v-if="searchResults.length" class="results-container">
        <ul class="list-none">
          <li v-for="individualUser in searchResults" :key="individualUser.id" class="flex justify-between items-center py-2 border-b">
            {{ individualUser.name }} ({{ individualUser.azon_id }}, {{ individualUser.email }})
            <button class="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-4 rounded" @click="addMember(individualUser.id)">Add</button>
          </li>
        </ul>
      </div>
      <div v-else>
        <p class="text-center text-gray-600">No results found</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-member {
  padding: 20px;
}

.input-group-container {
  max-width: 600px;
  margin: auto;
}

.results-container {
  width: 100%;
}
</style>

