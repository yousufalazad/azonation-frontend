<script setup>
// Add or edit an income/expense transaction, with receipt photos and documents.
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { authStore } from "@/store/authStore";
import { useToast } from "@/composables/useToast";
import { CurrencyService } from "@/helpers/currency";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { X, ImagePlus, FilePlus, FileText } from "lucide-vue-next";

const open = defineModel("open", { type: Boolean, default: false });

const props = defineProps({
  transaction: { type: Object, default: null }, // null = add
  funds: { type: Array, default: () => [] },
  defaultType: { type: String, default: "income" },
});

const emit = defineEmits(["saved"]);
const { t } = useI18n();
const toast = useToast();

const form = reactive({ date: "", type: "income", fund_id: "", transaction_title: "", amount: "", description: "" });
const errors = reactive({});
const newImages = ref([]); // [{ file, url }]
const newDocuments = ref([]); // [File]
const saving = ref(false);

const isEdit = computed(() => !!props.transaction?.id);

const releaseImages = () => newImages.value.forEach((i) => URL.revokeObjectURL(i.url));
onBeforeUnmount(releaseImages);

watch(open, (isOpen) => {
  if (!isOpen) return;
  const tr = props.transaction;
  Object.assign(form, {
    date: tr?.date ? String(tr.date).slice(0, 10) : dayjs().format("YYYY-MM-DD"),
    type: tr?.type || props.defaultType,
    fund_id: tr?.fund_id ?? (activeFunds.value.length === 1 ? activeFunds.value[0].id : ""),
    transaction_title: tr?.transaction_title ?? "",
    amount: tr?.amount != null ? String(Number(tr.amount)) : "",
    description: tr?.description ?? "",
  });
  Object.keys(errors).forEach((k) => delete errors[k]);
  releaseImages();
  newImages.value = [];
  newDocuments.value = [];
});

// New transactions go into active funds; an edited one keeps its current fund in the list
const activeFunds = computed(() => props.funds.filter((f) => Number(f.is_active) !== 0 || f.id === props.transaction?.fund_id));
const fundOptions = computed(() => activeFunds.value.map((f) => ({ value: f.id, label: f.name })));
const typeOptions = computed(() => [
  { value: "income", label: t("funds.income") },
  { value: "expense", label: t("funds.expense") },
]);

const existingImages = computed(() => props.transaction?.images || []);
const existingDocuments = computed(() => props.transaction?.documents || []);

function addImages(e) {
  for (const file of e.target.files || []) newImages.value.push({ file, url: URL.createObjectURL(file) });
  e.target.value = "";
}
function removeImage(i) {
  URL.revokeObjectURL(newImages.value[i].url);
  newImages.value.splice(i, 1);
}
function addDocuments(e) {
  newDocuments.value.push(...(e.target.files || []));
  e.target.value = "";
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.date) errors.date = t("funds.needDate");
  if (!form.fund_id) errors.fund_id = t("funds.needFund");
  if (!form.transaction_title.trim()) errors.transaction_title = t("funds.needTitle");
  if (!(Number(form.amount) > 0)) errors.amount = t("funds.needAmount");
  return !Object.keys(errors).length;
}

