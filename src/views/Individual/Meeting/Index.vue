<!-- Meetings of your organisations: upcoming and past, with your attendance -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { shortDate } from "@/helpers/billing";
import { CalendarDays } from "lucide-vue-next";
import ActivityList from "../components/ActivityList.vue";

const auth = authStore;
const { t, locale } = useI18n();
const time = (v) => (v ? String(v).slice(0, 5) : "");
const createRoute = computed(() => (auth.hasPermission("meeting.create") ? { name: "create-individual-meeting" } : null));

const row = {
  title: (r) => r.name,
  date: (r) => r.date,
  when: (r) => [shortDate(r.date, locale.value), time(r.start_time)].filter(Boolean).join(" · "),
  place: (r) => r.venue,
  badge: (r) => (r.my_attendance ? { tone: r.my_attendance.attended ? "success" : "neutral", text: r.my_attendance.status || t("memberActivity.attended") } : null),
};
</script>

<template>
  <ActivityList kind="meetings" :icon="CalendarDays" :title="t('memberActivity.meeting_title')" :description="t('memberActivity.meeting_description')"
    :tabs="[t('memberActivity.meeting_current'), t('memberActivity.meeting_past')]"
    :empty="[[t('memberActivity.meeting_emptyTitle'), t('memberActivity.meeting_emptyText')], [t('memberActivity.meeting_pastEmptyTitle'), t('memberActivity.meeting_pastEmptyText')]]"
    detail-route="view-individual-meeting" :create-route="createRoute" :row="row" />
</template>
