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
      <div v-if="auth.isAuthenticated && auth.user?.type == 'individual'">
        <div class="row">
          <div class="col-md-3 col-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Connected organisations</h5>
                <p class="card-text"> <strong>3</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 col-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Next meeting</h5>
                <p class="card-text"><strong>5 Aug 2025</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Upcoming event</h5>
                <p class="card-text"><strong>16 Dec 2024</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Approval request</h5>
                <p class="card-text"><strong>Membership request from XYZ org</strong></p>
                <a href="#" class="btn btn-primary">See all</a>
              </div>
            </div>
          </div>
        </div>
        <br>
        <br>
        <!-- connected-organisation's activities -->
      </div>
    </div>
</template>