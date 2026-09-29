<!-- Committees you are on, and ones you were on before -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { shortDate } from "@/helpers/billing";
import { Users } from "lucide-vue-next";
import ActivityList from "../components/ActivityList.vue";

const auth = authStore;
const { t, locale } = useI18n();
const time = (v) => (v ? String(v).slice(0, 5) : "");
const createRoute = null;

const row = {
  title: (r) => r.name,
  when: (r) => [r.start_date ? t("memberHome.since", { date: shortDate(r.start_date, locale.value) }) : "", r.end_date ? t("memberActivity.until", { date: shortDate(r.end_date, locale.value) }) : ""].filter(Boolean).join(" · ") || r.short_description || "",
  badge: (r) => (r.designation ? { tone: "info", text: r.designation } : null),
};
</script>

<template>
  <ActivityList kind="committees" :icon="Users" :title="t('memberActivity.committee_title')" :description="t('memberActivity.committee_description')"
    :tabs="[t('memberActivity.committee_current'), t('memberActivity.committee_past')]"
    :empty="[[t('memberActivity.committee_emptyTitle'), t('memberActivity.committee_emptyText')], [t('memberActivity.committee_pastEmptyTitle'), t('memberActivity.committee_pastEmptyText')]]"
    detail-route="" :create-route="createRoute" :row="row" />
</template>
