<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { authStore as auth } from "@/store/authStore";

const router = useRouter();

onMounted(async () => {
  // No token in URL. Use session cookie to call /api/me
  auth._initPromise = auth.fetchUser();
  const ok = await auth._initPromise;

  if (!ok) {
    await Swal.fire({ icon: "error", title: "Couldn’t sign you in", text: "Please try again." });
    router.replace({ name: "login" });
    return;
  }

  const routes = {
    individual: "individual-dashboard-index",
    organisation: "org-dashboard-index",
    superadmin: "superadmin-dashboard-index",
  };
  router.replace({ name: routes[auth.user.type] || "login" });
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-sm text-gray-600">Signing you in…</p>
  </div>
</template>
