// Generates src/assets/css/dark-bridge.css from Tailwind's default palette.
// Run: npm run gen:dark-bridge
const path = require("path");
const root = process.argv[2] || path.resolve(__dirname, "..");
const colors = require(path.join(root, "node_modules/tailwindcss/colors"));

const esc = (c) => c.replace(/:/g, "\\:").replace(/\//g, "\\/").replace(/\./g, "\\.");
const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(" ");
};
const rules = [];
const add = (classes, decl, pseudo = "") => {
  const sel = classes.map((c) => `.dark .${esc(c)}${pseudo}`).join(",\n");
  rules.push(`${sel} {\n  ${decl};\n}`);
};

// ---- Neutrals -> tokens
add(["bg-white"], "background-color: rgb(var(--az-surface))");
add(["bg-gray-50", "bg-slate-50"], "background-color: rgb(var(--az-surface-2))");
add(["bg-gray-100", "bg-slate-100"], "background-color: rgb(var(--az-surface-2))");
add(["bg-gray-200", "bg-slate-200"], "background-color: rgb(var(--az-line))");
add(["bg-gray-300"], "background-color: rgb(var(--az-line-strong))");
add(["hover:bg-white", "hover:bg-gray-50", "hover:bg-gray-100", "hover:bg-slate-50", "hover:bg-slate-100"], "background-color: rgb(var(--az-surface-2))", ":hover");
add(["hover:bg-gray-200", "hover:bg-slate-200"], "background-color: rgb(var(--az-line))", ":hover");

add(["text-black", "text-gray-900", "text-gray-800", "text-slate-900", "text-slate-800"], "color: rgb(var(--az-ink))");
add(["text-gray-700", "text-gray-600", "text-slate-700", "text-slate-600"], "color: rgb(var(--az-ink-2))");
add(["text-gray-500", "text-gray-400", "text-slate-500", "text-slate-400"], "color: rgb(var(--az-muted))");
add(["hover:text-gray-900", "hover:text-gray-800", "hover:text-black"], "color: rgb(var(--az-ink))", ":hover");

add(["border-gray-100", "border-gray-200", "border-slate-100", "border-slate-200"], "border-color: rgb(var(--az-line))");
add(["border-gray-300", "border-gray-400", "border-slate-300"], "border-color: rgb(var(--az-line-strong))");
// Default border colour (zero specificity, so explicit border-* classes still win)
rules.push(`:where(.dark) *,
:where(.dark) ::before,
:where(.dark) ::after {
  border-color: rgb(var(--az-line));
}`);
rules.push(`.dark .divide-gray-100 > :not([hidden]) ~ :not([hidden]),
.dark .divide-gray-200 > :not([hidden]) ~ :not([hidden]),
.dark .divide-y > :not([hidden]) ~ :not([hidden]) {
  border-color: rgb(var(--az-line));
}`);

// ---- Tinted backgrounds and coloured text
const hues = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];
for (const hue of hues) {
  const p = colors[hue];
  add([`bg-${hue}-50`], `background-color: rgb(${hexToRgb(p[400])} / 0.12)`);
  add([`bg-${hue}-100`], `background-color: rgb(${hexToRgb(p[400])} / 0.18)`);
  add([`bg-${hue}-200`], `background-color: rgb(${hexToRgb(p[400])} / 0.26)`);
  add([`hover:bg-${hue}-50`, `hover:bg-${hue}-100`], `background-color: rgb(${hexToRgb(p[400])} / 0.2)`, ":hover");
  add([`text-${hue}-600`, `text-${hue}-700`, `text-${hue}-800`, `text-${hue}-900`], `color: ${p[300]}`);
  add([`border-${hue}-100`, `border-${hue}-200`, `border-${hue}-300`], `border-color: rgb(${hexToRgb(p[400])} / 0.35)`);
}

const header = `/* Dark mode bridge (generated: do not edit by hand)
   Maps the Tailwind colour classes used by existing screens onto the
   Azonation dark tokens, so every page works in dark mode before it is
   rebuilt with the shared components. New code should use the semantic
   tokens (bg-surface, text-ink, border-line, ...) instead. */
`;

