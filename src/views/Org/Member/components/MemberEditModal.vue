<script setup>
// Edit a member's organisation details (ID, type, status, sponsor, approval).
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";

const open = defineModel("open", { type: Boolean, default: false });

const props = defineProps({
  member: { type: Object, default: null },
  membershipTypes: { type: Array, default: () => [] }, // org membership types: { membership_type_id, membership_type: { name } }
  membershipStatuses: { type: Array, default: () => [] },
  members: { type: Array, default: () => [] },
});

const emit = defineEmits(["saved"]);

const { t } = useI18n();
const toast = useToast();
const saving = ref(false);

const form = reactive({
  existing_membership_id: "",
  membership_start_date: "",
  membership_type_id: "",
  new_membership_type_started_from: "",
  membership_status_id: "",
  new_membership_status_started_from: "",
  sponsored_user_id: "",
  approved_by: "",
  approved_at: "",
});

// Date inputs need "YYYY-MM-DD"
const toDateInput = (v) => (v ? String(v).slice(0, 10) : "");

watch(
  () => [open.value, props.member],
  () => {
    if (!open.value || !props.member) return;
    const m = props.member;
    Object.assign(form, {
      existing_membership_id: m.existing_membership_id ?? "",
      membership_start_date: toDateInput(m.membership_start_date),
      membership_type_id: m.membership_type_id ?? "",
      new_membership_type_started_from: "",
      membership_status_id: m.membership_status_id ?? "",
      new_membership_status_started_from: "",
      sponsored_user_id: m.sponsored_user_id ?? "",
      approved_by: m.approved_by ?? "",
      approved_at: toDateInput(m.approved_at),
    });
  },
  { immediate: true },
);

const typeOptions = computed(() =>
  props.membershipTypes.map((t) => ({ value: t.membership_type_id, label: t.membership_type?.name ?? "—" })),
);
const statusOptions = computed(() => props.membershipStatuses.map((s) => ({ value: s.id, label: s.name })));
// A member cannot sponsor or approve themselves
const otherMembers = computed(() =>
  props.members
    .filter((m) => m.individual?.id && m.individual.id !== props.member?.individual_type_user_id)
    .map((m) => ({ value: m.individual.id, label: m.full_name || "—" })),
);

const typeChanged = computed(() => props.member && form.membership_type_id !== (props.member.membership_type_id ?? ""));
const statusChanged = computed(() => props.member && form.membership_status_id !== (props.member.membership_status_id ?? ""));

async function save() {
  if (!props.member || saving.value) return;
  saving.value = true;
  try {
    const res = await authStore.fetchProtectedApi(`/api/org-members/${props.member.id}`, { ...form }, "PUT");
    if (res?.status) {
      toast.success(t("members.saved"));
      open.value = false;
      emit("saved");
    } else {
      toast.error(t("members.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal v-model:open="open" :title="$t('members.edit')" size="lg">
    <form v-if="member" id="member-edit-form" class="flex flex-col gap-5" @submit.prevent="save">
      <div class="flex items-center gap-4">
        <AzAvatar :src="member.image_url" :name="member.full_name" size="lg" />
        <div class="min-w-0">
          <p class="truncate text-lg font-semibold text-ink">{{ member.full_name || '—' }}</p>
          <p class="text-sm text-ink-muted">{{ $t('members.azonId') }}: {{ member.individual?.azon_id || '—' }}</p>
        </div>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.existing_membership_id" :label="$t('members.membershipIdLabel')" autocomplete="off" />
        <AzInput v-model="form.membership_start_date" type="date" :label="$t('members.startDate')" />

        <AzSelect v-model="form.membership_type_id" :label="$t('members.type')" :options="typeOptions"
          :placeholder="$t('members.selectType')" />
        <AzInput v-if="typeChanged" v-model="form.new_membership_type_started_from" type="date" :label="$t('members.typeStartsOn')" />
        <div v-else class="hidden sm:block" />

        <AzSelect v-model="form.membership_status_id" :label="$t('members.status')" :options="statusOptions"
          :placeholder="$t('members.selectStatus')" />
        <AzInput v-if="statusChanged" v-model="form.new_membership_status_started_from" type="date" :label="$t('members.statusStartsOn')" />
        <div v-else class="hidden sm:block" />

        <AzSelect v-model="form.sponsored_user_id" :label="$t('members.sponsoredBy')" :options="otherMembers"
          :placeholder="$t('members.selectMember')" />
        <div class="hidden sm:block" />

        <AzSelect v-model="form.approved_by" :label="$t('members.approvedBy')" :options="otherMembers"
          :placeholder="$t('members.selectMember')" />
        <AzInput v-model="form.approved_at" type="date" :label="$t('members.approvedAt')" />
      </div>
    </form>

    <template #footer>
      <AzButton variant="quiet" @click="open = false">{{ $t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="member-edit-form" :loading="saving">{{ $t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
