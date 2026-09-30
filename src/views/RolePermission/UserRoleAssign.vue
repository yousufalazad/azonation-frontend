<!-- Give roles (Super Admin): choose an organisation, then change its members' roles -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import RoleAssignments from "./components/RoleAssignments.vue";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const orgs = ref([]);
const orgId = ref(Number(route.query.org) || "");
const options = computed(() => orgs.value.map((o) => ({ value: o.org_id, label: o.org_name || o.email })));

function choose(v) {
  orgId.value = v;
  router.replace({ query: v ? { org: v } : {} });
}

onMounted(async () => {
  const res = await auth.fetchProtectedApi("/api/superadmin/billing/subscriptions", {}, "GET");
  orgs.value = res?.status ? res.data : [];
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('roleAssign.adminTitle')" :description="t('roleAssign.adminDescription')" />
    <div class="max-w-md">
      <AzSelect :model-value="orgId" :label="t('adminBilling.organisation')" :options="options" :placeholder="t('meetingForm.choose')" @update:model-value="choose" />
    </div>
    <RoleAssignments v-if="orgId" :key="orgId" :org-id="orgId" />
    <AzCard v-else><AzEmptyState :title="t('roleAssign.pickOrgTitle')" :description="t('roleAssign.pickOrgText')" /></AzCard>
  </div>
</template>
