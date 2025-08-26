<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;
const committeeList = ref([]);
const orgId = authStore.org.id; // Assuming the org ID is stored in the logged-in user

const fetchCommitteeList = async () => {
  try {
    const response = await authStore.fetchProtectedApi(`/api/committees/${orgId}`, {}, 'GET');
    if (response.status) {
      committeeList.value = response.data;
    } else {
      committeeList.value = [];
    }
  } catch (error) {
    console.error("Error fetching member list:", error);
    committeeList.value = [];
  }
};

onMounted(fetchCommitteeList);
</script>

<template>
  <br>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <div class="org-member-list">
        <h2>Former Committees</h2>
        <div v-if="committeeList.length">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Sl</th>
                <th scope="col">Ord ID</th>
                <th scope="col">Committee name</th>
                <th scope="col">Starting date</th>
                <th scope="col">Ending date</th>
                <th scope="col">Status</th>
                <th scope="col">Short description</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="committee in committeeList" :key="committee.id">
                <td>{{ committee.id }}</td>
                <td>{{ committee.org_id }}</td>
                <td>{{ committee.name }}</td>
                <td>{{ committee.start_date }}</td>
                <td>{{ committee.end_date }}</td>
                <td>{{ committee.status }}</td>
                <td>{{ committee.short_description }}</td>
                <td>{{ committee.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No committee found</p>
        </div>
      </div>
    </div>
  </div>

</template>

<style>

</style>