<script setup>
// Record a membership termination, then remove the member from the list.
// Works for linked members (source "org") and unlinked members (source "unlinked").
// Reasons and the primary administrator are loaded the first time the dialog opens.
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { formatDate, humanize } from "@/helpers/format";

const open = defineModel("open", { type: Boolean, default: false });

const props = defineProps({
  member: { type: Object, default: null },
  source: { type: String, default: "org" }, // org | unlinked
});

const isUnlinked = computed(() => props.source === "unlinked");

const emit = defineEmits(["terminated"]);

const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const today = () => dayjs().format("YYYY-MM-DD");

const reasons = ref([]);
const administrator = ref(null);
const lookupsLoaded = ref(false);
const saving = ref(false);
const error = ref("");
const fileInput = ref(null);

const form = reactive({
  membership_termination_reason_id: "",
  terminated_at: today(),
  processed_at: today(),
  org_note: "",
  rejoin_eligible: true,
  file: null,
});

async function loadLookups() {
  if (lookupsLoaded.value) return;
  const [reasonRes, adminRes] = await Promise.all([
    authStore.fetchProtectedApi("/api/membership-termination-reasons", {}, "GET"),
    authStore.fetchProtectedApi("/api/org-administrators/primary", {}, "GET"),
  ]);
  reasons.value = reasonRes?.status ? reasonRes.data : [];
  administrator.value = adminRes?.status ? adminRes.data : null;
  lookupsLoaded.value = true;
}

watch(open, (isOpen) => {
  if (!isOpen) return;
  Object.assign(form, {
    membership_termination_reason_id: "",
    terminated_at: today(),
    processed_at: today(),
    org_note: "",
    rejoin_eligible: true,
    file: null,
  });
  error.value = "";
  if (fileInput.value) fileInput.value.value = "";
  loadLookups();
});

const memberName = computed(() => props.member?.full_name || "—");
const email = computed(() => (isUnlinked.value ? props.member?.email : props.member?.individual?.email) || "");
const mobile = computed(() =>
  (isUnlinked.value ? props.member?.mobile : props.member?.individual?.phone_number?.phone_number) || "",
);
const typeBefore = computed(() => props.member?.membership_type?.name || "");
const statusBefore = computed(() => props.member?.membership_status?.name || "");
const joinedAt = computed(() => props.member?.membership_start_date || "");

const durationDays = computed(() =>
  joinedAt.value && form.terminated_at ? dayjs(form.terminated_at).diff(dayjs(joinedAt.value), "day") : null,
);

const administratorName = computed(() => {
  const a = administrator.value;
  return a ? [a.first_name, a.last_name].filter(Boolean).join(" ") || "—" : "—";
});

const reasonOptions = computed(() => reasons.value.map((r) => ({ value: r.id, label: r.reason })));

function validate() {
  if (!typeBefore.value || !statusBefore.value) return t("terminate.needTypeStatus");
  if (!form.membership_termination_reason_id) return t("terminate.needReason");
  if (!administrator.value?.id) return t("terminate.needAdmin");
  return "";
}

