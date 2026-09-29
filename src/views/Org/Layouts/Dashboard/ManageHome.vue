<!-- Home page for a member who manages parts of an organisation through their role:
     shortcuts to exactly the parts they may work on -->
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { canOpenOrgRoute, currentOrgName } from "@/router/orgAccess";
import {
  CalendarDays, NotebookPen, PartyPopper, FileBarChart, FolderKanban, Users, UserRound, Package, FileText,
  Wallet, RefreshCw, IdCard, ChevronRight,
} from "lucide-vue-next";

const auth = authStore;
const router = useRouter();
const { t } = useI18n();

const MODULES = [
  { name: "index-meeting", label: "nav.meetings", icon: CalendarDays },
  { name: "index-meeting-minutes", label: "nav.meetingMinutes", icon: NotebookPen },
  { name: "index-event", label: "nav.events", icon: PartyPopper },
  { name: "index-event-summary", label: "nav.eventReports", icon: FileBarChart },
  { name: "index-project", label: "nav.projects", icon: FolderKanban },
  { name: "committees", label: "nav.committees", icon: Users },
  { name: "index-member", label: "nav.members", icon: UserRound },
  { name: "org-membership-renewal", label: "nav.membershipRenewal", icon: RefreshCw },
  { name: "org-membership-type", label: "nav.membershipType", icon: IdCard },
  { name: "index-asset", label: "nav.assets", icon: Package },
  { name: "index-document", label: "nav.documents", icon: FileText },
  { name: "fund-management", label: "nav.fundManagement", icon: Wallet },
];

const modules = computed(() => MODULES.filter((m) => {
  try {
    return canOpenOrgRoute(router.resolve({ name: m.name }));
  } catch {
    return false;
  }
}));
const roles = computed(() => auth.orgAccess.find((o) => String(o.org_type_user_id) === String(auth.currentOrgId))?.roles || []);
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6">
    <AzPageHeader :title="t('manageOrg.title', { name: currentOrgName() })" :description="t('manageOrg.description')">
      <AzButton variant="secondary" :to="{ name: 'individual-dashboard-index' }">{{ t('nav.backToMemberArea') }}</AzButton>
    </AzPageHeader>

    <AzCard v-if="roles.length">
      <p class="text-sm text-ink-muted">{{ t('manageOrg.yourRoles') }}</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <AzBadge v-for="r in roles" :key="r" tone="info" :dot="false">{{ r }}</AzBadge>
      </div>
    </AzCard>

    <AzCard v-if="!modules.length">
      <AzEmptyState :title="t('manageOrg.nothingTitle')" :description="t('manageOrg.nothingText')" />
    </AzCard>

    <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="m in modules" :key="m.name">
        <RouterLink :to="{ name: m.name }"
          class="flex h-full items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-ink">
            <component :is="m.icon" class="h-5 w-5" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1 font-semibold text-ink">{{ t(m.label) }}</span>
          <ChevronRight class="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
