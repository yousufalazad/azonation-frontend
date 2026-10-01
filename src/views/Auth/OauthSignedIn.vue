<!-- Google sends people here after signing in; the session cookie is already set -->
<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore as auth } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { Loader2 } from "lucide-vue-next";

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const DASHBOARDS = { individual: "individual-dashboard-index", organisation: "org-dashboard-index", superadmin: "superadmin-dashboard-index" };

onMounted(async () => {
  auth._initPromise = auth.fetchUser();
  if (!(await auth._initPromise)) {
    toast.error(t("signup.googleFailed"));
    router.replace({ name: "login" });
    return;
  }
  router.replace({ name: DASHBOARDS[auth.user.type] || "login" });
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center gap-3 bg-canvas text-ink-2" role="status">
    <Loader2 class="h-5 w-5 animate-spin" aria-hidden="true" />{{ t('signup.signingIn') }}
  </div>
</template>
