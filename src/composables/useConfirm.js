// composables/useConfirm.js
// Promise-based confirmation dialog, shown by <AzConfirmHost> in App.vue.
//   const confirm = useConfirm();
//   if (await confirm({
//     title: "Remove Kamal Hossain?",
//     message: "He will lose access to the club. This can't be undone.",
//     confirmText: "Remove member",
//     danger: true,
//   })) { ... }
import { reactive } from "vue";

const state = reactive({
  open: false,
  title: "",
  message: "",
  confirmText: "",
  cancelText: "",
  danger: false,
  resolve: null,
});

function ask(options = {}) {
  // A new question replaces an unanswered one (treated as "cancel")
  state.resolve?.(false);
  Object.assign(state, {
    open: true,
    title: options.title || "",
    message: options.message || "",
    confirmText: options.confirmText || "",
    cancelText: options.cancelText || "",
    danger: !!options.danger,
  });
  return new Promise((resolve) => {
    state.resolve = resolve;
  });
}

function answer(value) {
  const resolve = state.resolve;
  state.resolve = null;
  state.open = false;
  resolve?.(value);
}

export function useConfirm() {
  return ask;
}

export const confirmState = state;
export const answerConfirm = answer;