async function save() {
  if (!validate() || saving.value) return;
  const fd = new FormData();
  fd.append("date", form.date);
  fd.append("transaction_title", form.transaction_title.trim());
  fd.append("amount", Number(form.amount).toFixed(2));
  fd.append("type", form.type);
  fd.append("fund_id", form.fund_id);
  fd.append("description", form.description ?? "");
  newImages.value.forEach((img, i) => fd.append(`images[${i}]`, img.file));
  newDocuments.value.forEach((doc, i) => fd.append(`documents[${i}]`, doc));
  if (isEdit.value) fd.append("_method", "PUT"); // file uploads must be POST; Laravel reads _method

  saving.value = true;
  try {
    const url = isEdit.value ? `/api/fund-transactions/${props.transaction.id}` : "/api/fund-transactions";
    const res = await authStore.uploadProtectedApi(url, fd, "POST");
    if (res?.status) {
      toast.success(t("funds.saved"));
      open.value = false;
      emit("saved");
    } else {
      toast.error(t("funds.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AzModal v-model:open="open" :title="isEdit ? $t('funds.edit') : $t('funds.add')" size="lg">
    <form id="fund-transaction-form" class="flex flex-col gap-5" novalidate @submit.prevent="save">
      <AzSegmented v-model="form.type" :label="$t('funds.type')" :options="typeOptions" />

      <div class="grid gap-5 sm:grid-cols-2">
        <AzInput v-model="form.amount" type="number" inputmode="decimal" min="0" step="0.01" :label="$t('funds.amount')"
          :error="errors.amount" :prefix-pad="CurrencyService.code ? 'pl-16' : 'pl-3.5'" required>
          <template v-if="CurrencyService.code" #prefix><span class="text-sm font-semibold">{{ CurrencyService.code }}</span></template>
        </AzInput>
        <AzInput v-model="form.date" type="date" :label="$t('funds.date')" :error="errors.date" required />
        <div class="sm:col-span-2">
          <AzInput v-model="form.transaction_title" :label="$t('funds.titleLabel')" :placeholder="$t('funds.titlePlaceholder')"
            :error="errors.transaction_title" maxlength="100" required autocomplete="off" />
        </div>
        <div class="sm:col-span-2">
          <AzSelect v-model="form.fund_id" :label="$t('funds.fund')" :options="fundOptions" :placeholder="$t('funds.selectFund')"
            :error="errors.fund_id" required />
        </div>
        <div class="sm:col-span-2">
          <AzTextarea v-model="form.description" :label="$t('funds.descriptionLabel')" :help="$t('funds.descriptionHelp')"
            rows="2" maxlength="255" />
        </div>
      </div>

      <!-- Attachments -->
      <div class="grid gap-5 sm:grid-cols-2">
        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold text-ink">{{ $t('funds.images') }}</h3>
          <div class="flex flex-wrap gap-2">
            <a v-for="img in existingImages" :key="`e${img.id}`" :href="safeUrl(img.image_url)" target="_blank" rel="noopener noreferrer"
              :title="$t('funds.existingFiles')">
              <img :src="img.image_url" alt="" class="h-16 w-16 max-w-none rounded-control border border-line object-cover" />
            </a>
            <div v-for="(img, i) in newImages" :key="img.url" class="relative">
              <img :src="img.url" :alt="img.file.name" class="h-16 w-16 max-w-none rounded-control border-2 border-primary object-cover" />
              <button type="button" class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink shadow-pop"
                :aria-label="`${$t('common.delete')} ${img.file.name}`" @click="removeImage(i)">
                <X class="h-4 w-4" />
              </button>
            </div>
            <label class="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-control border border-dashed border-line-strong text-ink-muted hover:border-primary hover:text-primary focus-within:ring-[3px] focus-within:ring-primary/40">
              <ImagePlus class="h-5 w-5" aria-hidden="true" />
              <span class="sr-only">{{ $t('funds.addImages') }}</span>
              <input type="file" accept="image/*" multiple class="sr-only" @change="addImages" />
            </label>
          </div>
        </section>

        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold text-ink">{{ $t('funds.documents') }}</h3>
          <ul class="flex flex-col gap-1.5 text-sm">
            <li v-for="doc in existingDocuments" :key="`e${doc.id}`" class="flex items-center gap-2 text-ink-2">
              <FileText class="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <a :href="safeUrl(doc.document_url)" target="_blank" rel="noopener noreferrer" class="truncate text-primary hover:underline">{{ doc.file_name }}</a>
            </li>
            <li v-for="(doc, i) in newDocuments" :key="`n${i}${doc.name}`" class="flex items-center gap-2 text-ink">
              <FileText class="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span class="truncate">{{ doc.name }}</span>
              <button type="button" class="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2"
                :aria-label="`${$t('common.delete')} ${doc.name}`" @click="newDocuments.splice(i, 1)">
                <X class="h-4 w-4" />
              </button>
            </li>
          </ul>
          <label class="inline-flex min-h-[40px] w-fit cursor-pointer items-center gap-2 rounded-control border border-dashed border-line-strong px-3 text-sm font-semibold text-ink-2 hover:border-primary hover:text-primary focus-within:ring-[3px] focus-within:ring-primary/40">
            <FilePlus class="h-4 w-4" aria-hidden="true" />
            {{ $t('funds.addDocuments') }}
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" multiple class="sr-only" @change="addDocuments" />
          </label>
        </section>
      </div>
      <p class="-mt-2 text-[13px] text-ink-muted">{{ $t('funds.attachHelp') }}</p>
    </form>

    <template #footer>
      <AzButton variant="quiet" @click="open = false">{{ $t('common.cancel') }}</AzButton>
      <AzButton type="submit" form="fund-transaction-form" :loading="saving">{{ $t('common.save') }}</AzButton>
    </template>
  </AzModal>
</template>
