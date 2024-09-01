<!-- OrgDashboard.vue -->

<script setup>
  import { ref, onMounted } from 'vue';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const userId = auth.user.id;
const totalOrgMember = ref('');
const memberList = ref([]);

const totalOrgMemberCount = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/total-org-member-count/${userId}`, {}, 'GET');
    if (response.status && response.totalOrgMemberCount) {
      totalOrgMember.value = response.totalOrgMemberCount;
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
  }
};

const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi(`/api/org-member-list/${userId}`, {}, 'GET');
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

onMounted(totalOrgMemberCount)
onMounted(fetchMemberList);
</script>

<template>
 <div class="content-area mt-4">
      <div v-if="auth.isAuthenticated && auth.user?.type == 'organisation'">
        <div class="row">
          <div class="col-md-3 col-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Members</h5>
                <p class="card-text"> <strong>{{ totalOrgMember }}</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 col-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Meetings</h5>
                <p class="card-text"><strong>{{ totalOrgMember }}</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Events</h5>
                <p class="card-text"><strong>{{ totalOrgMember }}</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">New Member</h5>
                <p class="card-text"><strong>{{ totalOrgMember }}</strong></p>
                <a href="#" class="btn btn-primary">This month</a>
              </div>
            </div>
          </div>
        </div>
        <br>
        <br>
        <div class="row">
          <div class="col-md-12">
            <h5>Member List</h5>
            <div v-if="memberList.length">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Sl</th>
                    <th scope="col">Photo</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">ID Number</th>
                    <th scope="col">Membership Type</th>
                    <th scope="col">Joining Date</th>
                    <th scope="col">Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="  member   in   memberList  " :key="member.id">
                    <td>{{ member.id }}</td>
                    <td>{{ member.existing_org_membership_id }}</td>
                    <td>{{ member.individual.name }}</td>
                    <td>{{ member.individual.email }}</td>
                    <td>{{ member.existing_org_membership_id }}</td>
                    <td>{{ member.membership_type }}</td>
                    <td>{{ member.joining_date }}</td>
                    <td>{{ member.note }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else>
              <p>No members found</p>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>