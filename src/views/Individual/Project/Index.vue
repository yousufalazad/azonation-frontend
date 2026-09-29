<!-- Projects of your organisations: current and finished, with your participation -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { shortDate } from "@/helpers/billing";
import { FolderKanban } from "lucide-vue-next";
import ActivityList from "../components/ActivityList.vue";

const auth = authStore;
const { t, locale } = useI18n();
const time = (v) => (v ? String(v).slice(0, 5) : "");
const createRoute = computed(() => (auth.hasPermission("project.create") ? { name: "create-individual-project" } : null));

const row = {
  title: (r) => r.title,
  date: (r) => r.start_date,
  when: (r) => (r.start_date || r.end_date ? `${shortDate(r.start_date, locale.value) || "…"} – ${shortDate(r.end_date, locale.value) || "…"}` : r.short_description || ""),
  place: (r) => r.venue_name,
  badge: (r) => (r.my_attendance ? { tone: r.my_attendance.attended ? "success" : "neutral", text: r.my_attendance.status || t("memberActivity.attended") } : null),
};
</script>

<template>
  <ActivityList kind="projects" :icon="FolderKanban" :title="t('memberActivity.project_title')" :description="t('memberActivity.project_description')"
    :tabs="[t('memberActivity.project_current'), t('memberActivity.project_past')]"
    :empty="[[t('memberActivity.project_emptyTitle'), t('memberActivity.project_emptyText')], [t('memberActivity.project_pastEmptyTitle'), t('memberActivity.project_pastEmptyText')]]"
    detail-route="view-individual-project" :create-route="createRoute" :row="row" />
</template>
