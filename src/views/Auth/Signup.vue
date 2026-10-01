<!-- Sign up: choose a person or organisation account, then the details and a strong password.
     Invite links (/signup?ref=CODE) fill in the referral code.
     With complete-google it finishes a Google sign-up instead: no email or password, Google gave those. -->
<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import AuthCard from "@/components/auth/AuthCard.vue";
import NewPasswordFields from "@/components/auth/NewPasswordFields.vue";
import GoogleButton from "@/components/auth/GoogleButton.vue";
import { apiError } from "@/components/auth/authErrors";
import { Building2, UserRound } from "lucide-vue-next";

const props = defineProps({ completeGoogle: { type: Boolean, default: false } });

const auth = authStore;
const DASHBOARDS = { individual: "individual-dashboard-index", organisation: "org-dashboard-index", superadmin: "superadmin-dashboard-index" };
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const type = ref("");
const firstName = ref("");
const lastName = ref("");
const orgName = ref("");
const email = ref(props.completeGoogle ? String(route.query.email || "") : "");
const countryId = ref("");
const password = ref("");
const confirmation = ref("");
const source = ref("");
const referral = ref("");
const acceptTerms = ref(false);
const countries = ref([]);
const passwordFields = ref(null);
const saving = ref(false);
const tried = ref(false);
const serverErrors = ref({});
const form = ref(null);

const TYPES = [
  { value: "individual", icon: UserRound },
  { value: "organisation", icon: Building2 },
];
const SOURCES = ["friend", "social", "search", "referral", "other"];
const sourceOptions = computed(() => SOURCES.map((s) => ({ value: s, label: t(`signup.source_${s}`) })));
const countryOptions = computed(() => countries.value.map((c) => ({ value: c.id, label: c.name })));
const needsNote = computed(() => ["referral", "other"].includes(source.value));

watch(source, (v) => {
  if (!["referral", "other"].includes(v)) referral.value = "";
});

// One message per field; shown after the first try to send
const errors = computed(() => {
  const e = {};
  if (type.value === "individual") {
    if (!firstName.value.trim()) e.first_name = t("signup.required");
    if (!lastName.value.trim()) e.last_name = t("signup.required");
  }
  if (type.value === "organisation" && !orgName.value.trim()) e.org_name = t("signup.required");
  if (!countryId.value) e.country_id = t("signup.required");
  if (!props.completeGoogle) {
    if (!email.value.trim()) e.email = t("signup.required");
    if (!passwordFields.value?.strong) e.password = t("security.needStrong");
    else if (password.value !== confirmation.value) e.confirmation = t("authPages.mismatch");
  }
  if (!source.value) e.source = t("signup.required");
  else if (needsNote.value && !referral.value.trim()) e.referral = t("signup.required");
  if (!acceptTerms.value) e.terms = t("signup.acceptTerms");
  return e;
});
const serverError = (key) => {
  const m = serverErrors.value[key]?.[0] || "";
  return key === "email" && /taken/i.test(m) ? t("signup.emailTaken") : m;
};
const shown = (key) => (tried.value ? errors.value[key] : "") || serverError(key);
watch(email, () => delete serverErrors.value.email);

async function submit() {
  tried.value = true;
  serverErrors.value = {};
  if (saving.value) return;
  if (Object.keys(errors.value).length) {
    // Take the person to the first thing to fix
    await nextTick();
    form.value?.querySelector("[aria-invalid='true']")?.focus();
    return;
  }
  saving.value = true;
  const individual = type.value === "individual";
  const url = props.completeGoogle ? "/api/oauth/google/complete" : "/api/register";
  const res = await auth.fetchPublicApi(url, {
    type: type.value,
    first_name: individual ? firstName.value.trim() : null,
    last_name: individual ? lastName.value.trim() : null,
    org_name: individual ? null : orgName.value.trim(),
    ...(props.completeGoogle ? {} : { email: email.value.trim(), password: password.value }),
    country_id: Number(countryId.value),
    referral_source: source.value,
    referral: needsNote.value ? referral.value.trim() : null,
  }, "POST");
  saving.value = false;
  if (props.completeGoogle && res?.status === "success" && res.data) {
    // Signed in now; a full load so every part of the app starts with the new account
    auth.setSession(res.data);
    window.location.assign(router.resolve({ name: DASHBOARDS[res.data.type] || "login" }).href);
    return;
  }
  if (!props.completeGoogle && res?.status === true) {
    toast.success(t("signup.done"));
    router.push({ name: "login", query: { email: email.value.trim() } });
    return;
  }
  const fieldErrors = res?.errors?.errors || res?.errors;
  if (fieldErrors && typeof fieldErrors === "object" && !fieldErrors.message) serverErrors.value = fieldErrors;
  toast.error(serverError("email") || apiError(res, t));
}

