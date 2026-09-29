<script setup>
// Formatted text box (bold, lists, links...). v-model is HTML.
// The editor (Quill) loads only when this box is shown, so other pages stay light.
// What people type is cleaned (DOMPurify) when it comes in and when it is shown elsewhere (v-safe-html).
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { richTextHtml, sanitizeHtml } from "@/helpers/sanitizeHtml";

const props = defineProps({
  label: { type: String, default: "" },
  help: { type: String, default: "" },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
  minHeight: { type: String, default: "10rem" },
});
const model = defineModel({ type: String, default: "" });

const host = ref(null);
const loading = ref(true);
let quill = null;
let lastHtml = "";

// Plain text from older records keeps its line breaks
const toHtml = richTextHtml;

onMounted(async () => {
  const [{ default: Quill }] = await Promise.all([import("quill"), import("quill/dist/quill.snow.css")]);
  quill = new Quill(host.value, {
    theme: "snow",
    placeholder: props.placeholder,
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "blockquote"],
        ["clean"],
      ],
    },
  });
  const initial = toHtml(model.value);
  if (initial) quill.clipboard.dangerouslyPasteHTML(initial, "silent");
  lastHtml = model.value;
  quill.on("text-change", () => {
    // Quill's export writes every space as &nbsp;, which stops text wrapping on phones
    const html = quill.getText().trim() ? sanitizeHtml(quill.getSemanticHTML().replace(/&nbsp;/g, " ")) : "";
    lastHtml = html;
    model.value = html;
  });
  // Label the typing area for screen readers
  const editor = host.value.querySelector(".ql-editor");
  editor?.setAttribute("aria-label", props.label);
  editor?.setAttribute("aria-multiline", "true");
  editor?.setAttribute("role", "textbox");
  loading.value = false;
});

// A new record loaded into the form (e.g. opening "Edit" for another committee)
watch(model, (v) => {
  if (!quill || v === lastHtml) return;
  lastHtml = v;
  quill.setContents([], "silent");
  const html = toHtml(v);
  if (html) quill.clipboard.dangerouslyPasteHTML(html, "silent");
});

onBeforeUnmount(() => {
  quill?.off("text-change");
  quill = null;
});
</script>

<template>
  <AzField :label="label" :help="help" :error="error" :required="required">
    <template #default>
      <div class="az-rich overflow-hidden rounded-control border bg-surface"
        :class="error ? 'border-danger' : 'border-line focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30'">
        <div v-if="loading" class="animate-pulse bg-surface-2" :style="{ minHeight }" />
        <div ref="host" :style="{ minHeight }" />
      </div>
    </template>
  </AzField>
</template>

<style>
/* Quill's default look, adjusted to Azonation colours and dark mode */
.az-rich .ql-toolbar.ql-snow { border: 0; border-bottom: 1px solid rgb(var(--az-line)); background: rgb(var(--az-surface-2)); }
.az-rich .ql-container.ql-snow { border: 0; font-family: inherit; font-size: 15px; }
.az-rich .ql-editor { min-height: inherit; color: rgb(var(--az-ink)); line-height: 1.6; }
.az-rich .ql-editor.ql-blank::before { color: rgb(var(--az-muted)); font-style: normal; }
.az-rich .ql-snow .ql-stroke { stroke: rgb(var(--az-ink-2)); }
.az-rich .ql-snow .ql-fill { fill: rgb(var(--az-ink-2)); }
.az-rich .ql-snow .ql-picker { color: rgb(var(--az-ink-2)); }
.az-rich .ql-snow .ql-picker-options { background: rgb(var(--az-surface)); border-color: rgb(var(--az-line)); }
.az-rich .ql-snow button:hover .ql-stroke, .az-rich .ql-snow button.ql-active .ql-stroke { stroke: rgb(var(--az-primary)); }
.az-rich .ql-snow button:hover .ql-fill, .az-rich .ql-snow button.ql-active .ql-fill { fill: rgb(var(--az-primary)); }
.az-rich .ql-snow .ql-tooltip { background: rgb(var(--az-surface)); border-color: rgb(var(--az-line)); color: rgb(var(--az-ink)); box-shadow: none; z-index: 10; }
.az-rich .ql-snow .ql-tooltip input[type="text"] { background: rgb(var(--az-surface)); color: rgb(var(--az-ink)); border-color: rgb(var(--az-line)); }
</style>
