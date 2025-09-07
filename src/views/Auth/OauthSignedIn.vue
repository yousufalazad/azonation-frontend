<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { authStore } from "@/store/authStore";
import functions from "@/global/cookie";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const auth = authStore;

onMounted(async () => {
  const token = String(route.query.accessToken || "");
  if (!token) {
    await Swal.fire({ icon: "error", title: "Invalid session", text: "Please sign in again." });
    router.replace({ name: "login" });
    return;
  }

  try {
    // Fetch the current user using the token (add /api/me on backend if you don’t already have one)
    const me = await axios.get(auth.apiBase + "/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userData = {
      ...(me?.data?.data || {}),
      accessToken: token,
      token_type: "Bearer",
    };

    auth.isAuthenticated = true;
    auth.user = userData;
    functions.setCookie("auth", 1);
    functions.setCookie("user", JSON.stringify(userData));

    switch (userData.type) {
      case "individual":
        router.push({ name: "individual-dashboard-index" }).then(() => location.reload());
        break;
      case "organisation":
        router.push({ name: "org-dashboard-index" }).then(() => location.reload());
        break;
      case "superadmin":
        router.push({ name: "superadmin-dashboard-index" }).then(() => location.reload());
        break;
      default:
        router.replace({ name: "login" });
    }
  } catch (e) {
    console.error(e);
    await Swal.fire({ icon: "error", title: "Couldn’t sign you in", text: "Please try again." });
    router.replace({ name: "login" });
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-sm text-gray-600">Signing you in…</p>
  </div>
</template>
