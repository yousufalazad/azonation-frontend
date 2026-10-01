<!-- Sign-in and security: change the password. The email address is changed on the Profile page. -->
<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { Check, Eye, EyeOff, KeyRound } from "lucide-vue-next";

const auth = authStore;
const { t } = useI18n();
const toast = useToast();

const form = reactive({ old_password: "", password: "", password_confirmation: "" });
const errors = reactive({});
const saving = ref(false);
const show = ref(false);

const rules = computed(() => [
  { key: "length", ok: form.password.length >= 8 },
  { key: "upper", ok: /[A-Z]/.test(form.password) },
  { key: "lower", ok: /[a-z]/.test(form.password) },
  { key: "number", ok: /\d/.test(form.password) },
  { key: "symbol", ok: /[^A-Za-z0-9]/.test(form.password) },
]);
const score = computed(() => rules.value.filter((r) => r.ok).length);
const strength = computed(() => (!form.password ? "" : score.value <= 2 ? "weak" : score.value <= 4 ? "fair" : "strong"));
const strengthTone = { weak: "bg-danger", fair: "bg-warning", strong: "bg-success" };

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (score.value < 5) errors.password = t("security.needStrong");
  if (form.password !== form.password_confirmation) errors.password_confirmation = t("security.noMatch");
  if (Object.keys(errors).length) return;
  saving.value = true;
  try {
    const res = await auth.fetchProtectedApi(`/api/update-password/${auth.user?.id}`, { ...form }, "POST");
    if (res?.status) {
      toast.success(t("security.changed"));
      Object.assign(form, { old_password: "", password: "", password_confirmation: "" });
    } else {
      const e = res?.errors;
      const fieldErrors = e?.errors || (e && !e.message ? e : null);
      if (fieldErrors?.old_password) errors.old_password = fieldErrors.old_password[0];
      else if (fieldErrors?.password) errors.password = fieldErrors.password[0];
      else errors.old_password = e?.message || res?.message || t("security.failed");
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AzPageHeader :title="t('accountNav.security')" :description="t('security.description')" />

    <AzCard>
      <template #header>
        <h2 class="flex items-center gap-2 text-lg font-semibold text-ink"><KeyRound class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('security.changePassword') }}</h2>
      </template>
      <form class="flex max-w-md flex-col gap-5" novalidate @submit.prevent="save">
        <!-- Lets password managers match the account -->
        <input type="text" class="sr-only" :value="auth.user?.email" autocomplete="username" tabindex="-1" aria-hidden="true" readonly />
        <AzInput v-model="form.old_password" :type="show ? 'text' : 'password'" :label="t('security.current')" :help="t('security.currentHelp')"
          :error="errors.old_password" autocomplete="current-password" />
        <div class="flex flex-col gap-2">
          <AzInput v-model="form.password" :type="show ? 'text' : 'password'" :label="t('security.new')" :error="errors.password" autocomplete="new-password">
            <template #suffix>
              <button type="button" class="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:text-ink" :aria-label="show ? t('security.hide') : t('security.show')"
                :aria-pressed="show" @click="show = !show">
                <EyeOff v-if="show" class="h-4 w-4" aria-hidden="true" /><Eye v-else class="h-4 w-4" aria-hidden="true" />
              </button>
            </template>
          </AzInput>
          <div v-if="form.password" class="flex items-center gap-2" aria-live="polite">
            <div class="flex h-1.5 flex-1 gap-1">
              <span v-for="i in 5" :key="i" class="flex-1 rounded-full" :class="i <= score ? strengthTone[strength] : 'bg-surface-2'" />
            </div>
            <span class="text-sm font-medium text-ink-2">{{ t(`security.strength_${strength}`) }}</span>
          </div>
          <ul class="grid gap-1 text-sm sm:grid-cols-2">
            <li v-for="r in rules" :key="r.key" class="flex items-center gap-1.5" :class="r.ok ? 'text-success' : 'text-ink-muted'">
              <Check class="h-4 w-4" :class="r.ok ? '' : 'opacity-30'" aria-hidden="true" />{{ t(`security.rule_${r.key}`) }}
            </li>
          </ul>
        </div>
        <AzInput v-model="form.password_confirmation" :type="show ? 'text' : 'password'" :label="t('security.confirm')" :error="errors.password_confirmation" autocomplete="new-password" />
        <div><AzButton type="submit" :loading="saving">{{ t('security.save') }}</AzButton></div>
      </form>
    </AzCard>
  </div>
</template>
