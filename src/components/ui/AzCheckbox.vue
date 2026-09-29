<script setup>
// Checkbox with its label as part of a 48px tap area.
import { computed, useId } from "vue";

const model = defineModel({ type: [Boolean, Array], default: false });

const props = defineProps({
  label: { type: String, required: true },
  help: { type: String, default: "" },
  value: { type: [String, Number, Boolean], default: undefined },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: "" },
});

const autoId = useId();
const boxId = computed(() => props.id || `az-${autoId}`);
</script>

<template>
  <label :for="boxId" class="flex min-h-touch cursor-pointer items-start gap-3 py-3"
    :class="disabled ? 'cursor-not-allowed opacity-60' : ''">
    <input :id="boxId" v-model="model" type="checkbox" :value="value" :disabled="disabled"
      class="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong accent-[rgb(var(--az-primary))]" />
    <span class="flex flex-col gap-0.5">
      <span class="text-[15px] text-ink">{{ label }}</span>
      <span v-if="help" class="text-[13px] text-ink-muted">{{ help }}</span>
    </span>
  </label>
</template>
