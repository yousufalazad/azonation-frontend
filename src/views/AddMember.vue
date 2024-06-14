<!-- AddMember.vue -->
<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { authStore } from "../store/authStore";

const auth = authStore;
const searchQuery = ref('');
const searchResults = ref([]);
const selectedIndividual = ref(null);
const orgId = auth.org.id; // Assuming the org ID is stored in the logged-in user

const searchIndividuals = async () => {
  try {
    const response = await auth.fetchPublicApi('/api/search_individuals', { query: searchQuery.value }, 'POST');
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

const addMember = async (individualId) => {
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
      const response = await auth.fetchProtectedApi('/api/add_member', { org_id: orgId, individual_id: individualId }, 'POST');
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
  <div class="add-member container">
    <h2 class="mb-4 text-center">Search and Add Member</h2>
    <div class="input-group-container">
      <div class="input-group mb-3">
        <input type="text" class="form-control" v-model="searchQuery" placeholder="Search by ID, User ID, Azon ID, or Full Name" @input="searchIndividuals">
        <button class="btn btn-outline-secondary" type="button" @click="searchIndividuals">Search</button>
      </div>
      <div v-if="searchResults.length" class="results-container">
        <ul class="list-group">
          <li v-for="individual in searchResults" :key="individual.id" class="list-group-item d-flex justify-content-between align-items-center">
            {{ individual.full_name }} ({{ individual.id }}, {{ individual.user_id }}, {{ individual.azon_id }})
            <button class="btn btn-sm btn-primary px-4" @click="addMember(individual.id)">Add</button>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No results found</p>
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

.input-group {
  width: 100%;
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-group-item button {
  margin-left: 10px;
}
</style>
