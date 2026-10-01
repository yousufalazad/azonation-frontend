<!-- Items you look after for your organisations, and ones you handed back -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { shortDate } from "@/helpers/billing";
import { Package } from "lucide-vue-next";
import ActivityList from "../components/ActivityList.vue";

const auth = authStore;
const { t, locale } = useI18n();
const time = (v) => (v ? String(v).slice(0, 5) : "");
const createRoute = null;

const row = {
  title: (r) => (r.quantity > 1 ? `${r.name} × ${r.quantity}` : r.name),
  when: (r) => [r.since ? t("memberHome.since", { date: shortDate(r.since, locale.value) }) : "", r.until ? t("memberActivity.until", { date: shortDate(r.until, locale.value) }) : ""].filter(Boolean).join(" · "),
  badge: (r) => (r.condition ? { tone: "neutral", text: r.condition } : null),
};
</script>

<template>
  <ActivityList kind="assets" :icon="Package" :title="t('memberActivity.asset_title')" :description="t('memberActivity.asset_description')"
    :tabs="[t('memberActivity.asset_current'), t('memberActivity.asset_past')]"
    :empty="[[t('memberActivity.asset_emptyTitle'), t('memberActivity.asset_emptyText')], [t('memberActivity.asset_pastEmptyTitle'), t('memberActivity.asset_pastEmptyText')]]"
    detail-route="" :create-route="createRoute" :row="row" />
</template>
