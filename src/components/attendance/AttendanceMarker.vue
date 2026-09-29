<script setup>
// One person's attendance in a list: "how" chips (In Person, Online...) and a small status chip
// (Present ▾) that opens Late, Left Early, Absent, Excused... Tap the selected "how" again to unmark.
// mark: { type, status } — changed in place through the `options` helpers (useAttendanceOptions).
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { X } from "lucide-vue-next";

const props = defineProps({
  mark: { type: Object, required: true },
  options: { type: Object, required: true }, // return value of useAttendanceOptions()
  name: { type: String, default: "" }, // person's name, for screen readers
});

const { t } = useI18n();
const o = props.options;

const marked = computed(() => !!props.mark.status);
const attended = computed(() => marked.value && o.isAttended(props.mark.status));

const statusLabel = computed(() => (marked.value ? o.statusById(props.mark.status)?.name ?? "—" : t("attendance.notMarked")));
const statusTone = computed(() => {
  if (!marked.value) return "muted";
  if (!attended.value) return "danger";
  return String(props.mark.status) === String(o.defaultStatus.value?.id) ? "default" : "warning";
});

const statusItems = computed(() => [
  ...o.attendedStatuses.value.map((s) => ({
    label: s.name,
    checked: String(props.mark.status) === String(s.id),
    onSelect: () => o.chooseStatus(props.mark, s.id),
  })),
  ...o.missedStatuses.value.map((s, i) => ({
    label: s.name,
    checked: String(props.mark.status) === String(s.id),
    separatorBefore: i === 0,
    onSelect: () => o.chooseStatus(props.mark, s.id),
  })),
]);

function tapType(typeId) {
  if (String(props.mark.type) === String(typeId)) o.clearMark(props.mark);
  else o.chooseType(props.mark, typeId);
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="contents" role="radiogroup" :aria-label="t('attendance.howFor', { name })">
      <button v-for="ty in o.types.value" :key="ty.id" type="button" role="radio" :aria-checked="String(mark.type) === String(ty.id)"
        class="min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        :class="String(mark.type) === String(ty.id)
          ? 'border-primary bg-primary-soft text-primary-soft-ink'
          : attended || !marked
            ? 'border-line bg-surface text-ink-2 hover:border-primary hover:text-primary'
            : 'border-line bg-surface text-ink-muted opacity-60 hover:border-primary hover:text-primary hover:opacity-100'"
        @click="tapType(ty.id)">
        {{ ty.name }}
      </button>
    </div>
    <AzMenu chip align="left" :chip-tone="statusTone" :label="statusLabel" :items="statusItems"
      :aria-label="t('attendance.statusFor', { name, status: statusLabel })" />
    <button v-if="marked" type="button" class="grid h-10 w-10 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
      :aria-label="t('attendance.clear', { name })" @click="o.clearMark(mark)">
      <X class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
</template>
