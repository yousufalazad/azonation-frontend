<!-- New password + confirm, with a strength bar and the rules ticked off as they are met.
     The same rules are enforced by the server (8+ characters, capital, small letter, number, symbol). -->
<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Check, Eye, EyeOff } from "lucide-vue-next";

const password = defineModel("password", { type: String, default: "" });
const confirmation = defineModel("confirmation", { type: String, default: "" });
defineProps({
  label: { type: String, default: "" },
  error: { type: String, default: "" },
  confirmError: { type: String, default: "" },
});

const { t } = useI18n();
const show = ref(false);

const rules = computed(() => [
  { key: "length", ok: password.value.length >= 8 },
  { key: "upper", ok: /[A-Z]/.test(password.value) },
  { key: "lower", ok: /[a-z]/.test(password.value) },
  { key: "number", ok: /\d/.test(password.value) },
  { key: "symbol", ok: /[^A-Za-z0-9]/.test(password.value) },
]);
const score = computed(() => rules.value.filter((r) => r.ok).length);
const strength = computed(() => (!password.value ? "" : score.value <= 2 ? "weak" : score.value <= 4 ? "fair" : "strong"));
const TONE = { weak: "bg-danger", fair: "bg-warning", strong: "bg-success" };

// For the parent: can the form be sent?
const valid = computed(() => score.value === 5 && password.value === confirmation.value);
defineExpose({ valid, strong: computed(() => score.value === 5) });
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <AzInput v-model="password" :type="show ? 'text' : 'password'" :label="label || t('security.new')" :error="error" autocomplete="new-password" required>
        <template #suffix>
          <button type="button" class="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:text-ink" :aria-label="show ? t('security.hide') : t('security.show')"
            :aria-pressed="show" @click="show = !show">
            <EyeOff v-if="show" class="h-4 w-4" aria-hidden="true" /><Eye v-else class="h-4 w-4" aria-hidden="true" />
          </button>
        </template>
      </AzInput>
      <div v-if="password" class="flex items-center gap-2" aria-live="polite">
        <div class="flex h-1.5 flex-1 gap-1">
          <span v-for="i in 5" :key="i" class="flex-1 rounded-full" :class="i <= score ? TONE[strength] : 'bg-surface-2'" />
        </div>
        <span class="text-sm font-medium text-ink-2">{{ t(`security.strength_${strength}`) }}</span>
      </div>
      <ul class="grid gap-1 text-sm sm:grid-cols-2">
        <li v-for="r in rules" :key="r.key" class="flex items-center gap-1.5" :class="r.ok ? 'text-success' : 'text-ink-muted'">
          <Check class="h-4 w-4" :class="r.ok ? '' : 'opacity-30'" aria-hidden="true" />{{ t(`security.rule_${r.key}`) }}
        </li>
      </ul>
    </div>
    <AzInput v-model="confirmation" :type="show ? 'text' : 'password'" :label="t('security.confirm')" :error="confirmError" autocomplete="new-password" required />
  </div>
</template>
