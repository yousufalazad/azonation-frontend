<script setup>
// Photos and documents for a form: shows what is already attached and lets people add more.
// images: [{ file, preview }]   documents: File[]   (only new files; existing ones are read-only)
import { onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { safeUrl } from "@/helpers/sanitizeHtml";
import { Paperclip, X } from "lucide-vue-next";

defineProps({
  existingImages: { type: Array, default: () => [] }, // [{ id, image_url, file_name }]
  existingDocuments: { type: Array, default: () => [] }, // [{ id, document_url, file_name }]
});
const images = defineModel("images", { type: Array, default: () => [] });
const documents = defineModel("documents", { type: Array, default: () => [] });

const { t } = useI18n();

function onImages(e) {
  images.value = [...images.value, ...[...(e.target.files || [])].map((file) => ({ file, preview: URL.createObjectURL(file) }))];
  e.target.value = "";
}
function removeImage(i) {
  URL.revokeObjectURL(images.value[i].preview);
  images.value = images.value.filter((_, j) => j !== i);
}
function onDocuments(e) {
  documents.value = [...documents.value, ...(e.target.files || [])];
  e.target.value = "";
}
function removeDocument(i) {
  documents.value = documents.value.filter((_, j) => j !== i);
}
onBeforeUnmount(() => images.value.forEach((img) => URL.revokeObjectURL(img.preview)));

const fileClass =
  "az-control w-full py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-semibold file:text-primary-soft-ink";
</script>

<template>
  <AzCard>
    <template #header>
      <h2 class="flex items-center gap-2 text-lg font-semibold text-ink">
        <Paperclip class="h-5 w-5 text-primary" aria-hidden="true" />{{ t('meetingView.attachments') }}
      </h2>
    </template>
    <div class="flex flex-col gap-5">
      <div v-if="existingImages.length || existingDocuments.length" class="flex flex-col gap-3">
        <p class="text-sm text-ink-muted">{{ t('meetingForm.alreadyAttached') }}</p>
        <div v-if="existingImages.length" class="flex flex-wrap gap-2">
          <img v-for="img in existingImages" :key="img.id" :src="img.image_url" :alt="img.file_name || ''"
            class="h-16 w-16 max-w-none rounded-control border border-line object-cover" loading="lazy" />
        </div>
        <ul v-if="existingDocuments.length" class="flex flex-col gap-1">
          <li v-for="doc in existingDocuments" :key="doc.id">
            <a :href="safeUrl(doc.document_url)" target="_blank" rel="noopener noreferrer" class="text-[15px] text-primary hover:underline">
              {{ doc.file_name || t('meetingView.document') }}
            </a>
          </li>
        </ul>
      </div>

      <AzField :label="t('meetingForm.addPhotos')" :help="t('meetingForm.photosHelp')">
        <template #default="{ id, describedBy }">
          <input :id="id" type="file" multiple accept="image/png,image/jpeg,image/webp" :aria-describedby="describedBy" :class="fileClass" @change="onImages" />
        </template>
      </AzField>
      <div v-if="images.length" class="flex flex-wrap gap-3">
        <div v-for="(img, i) in images" :key="img.preview" class="relative">
          <img :src="img.preview" :alt="img.file.name" class="h-20 w-20 max-w-none rounded-control border border-line object-cover" />
          <button type="button" class="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-line bg-surface text-ink-muted shadow-card hover:text-danger"
            :aria-label="t('meetingForm.remove', { name: img.file.name })" @click="removeImage(i)">
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <AzField :label="t('meetingForm.addDocuments')" :help="t('meetingForm.documentsHelp')">
        <template #default="{ id, describedBy }">
          <input :id="id" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" :aria-describedby="describedBy" :class="fileClass" @change="onDocuments" />
        </template>
      </AzField>
      <ul v-if="documents.length" class="flex flex-col gap-2">
        <li v-for="(doc, i) in documents" :key="`${doc.name}-${i}`" class="flex items-center justify-between gap-3 rounded-control bg-surface-2 px-3 py-2">
          <span class="truncate text-[15px] text-ink-2">{{ doc.name }}</span>
          <button type="button" class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted hover:text-danger"
            :aria-label="t('meetingForm.remove', { name: doc.name })" @click="removeDocument(i)">
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </div>
  </AzCard>
</template>
