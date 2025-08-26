<template>
  <header class="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-white/80 border-b">
      <div class="w-full flex justify-between items-center px-6 py-4">
        <!-- Left Logo -->
        <div class="flex items-center space-x-4">
          <img src="../../assets/Logo/Azonation.png" alt="Azonation" class="w-36 sm:w-44" />

          <!-- Navigation -->
          <div class="hidden lg:flex items-center space-x-4">
            <!-- Individual Menu -->
            <div class="relative group w-full" data-menu-trigger>
              <button @click="toggleMenu('individual')"
                class="flex items-center space-x-1 px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
                <span>Individual</span>
                <svg :class="['w-4 h-4 transition-transform duration-300', showIndividualMenu ? 'rotate-180' : '']"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 lg:hidden"
                v-if="!isDesktop && showIndividualMenu">
                <div class="flex flex-wrap justify-between max-w-7xl mx-auto">
                  <div style="width: 250px;">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Getting Started</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="/individual">What is an Individual Account?</router-link></li>
                      <li><router-link to="/individual">How does it work?</router-link></li>
                      <li><router-link to="/individual">Why do I need one?</router-link></li>
                      <li><router-link to="/individual">What if I don’t have one?</router-link></li>
                    </ul>
                  </div>
                  <div style="width: 250px;">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Usage & Membership</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="/individual">Join Multiple Organisations?</router-link></li>
                      <li><router-link to="/individual">What can I do?</router-link></li>
                      <li><router-link to="/individual">Profile Tips</router-link></li>
                    </ul>
                  </div>
                  <div class="flex flex-col gap-3">
                    <router-link to="/signup"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Join Now <span>→</span>
                    </router-link>
                    <router-link to="/help"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Help Center <span>→</span>
                    </router-link>
                  </div>
                </div>
              </div>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 hidden lg:group-hover:flex">
                <div class="flex w-full max-w-7xl mx-auto justify-between">
                  <div style="width: 250px;">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Getting Started</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="/individual">What is an Individual Account?</router-link></li>
                      <li><router-link to="/individual">How does it work?</router-link></li>
                      <li><router-link to="/individual">Why do I need one?</router-link></li>
                      <li><router-link to="/individual">What if I don’t have one?</router-link></li>
                    </ul>
                  </div>
                  <div style="width: 250px;">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Usage & Membership</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="/individual">Join Multiple Organisations?</router-link></li>
                      <li><router-link to="/individual">What can I do?</router-link></li>
                      <li><router-link to="/individual">Profile Tips</router-link></li>
                    </ul>
                  </div>
                  <div class="flex flex-col gap-3">
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Join Now <span>→</span>
                    </router-link>
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Help Center <span>→</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Organisation Menu -->
            <div class="relative group w-full" data-menu-trigger>
              <button @click="toggleMenu('organisation')"
                class="flex items-center space-x-1 px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
                <span>Organisation</span>
                <svg :class="['w-4 h-4 transition-transform duration-300', showOrganisationMenu ? 'rotate-180' : '']"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 lg:hidden"
                v-if="!isDesktop && showOrganisationMenu">
                <div class="flex flex-wrap justify-between max-w-7xl mx-auto">
                  <div style="width: 250px;">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Organisation Basics</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="/organisation">What is an Organisation Account?</router-link></li>
                      <li><router-link to="/organisation">Who Can Register?</router-link></li>
                      <li><router-link to="/organisation">Benefits Overview</router-link></li>
                    </ul>
                  </div>
                  <div style="width: 250px;">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Features & Management</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="/organisation">Manage Members</router-link></li>
                      <li><router-link to="/organisation">Events & Projects</router-link></li>
                      <li><router-link to="/organisation">Finance & Billing</router-link></li>
                    </ul>
                  </div>
                  <div class="flex flex-col gap-3">
                    <router-link to="/signup"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Register Now <span>→</span>
                    </router-link>
                    <router-link to="/pricing"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Pricing Plans <span>→</span>
                    </router-link>
                  </div>
                </div>
              </div>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 hidden lg:group-hover:flex">
                <div class="flex w-full max-w-7xl mx-auto justify-between">
                  <div style="width: 250px;">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Organisation Basics</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="/organisation">What is an Organisation Account?</router-link></li>
                      <li><router-link to="/organisation">Who Can Register?</router-link></li>
                      <li><router-link to="/organisation">Benefits Overview</router-link></li>
                    </ul>
                  </div>
                  <div style="width: 250px;">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Features & Management</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="/organisation">Manage Members</router-link></li>
                      <li><router-link to="/organisation">Events & Projects</router-link></li>
                      <li><router-link to="/organisation">Finance & Billing</router-link></li>
                    </ul>
                  </div>
                  <div class="flex flex-col gap-3">
                    <router-link to="/signup"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Register Now <span>→</span>
                    </router-link>
                    <router-link to="/pricing"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Pricing Plans <span>→</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pricing Link -->
            <router-link to="/pricing"
              class="px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
              Pricing
            </router-link>
          </div>
        </div>
        <!-- Right Side Navbar + Toggler -->
        <div class="flex items-center space-x-6">
          <!-- Desktop Menu -->
          <div class="hidden lg:flex items-center space-x-4">
            <router-link to="/help" class="text-sm">Help</router-link>
            <router-link to="/"
              class="text-sm border border-black px-4 py-2 rounded-full font-medium hover:bg-black hover:text-white">
              Log In
            </router-link>
          </div>
          <div class="lg:hidden">
            <router-link @click="showMobileMenu = false" to="/"
            class="text-sm border border-black px-4 py-2 rounded-full font-medium hover:bg-black hover:text-white">
            Log In
          </router-link>
          </div>
          <!-- Toggler for Mobile -->
          <button @click="showMobileMenu = !showMobileMenu"
            class="lg:hidden border border-gray-400 p-2 rounded-md hover:bg-gray-200">
            <svg v-if="!showMobileMenu" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Panel -->
      <div v-if="showMobileMenu" class="lg:hidden bg-white border-t shadow-md">
        <div class="flex flex-col px-6 py-4 space-y-3">
         <!-- Individual Menu -->
            <div class="relative group w-full" data-menu-trigger>
              <button @click="toggleMenu('individual')"
                class="flex items-center space-x-1 px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
                <span>Individual</span>
                <svg :class="['w-4 h-4 transition-transform duration-300', showIndividualMenu ? 'rotate-180' : '']"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 lg:hidden"
                v-if="!isDesktop && showIndividualMenu">
                <div class="flex flex-wrap justify-between max-w-7xl mx-auto">
                  <div class="mb-5">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Getting Started</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="#">What is an Individual Account?</router-link></li>
                      <li><router-link to="#">How does it work?</router-link></li>
                      <li><router-link to="#">Why do I need one?</router-link></li>
                      <li><router-link to="#">What if I don’t have one?</router-link></li>
                    </ul>
                  </div>
                  <div class="mb-5">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Usage & Membership</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="#">Join Multiple Organisations?</router-link></li>
                      <li><router-link to="#">What can I do?</router-link></li>
                      <li><router-link to="#">Profile Tips</router-link></li>
                    </ul>
                  </div>
                  <div class="flex flex-col gap-3">
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Join Now <span>→</span>
                    </router-link>
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Help Center <span>→</span>
                    </router-link>
                  </div>
                </div>
              </div>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 hidden lg:group-hover:flex">
                <div class="flex w-full max-w-7xl mx-auto justify-between">
                  <div class="mb-5">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Getting Started</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="#">What is an Individual Account?</router-link></li>
                      <li><router-link to="#">How does it work?</router-link></li>
                      <li><router-link to="#">Why do I need one?</router-link></li>
                      <li><router-link to="#">What if I don’t have one?</router-link></li>
                    </ul>
                  </div>
                  <div class="mb-5">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Usage & Membership</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="#">Join Multiple Organisations?</router-link></li>
                      <li><router-link to="#">What can I do?</router-link></li>
                      <li><router-link to="#">Profile Tips</router-link></li>
                    </ul>
                  </div>
                  <div class="flex flex-col gap-3">
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Join Now <span>→</span>
                    </router-link>
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Help Center <span>→</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Organisation Menu -->
            <div class="relative group w-full" data-menu-trigger>
              <button @click="toggleMenu('organisation')"
                class="flex items-center space-x-1 px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
                <span>Organisation</span>
                <svg :class="['w-4 h-4 transition-transform duration-300', showOrganisationMenu ? 'rotate-180' : '']"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 lg:hidden"
                v-if="!isDesktop && showOrganisationMenu">
                <div class="flex flex-wrap justify-between max-w-7xl mx-auto">
                  <div class="mb-5">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Organisation Basics</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="#">What is an Organisation Account?</router-link></li>
                      <li><router-link to="#">Who Can Register?</router-link></li>
                      <li><router-link to="#">Benefits Overview</router-link></li>
                    </ul>
                  </div>
                  <div class="mb-5">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Features & Management</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="#">Manage Members</router-link></li>
                      <li><router-link to="#">Events & Projects</router-link></li>
                      <li><router-link to="#">Finance & Billing</router-link></li>
                    </ul>
                  </div>
                  <div class="flex flex-col gap-3">
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Register Now <span>→</span>
                    </router-link>
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Pricing Plans <span>→</span>
                    </router-link>
                  </div>
                </div>
              </div>
              <div
                class="mega-menu absolute left-0 right-0 top-full bg-white shadow-lg border-t py-10 px-12 z-50 hidden lg:group-hover:flex">
                <div class="flex w-full max-w-7xl mx-auto justify-between">
                  <div class="mb-5">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Organisation Basics</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="#">What is an Organisation Account?</router-link></li>
                      <li><router-link to="#">Who Can Register?</router-link></li>
                      <li><router-link to="#">Benefits Overview</router-link></li>
                    </ul>
                  </div>
                  <div class="mb-5">
                    <h4 class="text-sm font-semibold text-gray-800 mb-3">Features & Management</h4>
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li><router-link to="#">Manage Members</router-link></li>
                      <li><router-link to="#">Events & Projects</router-link></li>
                      <li><router-link to="#">Finance & Billing</router-link></li>
                    </ul>
                  </div>
                  <div class="flex flex-col gap-3">
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Register Now <span>→</span>
                    </router-link>
                    <router-link to="#"
                      class="bg-black text-white px-4 py-3 rounded-full flex justify-between items-center w-52 hover:bg-gray-800">
                      Pricing Plans <span>→</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pricing Link -->
            <router-link to="#"
              class="px-3 py-2 text-sm text-black hover:bg-black hover:text-white rounded-full transition">
              Pricing
            </router-link>
        </div>
      </div>
    </header>
</template>

<script setup>
const props = defineProps({
  showMobileMenu: Boolean,
  showIndividualMenu: Boolean,
  showOrganisationMenu: Boolean
});
</script>
