<!-- Connected Org List.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from "../store/authStore";

const connectedOrgList = ref([]);
const individualId = authStore.individual.id;

const fetchOrganisationList = async () => {
  try {
    const response = await authStore.fetchProtectedApi(`/api/connected-org-list/${individualId}`, {}, 'GET');
    if (response.status) {
      connectedOrgList.value = response.data;
    } else {
      connectedOrgList.value = [];
    }
  } catch (error) {
    console.error("Error fetching org list:", error);
    connectedOrgList.value = [];
  }
};

onMounted(fetchOrganisationList);
</script>

<template>
  <div class="org-member-list">
    <h2>Connected Org List</h2>
    <div v-if="connectedOrgList.length">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">Sl</th>
            <th scope="col">Org ID</th>
            <th scope="col">Org Name</th>
            <th scope="col">Joining Date</th>
            <th scope="col">Membership Type</th>
            <th scope="col">ID for this Org</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="org in connectedOrgList" :key="org.id">
            <td>{{ org.id }}</td>
            <td>{{ org.id }}</td>
            <td>{{ org.connectedorg.org_name }}</td>
            <td>{{ org.joining_date }}</td>
            <td>{{ org.membership_type }}</td>
            <td>{{ org.existing_org_membership_id_number }}</td>

          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>You are not connected to any organisation!</p>
      <p>Join a international organisation</p>
    </div>
  </div>
</template>

<style scoped>
.org-member-list {
  padding: 20px;
}
</style>
../store/authStore