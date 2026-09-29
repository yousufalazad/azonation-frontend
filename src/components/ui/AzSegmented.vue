<script setup>
// A small set of mutually exclusive choices shown side by side
// (e.g. Light / Dark / Device). Keyboard: arrow keys move the choice.
const model = defineModel({ type: [String, Number], required: true });

const props = defineProps({
  label: { type: String, required: true }, // read by screen readers
  options: { type: Array, required: true }, // [{ value, label }]
});

function move(step) {
  const i = props.options.findIndex((o) => o.value === model.value);
  const next = props.options[(i + step + props.options.length) % props.options.length];
  model.value = next.value;
}
</script>

<template>
  <div role="radiogroup" :aria-label="label" class="inline-flex w-full rounded-control bg-surface-2 p-1"
    @keydown.right.prevent="move(1)" @keydown.left.prevent="move(-1)">
    <button v-for="opt in options" :key="opt.value" type="button" role="radio" :aria-checked="model === opt.value"
      :tabindex="model === opt.value ? 0 : -1"
      class="flex min-h-[40px] flex-1 items-center justify-center rounded-[8px] px-3 text-sm font-semibold transition-colors"
      :class="model === opt.value ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink'"
      @click="model = opt.value">
      {{ opt.label }}
    </button>
  </div>
</template>
