<!-- OrgDashboard.vue -->

<script setup>
  import { ref, onMounted } from 'vue';
import { authStore } from '../../../../store/authStore';

const auth = authStore;
const orgId = auth.org.id;
const totalOrgMember = ref('');
const memberList = ref([]);

const totalOrgMemberCount = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/total-org-member-count/${orgId}`, {}, 'GET');
    if (response.status && response.totalOrgMemberCount) {
      totalOrgMember.value = response.totalOrgMemberCount;
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
  }
};

const fetchMemberList = async () => {
  try {
    const response = await authStore.fetchProtectedApi(`/api/org-members-list/${orgId}`, {}, 'GET');
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
 <div class="content-area">
      <div v-if="auth.isAuthenticated && auth.user?.type == 2">
        <div class="row">
          <div class="col-sm-6 mb-3 mb-sm-0">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Total members</h5>
                <p class="card-text"> <strong>{{ totalOrgMember }}</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Committees and sub-committees</h5>
                <p class="card-text"><strong>{{ totalOrgMember }}</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>
        </div>
        <br>
        <div class="row">
          <div class="col-sm-6 mb-3 mb-sm-0">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Upcoming meetings</h5>
                <p class="card-text"> <strong>{{ totalOrgMember }}</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Upcoming events</h5>
                <p class="card-text"><strong>{{ totalOrgMember }}</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
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
                    <td>{{ member.individual.full_name }}</td>
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
      <!-- <div v-if="!auth.isAuthenticated">
        <br>
        <h2>Need to protect from Router, path need to protect router.js</h2>
        <h3>Total Membership Organisation/s: 5</h3>
        <br>
        <h3>Total Committee Involvement: 3</h3>
        <br>
        <h3>Upcoming meeting: 2</h3>
        <br>
        <h3>Upcoming Events: 2</h3>
        <br>
        <h3>Upcoming Projects: 1</h3>
        <br>
        <h3>Next Meeting Date: 1 Jan 2025</h3>
        <br>
        <h3>Total Upcoming Meeting in {August}: 3</h3>
        <br>
        <h3>Meeting Attendance Parcentage : 75%</h3>
        <br>
      </div> -->

    </div>
</template>