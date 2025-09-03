<script setup>
import { ref } from 'vue';
import router from "../../../router/router";
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';

const auth = authStore;
const searchQuery = ref('');
const searchResults = ref([]);
const selectedIndividual = ref(null);
const orgTypeUserId = auth.user.id;

const searchIndividuals = async () => {
  const currentQuery = searchQuery.value.trim();

  if (!currentQuery) {
    searchResults.value = [];
    return;
  }

  try {
    const response = await auth.fetchProtectedApi('/api/org-members/search', { query: currentQuery }, 'POST');

    if (searchQuery.value.trim() === currentQuery && response.status) {
      const individuals = response.data;

      // Check each individual if already added
      const updatedResults = await Promise.all(
        individuals.map(async (individual) => {
          const checkRes = await auth.fetchProtectedApi(
            '/api/org-members/check',
            {
              org_type_user_id: orgTypeUserId,
              individual_type_user_id: individual.id,
            },
            'POST'
          );

          return {
            ...individual,
            already_added: checkRes.status && checkRes.data.exists,
          };
        })
      );

      searchResults.value = updatedResults;
    } else if (searchQuery.value.trim() === currentQuery) {
      searchResults.value = [];
    }
  } catch (error) {
    console.error("Error searching individuals:", error);
    if (searchQuery.value.trim() === currentQuery) {
      searchResults.value = [];
    }
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
      const response = await auth.fetchProtectedApi(
        '/api/org-members/create',
        {
          org_type_user_id: orgTypeUserId,
          individual_type_user_id: individualTypeUserId
        },
        'POST'
      );

      if (response.status) {
        const newOrgMemberId = response?.data?.id;
        await Swal.fire(
          'Added!',
          'Member added successfully.',
          'success'
        );
        selectedIndividual.value = null;
        searchResults.value = [];
        searchQuery.value = '';
        // router.push({ name: "index-member" });
        router.push({ name: "index-member", query: { edit: newOrgMemberId } });
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

// function to get city and country from search result users

</script>

<template>
  <div class="add-member max-w-7xl mx-auto p-8">
    <h2 class="mb-8 text-center text-2xl text-gray-500">Search & add member</h2>

    <!-- Search Input -->
    <div class="flex justify-center mb-6">
      <input
        type="text"
        class="form-input flex-1 max-w-lg px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        v-model="searchQuery"
        placeholder="Search by name, email, mobile, username or Azon Id"
        @input="searchIndividuals"
      />
      <button
        class="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 transition-all focus:outline-none"
        @click="searchIndividuals"
      >
        Search
      </button>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length" class="bg-white shadow-lg rounded-lg p-6">
      <ul class="divide-y divide-gray-200">
        <li
          v-for="individualUser in searchResults"
          :key="individualUser.id"
          class="flex items-center py-4"
        >
          <!-- Profile Image -->
          <img
            :src="individualUser.image_url ? individualUser.image_url : placeholderImage"
            alt="Profile picture"
            class="w-20 h-20 rounded-full object-cover mr-4"
          />

          <!-- User Details -->
          <div class="flex-1">
            <p class="font-medium text-lg text-gray-700">
              {{ individualUser.first_name }} {{ individualUser.last_name }}
            </p>
            <!-- <p class="text-sm text-gray-500">
              Username: {{ individualUser.username }}
            </p> -->
            <p class="text-sm text-gray-500">
              City: {{ individualUser.username }}
            </p>
            <p class="text-sm text-gray-500">
              Country: {{ individualUser.username }}
            </p>
            <p class="text-sm text-gray-500">
              Azon Id: {{ individualUser.azon_id }}
            </p>
          </div>

          <!-- Add Button or Already Added Label -->
          <div class="ml-4">
            <button
              v-if="!individualUser.already_added"
              class="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded focus:outline-none"
              @click="addMember(individualUser.id)"
            >
              Add member
            </button>
            <span
              v-else
              class="text-sm text-gray-500 font-medium"
            >
              Already member
            </span>
          </div>
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