<!-- App.vue -->
<script setup>
import { computed } from 'vue';
import { loginAuthStore } from "../store/loginLogoutStore";
//import { orgMemberListAuthStore } from '../store/orgMemberList';
const auth = loginAuthStore;
// const orgMemberListAuth = orgMemberListAuthStore;

// const org_id = ref('')
// const individual_id = ref('')

const UserType = computed(() => auth.user?.type);
const OrgName = computed(() => auth.org?.org_name);
const OrgID = computed(() => auth.org?.id);
const UserID = computed(() => auth.org?.user_id);
const ShortDescription = computed(() => auth.org?.short_description);
const AzonID = computed(() => auth.org?.azon_id);
</script>

<template>
  <h1>Org Dasboard Data:</h1>
  <p>
    User type for Organization: <span>{{ UserType }}</span><br>
    Organization Name: <span>{{ OrgName }}</span><br>
    Organization OrgID: <span>{{ OrgID }}</span><br>
    Organization UserID: <span>{{ UserID }}</span><br>
    Organization ShortDescription: <span>{{ ShortDescription }}</span><br>
    Organization AzonID: <span>{{ AzonID }}</span><br>
  </p>
  <!-- <div class="card shadow-sm">
    <div class="card-body p-4">
      <h1 class="h4 mb-4 fw-bold text-center">Sign up to your account</h1>
      <div class="mb-3">
        <label for="org_id" class="form-label">Org Id</label>
        <input v-model="org_id" type="text" id="org_id" class="form-control" placeholder="org_id" required>
        <p v-if="orgMemberListAuth.errors?.org_id" class="text-danger mt-2">{{ orgMemberListAuth.errors?.org_id[0] }}</p>
      </div>

      <div class="mb-3">
        <label for="individual_id" class="form-label">individual_id</label>
        <input v-model="individual_id" type="text" id="individual_id" class="form-control" placeholder="individual_id" required>
        <p v-if="orgMemberListAuth.errors?.individual_id" class="text-danger mt-2">{{ orgMemberListAuth.errors?.individual_id[0] }}</p>
      </div>
      
      <div class="d-flex justify-content-between mb-3">
        <router-link to="/login" class="text-primary">Click to See how to add member</router-link>
      </div>
      <div class="text-end">
        <button @click="orgMemberListAuth.orgMemberListAdd(org_id, individual_id)" class="btn btn-primary">Add Member</button>
      </div>
    </div>
  </div> -->

</template>

<style></style>
