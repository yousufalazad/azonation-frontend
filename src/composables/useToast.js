// composables/useToast.js
// Small non-blocking messages ("Member saved"). Shown by <AzToastHost> in App.vue.
//   const toast = useToast();
//   toast.success("Member saved");
//   toast.error("Could not save. Check your internet connection and try again.");
import { reactive } from "vue";

const state = reactive({ items: [] });
let nextId = 1;

function push(tone, message, { title = "", timeout } = {}) {
  const id = nextId++;
  // Errors stay a little longer so people have time to read them
  const ms = timeout ?? (tone === "error" ? 7000 : 4000);
  state.items.push({ id, tone, title, message });
  if (ms > 0) setTimeout(() => dismiss(id), ms);
  return id;
}

function dismiss(id) {
  const i = state.items.findIndex((t) => t.id === id);
  if (i !== -1) state.items.splice(i, 1);
}

const api = {
  success: (message, opts) => push("success", message, opts),
  error: (message, opts) => push("error", message, opts),
  warning: (message, opts) => push("warning", message, opts),
  info: (message, opts) => push("info", message, opts),
  dismiss,
};

export function useToast() {
  return api;
}

export const toastState = state;
