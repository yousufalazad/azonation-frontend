<!-- App.vue -->

<template>
  <div class="container">
    <div class="row">
      <div class="col-md-3 bg-light">

        <header>

          <div class="wrapper">
            <nav>
              <ul>
                <li ><router-link to="/individual-register">Individual Register</router-link></li>
                <li><router-link to="/org-register">Org Register</router-link></li>
                <li><router-link to="/login">Login</router-link></li>
                <!-- <li ><router-link to="/">Home</router-link></li>
                
                <li ><router-link to="/org-register">Org Register</router-link></li>

                <li ><router-link to="/person-dashboard">Person Dashboard</router-link></li>
                <li ><router-link to="/org-dashboard">Organization Dashboard</router-link></li>
                 -->
                <!-- 
                
                <li ><router-link to="/logout" @click="logout">Logout</router-link></li> -->
              </ul>
            </nav>
          </div>
        </header>
      </div>
      <div class="col-md-9 mt-5">
        <main>
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { useStore } from 'vuex';
// import { computed } from 'vue';

// import { authStore } from './store/store';
// const auth = authStore

// const store = useStore(); // Access Vuex store instance

// const isLoggedIn = computed(() => store.state.isLoggedIn);
// const userType = computed(() => store.state.userType);

// const logout = () => {
//   store.dispatch('logout'); // Dispatch logout action
// };
</script>
<style>
/* new */
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin-top: 50px;
}

.logo {
  width: 80px;
  height: 80px;
}

nav ul {
  list-style: square;
  padding: 0;
  padding-left: 20px;
  /* display: flex; */
}

nav ul li {
  margin-right: 10px;
  margin: 10px 0px;
}

nav ul li:last-child {
  margin-right: 0;
}

nav ul li a {
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #f0f0f0;
  color: #333;
}

nav ul li a:hover {
  background-color: #ddd;
}


@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>