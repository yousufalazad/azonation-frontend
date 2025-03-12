<!-- OrgMemberList.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';

const memberList = ref([]);
const userId = authStore.user.id;

const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi(`/api/org-members/list/${userId}`, {}, 'GET');
    if (response.status) {
      memberList.value = response.data;
    } else {
      memberList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    memberList.value = [];
  }
};

onMounted(fetchMemberList);
</script>

<template>
  <div class="org-member-list">
    <h2>Member List</h2>
    <div v-if="memberList.length">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">Sl</th>
            <th scope="col">ID Number</th>
            <th scope="col">Photo</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Azon ID</th>
            <th scope="col">Individual ID</th>
            <th scope="col">Joining Date</th>
            <th scope="col">Membership Type</th>
            <th scope="col">End Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in memberList" :key="member.id">
            <td>{{ member.id }}</td>
            <td>{{ member.existing_org_membership_id }}</td>
            <td>{{ member.individual.image }}</td>
            <td>{{ member.individual.name }}</td>
            <td>{{ member.individual.email }}</td>
            <td>{{ member.individual.azon_id }}</td>
            <td>{{ member.individual.id }}</td>
            <td>{{ member.joining_date }}</td>
            <td>{{ member.membership_type }}</td>
            <td>{{ member.end_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No members found</p>
    </div>
  </div>
</template>

<style scoped></style>
