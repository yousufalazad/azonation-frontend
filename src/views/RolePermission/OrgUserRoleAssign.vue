<!-- Admin roles (organisation): give members roles so they can help run parts of the organisation -->
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import RoleAssignments from "./components/RoleAssignments.vue";

const auth = authStore;
const { t } = useI18n();
const orgId = computed(() => auth.currentOrgId || auth.user?.id);
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('roleAssign.orgTitle')" :description="t('roleAssign.orgDescription')" />
    <RoleAssignments v-if="orgId" :org-id="orgId" />
  </div>
</template>
