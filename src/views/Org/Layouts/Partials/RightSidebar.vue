<template>
  <div class="org-sidebar-right">
    <h5 @click="toggleDropdown('reports')">Reports</h5>

    <button type="button" class="btn btn-primary btn-sm">Expand</button>
    <button type="button" class="btn btn-secondary btn-sm ms-3">Collapse</button>

    <form class="d-flex">
      <input class="form-control me-1 my-2" type="search" placeholder="Search" aria-label="Search">
      <button class="btn btn-outline-dark my-2" type="submit">Search</button>
    </form>

    <div v-show="dropdowns.reports" class="dropdown-content">
      <h6 @click="toggleDropdown('membership')">Membership</h6>
      <div v-show="dropdowns.membership" class="dropdown-content">
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Membership growth report</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Past members list</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Pending membership</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Member engagement report</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Pending membership application</router-link>
      </div>

      <br>
      <h6 @click="toggleDropdown('attendance')">Attendance</h6>
      <div v-show="dropdowns.attendance" class="dropdown-content">
        <router-link to="/org-dashboard/committee-list" class="menu-item">Attendance forecast</router-link>
        <router-link to="/org-dashboard/committee-list" class="menu-item">Meeting Attendance</router-link>
        <router-link to="/org-dashboard/committee-list" class="menu-item">Event Attendance</router-link>
        <router-link to="/org-dashboard/committee-list" class="menu-item">Programme Attendance</router-link>
        <router-link to="/org-dashboard/committee-list" class="menu-item">Project Attendance</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('meeting')">Meeting</h6>
      <div v-show="dropdowns.meeting" class="dropdown-content">
        <router-link to="/org-dashboard/upcoming-meeting-list" class="menu-item">Past meeting reports</router-link>
        <router-link to="/org-dashboard/committee-list" class="menu-item">Meeting attendance</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('event')">Event</h6>
      <div v-show="dropdowns.event" class="dropdown-content">
        <router-link to="/org-dashboard/upcoming-events" class="menu-item">Event reports</router-link>
        <router-link to="/org-dashboard/committee-list" class="menu-item">Event Attendance</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('project')">Project</h6>
      <div v-show="dropdowns.project" class="dropdown-content">
        <router-link to="/org-dashboard/projects" class="menu-item">Project reports</router-link>
        <router-link to="/org-dashboard/committee-list" class="menu-item">Project Attendance</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('financial')">Financial</h6>
      <div v-show="dropdowns.financial" class="dropdown-content">
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Financial reports</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('billing')">Billing</h6>
      <div v-show="dropdowns.billing" class="dropdown-content">
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Billing history</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Transaction history</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Upcoming bill</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('support')">Support</h6>
      <div v-show="dropdowns.support" class="dropdown-content">
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Support FAQ</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Email</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Chat</router-link>
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Call</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('howToUse')">How To Use</h6>
      <div v-show="dropdowns.howToUse" class="dropdown-content">
        <router-link to="/org-dashboard/org-member-list" class="menu-item">User manual</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('developerTool')">Developer Tool</h6>
      <div v-show="dropdowns.developerTool" class="dropdown-content">
        <router-link to="/org-dashboard/org-member-list" class="menu-item">API</router-link>
      </div>
      <br>
      
      <h6 @click="toggleDropdown('contact')">Contact</h6>
      <div v-show="dropdowns.contact" class="dropdown-content">
        <router-link to="/org-dashboard/org-member-list" class="menu-item">Contact us</router-link>
      </div>
    </div>
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
        reports: true,
        membership: true,
        attendance: true,
        meeting: true,
        event: true,
        project: true,
        financial: true,
        billing: true,
        support: true,
        howToUse: true,
        developerTool: true,
        contact: true,
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
.org-sidebar-right {
  position: fixed;
  margin-top: 66px;
  margin-right: 0;
  height: 100%;
  background-color: #ffffff;
  padding-top: 20px;
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
.dropdown-content {
  margin-left: 7px;
}
h5, h6 {
  cursor: pointer;
  margin: 10px 0;
  color: #343a40;
}
h4 {
margin-left: 7px;
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
