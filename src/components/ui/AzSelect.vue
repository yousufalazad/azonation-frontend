<script setup>
// Native select (best on phones) with label, help and error.
// options: [{ value, label, disabled? }] or plain strings.
import { computed } from "vue";

defineOptions({ inheritAttrs: false });

const model = defineModel({ type: [String, Number, Boolean, null], default: "" });

const props = defineProps({
  label: { type: String, default: "" },
  help: { type: String, default: "" },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  id: { type: String, default: "" },
});

const normalized = computed(() =>
  props.options.map((o) => (typeof o === "object" && o !== null ? o : { value: o, label: String(o) })),
);
</script>

<template>
  <AzField :label="label" :help="help" :error="error" :required="required" :id="id">
    <template #default="{ id: fieldId, describedBy, invalid }">
      <div class="relative">
        <select
          :id="fieldId"
          v-model="model"
          v-bind="$attrs"
          :required="required"
          :aria-invalid="invalid || undefined"
          :aria-describedby="describedBy"
          class="az-control w-full appearance-none pr-10"
          :class="invalid ? 'az-control-invalid' : ''"
        >
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <option v-for="opt in normalized" :key="String(opt.value)" :value="opt.value" :disabled="opt.disabled">
            {{ opt.label }}
          </option>
        </select>
        <svg class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </template>
  </AzField>
</template>
