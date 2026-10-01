<script setup>
defineOptions({ inheritAttrs: false });

const model = defineModel({ type: String, default: "" });

defineProps({
  label: { type: String, default: "" },
  help: { type: String, default: "" },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  rows: { type: [Number, String], default: 4 },
  id: { type: String, default: "" },
});
</script>

<template>
  <AzField :label="label" :help="help" :error="error" :required="required" :id="id">
    <template #default="{ id: fieldId, describedBy, invalid }">
      <textarea
        :id="fieldId"
        v-model="model"
        v-bind="$attrs"
        :rows="rows"
        :required="required"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
        class="az-control w-full py-3"
        :class="invalid ? 'az-control-invalid' : ''"
      />
    </template>
  </AzField>
</template>
