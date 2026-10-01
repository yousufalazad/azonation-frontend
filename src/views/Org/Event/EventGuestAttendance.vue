<!-- Guests at an event (the list itself is shared with meetings: GuestList) -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import GuestList from "@/components/attendance/GuestList.vue";
import { Users } from "lucide-vue-next";

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
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('guests.title')" :description="event ? `${event.name} — ${whenText}` : ''"
      :back="{ name: 'view-event', params: { id: eventId } }" :back-label="event?.name || t('events.title')">
      <AzButton variant="secondary" :to="{ name: 'event-attendances', params: { id: eventId } }">
        <template #icon><Users class="h-[18px] w-[18px]" /></template>
        {{ t('attendance.title') }}
      </AzButton>
    </AzPageHeader>

    <GuestList :key="eventId" endpoint="/api/event-guest-attendances" parent-key="event_id" :parent-id="eventId"
      :date="event?.date || ''" />
  </div>
</template>
