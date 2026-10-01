<script setup>
// Add or edit a founder: one of the organisation's members, or someone named by hand.
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";

const open = defineModel("open", { type: Boolean, default: false });
const props = defineProps({
  founder: { type: Object, default: null }, // null = add
  members: { type: Array, default: () => [] }, // [{ value, label }]
});
const emit = defineEmits(["saved"]);
const { t } = useI18n();
const toast = useToast();

const blank = () => ({ who: "member", founder_user_id: "", full_name: "", designation: "", email: "", mobile: "", address: "", note: "", is_active: true });
const form = reactive(blank());
const errors = reactive({});
const saving = ref(false);
const photo = ref(null);
const preview = ref("");
const fileInput = ref(null);
const isEdit = computed(() => !!props.founder?.id);
const whoOptions = computed(() => [
  { value: "member", label: t("founders.whoMember") },
  { value: "other", label: t("founders.whoOther") },
]);

const clearPreview = () => {
  if (preview.value.startsWith("blob:")) URL.revokeObjectURL(preview.value);
};

watch(open, (isOpen) => {
  if (!isOpen) return;
  const f = props.founder;
  Object.keys(errors).forEach((k) => delete errors[k]);
  Object.assign(form, blank(), f ? {
    who: f.is_member ? "member" : "other",
    founder_user_id: f.founder_user_id ?? "",
    full_name: f.full_name ?? "",
    designation: f.designation ?? "",
    email: f.email ?? "",
    mobile: f.mobile ?? "",
    address: f.address ?? "",
    note: f.note ?? "",
    is_active: Number(f.is_active) === 1,
  } : { who: props.members.length ? "member" : "other" });
  photo.value = null;
  clearPreview();
  preview.value = f?.image_url || "";
  if (fileInput.value) fileInput.value.value = "";
});
onBeforeUnmount(clearPreview);

function onPhoto(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  clearPreview();
  photo.value = file;
  preview.value = URL.createObjectURL(file);
}

const shownName = computed(() => (form.who === "member" ? props.members.find((m) => String(m.value) === String(form.founder_user_id))?.label : form.full_name) || "");

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.who === "member" && !form.founder_user_id) errors.founder_user_id = t("founders.needMember");
  if (form.who === "other" && !form.full_name.trim()) errors.full_name = t("founders.needName");
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = t("founders.badEmail");
  if (Object.keys(errors).length || saving.value) return;

  const fd = new FormData();
  fd.append("founder_user_id", form.who === "member" ? form.founder_user_id : "");
  fd.append("full_name", form.who === "other" ? form.full_name.trim() : "");
  ["designation", "email", "mobile", "address", "note"].forEach((k) => fd.append(k, form[k].trim()));
  fd.append("is_active", form.is_active ? "1" : "0");
  if (photo.value) fd.append("profile_image", photo.value);

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/founders/${props.founder.id}` : "/api/founders";
    const res = await authStore.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      toast.success(isEdit.value ? t("founders.updated") : t("founders.created"));
      open.value = false;
      emit("saved");
    } else {
      const reason = res?.errors?.exception ? "" : res?.errors?.message;
      toast.error(reason && reason.length < 160 ? reason : t("founders.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal v-model:open="open" :title="isEdit ? t('founders.edit') : t('founders.add')" size="lg">
    <form id="founder-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <AzSegmented v-model="form.who" :label="t('founders.who')" :options="whoOptions" />

      <AzSelect v-if="form.who === 'member'" v-model="form.founder_user_id" :label="t('committees.member')" :options="members"
        :placeholder="t('meetingForm.choose')" :error="errors.founder_user_id" :help="t('founders.memberHelp')" required />
      <AzInput v-else v-model="form.full_name" :label="t('founders.name')" :error="errors.full_name" required maxlength="100" autocomplete="off" />

      <AzInput v-model="form.designation" :label="t('founders.role')" :placeholder="t('founders.rolePlaceholder')" maxlength="255" autocomplete="off" />

      <div class="flex items-center gap-4">
        <AzAvatar :src="preview" :name="shownName" size="lg" />
        <div class="min-w-0 flex-1">
          <AzField :label="t('unlinked.photo')" :help="form.who === 'member' ? t('founders.photoHelpMember') : t('unlinked.photoHelp')">
            <template #default="{ id, describedBy }">
              <input :id="id" ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" :aria-describedby="describedBy"
                class="az-control w-full py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-semibold file:text-primary-soft-ink"
                @change="onPhoto" />
            </template>
          </AzField>
        </div>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.email" type="email" inputmode="email" :label="t('unlinked.email')" :error="errors.email" maxlength="50" autocomplete="off" />
        <AzInput v-model="form.mobile" type="tel" inputmode="tel" :label="t('unlinked.mobile')" maxlength="20" autocomplete="off" />
        <div class="sm:col-span-2">
          <AzInput v-model="form.address" :label="t('unlinked.address')" maxlength="255" autocomplete="off" />
        </div>
        <div class="sm:col-span-2">
          <AzTextarea v-model="form.note" :label="t('meetingView.note')" :help="t('founders.noteHelp')" rows="2" maxlength="255" />
        </div>
      </div>
      <AzCheckbox v-model="form.is_active" :label="t('founders.show')" :help="t('founders.showHelp')" />
    </form>
    <template #footer>
      <AzButton variant="quiet" @click="open = false">{{ t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="founder-form" :loading="saving">{{ t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
