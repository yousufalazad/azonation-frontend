<script setup>
// Renders toasts from useToast(). Mounted once in App.vue.
// Bottom of the screen on phones (thumb reach), top-right on desktop.
import { toastState, useToast } from "@/composables/useToast";

const { dismiss } = useToast();

const TONES = {
  success: { box: "border-success/40", icon: "text-success", path: "M20 6 9 17l-5-5" },
  error: { box: "border-danger/50", icon: "text-danger", path: "M12 8v5m0 3.5v.5M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" },
  warning: { box: "border-warning/50", icon: "text-warning", path: "M12 8v5m0 3.5v.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" },
  info: { box: "border-primary/40", icon: "text-primary", path: "M12 16v-5m0-3.5V7M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" },
};
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-[1100] flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:top-16 sm:items-end"
    aria-live="polite" aria-atomic="false">
    <TransitionGroup enter-from-class="translate-y-2 opacity-0" leave-to-class="opacity-0"
      enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-for="t in toastState.items" :key="t.id" :role="t.tone === 'error' ? 'alert' : 'status'"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-control border bg-surface p-4 shadow-pop"
        :class="(TONES[t.tone] || TONES.info).box">
        <svg class="mt-0.5 h-5 w-5 shrink-0" :class="(TONES[t.tone] || TONES.info).icon" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path :d="(TONES[t.tone] || TONES.info).path" />
        </svg>
        <div class="min-w-0 flex-1">
          <p v-if="t.title" class="text-[15px] font-semibold text-ink">{{ t.title }}</p>
          <p class="text-[15px] text-ink-2">{{ t.message }}</p>
        </div>
        <button type="button" class="-m-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2"
          :aria-label="$t('common.dismiss')" @click="dismiss(t.id)">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
