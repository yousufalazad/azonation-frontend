<!-- Member home: for each organisation they belong to, what is coming up (meetings, events, projects),
     their committees and the assets they hold. New members see how to join an organisation. -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { shortDate } from "@/helpers/billing";
import { CalendarDays, PartyPopper, FolderKanban, Users, Package, Copy, Building2, MapPin } from "lucide-vue-next";

const auth = authStore;
const { t, locale } = useI18n();
const toast = useToast();

const loading = ref(true);
const orgs = ref([]);
const azonId = ref("");

const firstName = computed(() => auth.user?.first_name || "");
const time = (v) => (v ? String(v).slice(0, 5) : "");
const when = (date, clock) => [shortDate(date, locale.value), time(clock)].filter(Boolean).join(" · ");

async function copyId() {
  try {
    await navigator.clipboard.writeText(azonId.value);
    toast.success(t("memberHome.idCopied"));
  } catch {
    toast.error(t("referralPage.copyFailed"));
  }
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/individual/dashboard-summary", {}, "GET");
  orgs.value = res?.status ? res.data?.organisations || [] : [];
  azonId.value = res?.data?.azon_id || auth.user?.azon_id || "";
  loading.value = false;
});
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6">
    <AzPageHeader :title="firstName ? t('memberHome.hello', { name: firstName }) : t('dashboard.welcome')" :description="t('memberHome.description')" />

    <AzSkeleton v-if="loading" :lines="6" height="4rem" />

    <!-- Not in any organisation yet -->
    <AzCard v-else-if="!orgs.length">
      <AzEmptyState :title="t('memberHome.noOrgTitle')" :description="t('memberHome.noOrgText')">
        <template #icon><Building2 class="h-7 w-7" /></template>
        <div v-if="azonId" class="flex flex-wrap items-center justify-center gap-2">
          <span class="rounded-control border border-dashed border-line-strong bg-surface-2 px-3 py-1.5 font-mono font-semibold text-ink">{{ azonId }}</span>
          <AzButton variant="secondary" size="sm" @click="copyId"><template #icon><Copy class="h-4 w-4" /></template>{{ t('memberHome.copyId') }}</AzButton>
        </div>
      </AzEmptyState>
    </AzCard>

    <!-- One section per organisation -->
    <section v-for="o in orgs" v-else :key="o.org_id" class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <AzAvatar :src="o.logo_url || ''" :name="o.org_name" />
        <div class="min-w-0">
          <h2 class="truncate text-lg font-semibold text-ink">{{ o.org_name }}</h2>
          <p class="truncate text-sm text-ink-muted">
            {{ [o.membership_type, o.membership_id ? t('memberHome.memberNo', { id: o.membership_id }) : '', o.member_since ? t('memberHome.since', { date: shortDate(o.member_since, locale) }) : ''].filter(Boolean).join(' · ') }}
          </p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <!-- Meetings -->
        <AzCard>
          <h3 class="mb-3 flex items-center gap-2 font-semibold text-ink"><CalendarDays class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('memberHome.nextMeetings') }}</h3>
          <ul v-if="o.next_meetings.length" class="flex flex-col gap-3">
            <li v-for="m in o.next_meetings" :key="m.id">
              <p class="font-medium text-ink">{{ m.name }}</p>
              <p class="text-sm text-ink-muted">{{ when(m.date, m.start_time) }}</p>
              <p v-if="m.venue" class="flex items-center gap-1 text-sm text-ink-muted"><MapPin class="h-3.5 w-3.5" aria-hidden="true" />{{ m.venue }}</p>
            </li>
          </ul>
          <p v-else class="text-sm text-ink-muted">{{ t('memberHome.noMeetings') }}</p>
        </AzCard>

        <!-- Events -->
        <AzCard>
          <h3 class="mb-3 flex items-center gap-2 font-semibold text-ink"><PartyPopper class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('memberHome.upcomingEvents') }}</h3>
          <ul v-if="o.upcoming_events.length" class="flex flex-col gap-3">
            <li v-for="e in o.upcoming_events" :key="e.id">
              <p class="font-medium text-ink">{{ e.title }}</p>
              <p class="text-sm text-ink-muted">{{ when(e.date, e.time) }}</p>
              <p v-if="e.venue_name" class="flex items-center gap-1 text-sm text-ink-muted"><MapPin class="h-3.5 w-3.5" aria-hidden="true" />{{ e.venue_name }}</p>
            </li>
          </ul>
          <p v-else class="text-sm text-ink-muted">{{ t('memberHome.noEvents') }}</p>
        </AzCard>

        <!-- Projects -->
        <AzCard>
          <h3 class="mb-3 flex items-center gap-2 font-semibold text-ink"><FolderKanban class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('memberHome.projects') }}</h3>
          <ul v-if="o.projects.length" class="flex flex-col gap-3">
            <li v-for="p in o.projects" :key="p.id">
              <p class="font-medium text-ink">{{ p.title }}</p>
              <p v-if="p.start_date || p.end_date" class="text-sm text-ink-muted">{{ shortDate(p.start_date, locale) || '…' }} – {{ shortDate(p.end_date, locale) || '…' }}</p>
            </li>
          </ul>
          <p v-else class="text-sm text-ink-muted">{{ t('memberHome.noProjects') }}</p>
        </AzCard>

        <!-- Committees -->
        <AzCard>
          <h3 class="mb-3 flex items-center gap-2 font-semibold text-ink"><Users class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('memberHome.committees') }}</h3>
          <ul v-if="o.committees.length" class="flex flex-col gap-2">
            <li v-for="c in o.committees" :key="c.id" class="flex items-center justify-between gap-3">
              <span class="font-medium text-ink">{{ c.name }}</span>
              <AzBadge v-if="c.designation" tone="info" :dot="false">{{ c.designation }}</AzBadge>
            </li>
          </ul>
          <p v-else class="text-sm text-ink-muted">{{ t('memberHome.noCommittees') }}</p>
        </AzCard>

        <!-- Assets -->
        <AzCard>
          <h3 class="mb-3 flex items-center gap-2 font-semibold text-ink"><Package class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('memberHome.assets') }}</h3>
          <ul v-if="o.assets.length" class="flex flex-col gap-2">
            <li v-for="a in o.assets" :key="a.id">
              <p class="font-medium text-ink">{{ a.name }}<span v-if="a.quantity > 1" class="font-normal text-ink-muted"> × {{ a.quantity }}</span></p>
              <p class="text-sm text-ink-muted">{{ [a.since ? t('memberHome.since', { date: shortDate(a.since, locale) }) : '', a.condition].filter(Boolean).join(' · ') }}</p>
            </li>
          </ul>
          <p v-else class="text-sm text-ink-muted">{{ t('memberHome.noAssets') }}</p>
        </AzCard>
      </div>
    </section>
  </div>
</template>
