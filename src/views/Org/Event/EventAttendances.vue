<!-- Who came to an event (the list itself is shared with meetings: AttendanceChecklist) -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import AttendanceChecklist from "@/components/attendance/AttendanceChecklist.vue";
import { UserPlus } from "lucide-vue-next";

const route = useRoute();
const { t } = useI18n();

const eventId = computed(() => route.params.id);
const event = ref(null);

const whenText = computed(() => {
  const e = event.value;
  if (!e) return "";
  const date = e.date ? formatDate(e.date) : t("meetings.noDate");
  return e.time ? `${date} · ${dayjs(`2000-01-01 ${e.time}`).format("h:mm A")}` : date;
});

onMounted(async () => {
  const res = await authStore.fetchProtectedApi(`/api/events/event/${eventId.value}`, {}, "GET");
  event.value = res?.status ? res.data : null;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 pb-24">
    <AzPageHeader :title="t('attendance.title')" :description="event ? `${event.name} — ${whenText}` : ''"
      :back="{ name: 'view-event', params: { id: eventId } }" :back-label="event?.name || t('events.title')">
      <AzButton variant="secondary" :to="{ name: 'event-guest-attendance', params: { id: eventId } }">
        <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
        {{ t('meetings.guests') }}
      </AzButton>
    </AzPageHeader>

    <AttendanceChecklist :key="eventId" endpoint="/api/event-attendances" parent-key="event_id" :parent-id="eventId" />
  </div>
</template>
