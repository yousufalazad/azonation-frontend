// helpers/sanitizeHtml.js
// One place to clean user-written HTML (rich text from the editor) before it is shown.
import DOMPurify from "dompurify";

// Links that open a new tab must not give the new page access to this one.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

const BASE_CONFIG = {
  USE_PROFILES: { html: true },
  // Inline style attributes are kept so editor formatting (colours, alignment) survives.
  FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
};

export function sanitizeHtml(html, config = {}) {
  if (html === null || html === undefined) return "";
  return DOMPurify.sanitize(String(html), { ...BASE_CONFIG, ...config });
}

// v-safe-html: drop-in replacement for v-html that always sanitizes.
// Usage: <div v-safe-html="record.description || 'N/A'"></div>
const render = (el, { value, oldValue }) => {
  if (value === oldValue && el.innerHTML) return;
  el.innerHTML = sanitizeHtml(value);
};

export const vSafeHtml = {
  mounted: render,
  updated: render,
};
