// helpers/download.js
// Small, dependency-free helpers for giving the user a file.

// Saves a Blob as a file download.
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Cells that start with these characters are run as formulas by Excel/Sheets.
// Prefixing them with an apostrophe stops "CSV injection" from user-entered data.
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value) {
  if (value === null || value === undefined) return "";
  let text = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (FORMULA_START.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// rows: array of arrays -> CSV text (with BOM so Excel reads UTF-8, e.g. Bangla, correctly)
export function toCsv(rows) {
  return "﻿" + rows.map((row) => (row || []).map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(rows, fileName) {
  const safeName = /\.csv$/i.test(fileName) ? fileName : `${fileName}.csv`;
  downloadBlob(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }), safeName);
}
