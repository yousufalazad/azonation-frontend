// composables/useListView.js
// Search, filters, sorting, paging and column choice for list pages.
// Column choice and page size are remembered per list in this browser.
//
//   const list = useListView({
//     key: "members",                                   // storage prefix, unique per page
//     items: memberList,                                // ref([...])
//     columns: allColumns,                              // computed([{ key, label, sortable?, sortValue? }])
//     presets: { detailed: [...keys], minimal: [...keys] },
//     searchText: (row) => [row.full_name, row.email],  // what the search box looks at
//     filter: (row) => true,                            // extra filters (optional)
//     filterDeps: [typeFilter, statusFilter],           // refs that should reset to page 1
//     defaultSort: "full_name",
//   });
import { computed, ref, watch } from "vue";

function readSaved(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: the choice lasts for this visit
  }
}

export function useListView({
  key,
  items,
  columns,
  presets = {},
  searchText = () => [],
  filter = () => true,
  filterDeps = [],
  defaultSort = "",
  defaultDir = "asc",
}) {
  /* ---------- columns ---------- */
  const presetNames = Object.keys(presets);
  const firstPreset = presetNames[0] || "";
  const columnPreset = ref(readSaved(`${key}_column_preset`, firstPreset));
  const allKeys = () => columns.value.map((c) => c.key);
  const visibleKeys = ref(readSaved(`${key}_visible_columns`, presets[columnPreset.value] || allKeys()));

  watch(columnPreset, (v) => save(`${key}_column_preset`, v));
  watch(visibleKeys, (v) => save(`${key}_visible_columns`, v), { deep: true });

  const applyPreset = (name) => {
    columnPreset.value = name;
    visibleKeys.value = [...(presets[name] || allKeys())];
  };
  const presetModel = computed({ get: () => columnPreset.value, set: applyPreset });
  const visibleColumns = computed(() => columns.value.filter((c) => visibleKeys.value.includes(c.key)));

  /* ---------- search + filters ---------- */
  const search = ref("");
  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase();
    return (items.value || []).filter((row) => {
      if (q) {
        const text = searchText(row).filter((v) => v !== null && v !== undefined).join(" ").toLowerCase();
        if (!text.includes(q)) return false;
      }
      return filter(row);
    });
  });

  /* ---------- sorting ---------- */
  const sortKey = ref(defaultSort);
  const sortDir = ref(defaultDir);
  const valueFor = (row, k) => {
    const col = columns.value.find((c) => c.key === k);
    if (col?.sortValue) return col.sortValue(row);
    return k.split(".").reduce((o, part) => (o == null ? undefined : o[part]), row);
  };
  const sorted = computed(() => {
    if (!sortKey.value) return filtered.value;
    const dir = sortDir.value === "asc" ? 1 : -1;
    return [...filtered.value].sort((a, b) => {
      const x = valueFor(a, sortKey.value);
      const y = valueFor(b, sortKey.value);
      const xEmpty = x === null || x === undefined || x === "";
      const yEmpty = y === null || y === undefined || y === "";
      if (xEmpty && yEmpty) return 0;
      if (xEmpty) return 1; // empty values always last
      if (yEmpty) return -1;
      return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: "base" }) * dir;
    });
  });
  const sortBy = (k) => {
    if (sortKey.value === k) sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    else {
      sortKey.value = k;
      sortDir.value = "asc";
    }
  };
  const ariaSort = (k) => (sortKey.value === k ? (sortDir.value === "asc" ? "ascending" : "descending") : "none");

  /* ---------- paging ---------- */
  const page = ref(1);
  const pageSize = ref(readSaved(`${key}_page_size`, 10));
  watch(pageSize, (v) => save(`${key}_page_size`, v));
  // Anything that changes what is listed starts again at page 1
  watch([search, sortKey, sortDir, ...filterDeps], () => (page.value = 1));
  // Stay on a real page when the list shrinks (e.g. after deleting)
  watch(
    () => sorted.value.length,
    (n) => {
      const last = Math.max(1, Math.ceil(n / pageSize.value));
      if (page.value > last) page.value = last;
    },
  );
  const paged = computed(() => sorted.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));

  return {
    search,
    filtered,
    sorted,
    paged,
    sortKey,
    sortDir,
    sortBy,
    ariaSort,
    page,
    pageSize,
    columnPreset,
    presetModel,
    applyPreset,
    visibleKeys,
    visibleColumns,
  };
}
