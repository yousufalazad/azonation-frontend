<!-- IndividualSidebar.vue -->
<template>
    <div class="individualSidebar">
        <router-link to="/individual-dashboard/notification-from-org" class="menu-item">Notification from Org</router-link>
        <router-link to="/individual-dashboard/connected-organisation" class="menu-item">Connected Organization</router-link>
        <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">Profile</router-link>
        <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">Upcoming Event</router-link>
        <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">Past Event</router-link>
        <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">Your Attendance</router-link>
        <router-link to="/individual-dashboard/individual-profile-update" class="menu-item">Your Designation</router-link>
    </div>
  </template>
  
  <style scoped>
  .individualSidebar {
    position: fixed;
    top: 50;
    left: 0;
    height: 100%;
    width: 200px;
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
  