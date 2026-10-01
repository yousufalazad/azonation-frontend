<!-- Guests at a project (the list itself is shared with meetings: GuestList) -->
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

const projectId = computed(() => route.params.id);
const project = ref(null);

const whenText = computed(() => {
  const e = project.value;
  if (!e) return "";
  const date = e.start_date ? formatDate(e.start_date) : t("meetings.noDate");
  return e.start_time ? `${date} · ${dayjs(`2000-01-01 ${e.start_time}`).format("h:mm A")}` : date;
});

onMounted(async () => {
  const res = await authStore.fetchProtectedApi(`/api/projects/${projectId.value}`, {}, "GET");
  project.value = res?.status ? res.data : null;
});
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6">
    <AzPageHeader :title="t('guests.title')" :description="project ? `${project.title} — ${whenText}` : ''"
      :back="{ name: 'view-project', params: { id: projectId } }" :back-label="project?.title || t('projects.title')">
      <AzButton variant="secondary" :to="{ name: 'project-attendances', params: { id: projectId } }">
        <template #icon><Users class="h-[18px] w-[18px]" /></template>
        {{ t('projects.participants') }}
      </AzButton>
    </AzPageHeader>

    <GuestList :key="projectId" endpoint="/api/project-guest-attendances" parent-key="project_id" :parent-id="projectId"
      :date="project?.start_date || ''" />
  </div>
</template>
