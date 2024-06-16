<!-- Sidebar.vue -->
<template>
  <div class="org-sidebar">
    <router-link to="/org-dashboard/org-profile-update" class="menu-item">Profile Update</router-link>
    <router-link to="/org-dashboard/add-member" class="menu-item">Add Member</router-link>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Member List</router-link>
    <br>
    <router-link to="/org-dashboard/committee-list" class="menu-item">Committees</router-link>
    <router-link to="/org-dashboard/former-committee-list" class="menu-item">Former Committees</router-link>
    <router-link to="/org-dashboard/create-committee" class="menu-item">Create & Edit Committee</router-link>
    <br>
    <router-link to="/org-dashboard/upcoming-meeting-list" class="menu-item">Upcoming Meeting</router-link>
    <router-link to="/org-dashboard/previous-meeting-list" class="menu-item">Previous Meeting</router-link>
    <router-link to="/org-dashboard/invite-meeting" class="menu-item">Invite Meeting</router-link>
    <router-link to="/org-dashboard/create-meeting" class="menu-item">Create Meeting</router-link>
    <br>
    <router-link to="/org-dashboard/upcoming-events" class="menu-item">Upcoming Event</router-link>
    <router-link to="/org-dashboard/upcoming-events" class="menu-item">Previous Event</router-link>
    <router-link to="/org-dashboard/upcoming-events" class="menu-item">Invite Event</router-link>
    <router-link to="/org-dashboard/create-event" class="menu-item">Create Event</router-link>
    <router-link to="/org-dashboard/upcoming-events" class="menu-item">Registered Event participants List</router-link>
    <br>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Upcoming Project</router-link>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Previous Project</router-link>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Invite Project</router-link>
    <router-link to="/org-dashboard/create-project" class="menu-item">Create Project</router-link>
    <br>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Attendance</router-link>
    <br>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Online Membership Form</router-link>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Pending Membership Application</router-link>
    <br>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Reports</router-link>
    <router-link to="/org-dashboard/org-member-list" class="menu-item">Settings</router-link>
  </div>
</template>

<style scoped>
.org-sidebar {
  position: fixed;
  top: 50;
  left: 0;
  height: 100%;
  width: 280px;
  background-color: #f8f9fa;
  padding: 20px;
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
</style>