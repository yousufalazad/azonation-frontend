<template>
  <div class="org-sidebar-right">
    <h5>Reports</h5>
    <br>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Membership reports</router-link>
    <hr>
    <router-link to="/org-dashboard/committee-list" class="menu-item">Attendance report</router-link>
    <hr>
    <router-link to="/org-dashboard/upcoming-meeting-list" class="menu-item">Meeting reports</router-link>
    <hr>
    <router-link to="/org-dashboard/upcoming-events" class="menu-item">Event reports</router-link>
    <hr>
    <router-link to="/org-dashboard/projects" class="menu-item">Project reports</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Member engagement report</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Pending Membership Application</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Financial reports</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Billing</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Settings</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Example demo</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Example demo</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Example demo</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Example demo</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Example demo</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Example demo</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Example demo</router-link>
    <hr>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Example demo</router-link>
  </div>
</template>

<style scoped>
.org-sidebar-right {
  position: fixed;
  top: 50px;
  right: 0;
  height: 100%;
  width: 280px;
  background-color: #ffffff;
  padding: 20px;
  overflow-y: hidden;
  transition: overflow-y 0.3s;
}
.org-sidebar-right:hover {
  overflow-y: auto;
}
.menu-item {
  display: block;
  margin: 10px 0;
  color: #007bff;
  text-decoration: none;
}
.menu-item:hover {
  text-decoration: underline;
}
h5 {
  cursor: pointer;
  margin: 10px 0;
  color: #343a40;
}
hr {
  border-top: 1px solid #dee2e6;
}
@media (max-width: 767.98px) {
  .org-sidebar-right {
    width: 100%;
    height: auto;
    position: relative;
  }
}
</style>
