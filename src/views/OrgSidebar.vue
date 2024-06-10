<!-- Sidebar.vue -->
<template>
    <div class="org-sidebar">
      <router-link to="/org-dashboard/org-profile-update" class="menu-item">Profile Update</router-link>
      <router-link to="/org-dashboard/add-member" class="menu-item">Add Member</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Member List</router-link>
      <br>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Committee</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Former Committee</router-link>
      <br>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Create Meeting</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Invite Meeting</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Create Event</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Upcoming Meeting</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Past Meeting</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Attendance</router-link>
      <br>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Reports</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Online Membership Form</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Pending Membership Application</router-link>
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