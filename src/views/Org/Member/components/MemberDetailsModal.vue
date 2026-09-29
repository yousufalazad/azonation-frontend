<script setup>
// Read-only member summary with Edit and Terminate actions.
import { computed } from "vue";
import placeholderImage from "@/assets/Placeholder/Azonation-profile-image.jpg";
import { formatDate, membershipAge, humanize, statusTone } from "@/helpers/format";

const open = defineModel("open", { type: Boolean, default: false });

const props = defineProps({
  member: { type: Object, default: null },
  // All members, used to show sponsor / approver names
  members: { type: Array, default: () => [] },
});

const emit = defineEmits(["edit", "terminate"]);

const nameOf = (individualId) => {
  if (!individualId) return null;
  return props.members.find((m) => m.individual?.id === individualId)?.full_name || null;
};

const rows = computed(() => {
  const m = props.member;
  if (!m) return [];
  return [
    { label: "members.type", value: m.membership_type?.name },
    { label: "members.status", value: m.membership_status?.name ? humanize(m.membership_status.name) : null },
    { label: "member.joined", value: m.membership_start_date ? formatDate(m.membership_start_date) : null },
    { label: "member.membershipAge", value: m.membership_start_date ? membershipAge(m.membership_start_date) : null },
    { label: "members.sponsoredBy", value: nameOf(m.sponsored_user_id) },
    { label: "members.approvedBy", value: nameOf(m.approved_by) },
    { label: "members.approvedAt", value: m.approved_at ? formatDate(m.approved_at) : null },
  ];
});
</script>

<template>
  <AzModal v-model:open="open" :title="member?.full_name || $t('members.details')" size="md">
    <div v-if="member" class="flex flex-col gap-5">
      <div class="flex items-center gap-4">
        <img :src="member.image_url || placeholderImage" :alt="$t('member.photoOf', { name: member.full_name })"
          class="h-20 w-20 max-w-none shrink-0 rounded-full border border-line object-cover" />
        <div class="min-w-0">
          <p class="text-sm text-ink-muted">{{ $t('member.membershipId') }}</p>
          <p class="text-lg font-semibold text-ink tabular-nums">{{ member.existing_membership_id || '—' }}</p>
          <AzBadge v-if="member.membership_status?.name" class="mt-1" :tone="statusTone(member.membership_status.name)">
            {{ humanize(member.membership_status.name) }}
          </AzBadge>
        </div>
      </div>

      <dl class="divide-y divide-line rounded-control border border-line">
        <div v-for="row in rows" :key="row.label" class="flex flex-wrap justify-between gap-x-4 gap-y-1 px-4 py-3">
          <dt class="text-sm text-ink-muted">{{ $t(row.label) }}</dt>
          <dd class="text-[15px] font-medium" :class="row.value ? 'text-ink' : 'text-ink-muted'">
            {{ row.value || $t('members.notProvided') }}
          </dd>
        </div>
      </dl>
    </div>

    <template #footer>
      <AzButton variant="danger" @click="emit('terminate', member)">{{ $t('members.terminate') }}</AzButton>
      <AzButton @click="emit('edit', member)">{{ $t('members.edit') }}</AzButton>
    </template>
  </AzModal>
</template>
