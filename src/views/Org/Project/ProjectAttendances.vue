<!-- Who came to a project (the list itself is shared with meetings: AttendanceChecklist) -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { formatDate } from "@/helpers/format";
import AttendanceChecklist from "@/components/attendance/AttendanceChecklist.vue";
import { UserPlus } from "lucide-vue-next";

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
  <div class="mx-auto flex max-w-4xl flex-col gap-6 pb-24">
    <AzPageHeader :title="t('projects.participants')" :description="project ? `${project.title} — ${whenText}` : ''"
      :back="{ name: 'view-project', params: { id: projectId } }" :back-label="project?.title || t('projects.title')">
      <AzButton variant="secondary" :to="{ name: 'project-guest-attendance', params: { id: projectId } }">
        <template #icon><UserPlus class="h-[18px] w-[18px]" /></template>
        {{ t('meetings.guests') }}
      </AzButton>
    </AzPageHeader>

    <AttendanceChecklist :key="projectId" endpoint="/api/project-attendances" parent-key="project_id" :parent-id="projectId" />
  </div>
</template>
