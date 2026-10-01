// Attendance has two parts, shared by meetings, events and anything else people attend:
//  - type:   how someone took part (In Person, Online, Phone...)      /api/attendance-types
//  - status: what happened (Present, Late, Absent, Excused...)        /api/attendance-statuses
// Statuses with is_attended = false (Absent, Excused...) have no type.
// "Not marked" is never stored: it simply means there is no record yet.
import { computed, ref } from "vue";
import { authStore } from "@/store/authStore";

const isOn = (v) => !(v === 0 || v === "0" || v === false);

export function useAttendanceOptions() {
  const types = ref([]);
  const statuses = ref([]);

  async function loadOptions() {
    const [t, s] = await Promise.all([
      authStore.fetchProtectedApi("/api/attendance-types", {}, "GET"),
      authStore.fetchProtectedApi("/api/attendance-statuses", {}, "GET"),
    ]);
    types.value = (t?.status ? t.data : []).filter((x) => isOn(x.is_active));
    statuses.value = (s?.status ? s.data : [])
      .filter((x) => isOn(x.is_active))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
  }

  const attendedStatuses = computed(() => statuses.value.filter((s) => isOn(s.is_attended)));
  const missedStatuses = computed(() => statuses.value.filter((s) => !isOn(s.is_attended)));
  // Picking a type marks the person with this status ("Present")
  const defaultStatus = computed(() => attendedStatuses.value[0] ?? null);

  const statusById = (id) => statuses.value.find((s) => String(s.id) === String(id)) ?? null;
  const typeById = (id) => types.value.find((t) => String(t.id) === String(id)) ?? null;
  const isAttended = (statusId) => {
    const s = statusById(statusId);
    return s ? isOn(s.is_attended) : false;
  };

  /**
   * Apply a choice to a mark ({ type, status }) and keep it consistent:
   *  - choosing a type sets status to the default (Present) unless an "attended" status is already set
   *  - choosing an attended status without a type uses the first type (In Person)
   *  - choosing a missed status (Absent...) clears the type
   */
  function chooseType(mark, typeId) {
    mark.type = typeId;
    if (!mark.status || !isAttended(mark.status)) mark.status = defaultStatus.value?.id ?? null;
  }
  function chooseStatus(mark, statusId) {
    mark.status = statusId;
    if (isAttended(statusId)) {
      if (!mark.type) mark.type = types.value[0]?.id ?? null;
    } else {
      mark.type = null;
    }
  }
  function clearMark(mark) {
    mark.type = null;
    mark.status = null;
  }

  return {
    types, statuses, attendedStatuses, missedStatuses, defaultStatus,
    loadOptions, statusById, typeById, isAttended, chooseType, chooseStatus, clearMark,
  };
}
