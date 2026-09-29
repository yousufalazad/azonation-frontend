<script setup>
// Accessible dialog: Esc and the backdrop close it, focus moves inside and
// returns afterwards, page scrolling is locked. Full-screen sheet on phones.
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const open = defineModel("open", { type: Boolean, default: false });

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  size: { type: String, default: "md" }, // sm | md | lg
  dismissible: { type: Boolean, default: true },
});

const emit = defineEmits(["close"]);

const panel = ref(null);
let lastFocused = null;

const SIZES = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-3xl" };
const titleId = `az-modal-${Math.random().toString(36).slice(2, 9)}`;

function close() {
  if (!props.dismissible) return;
  open.value = false;
  emit("close");
}

function focusable() {
  return panel.value
    ? [...panel.value.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    : [];
}

function onKeydown(e) {
  if (e.key === "Escape") {
    e.stopPropagation();
    close();
  } else if (e.key === "Tab") {
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

watch(
  open,
  async (isOpen) => {
    if (isOpen) {
      lastFocused = document.activeElement;
      document.body.style.overflow = "hidden";
      await nextTick();
      // Start on the field marked autofocus, else the first control below the title (not the close button)
      const items = focusable();
      (panel.value?.querySelector("[autofocus]") || items.find((el) => !el.closest("header")) || items[0] || panel.value)?.focus();
    } else {
      document.body.style.overflow = "";
      lastFocused?.focus?.();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0"
      enter-active-class="transition-opacity duration-150" leave-active-class="transition-opacity duration-150">
      <div v-if="open" class="fixed inset-0 z-[1000] flex items-end justify-center bg-overlay/50 sm:items-center sm:p-4"
        @mousedown.self="close" @keydown="onKeydown">
        <div ref="panel" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1"
          class="flex max-h-[92vh] w-full flex-col rounded-t-card bg-surface shadow-pop outline-none sm:rounded-card"
          :class="SIZES[size] || SIZES.md">
          <header class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div class="min-w-0">
              <h2 :id="titleId" class="text-lg font-semibold text-ink">{{ title }}</h2>
              <p v-if="description" class="mt-0.5 text-sm text-ink-muted">{{ description }}</p>
            </div>
            <button v-if="dismissible" type="button" class="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
              :aria-label="$t('common.close')" @click="close">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </header>
          <div class="overflow-y-auto px-5 py-4">
            <slot />
          </div>
          <footer v-if="$slots.footer"
            class="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
