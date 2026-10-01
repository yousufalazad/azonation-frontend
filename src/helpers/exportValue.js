// helpers/exportValue.js
// Reads one cell for an export. A column's `value` can be a function (row => text),
// a dotted path ("membership_type.name") or a plain key.
export function cellValue(row, header) {
  const key = header?.value;
  let v;
  if (typeof key === "function") {
    try {
      v = key(row);
    } catch {
      v = "";
    }
  } else if (typeof key === "string" && key.includes(".")) {
    v = key.split(".").reduce((obj, part) => (obj == null ? undefined : obj[part]), row);
  } else {
    v = row?.[key] ?? row?.[header?.text];
  }
  if (v === null || v === undefined) return "";
  return typeof v === "object" ? JSON.stringify(v) : v;
}
