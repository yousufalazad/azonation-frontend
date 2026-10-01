<!-- One meeting, event or project as a member sees it: when and where, the details,
     published minutes (meetings) and whether they attended -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { shortDate } from "@/helpers/billing";
import { richTextHtml, safeUrl, vSafeHtml } from "@/helpers/sanitizeHtml";
import { CalendarDays, Clock, MapPin, Video, CheckCircle2, XCircle, HeartHandshake } from "lucide-vue-next";

const props = defineProps({
  kind: { type: String, required: true }, // meetings | events | projects
  backRoute: { type: String, required: true },
  backLabel: { type: String, required: true },
});

const auth = authStore;
const route = useRoute();
const { t, locale } = useI18n();

const loading = ref(true);
const item = ref(null);

const title = computed(() => item.value?.name || item.value?.title || "");
const time = (v) => (v ? String(v).slice(0, 5) : "");
const dateText = computed(() => {
  const i = item.value;
  if (!i) return "";
  if (props.kind === "projects") {
    if (!i.start_date && !i.end_date) return "";
    return `${shortDate(i.start_date, locale.value) || "…"} – ${shortDate(i.end_date, locale.value) || "…"}`;
  }
  return shortDate(i.date, locale.value);
});
const timeText = computed(() => {
  const i = item.value;
  if (!i) return "";
  const start = time(i.start_time || i.time);
  const end = time(i.end_time);
  return start && end ? `${start} – ${end}` : start;
});
const place = computed(() => [item.value?.venue || item.value?.venue_name, item.value?.venue_address].filter(Boolean).join(", "));
const link = computed(() => safeUrl(item.value?.video_conference_link || ""));
const sections = computed(() => {
  const i = item.value || {};
  return [
    { key: "subject", html: richTextHtml(i.subject) },
    { key: "agenda", html: richTextHtml(i.agenda) },
    { key: "about", html: richTextHtml(i.description || i.short_description) },
    { key: "requirements", html: richTextHtml(i.requirements) },
  ].filter((s) => s.html);
});
const minutes = computed(() => {
  const m = item.value?.minutes;
  if (!m) return [];
  return [
    { key: "minutes", html: richTextHtml(m.minutes) },
    { key: "decisions", html: richTextHtml(m.decisions) },
    { key: "actions", html: richTextHtml(m.action_items) },
  ].filter((s) => s.html);
});

onMounted(async () => {
  const res = await auth.fetchProtectedApi(`/api/individual/${props.kind}/${route.params.id}`, {}, "GET");
  item.value = res?.status ? res.data : null;
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <AzPageHeader :title="title || backLabel" :back="{ name: backRoute }" :back-label="backLabel" />

    <AzSkeleton v-if="loading" :lines="5" height="3rem" />

    <AzCard v-else-if="!item">
      <AzEmptyState :title="t('memberActivity.notFoundTitle')" :description="t('memberActivity.notFoundText')">
        <AzButton variant="secondary" :to="{ name: backRoute }">{{ backLabel }}</AzButton>
      </AzEmptyState>
    </AzCard>

    <template v-else>
      <AzCard>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 text-sm text-ink-muted">
            <AzAvatar :src="item.org_logo || ''" :name="item.org_name" size="sm" />{{ item.org_name }}
          </div>
          <p v-if="dateText" class="flex items-center gap-2 text-ink"><CalendarDays class="h-5 w-5 text-primary" aria-hidden="true" />{{ dateText }}</p>
          <p v-if="timeText" class="flex items-center gap-2 text-ink"><Clock class="h-5 w-5 text-primary" aria-hidden="true" />{{ timeText }}</p>
          <p v-if="place" class="flex items-center gap-2 text-ink"><MapPin class="h-5 w-5 text-primary" aria-hidden="true" />{{ place }}</p>
          <a v-if="link" :href="link" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 font-medium text-primary hover:underline">
            <Video class="h-5 w-5" aria-hidden="true" />{{ t('memberActivity.joinOnline') }}
          </a>
          <div v-if="item.family_welcome" class="flex flex-col gap-1 border-t border-line pt-3">
            <p class="flex items-center gap-2 font-medium text-ink"><HeartHandshake class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('family.welcomeBadge') }}</p>
            <p v-if="item.my_family_sharing === 'none'" class="text-sm text-ink-2">
              {{ t('family.welcomeNudge', { org: item.org_name }) }}
              <RouterLink :to="{ name: 'individual-family' }" class="font-medium text-primary hover:underline">{{ t('family.title') }}</RouterLink>
            </p>
          </div>
          <div v-if="item.my_attendance" class="flex items-center gap-2 border-t border-line pt-3">
            <CheckCircle2 v-if="item.my_attendance.attended" class="h-5 w-5 text-success" aria-hidden="true" />
            <XCircle v-else class="h-5 w-5 text-ink-muted" aria-hidden="true" />
            <span class="text-ink">{{ t('memberActivity.youWere', { status: item.my_attendance.status || t('memberActivity.attended') }) }}</span>
            <span v-if="item.my_attendance.how" class="text-sm text-ink-muted">· {{ item.my_attendance.how }}</span>
          </div>
        </div>
      </AzCard>

      <AzCard v-for="s in sections" :key="s.key" :title="t(`memberActivity.section_${s.key}`)">
        <div v-safe-html="s.html" class="prose prose-sm max-w-none text-ink dark:prose-invert" />
      </AzCard>

      <AzCard v-if="minutes.length" :title="t('memberActivity.minutesTitle')">
        <div class="flex flex-col gap-4">
          <div v-for="s in minutes" :key="s.key">
            <h3 class="mb-1 text-sm font-semibold text-ink-muted">{{ t(`memberActivity.section_${s.key}`) }}</h3>
            <div v-safe-html="s.html" class="prose prose-sm max-w-none text-ink dark:prose-invert" />
          </div>
        </div>
      </AzCard>
    </template>
  </div>
</template>
