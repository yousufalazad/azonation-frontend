<script setup>
// A button that opens a short list of actions (e.g. Export: CSV, Excel, PDF, Word).
// items: [{ label, onSelect, icon? }]. Closes on selection, outside click, Esc and scroll.
// Icon-only button (e.g. "more" on a table row): leave `label` empty and set `ariaLabel`.
// The list is placed on the page body so scrolling tables and cards cannot clip it.
import { nextTick, onBeforeUnmount, ref } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  label: { type: String, default: "" },
  ariaLabel: { type: String, default: "" },
  items: { type: Array, required: true },
  variant: { type: String, default: "secondary" },
  align: { type: String, default: "right" }, // right | left
});

const open = ref(false);
const root = ref(null);
const list = ref(null);
const busy = ref(false);
const position = ref({});

function place() {
  const rect = root.value?.getBoundingClientRect();
  if (!rect) return;
  const below = window.innerHeight - rect.bottom;
  const listHeight = list.value?.offsetHeight || 0;
  // Open upwards when there is no room below (last rows of a table)
  const top = below < listHeight + 16 && rect.top > listHeight + 16 ? rect.top - listHeight - 8 : rect.bottom + 8;
  position.value = props.align === "left"
    ? { top: `${top}px`, left: `${Math.max(8, rect.left)}px` }
    : { top: `${top}px`, right: `${Math.max(8, window.innerWidth - rect.right)}px` };
}

function onOutside(e) {
  if (root.value?.contains(e.target) || list.value?.contains(e.target)) return;
  close();
}

function listen(on) {
  const fn = on ? "addEventListener" : "removeEventListener";
  document[fn]("mousedown", onOutside);
  window[fn]("scroll", close, true);
  window[fn]("resize", close);
}

async function toggle() {
  if (open.value) return close();
  open.value = true;
  await nextTick();
  place();
  listen(true);
  list.value?.querySelector("button")?.focus();
}

function close() {
  if (!open.value) return;
  open.value = false;
  listen(false);
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
  } else if (e.key === "Tab") {
    close();
  }
}

onBeforeUnmount(() => listen(false));
</script>

<template>
  <div ref="root" class="relative" v-bind="$attrs" @keydown="onKeydown">
    <AzButton :variant="variant" :size="label ? 'md' : 'sm'" :loading="busy" aria-haspopup="menu" :aria-expanded="open"
      :aria-label="ariaLabel || undefined" :class="label ? '' : '!px-2.5'" @click="toggle">
      <template #icon><slot name="icon" /></template>
      <template v-if="label">
        {{ label }}
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
    </AzButton>
    <Teleport to="body">
      <div v-if="open" ref="list" role="menu" :style="position" @keydown="onKeydown"
        class="fixed z-[1050] min-w-[12rem] overflow-hidden rounded-control border border-line bg-surface py-1 shadow-pop">
        <button v-for="item in items" :key="item.label" type="button" role="menuitem"
          class="flex min-h-[44px] w-full items-center gap-3 px-4 text-left text-[15px] text-ink-2 hover:bg-surface-2 hover:text-ink focus:bg-surface-2 focus:outline-none"
          @click="select(item)">
          <component :is="item.icon" v-if="item.icon" class="h-4 w-4 text-ink-muted" aria-hidden="true" />
          {{ item.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