const extra = `
/* ---- Form controls without explicit colours */
.dark input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
.dark select,
.dark textarea {
  background-color: rgb(var(--az-surface));
  color: rgb(var(--az-ink));
  border-color: rgb(var(--az-line-strong));
}
.dark input::placeholder,
.dark textarea::placeholder {
  color: rgb(var(--az-muted));
}

/* ---- Global table styles from style.css */
.dark table:not(.az-table) thead tr th {
  color: rgb(var(--az-ink-2)) !important;
  background-color: rgb(var(--az-surface)) !important;
  border-bottom-color: rgb(var(--az-line)) !important;
}
.dark table:not(.az-table) tbody tr td {
  color: rgb(var(--az-ink-2));
  border-bottom-color: rgb(var(--az-line)) !important;
}
.dark table:not(.az-table) tbody tr:hover {
  background-color: rgb(var(--az-surface-2)) !important;
}
.dark table:not(.az-table) tbody tr:hover td {
  color: rgb(var(--az-ink)) !important;
}

/* ---- vue3-easy-data-table */
.dark .vue3-easy-data-table {
  --easy-table-border: 1px solid rgb(var(--az-line));
  --easy-table-row-border: 1px solid rgb(var(--az-line));
  --easy-table-header-background-color: rgb(var(--az-surface));
  --easy-table-header-font-color: rgb(var(--az-ink-2));
  --easy-table-body-row-background-color: rgb(var(--az-surface));
  --easy-table-body-row-font-color: rgb(var(--az-ink-2));
  --easy-table-body-even-row-background-color: rgb(var(--az-surface));
  --easy-table-body-even-row-font-color: rgb(var(--az-ink-2));
  --easy-table-body-row-hover-background-color: rgb(var(--az-surface-2));
  --easy-table-body-row-hover-font-color: rgb(var(--az-ink));
  --easy-table-footer-background-color: rgb(var(--az-surface));
  --easy-table-footer-font-color: rgb(var(--az-ink-2));
  --easy-table-message-font-color: rgb(var(--az-muted));
  --easy-table-loading-mask-background-color: rgb(var(--az-surface));
  --easy-table-scrollbar-track-color: rgb(var(--az-surface));
  --easy-table-scrollbar-color: rgb(var(--az-surface));
  --easy-table-scrollbar-thumb-color: rgb(var(--az-line-strong));
  --easy-table-scrollbar-corner-color: rgb(var(--az-surface));
  --easy-table-buttons-pagination-border: 1px solid rgb(var(--az-line));
}

/* ---- SweetAlert2 dialogs */
.dark .swal2-popup {
  background: rgb(var(--az-surface));
  color: rgb(var(--az-ink-2));
}
.dark .swal2-title {
  color: rgb(var(--az-ink));
}
.dark .swal2-html-container {
  color: rgb(var(--az-ink-2));
}
.dark .swal2-input,
.dark .swal2-textarea,
.dark .swal2-select {
  background: rgb(var(--az-surface-2));
  color: rgb(var(--az-ink));
  border-color: rgb(var(--az-line-strong));
}

/* ---- Quill rich-text editor */
.dark .ql-toolbar.ql-snow,
.dark .ql-container.ql-snow {
  border-color: rgb(var(--az-line-strong));
}
.dark .ql-snow .ql-stroke {
  stroke: rgb(var(--az-ink-2));
}
.dark .ql-snow .ql-fill {
  fill: rgb(var(--az-ink-2));
}
.dark .ql-snow .ql-picker {
  color: rgb(var(--az-ink-2));
}
.dark .ql-snow .ql-picker-options {
  background-color: rgb(var(--az-surface));
}
.dark .ql-editor.ql-blank::before {
  color: rgb(var(--az-muted));
}

/* ---- Rich text shown with the typography plugin */
.dark .prose {
  --tw-prose-body: rgb(var(--az-ink-2));
  --tw-prose-headings: rgb(var(--az-ink));
  --tw-prose-bold: rgb(var(--az-ink));
  --tw-prose-links: rgb(var(--az-primary));
  --tw-prose-bullets: rgb(var(--az-muted));
  --tw-prose-counters: rgb(var(--az-muted));
  --tw-prose-quotes: rgb(var(--az-ink-2));
  --tw-prose-hr: rgb(var(--az-line));
}
`;

require("fs").writeFileSync(
  path.join(root, "src/assets/css/dark-bridge.css"),
  header + "\n" + rules.join("\n\n") + "\n" + extra,
);
console.log("rules:", rules.length);
