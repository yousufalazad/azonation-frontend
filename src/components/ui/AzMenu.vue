<script setup>
// A button that opens a short list of actions (e.g. Export: CSV, Excel, PDF, Word).
// items: [{ label, onSelect, icon?, checked?, separatorBefore? }]. Closes on selection, outside click, Esc and scroll.
// - Icon-only button (e.g. "more" on a table row): leave `label` empty and set `ariaLabel`.
// - Choice menu (pick one option): give items `checked` (true on the current one) and set `chip`
//   for a compact rounded trigger; the current option shows a check mark.
// The list is placed on the page body so scrolling tables and cards cannot clip it.
import { computed, nextTick, onBeforeUnmount, ref } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  label: { type: String, default: "" },
  ariaLabel: { type: String, default: "" },
  items: { type: Array, required: true },
  variant: { type: String, default: "secondary" },
  align: { type: String, default: "right" }, // right | left
  chip: { type: Boolean, default: false }, // small rounded trigger, for choosing a value in a row
  chipTone: { type: String, default: "default" }, // default | muted | warning | danger
});

const open = ref(false);
const root = ref(null);
const list = ref(null);
const busy = ref(false);
const position = ref({});

const isChoice = computed(() => props.items.some((i) => typeof i.checked === "boolean"));

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
  // Start on the current choice, if there is one
  (list.value?.querySelector("[aria-checked='true']") || list.value?.querySelector("button"))?.focus();
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

const CHIP_TONES = {
  default: "border-line bg-surface text-ink-2 hover:border-primary hover:text-primary",
  muted: "border-dashed border-line bg-transparent text-ink-muted hover:border-primary hover:text-primary",
  warning: "border-warning/40 bg-warning-soft text-ink hover:border-warning",
  danger: "border-danger/30 bg-danger-soft text-danger hover:border-danger",
};
</script>

<template>
  <!-- No positioning here: the list is placed on the page body, and pages may position the button (e.g. absolute) -->
  <div ref="root" v-bind="$attrs" @keydown="onKeydown">
    <button v-if="chip" type="button" aria-haspopup="menu" :aria-expanded="open" :aria-label="ariaLabel || undefined"
      class="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      :class="CHIP_TONES[chipTone] || CHIP_TONES.default" @click="toggle">
      <slot name="icon" />
      {{ label }}
      <svg class="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <AzButton v-else :variant="variant" :size="label ? 'md' : 'sm'" :loading="busy" aria-haspopup="menu" :aria-expanded="open"
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
        class="fixed z-[1050] min-w-[12rem] overflow-hidden rounded-control border border-line bg-surface p-1 shadow-pop">
        <template v-for="item in items" :key="item.label">
          <div v-if="item.separatorBefore" class="my-1 border-t border-line" role="separator" />
          <button type="button" :role="isChoice ? 'menuitemradio' : 'menuitem'" :aria-checked="isChoice ? !!item.checked : undefined"
            class="flex min-h-[44px] w-full items-center gap-3 rounded-md px-3 text-left text-[15px] text-ink-2 hover:bg-surface-2 hover:text-ink focus:bg-surface-2 focus:outline-none"
            :class="item.checked ? 'bg-surface-2 font-semibold text-ink' : ''"
            @click="select(item)">
            <component :is="item.icon" v-if="item.icon" class="h-4 w-4 text-ink-muted" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
            <svg v-if="item.checked" class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </template>
      </div>
    </Teleport>
  </div>
</template>
