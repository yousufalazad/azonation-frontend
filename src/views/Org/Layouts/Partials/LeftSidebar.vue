<!-- Org Dashboard Page -->
<template>
  <div class="left-sidebar">
    <router-link to="/org-dashboard/dashboard-initial-content" class="menu-item">Home</router-link>

    <h6 @click="toggleDropdown('membership')">Membership</h6>
    <div v-show="dropdowns.membership" class="dropdown-content">
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Member List</router-link>
      <router-link to="/org-dashboard/add-member" class="menu-item">Add Member</router-link>
    </div>
    <hr>

    <h6 @click="toggleDropdown('committees')">Committees</h6>
    <div v-show="dropdowns.committees" class="dropdown-content">
      <router-link to="/org-dashboard/committee-list" class="menu-item">Committees</router-link>
      <router-link to="/org-dashboard/former-committee-list" class="menu-item">Former Committees</router-link>
      <router-link to="/org-dashboard/create-committee" class="menu-item">Create & Edit Committee</router-link>
    </div>
    <hr>

    <h6 @click="toggleDropdown('meetings')">Meetings</h6>
    <div v-show="dropdowns.meetings" class="dropdown-content">
      <router-link to="/org-dashboard/upcoming-meeting-list" class="menu-item">Upcoming Meeting</router-link>
      <router-link to="/org-dashboard/previous-meeting-list" class="menu-item">Previous Meeting</router-link>
      <router-link to="/org-dashboard/invite-meeting" class="menu-item">Invite Meeting</router-link>
      <router-link to="/org-dashboard/create-meeting" class="menu-item">Create Meeting</router-link>
    </div>
    <hr>

    <h6 @click="toggleDropdown('events')">Events</h6>
    <div v-show="dropdowns.events" class="dropdown-content">
      <router-link to="/org-dashboard/upcoming-events" class="menu-item">Upcoming Event</router-link>
      <router-link to="/org-dashboard/upcoming-events" class="menu-item">Previous Event</router-link>
      <router-link to="/org-dashboard/upcoming-events" class="menu-item">Invite Event</router-link>
      <router-link to="/org-dashboard/create-event" class="menu-item">Create Event</router-link>
      <router-link to="/org-dashboard/upcoming-events" class="menu-item">Registered Event participants List</router-link>
    </div>
    <hr>

    <h6 @click="toggleDropdown('projects')">Projects</h6>
    <div v-show="dropdowns.projects" class="dropdown-content">
      <router-link to="/org-dashboard/projects" class="menu-item">Upcoming Project</router-link>
      <router-link to="/org-dashboard/projects" class="menu-item">Previous Project</router-link>
      <router-link to="/org-dashboard/projects" class="menu-item">Invite Project</router-link>
      <router-link to="/org-dashboard/create-project" class="menu-item">Create Project</router-link>
    </div>
    <hr>

    <h6 @click="toggleDropdown('attendance')">Attendance</h6>
    <div v-show="dropdowns.attendance" class="dropdown-content">
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Attendance</router-link>
    </div>
    <hr>

    <h6 @click="toggleDropdown('membership')">Membership</h6>
    <div v-show="dropdowns.membership" class="dropdown-content">
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Online Membership Form</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Pending Membership Application</router-link>
    </div>
    <hr>

    <h6 @click="toggleDropdown('settings')">Settings</h6>
    <div v-show="dropdowns.settings" class="dropdown-content">
      <router-link to="/org-dashboard/org-settings" class="menu-item">Settings</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Time Zone</router-link>
      <router-link to="/org-dashboard/org-member-list" class="menu-item">Language</router-link>
    </div>
    <hr>

    <h6 @click="toggleDropdown('profile')">Profile</h6>
    <div v-show="dropdowns.profile" class="dropdown-content">
      <router-link to="/org-dashboard/org-profile-update" class="menu-item">Profile</router-link>
    </div>
    <br>
    <br>
    <br>
    <br>
  </div>
</template>

<script>

export default {
  data() {
    return {
      dropdowns: {
        membership: true,
        committees: true,
        meetings: true,
        events: true,
        projects: true,
        attendance: true,
        membership: true,
        settings: true,
        profile: true,
      },
    };
  },
  methods: {
    toggleDropdown(section) {
      this.$set(this.dropdowns, section, !this.dropdowns[section]);
    },
  },
};
</script>

<style scoped>
.left-sidebar {
  position: fixed;
  top: 70px;
  left: 0;
  height: 100%;
  background-color: #ffffff;
  padding-left: 35px;
}
.left-sidebar:hover {
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
.dropdown-content {
  margin-left: 7px;
}
h6 {
  cursor: pointer;
  margin: 10px 0;
  color: #343a40;
}
hr {
  border-top: 1px solid #dee2e6;
}
@media (max-width: 767.98px) {
  .left-sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
}
</style>
