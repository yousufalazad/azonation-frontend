<!-- Sidebar.vue -->
<template>
    <div class="sidebar">
      <router-link to="/org-dashboard/org-profile-update" class="menu-item">Profile Update</router-link>
      <router-link to="/org-dashboard/add-member" class="menu-item">Add Member</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Member List</router-link>
      <!-- <router-link to="/org-dashboard/create-meeting" class="menu-item">Create Meeting</router-link> -->
    </div>
  </template>
  
  <style scoped>
  .sidebar {
    position: fixed;
    top: 50;
    left: 0;
    height: 100%;
    width: 200px;
    background-color: #e9e8e8;
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