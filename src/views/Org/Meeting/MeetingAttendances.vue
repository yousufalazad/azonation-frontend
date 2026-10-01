<!-- Who came to a meeting (the list itself is shared with events: AttendanceChecklist) -->
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

const meetingId = computed(() => route.params.id);
const meeting = ref(null);

const whenText = computed(() => {
  const m = meeting.value;
  if (!m) return "";
  const date = m.date ? formatDate(m.date) : t("meetings.noDate");
  return m.start_time ? `${date} · ${dayjs(`2000-01-01 ${m.start_time}`).format("h:mm A")}` : date;
});

onMounted(async () => {
  const res = await authStore.fetchProtectedApi(`/api/meetings/${meetingId.value}`, {}, "GET");
  meeting.value = res?.status ? res.data : null;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 pb-24">
    <AzPageHeader :title="t('attendance.title')" :description="meeting ? `${meeting.name} — ${whenText}` : ''"
      :back="{ name: 'view-meeting', params: { id: meetingId } }" :back-label="meeting?.name || t('meetings.title')">
      <AzButton variant="secondary" :to="{ name: 'meeting-guest-attendance', params: { id: meetingId } }">
        <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
        {{ t('meetings.guests') }}
      </AzButton>
    </AzPageHeader>

    <AttendanceChecklist :key="meetingId" endpoint="/api/meeting-attendances" parent-key="meeting_id" :parent-id="meetingId" />
  </div>
</template>
