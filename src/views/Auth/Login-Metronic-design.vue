<!-- Home Component -->

<script setup>
import { ref } from 'vue'
import { authStore } from '../../store/authStore';
const auth = authStore
const username = ref('')
const password = ref('')

const defaultThemeMode = 'light'; // light|dark|system
let themeMode;

if (document.documentElement) {
  if (localStorage.getItem('theme')) {
    themeMode = localStorage.getItem('theme');
  } else if (document.documentElement.hasAttribute('data-theme-mode')) {
    themeMode = document.documentElement.getAttribute('data-theme-mode');
  } else {
    themeMode = defaultThemeMode;
  }

  if (themeMode === 'system') {
    themeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.documentElement.classList.add(themeMode);
}
</script>

<template>
  <header class="navbar navbar-expand-md navbar-light bg-light fixed-top navbar-width">
    <div class="container-fluid">
      <li class="nav-item">
        <img src="../../assets/Logo/Azonation.png" alt="Azonation" width="175px">
      </li>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/individual-register">Individual Register</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/org-register">Org Register</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/superAdmin-register">SuperAdmin Register</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>

  <div class="flex items-center justify-center grow bg-center bg-no-repeat page-bg mt-5 pt-5">
    <div class="card max-w-[370px] w-full">
      <form action="#" class="card-body flex flex-col gap-5 p-10" id="sign_in_form" method="get">
        <div class="text-center mb-2.5">
          <h3 class="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            Sign in
          </h3>
          <div class="flex items-center justify-center font-medium">
            <span class="text-2sm text-gray-600 me-1.5">
              Need an account?
            </span>
            <a class="text-2sm link" href="#">
              Sign up
            </a>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <a class="btn btn-light btn-sm justify-center" href="#">
            <img alt="" class="size-3.5 shrink-0" src="/src/assets/media/brand-logos/google.svg" />
            Use Google
          </a>
          <a class="btn btn-light btn-sm justify-center" href="#">
            <img alt="" class="size-3.5 shrink-0 dark:hidden" src="/src/assets/media/brand-logos/apple-black.svg" />
            <img alt="" class="size-3.5 shrink-0 light:hidden" src="/src/assets/media/brand-logos/apple-white.svg" />
            Use Apple
          </a>
        </div>
        <div class="flex items-center gap-2">
          <span class="border-t border-gray-200 w-full">
          </span>
          <span class="text-2xs text-gray-500 font-medium uppercase">
            Or
          </span>
          <span class="border-t border-gray-200 w-full">
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="form-label text-gray-900">
            Email
          </label>
          <input class="input" placeholder="email@email.com" type="text" value="" />
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between gap-1">
            <label class="form-label text-gray-900">
              Password
            </label>
            <a class="text-2sm link shrink-0" href="#">
              Forgot Password?
            </a>
          </div>
          <label class="input" data-toggle-password="true">
            <input name="user_password" placeholder="Enter Password" type="password" value="" />
            <button class="btn btn-icon" data-toggle-password-trigger="true">
              <i class="ki-filled ki-eye text-gray-500 toggle-password-active:hidden">
              </i>
              <i class="ki-filled ki-eye-slash text-gray-500 hidden toggle-password-active:block">
              </i>
            </button>
          </label>
        </div>
        <label class="checkbox-group">
          <input class="checkbox checkbox-sm" name="check" type="checkbox" value="1" />
          <span class="checkbox-label">
            Remember me
          </span>
        </label>
        <button class="btn btn-primary flex justify-center grow">
          Sign In
        </button>
      </form>
    </div>
  </div>

</template>

<style>
.page-bg {
  background-image: url('/src/assets/media/images/2600x1200/bg-10.png');
}

.dark .page-bg {
  background-image: url('/src/assets/media/images/2600x1200/bg-10-dark.png');
}

</style>