<script setup>
import { ref, onMounted } from 'vue';
import { authStore } from '../../../store/authStore';
import Swal from 'sweetalert2';

const auth = authStore;

const name = ref('');
const short_description = ref('');
const start_date = ref('');
const end_date = ref('');
const note = ref('');
const status = ref('');
const committeeList = ref([]);

const userId = authStore.user.id; // Assuming the org ID is stored in the logged-in user

const createCommittee = async () => {
  try {
    await auth.createCommittee(userId, name.value, short_description.value, start_date.value, end_date.value, note.value, status.value);
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Committee created successfully',
      showConfirmButton: false,
      timer: 1000
    });
  } catch (error) {
    // Handle error if needed
    console.error("Error creating committee", error);
  }
};

const fetchCommitteeList = async () => {
  try {
    const response = await authStore.fetchProtectedApi(`/api/committees`, {}, 'GET');
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
        <h2>Create and Edit Committee</h2>
        <br>
        <div v-if="committeeList.length">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Sl</th>
                <th scope="col">Org User ID</th>
                <th scope="col">Committee name</th>
                <th scope="col">Starting date</th>
                <th scope="col">Ending date</th>
                <th scope="col">Status</th>
                <th scope="col">Short description</th>
                <th scope="col">Note</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="committee in committeeList" :key="committee.id">
                <td>{{ committee.id }}</td>
                <td>{{ committee.user_id }}</td>
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
<br>
  <div class="card shadow-sm">
    <div class="card-body p-4">
      <h1 class="h4 mb-4 fw-bold text-center">Create committee</h1>

      <div class="mb-3">
        <label for="name" class="form-label required" required>Committee name (required)</label>
        <input v-model="name" type="text" id="name" class="form-control" placeholder="Committee Name" required>
        <p v-if="auth.errors?.name" class="text-danger mt-2">{{ auth.errors?.name[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="short_description" class="form-label">Short description</label>
        <input v-model="short_description" type="text" id="short_description" class="form-control"
          placeholder="Short description">
        <p v-if="auth.errors?.short_description" class="text-danger mt-2">{{ auth.errors?.short_description[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="start_date" class="form-label">Committee start date</label>
        <input v-model="start_date" type="date" id="start_date" class="form-control" placeholder="Committee start date">
        <p v-if="auth.errors?.start_date" class="text-danger mt-2">{{ auth.errors?.start_date[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="end_date" class="form-label">Committee end date (Only for admin, member will not see this
          date)</label>
        <input v-model="end_date" type="date" id="end_date" class="form-control" placeholder="Committee end date"
          required>
        <p v-if="auth.errors?.end_date" class="text-danger mt-2">{{ auth.errors?.end_date[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="note" class="form-label">Note (only for admin)</label>
        <input v-model="note" type="text" id="note" class="form-control" placeholder="Committee note">
        <p v-if="auth.errors?.note" class="text-danger mt-2">{{ auth.errors?.note[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="status" class="form-label">Committee status</label>
        <input v-model="status" type="dropdown" id="status" class="form-control" placeholder="Committee status">
        <p v-if="auth.errors?.status" class="text-danger mt-2">{{ auth.errors?.status[0] }}</p>
      </div>

      <div class="d-flex justify-content-between mb-3">
        <router-link to="/create-committee" class="text-primary">Already have committee? Edit existing
          committee</router-link>
      </div>
      <div class="text-end">
        <button @click="createCommittee" class="btn btn-primary">Create committee</button>
      </div>
    </div>
  </div>
</template>

<style>

</style>