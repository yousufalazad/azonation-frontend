<script setup>
// Table on tablets/desktops, tappable list on phones.
//   <AzDataTable :columns="list.visibleColumns.value" :rows="list.paged.value" row-key="id"
//     :sort-key="list.sortKey.value" :sort-dir="list.sortDir.value" @sort="list.sortBy" @row-click="open">
//     <template #cell-status="{ row }">...</template>   custom cell for column "status"
//     <template #actions="{ row }">...</template>        last column (desktop)
//     <template #mobile="{ row }">...</template>         content of one phone row
//   </AzDataTable>
// Columns: { key, label, sortable?, value?: (row) => text, class?, hideLabel? }
import { ChevronUp, ChevronDown } from "lucide-vue-next";

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: String, default: "id" },
  sortKey: { type: String, default: "" },
  sortDir: { type: String, default: "asc" },
  actionsLabel: { type: String, default: "" },
});

const emit = defineEmits(["sort", "row-click"]);

const cellText = (row, col) => {
  const v = col.value ? col.value(row) : col.key.split(".").reduce((o, p) => (o == null ? undefined : o[p]), row);
  return v === null || v === undefined || v === "" ? "—" : v;
};
const ariaSort = (col) =>
  col.sortable ? (props.sortKey === col.key ? (props.sortDir === "asc" ? "ascending" : "descending") : "none") : undefined;
</script>

<template>
  <div>
    <!-- Phones -->
    <ul class="divide-y divide-line md:hidden">
      <li v-for="row in rows" :key="row[rowKey]">
        <button type="button" class="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-surface-2"
          @click="emit('row-click', row)">
          <slot name="mobile" :row="row" />
        </button>
      </li>
    </ul>

    <!-- Tablets and desktops -->
    <div class="hidden overflow-x-auto md:block">
      <table class="az-table min-w-full">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" scope="col" :aria-sort="ariaSort(col)">
              <span v-if="col.hideLabel" class="sr-only">{{ col.label }}</span>
              <button v-else-if="col.sortable" type="button" class="inline-flex items-center gap-1 uppercase hover:text-ink"
                :aria-label="$t('list.sortBy', { column: col.label })" @click="emit('sort', col.key)">
                {{ col.label }}
                <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" class="h-3.5 w-3.5" aria-hidden="true" />
                <ChevronDown v-else-if="sortKey === col.key" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
            <th v-if="$slots.actions" scope="col"><span class="sr-only">{{ actionsLabel || $t('common.actions') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row[rowKey]">
            <td v-for="col in columns" :key="col.key" :class="col.class">
              <slot :name="`cell-${col.key}`" :row="row">
                <span class="whitespace-nowrap tabular-nums">{{ cellText(row, col) }}</span>
              </slot>
            </td>
            <td v-if="$slots.actions" class="text-right">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