async function submit() {
  error.value = validate();
  if (error.value || saving.value) return;

  const ok = await confirm({
    title: t("terminate.confirmTitle", { name: memberName.value }),
    message: t("terminate.confirmText"),
    confirmText: t("terminate.confirm"),
    danger: true,
  });
  if (!ok) return;

  const m = props.member;
  const fd = new FormData();
  const add = (key, value) => fd.append(key, value ?? "");
  add("existing_membership_id", m.existing_membership_id);
  add("org_type_user_id", authStore.user?.id);
  // Unlinked members have no user account; the API still requires an id, so the
  // record id is sent as before (see the report: the backend needs a proper field for this)
  add("individual_type_user_id", isUnlinked.value ? m.id : m.individual?.id);
  add("terminated_member_name", memberName.value);
  add("terminated_member_email", email.value);
  add("terminated_member_mobile", mobile.value);
  add("terminated_at", form.terminated_at);
  add("processed_at", form.processed_at);
  add("membership_termination_reason_id", form.membership_termination_reason_id);
  add("org_administrator_id", administrator.value.id);
  add("rejoin_eligible", form.rejoin_eligible ? "1" : "0");
  if (form.file) fd.append("file_path", form.file);
  if (durationDays.value !== null) add("membership_duration_days", String(durationDays.value));
  add("membership_status_before_termination", statusBefore.value);
  add("membership_type_before_termination", typeBefore.value);
  if (joinedAt.value) add("joined_at", joinedAt.value);
  add("org_note", form.org_note);

  saving.value = true;
  try {
    const res = await authStore.uploadProtectedApi("/api/membership-terminations", fd, "POST");
    if (!res?.status) {
      toast.error(t("terminate.failed"));
      return;
    }
    // The termination is recorded; now remove the member from the active list
    const removed = isUnlinked.value
      ? await authStore.uploadProtectedApi(`/api/unlink-members/${m.id}`, {}, "DELETE")
      : await authStore.fetchProtectedApi(`/api/org-members/${m.id}`, {}, "DELETE");
    if (removed?.status) toast.success(t("terminate.done"));
    else toast.error(t("terminate.removeFailed"));
    open.value = false;
    emit("terminated");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal v-model:open="open" :title="$t('terminate.title')" size="lg">
    <form v-if="member" id="member-terminate-form" class="flex flex-col gap-5" @submit.prevent="submit">
      <div class="flex items-center gap-4">
        <AzAvatar :src="member.image_url" :name="memberName" size="lg" />
        <div class="min-w-0">
          <p class="truncate text-lg font-semibold text-ink">{{ memberName }}</p>
          <p class="text-sm text-ink-muted">{{ $t('member.membershipId') }}: {{ member.existing_membership_id || '—' }}</p>
        </div>
      </div>

      <!-- Facts taken from the member record -->
      <dl class="grid grid-cols-1 gap-x-6 gap-y-3 rounded-control bg-surface-2 p-4 text-[15px] sm:grid-cols-2">
        <div><dt class="text-sm text-ink-muted">{{ $t('terminate.email') }}</dt><dd class="break-all text-ink">{{ email || '—' }}</dd></div>
        <div><dt class="text-sm text-ink-muted">{{ $t('terminate.mobile') }}</dt><dd class="text-ink">{{ mobile || '—' }}</dd></div>
        <div><dt class="text-sm text-ink-muted">{{ $t('terminate.typeBefore') }}</dt><dd class="text-ink">{{ typeBefore || '—' }}</dd></div>
        <div><dt class="text-sm text-ink-muted">{{ $t('terminate.statusBefore') }}</dt><dd class="text-ink">{{ statusBefore ? humanize(statusBefore) : '—' }}</dd></div>
        <div><dt class="text-sm text-ink-muted">{{ $t('terminate.joinedAt') }}</dt><dd class="text-ink">{{ formatDate(joinedAt) }}</dd></div>
        <div><dt class="text-sm text-ink-muted">{{ $t('terminate.durationDays') }}</dt><dd class="text-ink tabular-nums">{{ durationDays ?? '—' }}</dd></div>
      </dl>

      <div class="grid gap-5 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <AzSelect v-model="form.membership_termination_reason_id" :label="$t('terminate.reason')" :options="reasonOptions"
            :placeholder="$t('terminate.selectReason')" required />
        </div>
        <AzInput v-model="form.terminated_at" type="date" :label="$t('terminate.terminatedAt')" required />
        <AzInput v-model="form.processed_at" type="date" :label="$t('terminate.processedAt')" />
        <div class="sm:col-span-2">
          <AzTextarea v-model="form.org_note" :label="$t('terminate.note')" :placeholder="$t('terminate.notePlaceholder')" rows="3" />
        </div>
        <div class="sm:col-span-2">
          <AzField :label="$t('terminate.document')" :help="$t('terminate.documentHelp')">
            <template #default="{ id, describedBy }">
              <input :id="id" ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" :aria-describedby="describedBy"
                class="az-control w-full py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-semibold file:text-primary-soft-ink"
                @change="(e) => (form.file = e.target.files?.[0] ?? null)" />
            </template>
          </AzField>
        </div>
        <div>
          <p class="text-sm font-semibold text-ink">{{ $t('terminate.administrator') }}</p>
          <p class="mt-1.5 text-[15px] text-ink-2">{{ administratorName }}</p>
        </div>
        <AzCheckbox v-model="form.rejoin_eligible" :label="$t('terminate.rejoin')" />
      </div>

      <p v-if="error" class="rounded-control bg-danger-soft px-4 py-3 text-[15px] font-medium text-danger" role="alert">{{ error }}</p>
    </form>

    <template #footer>
      <AzButton variant="quiet" @click="open = false">{{ $t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="member-terminate-form" variant="danger" :loading="saving">{{ $t('terminate.confirm') }}</AzButton>
    </template>
  </AzModal>
</template>
