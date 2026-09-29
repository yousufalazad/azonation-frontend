<script setup>
// A button that opens a short list of actions (e.g. Export: CSV, Excel, PDF, Word).
// items: [{ label, onSelect, icon? }]. Closes on selection, outside click and Esc.
import { nextTick, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  items: { type: Array, required: true },
  variant: { type: String, default: "secondary" },
  align: { type: String, default: "right" }, // right | left
});

const open = ref(false);
const root = ref(null);
const list = ref(null);
const busy = ref(false);

function onOutside(e) {
  if (root.value && !root.value.contains(e.target)) close();
}

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    document.addEventListener("mousedown", onOutside);
    await nextTick();
    list.value?.querySelector("button")?.focus();
  } else {
    document.removeEventListener("mousedown", onOutside);
  }
}

function close() {
  open.value = false;
  document.removeEventListener("mousedown", onOutside);
}

async function select(item) {
  close();
  busy.value = true;
  try {
    await item.onSelect?.();
  } finally {
    busy.value = false;
  }
}

function onKeydown(e) {
  const buttons = [...(list.value?.querySelectorAll("button") || [])];
  const i = buttons.indexOf(document.activeElement);
  if (e.key === "Escape") {
    close();
    root.value?.querySelector("button")?.focus();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    buttons[(i + 1) % buttons.length]?.focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    buttons[(i - 1 + buttons.length) % buttons.length]?.focus();
  }
}

onBeforeUnmount(() => document.removeEventListener("mousedown", onOutside));
</script>

<template>
  <div ref="root" class="relative" @keydown="onKeydown">
    <AzButton :variant="variant" :loading="busy" aria-haspopup="menu" :aria-expanded="open" @click="toggle">
      <template #icon><slot name="icon" /></template>
      {{ label }}
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </AzButton>
    <div v-if="open" ref="list" role="menu"
      class="absolute z-40 mt-2 min-w-[12rem] overflow-hidden rounded-control border border-line bg-surface py-1 shadow-pop"
      :class="props.align === 'left' ? 'left-0' : 'right-0'">
      <button v-for="item in items" :key="item.label" type="button" role="menuitem"
        class="flex min-h-[44px] w-full items-center gap-3 px-4 text-left text-[15px] text-ink-2 hover:bg-surface-2 hover:text-ink focus:bg-surface-2 focus:outline-none"
        @click="select(item)">
        <component :is="item.icon" v-if="item.icon" class="h-4 w-4 text-ink-muted" aria-hidden="true" />
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
