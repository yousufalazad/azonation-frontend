<script setup>
// Text input with label, help and error. Any extra attributes (placeholder,
// autocomplete, inputmode, min, max...) are passed to the <input>.
defineOptions({ inheritAttrs: false });

const model = defineModel({ type: [String, Number], default: "" });

defineProps({
  label: { type: String, default: "" },
  help: { type: String, default: "" },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  type: { type: String, default: "text" },
  id: { type: String, default: "" },
});
</script>

<template>
  <AzField :label="label" :help="help" :error="error" :required="required" :id="id">
    <template #default="{ id: fieldId, describedBy, invalid }">
      <div class="relative flex items-center">
        <span v-if="$slots.prefix" class="pointer-events-none absolute left-3.5 flex text-ink-muted">
          <slot name="prefix" />
        </span>
        <input
          :id="fieldId"
          v-model="model"
          v-bind="$attrs"
          :type="type"
          :required="required"
          :aria-invalid="invalid || undefined"
          :aria-describedby="describedBy"
          class="az-control w-full"
          :class="[$slots.prefix ? 'pl-10' : '', $slots.suffix ? 'pr-11' : '', invalid ? 'az-control-invalid' : '']"
        />
        <span v-if="$slots.suffix" class="absolute right-1.5 flex">
          <slot name="suffix" />
        </span>
      </div>
    </template>
  </AzField>
</template>
