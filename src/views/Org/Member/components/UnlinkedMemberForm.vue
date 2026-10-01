<script setup>
// Add or edit a member who has no Azonation account.
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";

const open = defineModel("open", { type: Boolean, default: false });

const props = defineProps({
  member: { type: Object, default: null }, // null = add
  membershipTypes: { type: Array, default: () => [] },
  membershipStatuses: { type: Array, default: () => [] },
});

const emit = defineEmits(["saved"]);
const { t } = useI18n();
const toast = useToast();

const blank = () => ({
  existing_membership_id: "",
  membership_type_id: "",
  membership_status_id: "",
  membership_start_date: "",
  first_name: "",
  last_name: "",
  email: "",
  mobile: "",
  address: "",
  note: "",
  is_active: true,
});

const form = reactive(blank());
const image = ref(null);
const preview = ref("");
const saving = ref(false);
const nameError = ref("");
const fileInput = ref(null);

const isEdit = computed(() => !!props.member?.id);

const clearPreview = () => {
  if (preview.value.startsWith("blob:")) URL.revokeObjectURL(preview.value);
};

watch(open, (isOpen) => {
  if (!isOpen) return;
  const m = props.member;
  Object.assign(form, blank(), m ? {
    existing_membership_id: m.existing_membership_id ?? "",
    membership_type_id: m.membership_type_id ?? "",
    membership_status_id: m.membership_status_id ?? "",
    membership_start_date: m.membership_start_date ? String(m.membership_start_date).slice(0, 10) : "",
    first_name: m.first_name ?? "",
    last_name: m.last_name ?? "",
    email: m.email ?? "",
    mobile: m.mobile ?? "",
    address: m.address ?? "",
    note: m.note ?? "",
    is_active: m.is_active === 1 || m.is_active === true,
  } : {});
  image.value = null;
  clearPreview();
  preview.value = m?.image_url || "";
  nameError.value = "";
  if (fileInput.value) fileInput.value.value = "";
});

onBeforeUnmount(clearPreview);

const onImage = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  clearPreview();
  image.value = file;
  preview.value = URL.createObjectURL(file);
};

const typeOptions = computed(() =>
  props.membershipTypes.map((ty) => ({ value: ty.membership_type_id, label: ty.membership_type?.name ?? "—" })),
);
const statusOptions = computed(() => props.membershipStatuses.map((s) => ({ value: s.id, label: s.name })));

async function save() {
  nameError.value = form.first_name.trim() ? "" : t("unlinked.needName");
  if (nameError.value || saving.value) return;

  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => {
    if (k === "is_active") fd.append(k, v ? "1" : "0");
    else fd.append(k, v ?? "");
  });
  if (image.value) fd.append("image_path", image.value);
  if (isEdit.value) fd.append("_method", "PUT"); // file uploads must be POST; Laravel reads _method

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/unlink-members/${props.member.id}` : "/api/unlink-members";
    const res = await authStore.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      toast.success(t("unlinked.saved"));
      open.value = false;
      emit("saved");
    } else {
      toast.error(t("unlinked.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal v-model:open="open" :title="isEdit ? $t('unlinked.edit') : $t('unlinked.add')" size="lg">
    <form id="unlinked-member-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <div class="flex items-center gap-4">
        <AzAvatar :src="preview" :name="`${form.first_name} ${form.last_name}`" size="lg" />
        <div class="min-w-0 flex-1">
          <AzField :label="$t('unlinked.photo')" :help="$t('unlinked.photoHelp')">
            <template #default="{ id, describedBy }">
              <input :id="id" ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" :aria-describedby="describedBy"
                class="az-control w-full py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-semibold file:text-primary-soft-ink"
                @change="onImage" />
            </template>
          </AzField>
        </div>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.first_name" :label="$t('unlinked.firstName')" :error="nameError" required autocomplete="off" />
        <AzInput v-model="form.last_name" :label="$t('unlinked.lastName')" autocomplete="off" />
        <AzInput v-model="form.email" type="email" :label="$t('unlinked.email')" inputmode="email" autocomplete="off" />
        <AzInput v-model="form.mobile" type="tel" :label="$t('unlinked.mobile')" inputmode="tel" autocomplete="off" />
        <div class="sm:col-span-2">
          <AzInput v-model="form.address" :label="$t('unlinked.address')" autocomplete="off" />
        </div>
        <AzInput v-model="form.existing_membership_id" :label="$t('members.membershipIdLabel')" autocomplete="off" />
        <AzInput v-model="form.membership_start_date" type="date" :label="$t('members.startDate')" />
        <AzSelect v-model="form.membership_type_id" :label="$t('members.type')" :options="typeOptions" :placeholder="$t('members.selectType')" />
        <AzSelect v-model="form.membership_status_id" :label="$t('members.status')" :options="statusOptions" :placeholder="$t('members.selectStatus')" />
        <div class="sm:col-span-2">
          <AzTextarea v-model="form.note" :label="$t('unlinked.note')" rows="3" />
        </div>
        <div class="sm:col-span-2">
          <AzCheckbox v-model="form.is_active" :label="$t('unlinked.active')" :help="$t('unlinked.activeHelp')" />
        </div>
      </div>
    </form>

    <template #footer>
      <AzButton variant="quiet" @click="open = false">{{ $t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="unlinked-member-form" :loading="saving">{{ $t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
