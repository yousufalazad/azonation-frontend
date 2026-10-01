<script setup>
// Wraps any form control with a label above, help text and an error message.
// The default slot receives { id, describedBy, invalid } to wire up accessibility.
import { computed, useId } from "vue";

const props = defineProps({
  label: { type: String, default: "" },
  help: { type: String, default: "" },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  id: { type: String, default: "" },
});

const autoId = useId();
const fieldId = computed(() => props.id || `az-${autoId}`);
const messageId = computed(() => `${fieldId.value}-msg`);
const hasMessage = computed(() => !!(props.error || props.help));
</script>

<template>
  <div class="flex min-w-0 flex-col gap-1.5">
    <label v-if="label" :for="fieldId" class="text-sm font-semibold text-ink">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>
    <slot :id="fieldId" :described-by="hasMessage ? messageId : undefined" :invalid="!!error" />
    <p v-if="error" :id="messageId" class="text-[13px] font-medium text-danger" role="alert">{{ error }}</p>
    <p v-else-if="help" :id="messageId" class="text-[13px] text-ink-muted">{{ help }}</p>
  </div>
</template>
