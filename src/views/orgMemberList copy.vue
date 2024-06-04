<!-- AddMember.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { loginAuthStore } from "../store/loginLogoutStore";

const memberList = ref([]);
const orgId = loginAuthStore.org.id; // Assuming the org ID is stored in the logged-in user

const fetchMemberList = async () => {
  try {
    console.log(orgId);
    const response = await loginAuthStore.fetchProtectedApi(`/api/org-members-list/${orgId}`, {}, 'GET');
    if (response.status) {
      memberList.value = response.data;
      console.log("data");
    } else {
      memberList.value = [];
    }
  } catch (error) {
    console.error("Error searching individuals:", error);
    memberList.value = [];
  }
};

onMounted(fetchMemberList);

</script>

<template>
  <div class="add-member container">
    <h2 class="mb-4 text-center">Member List</h2>
    <div v-if="memberList.length" class="results-container">
      <table>
        <thead>
          <tr>
            <th>Sl</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in memberList" :key="member.id">
            <td>{{ member.id }}</td>
            <td>{{ member.individual.full_name }}</td>
            <!-- <td>{{ member.individual.full_name }}</td> -->
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No results found</p>
    </div>
  </div>
</template>

<style scoped></style>