onMounted(async () => {
  if (props.completeGoogle && !email.value) {
    toast.error(t("signup.googleExpired"));
    router.replace({ name: "login" });
    return;
  }
  const code = String(route.query.ref || "").trim().slice(0, 40);
  if (code) {
    source.value = "referral";
    referral.value = code;
  }
  if (route.query.oauth === "google" && route.query.status === "error") toast.error(t("signup.googleCancelled"));
  const res = await auth.fetchPublicApi("/api/countries", {}, "GET");
  countries.value = Array.isArray(res?.data) ? res.data : [];
});
</script>

<template>
  <AuthCard wide :title="completeGoogle ? t('signup.googleTitle') : t('signup.title')" :description="completeGoogle ? t('signup.googleText') : t('signup.text')">
    <p v-if="completeGoogle" class="-mt-2 mb-6 inline-flex max-w-full items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-sm text-ink-2">
      {{ t('signup.signedInAs') }} <strong class="truncate text-ink">{{ email }}</strong>
    </p>
    <GoogleButton v-if="!completeGoogle" :label="t('signup.google')" />
    <div v-if="!completeGoogle" class="my-6 flex items-center gap-3 text-sm text-ink-muted">
      <span class="h-px flex-1 bg-line" aria-hidden="true" />{{ t('signup.orEmail') }}<span class="h-px flex-1 bg-line" aria-hidden="true" />
    </div>

    <form ref="form" class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <fieldset>
        <legend class="mb-2 text-[15px] font-medium text-ink">{{ t('signup.typeQuestion') }}</legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <label v-for="opt in TYPES" :key="opt.value"
            class="flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
            :class="type === opt.value ? 'border-primary bg-primary-soft' : 'border-line hover:bg-surface-2'">
            <input v-model="type" type="radio" name="accountType" :value="opt.value" class="sr-only" />
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full" :class="type === opt.value ? 'bg-primary text-white' : 'bg-surface-2 text-ink-2'">
              <component :is="opt.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span class="block font-semibold text-ink">{{ t(`signup.type_${opt.value}`) }}</span>
              <span class="block text-sm text-ink-2">{{ t(`signup.type_${opt.value}_text`) }}</span>
            </span>
          </label>
        </div>
      </fieldset>

      <template v-if="type">
        <div v-if="type === 'individual'" class="grid gap-5 sm:grid-cols-2">
          <AzInput v-model="firstName" :label="t('signup.firstName')" autocomplete="given-name" maxlength="50" :error="shown('first_name')" required />
          <AzInput v-model="lastName" :label="t('signup.lastName')" autocomplete="family-name" maxlength="50" :error="shown('last_name')" required />
        </div>
        <AzInput v-else v-model="orgName" :label="t('signup.orgName')" autocomplete="organization" maxlength="100" :error="shown('org_name')" required />

        <AzInput v-if="!completeGoogle" v-model="email" type="email" :label="t('auth.email')" autocomplete="email" inputmode="email" placeholder="you@example.com" maxlength="100"
          :help="t('signup.emailHelp')" :error="shown('email')" required />
        <AzSelect v-model="countryId" :label="t('signup.country')" :placeholder="t('signup.choose')" :options="countryOptions" :error="shown('country_id')" required />
        <NewPasswordFields v-if="!completeGoogle" ref="passwordFields" v-model:password="password" v-model:confirmation="confirmation" :label="t('auth.password')"
          :error="shown('password')" :confirm-error="shown('confirmation')" />
        <AzSelect v-model="source" :label="t('signup.source')" :placeholder="t('signup.choose')" :options="sourceOptions" :error="shown('source')" required />
        <AzInput v-if="needsNote" v-model="referral" :label="source === 'referral' ? t('signup.referralCode') : t('signup.otherNote')" maxlength="100"
          :error="shown('referral')" required />

        <div>
          <label class="flex cursor-pointer items-start gap-3 py-1">
            <input v-model="acceptTerms" type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong accent-[rgb(var(--az-primary))]"
              :aria-invalid="!!shown('terms') || undefined" />
            <span class="text-[15px] text-ink">
              <i18n-t keypath="signup.terms" scope="global">
                <template #terms><RouterLink :to="{ name: 'terms-of-service' }" target="_blank" class="font-medium text-primary hover:underline">{{ t('signup.termsLink') }}</RouterLink></template>
                <template #privacy><RouterLink :to="{ name: 'privacy-policy' }" target="_blank" class="font-medium text-primary hover:underline">{{ t('signup.privacyLink') }}</RouterLink></template>
              </i18n-t>
            </span>
          </label>
          <p v-if="shown('terms')" class="mt-1 text-sm text-danger">{{ shown('terms') }}</p>
        </div>

        <AzButton type="submit" block :loading="saving" :loading-text="t('signup.creating')">{{ completeGoogle ? t('signup.finish') : t('signup.create') }}</AzButton>
      </template>
    </form>

    <p v-if="!completeGoogle" class="mt-6 text-center text-[15px] text-ink-2">
      {{ t('signup.haveAccount') }}
      <RouterLink :to="{ name: 'login' }" class="font-medium text-primary hover:underline">{{ t('auth.login') }}</RouterLink>
    </p>
  </AuthCard>
</template>
