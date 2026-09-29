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

// Returns the URL only if it is a safe web link (http/https), otherwise undefined.
// Use for links typed in by users, e.g. :href="safeUrl(record.video_link)".
export function safeUrl(url) {
  if (typeof url !== "string") return undefined;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
}

// Text saved straight from the Quill editor keeps bullet lists as <ol><li data-list="bullet">,
// which shows as a numbered list anywhere else. Turn those into real <ul> lists.
function fromQuillLists(html) {
  if (!html.includes("data-list")) return html;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  root.querySelectorAll("span.ql-ui").forEach((el) => el.remove());
  root.querySelectorAll("ol").forEach((ol) => {
    const items = [...ol.children];
    if (!items.length || !items.every((li) => li.getAttribute("data-list") === "bullet")) return;
    const ul = doc.createElement("ul");
    items.forEach((li) => {
      li.removeAttribute("data-list");
      ul.appendChild(li);
    });
    ol.replaceWith(ul);
  });
  root.querySelectorAll("li[data-list]").forEach((li) => li.removeAttribute("data-list"));
  return root.innerHTML;
}

// Formatted text for display: HTML is cleaned; plain text (older records) keeps its line breaks.
export function richTextHtml(value) {
  const s = String(value ?? "");
  // Older forms saved the word "null" in empty fields
  if (!s.trim() || s === "null" || s === "undefined") return "";
  if (/<[a-z][\s\S]*>/i.test(s)) return fromQuillLists(sanitizeHtml(s));
  const escape = (line) => line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return s.split(/\n/).map((line) => `<p>${escape(line) || "<br>"}</p>`).join("");
}
